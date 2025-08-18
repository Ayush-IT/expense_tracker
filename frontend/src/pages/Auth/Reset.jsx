import React, { useState, useMemo } from 'react';
import { useLocation, Link, useNavigate } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';
import Input from '../../components/Inputs/Input';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { toast } from 'react-hot-toast';

function useQuery() {
  const { search } = useLocation();
  return useMemo(() => new URLSearchParams(search), [search]);
}

const Reset = () => {
  const query = useQuery();
  const email = query.get('email') || '';
  const token = query.get('token') || '';

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [info, setInfo] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();

  const passwordStrength = (pwd) => {
    if (!pwd) return { label: '', color: '' };
    const length = pwd.length >= 8;
    const mix = /[a-z]/i.test(pwd) && /\d/.test(pwd);
    const special = /[^A-Za-z0-9]/.test(pwd);
    const score = [length, mix, special].filter(Boolean).length;
    if (score === 3) return { label: 'Strong', color: 'text-green-600' };
    if (score === 2) return { label: 'Medium', color: 'text-yellow-600' };
    return { label: 'Weak', color: 'text-red-600' };
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setInfo('');

    if (!token || !email) {
      setError('Invalid or missing reset link');
      return;
    }
    if (!password) {
      setError('Please enter a new password');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }

    try {
      setSubmitting(true);
      await axiosInstance.post(API_PATHS.AUTH.RESET_PASSWORD, { token, email, newPassword: password });
      setInfo('Password reset successful. Redirecting to login…');
      toast.success('Password updated');
      setTimeout(() => navigate('/login'), 1200);
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to reset password';
      setError(msg);
      toast.error(msg);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AuthLayout>
      <div className='w-full mt-10 flex flex-col justify-center px-4 sm:px-8'>
        <h3 className='text-xl font-semibold text-black text-center sm:text-left'>Set a new password</h3>
        <p className='text-sm text-slate-700 mt-1 mb-6 text-center sm:text-left'>Enter and confirm your new password.</p>

        <form onSubmit={onSubmit} className='w-full max-w-md mx-auto'>
          {(!token || !email) && (
            <p className='text-red-600 text-sm mb-3'>Reset link is invalid or missing. Request a new link from <Link className='underline' to='/auth/forgot'>Forgot password</Link>.</p>
          )}

          <div className='relative'>
            <Input
              value={password}
              onChange={({ target }) => setPassword(target.value)}
              label='New Password'
              type={showPwd ? 'text' : 'password'}
              placeholder='••••••••'
              className='text-sm pr-10'
            />
            <button type='button' onClick={() => setShowPwd(v => !v)} className='absolute right-3 top-9 text-xs text-primary underline'>
              {showPwd ? 'Hide' : 'Show'}
            </button>
          </div>

          <p className={`text-xs mt-1 ${passwordStrength(password).color}`}>{passwordStrength(password).label}</p>

          <div className='relative mt-3'>
            <Input
              value={confirmPassword}
              onChange={({ target }) => setConfirmPassword(target.value)}
              label='Confirm Password'
              type={showConfirm ? 'text' : 'password'}
              placeholder='••••••••'
              className='text-sm pr-10'
            />
            <button type='button' onClick={() => setShowConfirm(v => !v)} className='absolute right-3 top-9 text-xs text-primary underline'>
              {showConfirm ? 'Hide' : 'Show'}
            </button>
          </div>

          {error && <p className='text-red-500 text-xs pt-2'>{error}</p>}
          {info && <p className='text-green-600 text-xs pt-2'>{info}</p>}

          <button type='submit' disabled={submitting || !token || !email} className='btn-primary mt-4 py-2 text-sm disabled:opacity-70'>
            {submitting ? 'Resetting…' : 'Reset Password'}
          </button>

          <p className='text-[13px] text-slate-800 mt-3'>
            Back to <Link className='font-medium text-primary underline' to='/login'>Login</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default Reset;
