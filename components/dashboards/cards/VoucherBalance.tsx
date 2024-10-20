'use client'
import React from 'react';
import {CardBalance} from './CardBalance';
import useRemainingCredits from '@/app/actions/web3/useRemainingCredits';

const VoucherBalance: React.FC = () => {
  const { balance, loading, error } = useRemainingCredits();

  if (loading) {
    return <div>Loading...</div>;
  }

  if(error) {
    return (
      <div>
        <CardBalance title='Credits Remaining' description='Credits left to emit' amount={1000} percentage={undefined}/>
      </div>
    )
  }

  return (
    <div>
      <CardBalance title='Credits Remaining' description='Credits left to emit' amount={balance} percentage={undefined}/>
    </div>
  );
};

export default VoucherBalance;