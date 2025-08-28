import React, { useContext, useEffect, useRef, useState } from 'react'

import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';

const Login = () => {
 
 const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null); 

  const { updateUser } = useContext(UserContext);

  const navigate = useNavigate();
  const googleBtnRef = useRef(null);

  // Google Identity Services
  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) return; // silently no-op if not configured

    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => {
      try {
        /* global google */
        if (window.google && window.google.accounts && googleBtnRef.current) {
          window.google.accounts.id.initialize({
            client_id: clientId,
            callback: async (response) => {
              const idToken = response?.credential;
              if (!idToken) return;
              try {
                const res = await axiosInstance.post(API_PATHS.AUTH.GOOGLE, { idToken });
                const { token, user } = res.data || {};
                if (token) {
                  localStorage.setItem('token', token);
                  updateUser(user);
                  navigate('/dashboard');
                }
              } catch (e) {
                setError(e?.response?.data?.message || 'Google sign-in failed');
              }
            },
            ux_mode: 'popup',
          });

          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            text: 'continue_with',
            width: 320,
          });
        }
      } catch (e) {
        // ignore render errors
      }
    };
    document.body.appendChild(script);

    return () => {
      // best-effort cleanup
      if (script && script.parentNode) script.parentNode.removeChild(script);
    };
  }, [navigate, updateUser]);

  const handleLogin = async (e) => {
    e.preventDefault();
    const emailTrim = email.trim();
     
    if(!validateEmail(emailTrim)) {
      setError('Please enter a valid email address');
      return;
    } 

    if(!password) {
      setError('Password is required');
      return;
    }
    
    setError("");

    //Login API Call
    try {
      const response = await axiosInstance.post(API_PATHS.AUTH.LOGIN, {
        email: emailTrim,
        password
    });
    const { token, user } = response.data;

    if(token) {
      localStorage.setItem('token', token);
      updateUser(user); // Update user context with the logged-in user data
      navigate('/dashboard');
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
        setError(error.response.data.message || 'Login failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  }
    
  return (
      <AuthLayout>
        <div className='lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center'>
         <h3 className='text-xl font-semibold text-black'>Welcome Back</h3>
          <p className='text-[13px] text-slate-700 mt-[5px] mb-6'>
            Please Enter your Detail to Login
          </p>

          <form onSubmit={handleLogin}>
            <Input
             value={email}
              onChange={({ target }) => setEmail(target.value)}
              label="Email Address"
              type="email"
              placeholder="jhon@example.com"  
              autoComplete="email"
              inputMode="email"
              autoCapitalize="none"
              autoCorrect="off"
             />
            <Input
             value={password}
              onChange={({ target }) => setPassword(target.value)}
              label="Password"
              type="password"
              placeholder="Minimum 8 characters"  
             />

             <div className='flex justify-end -mt-1 mb-3'>
               <Link to='/auth/forgot' className='text-[12px] text-primary underline'>Forgot password?</Link>
             </div>

             {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

             <button type='submit' className='btn-primary'>LOGIN</button>

             <div className='my-3 flex items-center'>
               <div className='h-px bg-slate-200 flex-1' />
               <span className='px-3 text-xs text-slate-500'>OR</span>
               <div className='h-px bg-slate-200 flex-1' />
             </div>

             <div className='flex justify-center'>
               <div ref={googleBtnRef} />
             </div>

             <p className='text-[13px] text-slate-800 mt-3'>
              Don't have an account? {" "}
              <Link className='font-medium text-primary underline' to="/signup">SignUp</Link>
             </p>

            </form>
        </div>
      </AuthLayout>
    
  )
}

export default Login
