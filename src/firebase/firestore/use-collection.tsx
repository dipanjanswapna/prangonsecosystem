'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  type CollectionReference,
  type Query,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

export function useCollection<T>(path: string, field?: string, value?: string) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let collectionRef: CollectionReference | Query = collection(firestore, path);

    if (field && value) {
      collectionRef = query(collectionRef, where(field, '==', value));
    }

    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const result: T[] = [];
      snapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(result);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, path, field, value]);

  return { data, loading };
}
