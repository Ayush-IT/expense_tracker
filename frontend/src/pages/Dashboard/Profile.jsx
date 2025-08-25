import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import { useUserAuth } from '../../hooks/useUserAuth';
import DashboardLayout from '../../components/layouts/DashboardLayout';
import toast from 'react-hot-toast';
import { LuUser, LuCalendar, LuShield, LuPenTool } from 'react-icons/lu';
import ProfileEditForm from '../../components/Profile/ProfileEditForm';

const Profile = () => {
    useUserAuth();
    const { user, updateUser } = useContext(UserContext);
    const [isEditing, setIsEditing] = useState(false);

    const handleEditSuccess = (updatedUser) => {
        updateUser(updatedUser);
        setIsEditing(false);
        toast.success('Profile updated successfully!');
    };

    const handleCancelEdit = () => {
        setIsEditing(false);
    };

    if (isEditing) {
        return (
            <DashboardLayout activeMenu="Profile">
                <ProfileEditForm
                    user={user}
                    onCancel={handleCancelEdit}
                    onSuccess={handleEditSuccess}
                />
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout activeMenu="Profile">
            <div className="py-4 sm:py-6 lg:py-8">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                {/* Header */}
                <div className="mb-6 sm:mb-8">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Profile</h1>
                    <p className="text-gray-600 mt-1 sm:mt-2 text-sm sm:text-base">Manage your account settings and preferences</p>
                </div>

                {/* Profile Card */}
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Gradient Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8 py-6 sm:py-8 text-white">
                        <div className="flex flex-col sm:flex-row items-center sm:justify-between gap-4 sm:gap-6">
                            <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-center sm:text-left">
                                <div className="w-20 h-20 sm:w-24 sm:h-24 bg-white/20 rounded-full flex items-center justify-center flex-shrink-0">
                                    {user?.profileImageUrl ? (
                                        <img
                                            src={user.profileImageUrl}
                                            alt="Profile"
                                            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full object-cover"
                                        />
                                    ) : (
                                        <LuUser className="text-3xl sm:text-4xl text-white" />
                                    )}
                                </div>
                                <div className="min-w-0">
                                    <h2 className="text-xl sm:text-2xl font-bold truncate">{user?.fullName || 'User Name'}</h2>
                                    <p className="text-blue-100 text-base sm:text-lg truncate">{user?.email || 'user@example.com'}</p>
                                </div>
                            </div>
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 text-white px-3 sm:px-4 py-2 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base whitespace-nowrap"
                            >
                                <LuPenTool className="text-base sm:text-lg" />
                                <span className="hidden sm:inline">Edit Profile</span>
                                <span className="sm:hidden">Edit</span>
                            </button>
                        </div>
                    </div>

                    {/* Profile Information */}
                    <div className="p-4 sm:p-6 lg:p-8">
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8">
                            {/* Personal Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <LuUser className="text-blue-500" />
                                    Personal Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Full Name
                                        </label>
                                        <p className="text-gray-900 font-medium">
                                            {user?.fullName || 'Not provided'}
                                        </p>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Email Address
                                        </label>
                                        <p className="text-gray-900 font-medium">
                                            {user?.email || 'Not provided'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Account Information */}
                            <div className="space-y-6">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <LuShield className="text-green-500" />
                                    Account Information
                                </h3>

                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Account Status
                                        </label>
                                        <div className="flex items-center gap-2">
                                            <div className={`w-3 h-3 rounded-full ${user?.isVerified ? 'bg-green-500' : 'bg-yellow-500'}`}></div>
                                            <span className={`text-sm font-medium ${user?.isVerified ? 'text-green-600' : 'text-yellow-600'}`}>
                                                {user?.isVerified ? 'Verified' : 'Pending Verification'}
                                            </span>
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-500 mb-1">
                                            Member Since
                                        </label>
                                        <p className="text-gray-900 font-medium flex items-center gap-2">
                                            <LuCalendar className="text-gray-400" />
                                            {user?.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', {
                                                year: 'numeric',
                                                month: 'long',
                                                day: 'numeric'
                                            }) : 'Not available'}
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-6 sm:pt-8 border-t border-gray-200">
                            <button
                                onClick={() => setIsEditing(true)}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 sm:px-6 py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base"
                            >
                                <LuPenTool className="text-base sm:text-lg" />
                                Edit Profile
                            </button>
                        </div>
                    </div>
                </div>
            </div>
            </div>
        </DashboardLayout>
    );
};

export default Profile;
