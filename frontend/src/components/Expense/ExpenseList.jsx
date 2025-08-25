import moment from 'moment'
import React, { useState } from 'react'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import { LuDownload } from 'react-icons/lu'
import Modal from '../Modal'
import EmptyStateCard from '../EmptyStateCard'
import { LuInbox } from 'react-icons/lu'

const ExpenseList = ({ transactions, onDelete, onDownload, onAdd }) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownloadConfirm = () => {
    onDownload();
    setShowDownloadModal(false);
  };

  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg'>All Expenses</h5>

        <button className='card-btn' onClick={() => setShowDownloadModal(true)}>
          <LuDownload className='text-base' /> Download
        </button>
      </div>

      {(!transactions || transactions.length === 0) ? (
        <EmptyStateCard
          icon={<LuInbox className='text-2xl text-purple-600' />}
          title={'No expenses yet'}
          subtitle={'You haven\'t added any expense. Record your first transaction to see insights.'}
          actionLabel={'Add Expense'}
          onAction={onAdd}
        />
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2'>
          {transactions.map((expense) => (
            <TransactionInfoCard
              key={expense._id}
              title={expense.category}
              icon={expense.icon}
              date={moment(expense.date).format('Do MMM YYYY')}
              amount={expense.amount}
              type="expense"
              onDelete={() => onDelete(expense._id)}
            />
          ))}
        </div>
      )}

      {/* Download Confirmation Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Download Expense Data?"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
            <LuDownload className="text-red-500 text-xl" />
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            This will download all your expense records as an Excel file. The file will contain detailed information about your expense categories, amounts, and dates.
          </p>

          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowDownloadModal(false)}
              className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleDownloadConfirm}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default ExpenseList
