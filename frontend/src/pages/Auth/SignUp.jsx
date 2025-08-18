import React, { useContext, useState } from 'react'

import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import ProfilePhotoSelector from '../../components/Inputs/ProfilePhotoSelector';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import uploadImage from '../../utils/uploadImage';



const SignUp = () => {

  const [profilePic, setProfilePic] = useState(null);
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const [error, setError] = useState(null);
  const [info, setInfo] = useState("");
  const [pendingVerify, setPendingVerify] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();


    let profileImageUrl = "";

    if(!fullName) {
      setError('Please enter your name');
      return;
    }

    if(!validateEmail(email)) {
      setError('Please enter a valid email address');
      return;
    }

    if(!password) {
      setError('Please enter a password');
      return;
    }

    setError("");
    setInfo("");
    setSubmitting(true);

    //SignUp API Call

    try {

      //Upload image if present
      if (profilePic) {
        const imgUploadRes = await uploadImage(profilePic);
        profileImageUrl = imgUploadRes.imageUrl || ""; // Assuming the response contains the image URL
      }
      const response = await axiosInstance.post(API_PATHS.AUTH.REGISTER, {
        fullName, 
        email,
        password,
        profileImageUrl
      });
      // New behavior: backend returns a message prompting email verification
      setPendingVerify(true);
      setInfo(response.data?.message || 'Registration successful. Please verify your email.');
    } catch (error) {
      if (error.response && error.response.data.message) {
          setError(error.response.data.message || 'Sign up failed. Please try again.');
        } else {
          setError('An unexpected error occurred. Please try again later.');
        }
    } finally {
      setSubmitting(false);
    }
  } 

  const handleResendVerification = async () => {
    setError("");
    setInfo("");
    try {
      await axiosInstance.post(API_PATHS.AUTH.RESEND_VERIFICATION, { email });
      setInfo('Verification email has been resent. Please check your inbox.');
    } catch (err) {
      const msg = err?.response?.data?.message || 'Failed to resend verification email.';
      setError(msg);
    }
  }

  return (
    <AuthLayout>
      <div className='w-full mt-10 flex flex-col justify-center px-4 sm:px-8'>
        {!pendingVerify ? (
          <>
            <h3 className='text-xl font-semibold text-black text-center sm:text-left'>
              Create an Account
            </h3>
            <p className='text-sm lg:text-base text-slate-700 mt-1 mb-6 text-center sm:text-left'>
              Join us and start tracking your expenses today!
            </p>

            <form onSubmit={handleSignUp} className='w-full max-w-md lg:max-w-2xl mx-auto'>
              <div className='flex justify-center mb-4'>
                <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
              </div>

              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 lg:gap-8'>
                <Input 
                  value={fullName}
                  onChange={({ target }) => setFullName(target.value)}
                  label="Full Name"
                  type="text"
                  placeholder="John"
                  className='text-sm lg:text-[14px]'
                />
                <Input
                  value={email}
                  onChange={({ target }) => setEmail(target.value)}
                  label="Email Address"
                  type="text"
                  placeholder="john@example.com"
                  className='text-sm lg:text-[14px]'
                />
                <div className='col-span-1 sm:col-span-2'>
                  <Input
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    label="Password"
                    type="password"
                    placeholder="Min 8 characters"
                    className='text-sm text-[14px]'
                  />
                </div>
              </div>

              {error && <p className='text-red-500 text-xs pt-2'>{error}</p>}

              <button
                type='submit'
                disabled={submitting}
                className='btn-primary mt-4 py-2 lg:py-3 text-sm lg:text-base disabled:opacity-70'
              >
                {submitting ? 'Please wait…' : 'SIGN UP'}
              </button>

              <p className='text-[13px] lg:text-sm text-slate-800 mt-3 mb-2.5 text-center sm:text-left'>
                Already have an account?{' '}
                <Link className='font-medium text-primary underline' to='/login'>Login</Link>
              </p>
            </form>
          </>
        ) : (
          <div className='w-full max-w-md mx-auto text-center'>
            <h3 className='text-xl font-semibold text-black'>
              Verify your email
            </h3>
            <p className='text-sm text-slate-700 mt-2'>
              We sent a verification link to <span className='font-medium'>{email}</span>.
            </p>
            <p className='text-sm text-slate-700'>
              Please check your inbox and click the link to activate your account.
            </p>
            {info && <p className='text-green-600 text-xs mt-3'>{info}</p>}
            {error && <p className='text-red-500 text-xs mt-2'>{error}</p>}
            <div className='flex items-center justify-center gap-3 mt-5'>
              <button onClick={handleResendVerification} className='btn-secondary text-sm'>
                Resend verification email
              </button>
              <Link to='/login' className='btn-primary text-sm'>Go to Login</Link>
            </div>
          </div>
        )}
      </div>
    </AuthLayout>
  )
}

export default SignUp
