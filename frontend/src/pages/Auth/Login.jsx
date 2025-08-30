import React, { useContext, useEffect, useRef, useState } from 'react'
import toast from 'react-hot-toast';

import AuthLayout from '../../components/layouts/AuthLayout'
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import { validateEmail } from '../../utils/helper';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import { UserContext } from '../../context/UserContext';
import Alert from '../../components/Alert';

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
                // extract message from various possible error shapes
                const msg = (e && (e?.message || e?.response?.data?.message || e?.data?.message || (typeof e === 'string' && e))) || 'Google sign-in failed';
                setError(msg);
                toast.error(msg);
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
          } catch (err) {
        // ignore render errors
        console.warn('Google button render error', err);
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

      if (token) {
        localStorage.setItem('token', token);
        updateUser(user); // Update user context with the logged-in user data
        toast.success('Logged in successfully');
        navigate('/dashboard');
      }
    } catch (err) {
      const msg = (err && (err?.message || err?.response?.data?.message || err?.data?.message || (typeof err === 'string' && err))) || 'Login failed. Please try again.';
      setError(msg);
    }
  }
    
  return (
      <AuthLayout>
  <div className='lg:w-[70%] min-h-[60vh] md:min-h-full flex flex-col justify-start gap-3 pt-6'>
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

             {error && <div className='mb-3'><Alert type='error' message={error} autoDismiss={5000} onClose={() => setError(null)} /></div>}

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
