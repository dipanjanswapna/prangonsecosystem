'use server';

import { NextResponse } from 'next/server';
import { adminAuth, adminFirestore } from '@/lib/firebase-admin';

export async function DELETE(
  request: Request,
  { params }: { params: { uid: string } }
) {
  const { uid } = params;

  try {
    // Note: You might want to add an extra layer of security here
    // to ensure only admins can call this endpoint.
    // For example, by verifying a custom claim on the calling user's token.

    // Delete from Firestore
    await adminFirestore.collection('users').doc(uid).delete();

    // Delete from Firebase Auth
    await adminAuth.deleteUser(uid);

    return NextResponse.json({
      status: 'success',
      message: 'User deleted successfully',
    });
  } catch (error: any) {
    console.error('Failed to delete user:', error);
    return NextResponse.json(
      { status: 'error', message: error.message || 'Failed to delete user' },
      { status: 500 }
    );
  }
}
