import React from 'react'

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Login from './pages/Auth/Login'
import SignUp from './pages/Auth/SignUp'    
import Verified from './pages/Auth/Verified'
import Forgot from './pages/Auth/Forgot'
import Reset from './pages/Auth/Reset'
import Home from './pages/Dashboard/Home'
import Income from './pages/Dashboard/Income'
import Expense from './pages/Dashboard/Expense'
import Budgets from './pages/Dashboard/Budgets'
import UserProvider from './context/UserContext';
import { Toaster } from 'react-hot-toast';

const App = () => {
  return (
    <UserProvider>
      <div>
      <Router>
        <Routes>
          <Route path="/" element={<Root />} />
          <Route path="/login" exact element={<Login />} />
          <Route path="/signup" exact element={<SignUp />} />
          <Route path="/auth/verified" element={<Verified />} />
          <Route path="/auth/forgot" element={<Forgot />} />
          <Route path="/auth/reset" element={<Reset />} />
          <Route path="/dashboard" exact element={<Home />} />
          <Route path="/income" exact element={<Income />} />
          <Route path="/expense" exact element={<Expense />} />
          <Route path="/budgets" exact element={<Budgets />} />
        </Routes>
      </Router>
     </div>

     <Toaster
      toastOptions={{
        className: 'bg-white text-black',
        style: {
          fontSize: '13px',
        },
      }}
     />
    </UserProvider>
    
  );
};

export default App;


const Root = () => {
  const isAuthenticated = !!localStorage.getItem("token");

  return isAuthenticated ? <Navigate to="/dashboard" /> : <Navigate to="/login" />;

};  