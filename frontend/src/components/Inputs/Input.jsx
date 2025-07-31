import React, { useState } from 'react'
import { FaRegEye, FaRegEyeSlash } from 'react-icons/fa6';

const Input = React.forwardRef(
  ({ value, onChange, placeholder, label, type, className = '', ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);

    const toggleShowPassword = () => {
      setShowPassword(!showPassword);
    };

    // For file input, don't render label, wrapper, or value
    if (type === 'file') {
      return (
        <input
          ref={ref}
          type="file"
          className={className}
          onChange={onChange}
          {...props}
        />
      );
    }

    return (
      <div>
        <label className='text-[13px] text-slate-800'>{label}</label>
        <div className='input-box'>
          <input
            ref={ref}
            type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
            placeholder={placeholder}
            className={`w-full bg-transparent outline-none ${className}`}
            value={value}
            onChange={onChange}
            {...props}
          />
          {type === 'password' && (
            <>
              {showPassword ? (
                <FaRegEye
                  size={22}
                  className='text-primary cursor-pointer'
                  onClick={toggleShowPassword}
                />
              ) : (
                <FaRegEyeSlash
                  size={22}
                  className='text-slate-400 cursor-pointer'
                  onClick={toggleShowPassword}
                />
              )}
            </>
          )}
        </div>
      </div>
    );
  }
);

export default Input;
