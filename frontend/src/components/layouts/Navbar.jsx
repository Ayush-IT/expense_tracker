import React, { useState } from 'react'

import { HiOutlineMenu, HiOutlineX } from 'react-icons/hi';
import SideMenu from './SideMenu';


const Navbar = ({ activeMenu, onLogoutClick }) => {
  const [openSideMenu, setOpenSideMenu] = useState(false);

  return (
    <div className='flex gap-5 bg-white/60 backdrop-blur-md border-b border-white/20 py-4 px-7 sticky top-0 z-30 shadow-sm'>
      <button
        className='block lg:hidden text-gray-700 hover:text-gray-900 transition-colors'
        onClick={() => {
          setOpenSideMenu(!openSideMenu);
        }}
      >
        {openSideMenu ? <HiOutlineX className='text-2xl' /> : <HiOutlineMenu className='text-2xl' />}
      </button>

      <h2 className='text-lg font-medium text-gray-800'>Expense Tracker</h2>

      {openSideMenu && (
        <div className='fixed top-[61px] -ml-4 bg-white/90 backdrop-blur-md border border-white/20 rounded-br-lg shadow-lg'>
          <SideMenu
            activeMenu={activeMenu}
            onLogoutClick={onLogoutClick}
          />
        </div>
      )}
    </div>
  )
}

export default Navbar
