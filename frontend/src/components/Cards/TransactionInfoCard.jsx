
// import React from 'react'

// import {
//     LuUtensils,
//     LuTrendingUp,
//     LuTrendingDown,
//     LuTrash2
// } from 'react-icons/lu';


// const TransactionInfoCard = (
//     {
//         title,
//         icon,
//         date,
//         amount,
//         type,
//         hideDeleteBtn,
//         onDelete
//     }
// ) => {

//   const getAmountStyles = () => {
//     return type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500';
//   }

//   return (
//     <div className='group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60'>
//       <div className='w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full'>
//          {icon ? (
//             <img src={icon} alt={title} className='w-6 h-6' />
//          ) : ( 
//             <LuUtensils />
//         )}
//       </div>

//       <div className='flex-1 flex item-centre justify-between'>
//         <div>
//           <p className='text-sm text-gray-700 font-medium'>{title}</p>
//            <p className='text-xs text-gray-400 mt-1'>{date}</p>
//         </div>

//         <div className='flex items-center gap-2'>
//            {!hideDeleteBtn && (
//             <button className='text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer' 
//             onClick={onDelete}>
//               <LuTrash2 size={18} />
//             </button>
//            )}  

//            <div className={`flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}>

//             <h6 className='text-xs font-medium'>
//               {type === 'income' ? '+' : '-'}${amount}
//             </h6>
//             {type === 'income' ? <LuTrendingUp /> : <LuTrendingDown />}

//            </div>
//         </div>

//       </div>
//     </div>
//   )
// }

// export default TransactionInfoCard





import React from 'react'

import {
  LuUtensils,
  LuTrendingUp,
  LuTrendingDown,
  LuTrash2
} from 'react-icons/lu';


const TransactionInfoCard = (
  {
    title,
    icon,
    date,
    amount,
    type,
    hideDeleteBtn,
    onDelete
  }
) => {

  const getAmountStyles = () => {
    return type === 'income' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500';
  }

  return (
    <div className='group relative flex items-center gap-4 mt-2 p-3 rounded-lg hover:bg-gray-100/60'>
      <div className='w-12 h-12 flex items-center justify-center text-xl text-gray-800 bg-gray-100 rounded-full'>
        {icon ? (
          <img src={icon} alt={title} className='w-6 h-6' />
        ) : (
          <LuUtensils />
        )}
      </div>

      <div className='flex-1 flex item-centre justify-between'>
        <div>
          <p className='text-sm text-gray-700 font-medium'>{title}</p>
          <p className='text-xs text-gray-400 mt-1'>{date}</p>

          {/* Money amount below date - only on mobile */}
          <div className={`md:hidden flex items-center gap-2 px-3 py-1.5 rounded-md mt-2 ${getAmountStyles()}`}>
            <h6 className='text-xs font-medium'>
              {type === 'income' ? '+' : '-'}${amount}
            </h6>
            {type === 'income' ? <LuTrendingUp /> : <LuTrendingDown />}
          </div>
        </div>

        <div className='flex flex-col items-end gap-2 md:flex-row md:items-center'>
          {!hideDeleteBtn && (
            <button
              className='text-gray-400 hover:text-red-500 transition-opacity cursor-pointer opacity-100 md:opacity-0 md:group-hover:opacity-100 w-9 h-9 flex items-center justify-center mt-2 md:mt-0'
              onClick={onDelete}
              aria-label='Delete transaction'
              style={{ minWidth: 36, minHeight: 36 }}
            >
              <LuTrash2 size={18} />
            </button>
          )}

          {/* Money amount on right - only on desktop */}
          <div className={`hidden md:flex items-center gap-2 px-3 py-1.5 rounded-md ${getAmountStyles()}`}>
            <h6 className='text-xs font-medium'>
              {type === 'income' ? '+' : '-'}${amount}
            </h6>
            {type === 'income' ? <LuTrendingUp /> : <LuTrendingDown />}
          </div>
        </div>
      </div>
    </div>
  )
}

export default TransactionInfoCard




