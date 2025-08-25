import React, { useEffect, useState } from 'react'
import { prepareExpenseBarChartData } from '../../utils/helper';
import CustomBarChart from '../Charts/CustomBarChart';
import EmptyStateCard from '../EmptyStateCard';
import { LuInbox } from 'react-icons/lu';

const Last30DaysExpenses = ({ data }) => {
  
 const [chartData, setChartData] = useState([]);

 useEffect(() => {
  const result = prepareExpenseBarChartData(data);
  setChartData(result); 
  return() => {};
 }, [data]);

  return (
    <div className='card col-span-1'>
        <div className='flex items-centre justify-between'>
            <h5 className='text-lg'>Last 30 Days Expenses</h5>
        </div>
      {(!chartData || chartData.length === 0) ? (
        <EmptyStateCard
          icon={<LuInbox className='text-2xl text-gray-500' />}
          title={'No expense data'}
          subtitle={'Add expenses to see your spending trends over the last 30 days.'}
        />
      ) : (
        <CustomBarChart data = {chartData} />
      )}
    </div>
  )
}

export default Last30DaysExpenses
