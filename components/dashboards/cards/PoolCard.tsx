import React from 'react';
import {CardBalance} from './CardBalance';
import useGovernmentPool from '@/app/actions/useGovernmentPool';

const PoolCard: React.FC = () => {
  const { data, loading, error } = useGovernmentPool();

  if (loading) {
    return <div>Loading...</div>;
  }

  if(error) {
    return (
      <div>
        <CardBalance title='Current Pool' description='Goverment funds dedicated to Education' amount={1000} percentage={4.5}/>
      </div>
    )
  }

  return (
    <div>
      <CardBalance title='Current Pool' description='Goverment funds dedicated to Education' amount={data.totalUsdValue} percentage={4.5}/>
    </div>
  );
};

export default PoolCard;