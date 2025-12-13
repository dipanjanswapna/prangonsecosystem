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
  path: string | null, // Allow path to be null
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
    // If the path is not valid, do not execute the query.
    if (!path) {
      setLoading(false);
      setData([]); // Ensure data is cleared
      return;
    }
    
    let collectionRef: CollectionReference | Query = collection(firestore, path);
    
    const allWhereClauses = whereClauses ? [...whereClauses] : [];
    if(field && value) {
        allWhereClauses.push([field, '==', value]);
    }

    // Filter out clauses with undefined or null values, which are invalid for Firestore queries
    const validWhereClauses = allWhereClauses.filter(clause => clause[2] !== undefined && clause[2] !== null);

    if (validWhereClauses.length > 0) {
        const whereConstraints = validWhereClauses.map(clause => where(clause[0], clause[1], clause[2]));
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
