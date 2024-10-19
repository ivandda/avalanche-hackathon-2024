import React from 'react';
import {CardBalance} from './CardBalance';
import useApplications from '@/app/actions/useApplications';

const ActiveApplicationsCard: React.FC = () => {
  const { applications, loading, error } = useApplications();

  if (loading) {
    return <div>Loading...</div>;
  }

  if(error) {
    return (
      <div>
        <CardBalance title='Current Pool' description='Vouchers beeing used by students' amount={1000} percentage={undefined}/>
      </div>
    )
  }

  return (
    <div>
      <CardBalance title='Active Vouchers' description='Vouchers beeing used by students' amount={applications.length} percentage={undefined}/>
    </div>
  );
};

export default ActiveApplicationsCard;