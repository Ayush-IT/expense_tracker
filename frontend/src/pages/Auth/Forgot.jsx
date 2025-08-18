import React, { useState } from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import Input from '../../components/Inputs/Input';
import { Link } from 'react-router-dom';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { validateEmail } from '../../utils/helper';
import { toast } from 'react-hot-toast';

const Forgot = () => {
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    const normalized = (email || '').trim().toLowerCase();
    if (!validateEmail(normalized)) {
      setError('Enter a valid email');
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(API_PATHS.AUTH.FORGOT_PASSWORD, { email: normalized });
      setInfo('If that email exists, a reset link has been sent. Please check your inbox.');
      toast.success('If that email exists, a reset link has been sent.');
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to send reset email');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className='w-full mt-10 flex flex-col justify-center px-4 sm:px-8'>
        <h3 className='text-xl font-semibold text-black text-center sm:text-left'>Forgot password</h3>
        <p className='text-sm text-slate-700 mt-1 mb-6 text-center sm:text-left'>We'll email you a link to reset your password.</p>

        <form onSubmit={onSubmit} className='w-full max-w-md mx-auto'>
          <Input
            value={email}
            onChange={({ target }) => setEmail(target.value)}
            label='Email Address'
            type='email'
            placeholder='john@example.com'
            className='text-sm'
          />

          {error && <p className='text-red-500 text-xs pt-2'>{error}</p>}
          {info && <p className='text-green-600 text-xs pt-2'>{info}</p>}

          <button type='submit' disabled={submitting} className='btn-primary mt-4 py-2 text-sm disabled:opacity-70'>
            {submitting ? 'Sending…' : 'Send reset link'}
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Remembered your password? <Link className='font-medium text-primary underline' to='/login'>Login</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Forgot;
