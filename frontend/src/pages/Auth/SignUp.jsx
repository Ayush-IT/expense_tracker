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

    const { token, user } = response.data;

    if(token) {
      localStorage.setItem('token', token);
      updateUser(user); // Update user context with the signed-up user data
      navigate('/dashboard');
    }
  } catch (error) {
    if (error.response && error.response.data.message) {
        setError(error.response.data.message || 'Sign up failed. Please try again.');
      } else {
        setError('An unexpected error occurred. Please try again later.');
      }
    }
  } 

  return (
    // <AuthLayout>
    //    <div className='lg:w-[100%] h-auto md:h-full mt-10 md:mt-10 flex flex-col justify-center'>
    //     <h3 className='text-xl font-semibold text-black'>Create an Account</h3>
    //     <p className='text-xs text-slate-700 mt-[5px] mb-6'>
    //       Join us and start tracking your expenses today!
    //     </p>

    //     <form onSubmit={handleSignUp}>

    //       <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />

    //       <div className='grid grid-cols-1 md:grid-cols-2 sm:grid-cols-2 gap-4'>
    //         <Input 
    //           value={fullName}
    //           onChange={({ target }) => setFullName(target.value)}
    //           label="Full Name"
    //           type="text"
    //           placeholder="John"
    //         />
    //          <Input
    //          value={email}
    //           onChange={({ target }) => setEmail(target.value)}
    //           label="Email Address"
    //           type="text"
    //           placeholder="jhon@example.com"  
    //          />

    //          <div className='col-span-2 sm:col-span-2'>
    //           <Input
    //           value={password}
    //           onChange={(e) => setPassword(e.target.value)}
    //           label="Password"
    //           type="password"
    //           placeholder="Min 8 characters"  
    //          />
    //          </div>
    //       </div>

    //       {error && <p className='text-red-500 text-xs pb-2.5'>{error}</p>}

    //          <button type='submit' className='btn-primary'>SIGN UP</button>

    //          <p className='text-[13px] text-slate-800 mt-3'>
    //           Already have an account? {" "}
    //           <Link className='font-medium text-primary underline' to="/login">Login</Link>
    //          </p>
    //     </form>
    //    </div>
    // </AuthLayout>

<AuthLayout>
  <div className='w-full mt-10 flex flex-col justify-center px-4 sm:px-8'>
    <h3 className='text-xl font-semibold text-black text-center sm:text-left'>
      Create an Account
    </h3>
    <p className='text-sm lg:text-base text-slate-700 mt-1 mb-6 text-center sm:text-left'>
      Join us and start tracking your expenses today!
    </p>

    <form onSubmit={handleSignUp} className='w-full max-w-md lg:max-w-2xl mx-auto'>
      {/* Profile photo - Centered on mobile */}
      <div className='flex justify-center mb-4'>
        <ProfilePhotoSelector image={profilePic} setImage={setProfilePic} />
      </div>

      {/* Inputs - stacked on mobile, grid on sm+, wider & spaced on lg */}
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

      {/* Error message */}
      {error && <p className='text-red-500 text-xs pt-2'>{error}</p>}

      {/* Submit Button */}
      <button
        type='submit'
        className='btn-primary mt-4 py-2 lg:py-3 text-sm lg:text-base'
      >
        SIGN UP
      </button>

      {/* Login link */}
      <p className='text-[13px] lg:text-sm text-slate-800 mt-3 mb-2.5 text-center sm:text-left'>
        Already have an account?{" "}
        <Link className='font-medium text-primary underline' to="/login">Login</Link>
      </p>
    </form>
  </div>
</AuthLayout>


  )
}

export default SignUp
