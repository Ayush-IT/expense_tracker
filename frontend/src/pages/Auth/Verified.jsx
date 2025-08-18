import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import AuthLayout from '../../components/layouts/AuthLayout';

function useQuery() {
  const { search } = useLocation();
  return React.useMemo(() => new URLSearchParams(search), [search]);
}

const Verified = () => {
  const query = useQuery();
  const status = query.get('status');
  const reason = query.get('reason');

  const isSuccess = status === 'success';

  const title = isSuccess ? 'Email verified!' : 'Verification failed';
  const subtitle = isSuccess
    ? 'Your email has been verified successfully. You can now log in to your account.'
    : reason === 'invalid_or_expired'
      ? 'The verification link is invalid or has expired. Please request a new verification email from the sign up page.'
      : 'We could not verify your email. Please try again.';

  return (
    <AuthLayout>
      <div className='w-full mt-10 flex flex-col items-center justify-center px-4 sm:px-8 text-center'>
        {isSuccess ? (
          <div className='mb-3 flex items-center justify-center'>
            <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-green-100'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' className='h-7 w-7 text-green-600'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M9 12l2 2 4-4' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' />
              </svg>
            </span>
          </div>
        ) : (
          <div className='mb-3 flex items-center justify-center'>
            <span className='inline-flex h-12 w-12 items-center justify-center rounded-full bg-red-100'>
              <svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='currentColor' className='h-7 w-7 text-red-600'>
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M15 9l-6 6m0-6l6 6' />
                <path strokeLinecap='round' strokeLinejoin='round' strokeWidth='2' d='M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z' />
              </svg>
            </span>
          </div>
        )}
        <h3 className='text-2xl font-semibold text-black'>{title}</h3>
        <p className='text-sm text-slate-700 mt-2 max-w-md'>{subtitle}</p>

        <div className='flex gap-3 mt-6'>
          <Link to='/login' className='btn-primary text-sm'>Go to Login</Link>
          {!isSuccess && (
            <Link to='/signup' className='btn-secondary text-sm'>Back to Sign Up</Link>
          )}
        </div>
      </div>
    </AuthLayout>
  );
};

export default Verified;
