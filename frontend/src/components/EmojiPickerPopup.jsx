
import React, { useState } from 'react'
import EmojiPicker from 'emoji-picker-react'
import { LuImage, LuX } from 'react-icons/lu'

const EmojiPickerPopup = ({ icon, onSelect }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className='flex flex-col md:flex-row items-start gap-5 mb-6 w-full'>
      {/* Trigger Button */}
      <div
        className='flex items-center gap-4 cursor-pointer'
        onClick={() => setIsOpen(true)}
      >
        <div className='w-12 h-12 flex items-center justify-center text-2xl bg-purple-50 text-primary rounded-lg'>
          {icon ? (
            <img src={icon} alt='Icon' className='w-12 h-12 object-cover rounded-lg' />
          ) : (
            <LuImage />
          )}
        </div>
        <p className='text-sm md:text-base'>
          {icon ? 'Change Icon' : 'Pick Icon'}
        </p>
      </div>

      {/* Emoji Picker Popup */}
      {isOpen && (
        <div className='relative z-30 w-[90vw] max-w-xs md:w-auto md:max-w-none'>
          {/* Close Button */}
          <button
            className='w-7 h-7 flex items-center justify-center bg-white border border-gray-300 rounded-full absolute -top-2 -right-2 z-50 shadow-md'
            onClick={() => setIsOpen(false)}
          >
            <LuX className='text-gray-500 text-sm' />
          </button>

          {/* Scrollable container for mobile */}
          <div className='shadow-lg rounded-lg border border-gray-200 bg-white md:max-h-none md:overflow-visible max-h-[400px] overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 scrollbar-track-transparent'>
            <EmojiPicker
              open={isOpen}
              onEmojiClick={(emoji) => onSelect(emoji?.imageUrl || '')}
              skinTonesDisabled={true}
              width="100%"
              height="350px"
              lazyLoadEmojis={true}
            />
          </div>
        </div>
      )}
    </div>
  )
}

export default EmojiPickerPopup
