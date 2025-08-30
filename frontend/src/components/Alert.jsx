import React, { useEffect } from 'react'
import { FiAlertCircle, FiCheckCircle, FiInfo } from 'react-icons/fi'

const Alert = ({ type = 'error', message, autoDismiss = 0, onClose }) => {
  useEffect(() => {
    if (!autoDismiss || !message) return undefined
    const id = setTimeout(() => {
      if (typeof onClose === 'function') onClose()
    }, autoDismiss)
    return () => clearTimeout(id)
  }, [autoDismiss, message, onClose])

  if (!message) return null

  const configs = {
    error: { bg: 'bg-red-50', border: 'border-red-100', text: 'text-red-700', icon: <FiAlertCircle className='text-red-600' /> },
    success: { bg: 'bg-green-50', border: 'border-green-100', text: 'text-green-700', icon: <FiCheckCircle className='text-green-600' /> },
    info: { bg: 'bg-blue-50', border: 'border-blue-100', text: 'text-blue-700', icon: <FiInfo className='text-blue-600' /> },
  }

  const cfg = configs[type] || configs.error

  return (
    <div className={`w-full ${cfg.bg} ${cfg.border} border p-2 rounded-md flex items-start gap-2`}> 
      <div className='pt-0.5'>{cfg.icon}</div>
      <div className={`text-xs ${cfg.text}`}>{message}</div>
    </div>
  )
}

export default Alert
