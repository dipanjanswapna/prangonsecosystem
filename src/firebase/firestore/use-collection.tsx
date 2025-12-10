'use client';
import { useState, useEffect } from 'react';
import {
  collection,
  onSnapshot,
  query,
  where,
  orderBy,
  limit,
  type CollectionReference,
  type Query,
  type WhereFilterOp,
} from 'firebase/firestore';
import { useFirestore } from '../provider';

type WhereClause = [string, WhereFilterOp, any];
type OrderByClause = {
    field: string;
    direction?: 'asc' | 'desc';
}

export function useCollection<T>(
  path: string,
  field?: string, // Deprecated, use whereClauses instead
  value?: string, // Deprecated, use whereClauses instead
  orderByClause?: OrderByClause,
  limitCount?: number,
  whereClauses?: WhereClause[]
) {
  const firestore = useFirestore();
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let collectionRef: CollectionReference | Query = collection(firestore, path);
    
    const allWhereClauses = whereClauses ? [...whereClauses] : [];
    if(field && value) {
        allWhereClauses.push([field, '==', value]);
    }

    if (allWhereClauses.length > 0) {
        const whereConstraints = allWhereClauses.map(clause => where(clause[0], clause[1], clause[2]));
        collectionRef = query(collectionRef, ...whereConstraints);
    }
    
    if (orderByClause) {
        collectionRef = query(collectionRef, orderBy(orderByClause.field, orderByClause.direction || 'asc'));
    }

    if (limitCount) {
        collectionRef = query(collectionRef, limit(limitCount));
    }


    const unsubscribe = onSnapshot(collectionRef, (snapshot) => {
      const result: T[] = [];
      snapshot.forEach((doc) => {
        result.push({ id: doc.id, ...doc.data() } as T);
      });
      setData(result);
      setLoading(false);
    }, (error) => {
      console.error("Error fetching collection: ", error);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [firestore, path, field, value, JSON.stringify(orderByClause), limitCount, JSON.stringify(whereClauses)]);

  return { data, loading };
}
