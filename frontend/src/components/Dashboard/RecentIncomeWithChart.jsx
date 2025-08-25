import React, { useEffect, useState } from 'react'
import CustomPieChart from '../Charts/CustomPieChart';
import EmptyStateCard from '../EmptyStateCard'
import { LuInbox } from 'react-icons/lu'

const COLORS = ['#875CF5', '#FA2C37', '#FF6900', '#4f39f6', '#8884d8'];

const RecentIncomeWithChart = ({data, totalIncome}) => {

 const [chartData, setChartData] = useState([]);

 useEffect(() => {
  const dataArr = (data || []).map((item) => ({
    name: item?.source,
    amount: item?.amount,
  }));

  setChartData(dataArr);
  return () => {};
 }, [data]);

  return (
    <div className='card'>
        <div className='flex items-centre justify-between'>
            <h5 className='text-lg'>Last 60 Days Income</h5>
        </div>

        {(!chartData || chartData.length === 0) ? (
          <EmptyStateCard
            icon={<LuInbox className='text-2xl text-gray-500' />}
            title={'No income data'}
            subtitle={'Add income to view pie breakdowns of your recent income sources.'}
          />
        ) : (
          <CustomPieChart 
           data={chartData} 
           label='Total Income'
           totalAmount={`$${totalIncome}`}
           showTextAnchor
           colors={COLORS}
          />
        )}
      
    </div>
  )
}

export default RecentIncomeWithChart
