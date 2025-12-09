'use client';
import { useState, useEffect } from 'react';
import { doc, onSnapshot, type DocumentReference } from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useDoc<T>(path: string | null) {
  const firestore = useFirestore();
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!path) {
      setLoading(false);
      setData(null);
      return;
    }

    const docRef: DocumentReference = doc(firestore, path);

    const unsubscribe = onSnapshot(docRef, (snapshot) => {
      if (snapshot.exists()) {
        setData({ id: snapshot.id, ...snapshot.data() } as T);
      } else {
        setData(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, path]);

  return { data, loading };
}
