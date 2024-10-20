'use client'
import { ABI, address } from '@/app/chain/contract';
import { useState, useEffect } from 'react';
import { avalancheFuji } from 'viem/chains';
import { useReadContract } from 'wagmi';

const useRemainingCredits = () => {
  const [balance, setBalance] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBalance = async () => {
      try {

        const minted = useReadContract({
          chainId: avalancheFuji.id,
          abi: ABI,
          address: address,
          functionName: 'mintedSoFar',
        });

        const max = useReadContract({
          chainId: avalancheFuji.id,
          abi: ABI,
          address: address,
          functionName: 'MAX_SUPPLY',
        });

        if (minted && max) {
          // setBalance(max - minted);
          console.log('minted', minted);
          console.log('max', max);
        }
      } catch (err) {
        setError(err.message);
        console.log('error', err);
      } finally {
        setLoading(false);
      }
    };

    fetchBalance();
  }, []);

  return { balance, loading, error };
};

export default useRemainingCredits;