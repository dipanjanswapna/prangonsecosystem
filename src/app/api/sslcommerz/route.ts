'use server';

import { NextResponse } from 'next/server';
import { customAlphabet } from 'nanoid';

const nanoid = customAlphabet('ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789', 10);

const SSLCOMMERZ_API = process.env.NODE_ENV === 'production' 
  ? 'https://securepay.sslcommerz.com/gwprocess/v4/api.php'
  : 'https://sandbox.sslcommerz.com/gwprocess/v4/api.php';

const STORE_ID = process.env.SSLCOMMERZ_STORE_ID;
const STORE_PASSWORD = process.env.SSLCOMMERZ_STORE_PASSWORD;

export async function POST(request: Request) {
  if (!STORE_ID || !STORE_PASSWORD) {
    return NextResponse.json({ message: 'SSLCommerz credentials are not configured.' }, { status: 500 });
  }
    
  try {
    const { amount, customer_name, customer_email, customer_phone, customer_address, customer_city, campaignSlug, donationId } = await request.json();
    
    const tran_id = `ONGON-${nanoid()}`;
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:9002';

    const formData = new URLSearchParams();
    formData.append('store_id', STORE_ID);
    formData.append('store_passwd', STORE_PASSWORD);
    formData.append('total_amount', amount.toString());
    formData.append('currency', 'BDT');
    formData.append('tran_id', tran_id);
    // These URLs will receive a POST request from SSLCommerz
    formData.append('success_url', `${baseUrl}/api/sslcommerz/callback`);
    formData.append('fail_url', `${baseUrl}/api/sslcommerz/callback`);
    formData.append('cancel_url', `${baseUrl}/api/sslcommerz/callback`);
    formData.append('ipn_url', `${baseUrl}/api/sslcommerz/ipn`);

    // Product Information
    formData.append('product_name', 'Donation');
    formData.append('product_category', 'Donation');
    formData.append('product_profile', 'non-physical-goods');

    // Customer Information
    formData.append('cus_name', customer_name);
    formData.append('cus_email', customer_email);
    formData.append('cus_add1', customer_address || 'N/A');
    formData.append('cus_city', customer_city || 'N/A');
    formData.append('cus_state', customer_city || 'N/A');
    formData.append('cus_postcode', 'N/A');
    formData.append('cus_country', 'Bangladesh');
    formData.append('cus_phone', customer_phone || 'N/A');
    
    // Shipment Information (Not required for non-physical goods)
    formData.append('shipping_method', 'NO');

    // Custom parameter to pass our internal donationId
    formData.append('value_a', donationId);


    const response = await fetch(SSLCOMMERZ_API, {
      method: 'POST',
      body: formData,
    });

    const data = await response.json();

    if (data.status === 'SUCCESS' && data.GatewayPageURL) {
      return NextResponse.json({ checkout_url: data.GatewayPageURL });
    } else {
      throw new Error(data.failedreason || 'Failed to create SSLCommerz session.');
    }
  } catch (error: any) {
    console.error('[SSLCommerz API Error]', error);
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
