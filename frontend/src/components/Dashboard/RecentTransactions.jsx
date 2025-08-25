import React from 'react'
import { LuArrowRight } from 'react-icons/lu'
import moment from 'moment'
import DashboardTransactionCard from '../Cards/DashboardTransactionCard'
import EmptyStateCard from '../EmptyStateCard'
import { LuInbox } from 'react-icons/lu'

const RecentTransactions = ({ transactions, onSeeMore }) => {
  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg'>
          Recent transactions
        </h5>

        <button className='card-btn' onClick={onSeeMore}>
          See All <LuArrowRight className='text-base' />
        </button>
      </div>
      <div className='mt-6'>
        {(!transactions || transactions.length === 0) ? (
          <EmptyStateCard
            icon={<LuInbox className='text-2xl text-gray-500' />}
            title={'No transactions yet'}
            subtitle={'Your recent transactions will appear here once you add income or expenses.'}
          />
        ) : (
          transactions.slice(0, 5).map((item) => (
            <DashboardTransactionCard
              key={item._id}
              title={item.type == 'expense' ? item.category : item.source}
              icon={item.icon}
              date={moment(item.date).format('Do MMM YYYY')}
              amount={item.amount}
              type={item.type}
            />
          ))
        )}
      </div>
    </div>
  )
}

export default RecentTransactions
