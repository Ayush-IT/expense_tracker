import React, { useState } from 'react'

import { LuDownload } from 'react-icons/lu'
import moment from 'moment'
import TransactionInfoCard from '../Cards/TransactionInfoCard'
import Modal from '../Modal'

const IncomeList = ({ transactions, onDelete, onDownload }) => {
  const [showDownloadModal, setShowDownloadModal] = useState(false);

  const handleDownloadConfirm = () => {
    onDownload();
    setShowDownloadModal(false);
  };

  return (
    <div className='card'>
      <div className='flex items-center justify-between'>
        <h5 className='text-lg'>Income Source</h5>

        <button className='card-btn' onClick={() => setShowDownloadModal(true)}>
          <LuDownload className='text-base' /> Download
        </button>
      </div>

      <div className='grid grid-cols-1 md:grid-clos-2'>
        {transactions?.map((income) => (
          <TransactionInfoCard
            key={income._id}
            title={income.source}
            icon={income.icon}
            date={moment(income.date).format('Do MMM YYYY')}
            amount={income.amount}
            type="income"
            onDelete={() => onDelete(income._id)}
          />
        ))}
      </div>

      {/* Download Confirmation Modal */}
      <Modal
        isOpen={showDownloadModal}
        onClose={() => setShowDownloadModal(false)}
        title="Download Income Data?"
      >
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
            <LuDownload className="text-blue-500 text-xl" />
          </div>

          <p className="text-gray-600 mb-6 text-sm">
            This will download all your income records as an Excel file. The file will contain detailed information about your income sources, amounts, and dates.
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
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              Download
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default IncomeList
