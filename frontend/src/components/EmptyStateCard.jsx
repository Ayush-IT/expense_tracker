import React from 'react'

const EmptyStateCard = ({ icon, title, subtitle, actionLabel, onAction }) => {
  return (
    <div className='card flex flex-col items-center justify-center text-center py-12 px-6'>
      <div className='h-20 w-20 rounded-full bg-gradient-to-br from-purple-50 to-purple-100 flex items-center justify-center mb-4 shadow-sm'>
        <div className='text-3xl text-purple-600'>
          {icon}
        </div>
      </div>

      <h4 className='text-xl font-semibold text-gray-900'>{title}</h4>
      {subtitle && <p className='text-sm text-gray-500 mt-2 max-w-md'>{subtitle}</p>}

      {actionLabel && onAction && (
        <div className='mt-6'>
          <button
            type='button'
            onClick={onAction}
            className='add-btn add-btn-fill px-4 py-2 shadow'
          >
            {actionLabel}
          </button>
        </div>
      )}
    </div>
  )
}

export default EmptyStateCard
