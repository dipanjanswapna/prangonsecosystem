'use server';

// bKash API Configuration
const isProduction = process.env.NODE_ENV === 'production';

const BKASH_API_BASE_URL = isProduction
    ? 'https://tokenized.pay.bka.sh/v1.2.0-beta/tokenized'
    : 'https://tokenized.sandbox.bka.sh/v1.2.0-beta/tokenized';
    
const BKASH_USERNAME = process.env.BKASH_USERNAME;
const BKASH_PASSWORD = process.env.BKASH_PASSWORD;
const BKASH_APP_KEY = process.env.BKASH_APP_KEY;
const BKASH_APP_SECRET = process.env.BKASH_APP_SECRET;

let id_token: string | null = null;
let token_type: string | null = null;
let refresh_token: string | null = null;
let token_expires_at: number | null = null;

/**
 * Grants an authorization token from bKash.
 * Caches the token to avoid unnecessary re-authentication.
 */
export async function grantToken() {
  // If we have a valid, non-expired token, reuse it.
  if (id_token && token_expires_at && Date.now() < token_expires_at) {
    return { id_token, token_type };
  }
  
  // If token is expired, try to refresh it
  if (refresh_token && token_expires_at && Date.now() >= token_expires_at) {
      try {
          return await refreshToken();
      } catch (error) {
          console.log("Could not refresh token, getting a new one.");
      }
  }

  try {
    const response = await fetch(`${BKASH_API_BASE_URL}/checkout/token/grant`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'username': BKASH_USERNAME!,
        'password': BKASH_PASSWORD!,
      },
      body: JSON.stringify({
        app_key: BKASH_APP_KEY,
        app_secret: BKASH_APP_SECRET,
      }),
    });

    const data = await response.json();

    if (data && data.id_token) {
      id_token = data.id_token;
      token_type = data.token_type;
      refresh_token = data.refresh_token;
      // Set expiration time (e.g., 55 minutes from now, as token is valid for 1 hour)
      token_expires_at = Date.now() + (parseInt(data.expires_in) * 1000) - (5 * 60 * 1000);
      return { id_token, token_type };
    } else {
      throw new Error(data.statusMessage || 'bKash token grant failed.');
    }
  } catch (error) {
    console.error('bKash Grant Token Error:', error);
    throw error;
  }
}

/**
 * Refreshes an expired authorization token.
 */
export async function refreshToken() {
    try {
        const response = await fetch(`${BKASH_API_BASE_URL}/checkout/token/refresh`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'username': BKASH_USERNAME!,
                'password': BKASH_PASSWORD!,
            },
            body: JSON.stringify({
                app_key: BKASH_APP_KEY,
                app_secret: BKASH_APP_SECRET,
                refresh_token: refresh_token,
            }),
        });

        const data = await response.json();
        if (data && data.id_token) {
            id_token = data.id_token;
            token_type = data.token_type;
            refresh_token = data.refresh_token;
            token_expires_at = Date.now() + (parseInt(data.expires_in) * 1000) - (5 * 60 * 1000);
            return { id_token, token_type };
        } else {
            throw new Error(data.statusMessage || 'bKash token refresh failed.');
        }

    } catch (error) {
        console.error('bKash Refresh Token Error:', error);
        id_token = null;
        refresh_token = null;
        token_expires_at = null;
        throw error;
    }
}


/**
 * Creates a bKash payment session.
 */
export async function createPayment({ amount, invoiceNumber, callbackURL, payerReference = " " }: { amount: number; invoiceNumber: string; callbackURL: string; payerReference?: string; }) {
  try {
    const { id_token } = await grantToken();

    const response = await fetch(`${BKASH_API_BASE_URL}/checkout/create`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': id_token!,
        'X-App-Key': BKASH_APP_KEY!,
      },
      body: JSON.stringify({
        mode: '0011',
        payerReference,
        callbackURL,
        amount: amount.toString(),
        currency: 'BDT',
        intent: 'sale',
        merchantInvoiceNumber: invoiceNumber,
      }),
    });
    
    return await response.json();

  } catch (error) {
    console.error('bKash Create Payment Error:', error);
    throw error;
  }
}

/**
 * Executes a bKash payment after customer approval.
 */
export async function executePayment(paymentID: string) {
    try {
        const { id_token } = await grantToken();
        const response = await fetch(`${BKASH_API_BASE_URL}/checkout/execute`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': id_token!,
                'X-App-Key': BKASH_APP_KEY!,
            },
            body: JSON.stringify({ paymentID }),
        });
        return await response.json();
    } catch (error) {
        console.error('bKash Execute Payment Error:', error);
        throw error;
    }
}


/**
 * Queries the status of a bKash transaction.
 */
export async function queryPayment(paymentID: string) {
    try {
        const { id_token } = await grantToken();
        const response = await fetch(`${BKASH_API_BASE_URL}/checkout/payment/status`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': id_token!,
                'X-App-Key': BKASH_APP_KEY!,
            },
            body: JSON.stringify({ paymentID }),
        });

        return await response.json();

    } catch (error) {
        console.error('bKash Query Payment Error:', error);
        throw error;
    }
}
