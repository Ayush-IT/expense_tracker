import React, { useRef, useState, useEffect } from 'react'

import { LuUser, LuUpload, LuTrash } from 'react-icons/lu';
import Input from './Input';

const ProfilePhotoSelector = ({ setImage, currentImage, onImageChange, size = 'w-20 h-20' }) => {

  const inputRef = useRef(null);
  const [previewUrl, setPreviewUrl] = useState(null);

  // Set initial preview from currentImage prop (for Profile usage)
  useEffect(() => {
    if (currentImage) {
      setPreviewUrl(currentImage);
    }
  }, [currentImage]);

  const handleImageChange = (event) => {
    const file = event.target.files[0];

    if (file) {
      const preview = URL.createObjectURL(file);
      setPreviewUrl(preview);

      // Handle both prop patterns
      if (setImage) {
        setImage(file); // For SignUp usage
      }
      if (onImageChange) {
        onImageChange(file); // For Profile usage
      }
    }
  };

  const handleRemoveImage = () => {

    // Reset to current image if available, otherwise clear
    if (currentImage) {
      setPreviewUrl(currentImage);
    } else {
      setPreviewUrl(null);
    }

    // Handle both prop patterns
    if (setImage) {
      setImage(null); // For SignUp usage
    }
    if (onImageChange) {
      onImageChange(null); // For Profile usage
    }
  };

  const onChooseFile = () => {
    if (inputRef.current) {
      // Reset the value so selecting the same file again still triggers onChange
      inputRef.current.value = null;
      inputRef.current.click();
    }
  };

  return <div className='flex justify-center mb-6'>
    <Input
      type="file"
      accept="image/*"
      ref={inputRef}
      onChange={handleImageChange}
      className="hidden"
    />

    {!previewUrl ? (
      <div className={`${size} flex items-center justify-center bg-purple-100 rounded-full relative`}>
        <LuUser className='text-4xl text-primary' />

        <button
          type='button'
          className='w-8 h-8 flex items-center justify-center bg-primary text-white rounded-full absolute -bottom-1 -right-1'
          onClick={onChooseFile}
        >
          <LuUpload />
        </button>
      </div>
    ) : (
      <div className='relative'>
        <img
          src={previewUrl}
          alt='profile photo'
          className={`${size} rounded-full object-cover cursor-pointer`}
          onClick={onChooseFile}
          title='Change photo'
        />
        {/* Change photo button (overlay) */}
        <button
          type='button'
          className='w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-full absolute -bottom-1 -right-10'
          onClick={onChooseFile}
          title='Change photo'
        >
          <LuUpload />
        </button>
        {/* Remove photo button (overlay) */}
        <button
          type='button'
          className='w-8 h-8 flex items-center justify-center bg-red-500 text-white rounded-full absolute -bottom-1 -right-1'
          onClick={handleRemoveImage}
          title='Remove selected photo'
        >
          <LuTrash />
        </button>
      </div>
    )}
  </div>

}

export default ProfilePhotoSelector
