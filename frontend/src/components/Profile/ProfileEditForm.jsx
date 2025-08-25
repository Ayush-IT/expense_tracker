import React, { useState, useContext } from 'react';
import { UserContext } from '../../context/UserContext';
import axiosInstance from '../../utils/axiosInstance';
import { API_PATHS } from '../../utils/apiPaths';
import toast from 'react-hot-toast';
import { LuUser, LuMail, LuLock, LuCamera, LuX, LuSave, LuArrowLeft } from 'react-icons/lu';
import ProfilePhotoSelector from '../Inputs/ProfilePhotoSelector';

const ProfileEditForm = ({ user, onCancel, onSuccess }) => {
    const { updateUser } = useContext(UserContext);
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        fullName: user?.fullName || '',
        email: user?.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
    });
    const [profileImage, setProfileImage] = useState(null);
    const [showPasswordFields, setShowPasswordFields] = useState(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleImageChange = (file) => {
        setProfileImage(file);
    };

    const validateForm = () => {
        if (!formData.fullName.trim()) {
            toast.error('Full name is required');
            return false;
        }

        if (!formData.email.trim()) {
            toast.error('Email is required');
            return false;
        }

        if (showPasswordFields) {
            if (!formData.currentPassword) {
                toast.error('Current password is required');
                return false;
            }
            if (formData.newPassword && formData.newPassword !== formData.confirmPassword) {
                toast.error('New passwords do not match');
                return false;
            }
            if (formData.newPassword && formData.newPassword.length < 6) {
                toast.error('New password must be at least 6 characters');
                return false;
            }
        }

        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!validateForm()) return;

        setIsLoading(true);

        try {
            const updateData = {
                fullName: formData.fullName.trim(),
                email: formData.email.trim().toLowerCase(),
            };

            if (showPasswordFields && formData.newPassword) {
                updateData.currentPassword = formData.currentPassword;
                updateData.newPassword = formData.newPassword;
            }

            // If there's a new profile image, upload it first
            if (profileImage) {
                const formDataImage = new FormData();
                formDataImage.append('profileImage', profileImage);

                const imageResponse = await axiosInstance.post(API_PATHS.PROFILE.UPLOAD_PROFILE_IMAGE, formDataImage, {
                    headers: { 'Content-Type': 'multipart/form-data' }
                });

                updateData.profileImageUrl = imageResponse.data.profileImageUrl;
            }

            // Update user profile
            const response = await axiosInstance.put(API_PATHS.PROFILE.UPDATE_PROFILE, updateData);

            // Update local user context
            updateUser(response.data.user);

            toast.success('Profile updated successfully!');
            // Provide the updated user back to parent so dashboard can refresh immediately
            onSuccess(response.data.user);

        } catch (error) {
            const errorMessage = error.response?.data?.message || 'Failed to update profile';
            toast.error(errorMessage);
        } finally {
            setIsLoading(false);
        }
    };

    const handleCancel = () => {
        // Reset form data
        setFormData({
            fullName: user?.fullName || '',
            email: user?.email || '',
            currentPassword: '',
            newPassword: '',
            confirmPassword: '',
        });
        setProfileImage(null);
        setShowPasswordFields(false);
        onCancel();
    };

    return (
        <div className="py-4 sm:py-6 lg:py-8">
            <div className="max-w-4xl mx-auto px-3 sm:px-4 lg:px-6 xl:px-8">
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                    {/* Form Header */}
                    <div className="bg-gradient-to-r from-blue-500 to-purple-600 px-4 sm:px-6 lg:px-8 py-4 sm:py-6 text-white">
                        <div className="flex items-center justify-between">
                            <h2 className="text-xl sm:text-2xl font-bold">Edit Profile</h2>
                            <button
                                onClick={handleCancel}
                                className="text-white/80 hover:text-white transition-colors p-1"
                            >
                                <LuX className="text-xl sm:text-2xl" />
                            </button>
                        </div>
                    </div>

                    <form onSubmit={handleSubmit} className="p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
                        {/* Profile Image Section */}
                        <div className="space-y-3 sm:space-y-4">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <LuCamera className="text-blue-500 text-lg sm:text-xl" />
                                Profile Photo
                            </h3>
                            <ProfilePhotoSelector
                                currentImage={user?.profileImageUrl}
                                onImageChange={handleImageChange}
                                size="w-20 h-20 sm:w-24 sm:h-24"
                            />
                        </div>

                        {/* Personal Information */}
                        <div className="space-y-4 sm:space-y-6">
                            <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <LuUser className="text-blue-500 text-lg sm:text-xl" />
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6">
                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Full Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="fullName"
                                        value={formData.fullName}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter your full name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all duration-200"
                                        placeholder="Enter your email"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password Section */}
                        <div className="space-y-4 sm:space-y-6">
                            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <LuLock className="text-green-500 text-lg sm:text-xl" />
                                    Password
                                </h3>
                                <button
                                    type="button"
                                    onClick={() => setShowPasswordFields(!showPasswordFields)}
                                    className="text-blue-600 hover:text-blue-700 text-xs sm:text-sm font-medium self-start sm:self-auto"
                                >
                                    {showPasswordFields ? 'Hide' : 'Change Password'}
                                </button>
                            </div>

                            {showPasswordFields && (
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-6">
                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            Current Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="currentPassword"
                                            value={formData.currentPassword}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                            placeholder="Enter current password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            New Password
                                        </label>
                                        <input
                                            type="password"
                                            name="newPassword"
                                            value={formData.newPassword}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                            placeholder="Enter new password"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs sm:text-sm font-medium text-gray-700 mb-1 sm:mb-2">
                                            Confirm Password
                                        </label>
                                        <input
                                            type="password"
                                            name="confirmPassword"
                                            value={formData.confirmPassword}
                                            onChange={handleChange}
                                            className="w-full border border-gray-300 rounded-lg px-3 sm:px-4 py-2 sm:py-3 text-sm focus:ring-2 focus:ring-green-500 focus:border-green-500 transition-all duration-200"
                                            placeholder="Confirm new password"
                                        />
                                    </div>
                                </div>
                            )}
                        </div>

                        {/* Action Buttons */}
                        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 pt-4 sm:pt-6 border-t border-gray-200">
                            <button
                                type="button"
                                onClick={handleCancel}
                                className="flex items-center justify-center gap-2 px-4 sm:px-6 py-2 sm:py-3 border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors duration-200 text-sm sm:text-base order-2 sm:order-1"
                            >
                                <LuArrowLeft className="text-base sm:text-lg" />
                                Cancel
                            </button>

                            <button
                                type="submit"
                                disabled={isLoading}
                                className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-medium transition-colors duration-200 text-sm sm:text-base order-1 sm:order-2"
                            >
                                <LuSave className="text-base sm:text-lg" />
                                {isLoading ? 'Saving...' : 'Save Changes'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default ProfileEditForm;
