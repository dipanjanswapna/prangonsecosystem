'use client';

import { FirebaseProvider } from './provider';

export function FirebaseClientProviderWrapper({
  children,
}: {
  children: React.ReactNode;
}) {
  return <FirebaseProvider>{children}</FirebaseProvider>;
}
