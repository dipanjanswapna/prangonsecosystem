
'use server';

import { createPayment } from '@/lib/bkash';
import { NextResponse, type NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const { amount, invoiceNumber, payerReference } = await request.json();
    
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';
    const callbackURL = `${baseUrl}/api/bkash/callback`;


    const paymentResponse = await createPayment({
        amount,
        invoiceNumber,
        callbackURL,
        payerReference,
    });
    
    if (paymentResponse && paymentResponse.statusCode === '0000' && paymentResponse.bkashURL) {
      return NextResponse.json(paymentResponse);
    } else {
      console.error("bKash Create Payment Failed:", paymentResponse);
      throw new Error(paymentResponse.statusMessage || 'Failed to create bKash payment session.');
    }
  } catch (error: any) {
    console.error('[bKash Create API Error]', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
