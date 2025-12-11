'use server';

import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('1234567890', 8);

const SHURJOPAY_API_BASE = 'https://sandbox.shurjopayment.com/api';
const SHURJOPAY_USERNAME = process.env.SHURJOPAY_USERNAME || 'sp_sandbox';
const SHURJOPAY_PASSWORD = process.env.SHURJOPAY_PASSWORD || 'pyyk97hu&6u6';
const SHURJOPAY_PREFIX = process.env.SHURJOPAY_PREFIX || 'ongon';

async function getShurjoPayToken() {
  try {
    const response = await fetch(`${SHURJOPAY_API_BASE}/get_token`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        username: SHURJOPAY_USERNAME,
        password: SHURJOPAY_PASSWORD,
      }),
    });
    const data = await response.json();
    if (data.sp_code !== '200') {
      throw new Error(data.message || 'shurjoPay token generation failed');
    }
    return data;
  } catch (error: any) {
    console.error('shurjoPay get_token error:', error.message);
    throw new Error('Could not authenticate with shurjoPay.');
  }
}

async function createShurjoPayPayment(
  tokenData: any,
  paymentData: {
    amount: number;
    customer_name: string;
    customer_address: string;
    customer_phone: string;
    customer_city: string;
    customer_email: string;
    campaignSlug: string;
  }
) {
  const orderId = `${SHURJOPAY_PREFIX}${nanoid()}`;
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL;

  const returnUrl = `${baseUrl}/donations/${paymentData.campaignSlug}/donate?status=success`;
  const cancelUrl = `${baseUrl}/donations/${paymentData.campaignSlug}/donate?status=cancel`;
  
  const payload = {
      prefix: SHURJOPAY_PREFIX,
      token: tokenData.token,
      store_id: tokenData.store_id,
      amount: paymentData.amount,
      order_id: orderId,
      currency: 'BDT',
      return_url: returnUrl,
      cancel_url: cancelUrl,
      customer_name: paymentData.customer_name,
      customer_address: paymentData.customer_address,
      customer_phone: paymentData.customer_phone,
      customer_city: paymentData.customer_city,
      customer_email: paymentData.customer_email,
      client_ip: '127.0.0.1', // In a real app, you'd get this from the request
  };

  try {
    const response = await fetch(`${SHURJOPAY_API_BASE}/secret-pay`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${tokenData.token}`,
        },
        body: JSON.stringify(payload),
    });
    const data = await response.json();

    if (!data.checkout_url) {
        throw new Error(data.message || 'Failed to create shurjoPay payment session.');
    }
    return data;

  } catch (error: any) {
     console.error('shurjoPay secret-pay error:', error.message);
     throw new Error('Could not initiate shurjoPay payment.');
  }
}

export async function POST(request: Request) {
  try {
    const paymentData = await request.json();
    const tokenData = await getShurjoPayToken();

    const paymentResponse = await createShurjoPayPayment(tokenData, {
        ...paymentData,
    });
    
    return NextResponse.json(paymentResponse, { status: 200 });

  } catch (error: any) {
    console.error('[shurjopay API Error]', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
