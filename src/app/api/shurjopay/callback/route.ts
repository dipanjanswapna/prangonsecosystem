'use server';

import { NextResponse, type NextRequest } from 'next/server';
import { adminFirestore } from '@/lib/firebase-admin';
import { doc, updateDoc } from 'firebase-admin/firestore';


const SHURJOPAY_API_BASE = 'https://sandbox.shurjopayment.com/api';
const SHURJOPAY_USERNAME = process.env.SHURJOPAY_USERNAME || 'sp_sandbox';
const SHURJOPAY_PASSWORD = process.env.SHURJOPAY_PASSWORD || 'pyyk97hu&6u6';

async function getShurjoPayToken() {
  const response = await fetch(`${SHURJOPAY_API_BASE}/get_token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      username: SHURJOPAY_USERNAME,
      password: SHURJOPAY_PASSWORD,
    }),
  });
  const data = await response.json();
  if (data.sp_code !== '200') {
    throw new Error(data.message || 'shurjoPay token generation failed');
  }
  return data.token;
}

async function verifyShurjoPayPayment(token: string, order_id: string) {
  const response = await fetch(`${SHURJOPAY_API_BASE}/verification`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
    },
    body: JSON.stringify({ order_id }),
  });
  const data = await response.json();
  return data[0]; // The response is an array with one object
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { ongon_donation_id, sp_order_id } = body;

    if (!ongon_donation_id || !sp_order_id) {
        return NextResponse.json({ message: 'Missing required order information.' }, { status: 400 });
    }
    
    const token = await getShurjoPayToken();
    const verificationDetails = await verifyShurjoPayPayment(token, sp_order_id);

    let finalStatus: 'success' | 'failed' | 'cancelled' | 'pending' = 'pending';
    
    if (verificationDetails && verificationDetails.sp_code === '1000') {
        finalStatus = 'success';
    } else if (verificationDetails && verificationDetails.sp_code === '1002') {
        finalStatus = 'cancelled';
    }
    else {
        finalStatus = 'failed';
    }

    // Update the donation document in Firestore only if the status is not pending
    if (finalStatus !== 'pending') {
      const donationRef = doc(adminFirestore, 'donations', ongon_donation_id);
      await updateDoc(donationRef, {
          status: finalStatus,
          transactionId: verificationDetails.bank_trx_id || sp_order_id,
      });
    }
    
    // The client-side will handle the redirect
    return NextResponse.json({ status: 'ok', finalStatus: finalStatus, donationId: ongon_donation_id });

  } catch (error: any) {
    console.error('[shurjopay Callback Error]', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
