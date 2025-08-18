import React, { useContext, useState } from 'react'

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

  const handleLogin = async (e) => {
    e.preventDefault();
     
    if(!validateEmail(email)) {
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
        email,
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
              type="text"
              placeholder="jhon@example.com"  
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
