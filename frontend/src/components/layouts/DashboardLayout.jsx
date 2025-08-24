import React, { useContext, useState } from 'react'
import { UserContext } from '../../context/UserContext';
import Navbar from './Navbar';
import SideMenu from './SideMenu';
import Modal from '../Modal';

const DashboardLayout = ({ children, activeMenu }) => {
  const { user, clearUser } = useContext(UserContext);
  const [showLogoutModal, setShowLogoutModal] = useState(false);

  const handleLogout = () => {
    localStorage.clear();
    clearUser();
    window.location.href = '/login';
  };

  const handleLogoutConfirm = () => {
    setShowLogoutModal(false);
    handleLogout();
  };

  return (
    <div className=''>
      <Navbar activeMenu={activeMenu} onLogoutClick={() => setShowLogoutModal(true)} />

      {user && (
        <div className='flex'>
          <div className='max-[1080px]:hidden'>
            <SideMenu
              activeMenu={activeMenu}
              onLogoutClick={() => setShowLogoutModal(true)}
            />
          </div>

          <div className='grow mx-5'>{children}</div>
        </div>
      )}

      {/* Logout Confirmation Modal - Rendered at page level for proper positioning */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Confirm Logout"
      >
        <div className="text-center">
          <p className="text-gray-600 mb-6">Are you sure you want to logout?</p>
          <div className="flex gap-3 justify-center">
            <button
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-gray-600 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleLogoutConfirm}
              className="px-4 py-2 text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
            >
              Logout
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}

export default DashboardLayout
