const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Update user profile
exports.updateProfile = async (req, res) => {
    try {
        const { fullName, email, currentPassword, newPassword, profileImageUrl } = req.body;
        const userId = req.user.id;

        // Find user
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Check if email is being changed and if it's already taken
        if (email && email !== user.email) {
            const existingUser = await User.findOne({ email: email.toLowerCase() });
            if (existingUser) {
                return res.status(400).json({ message: 'Email is already taken' });
            }
        }

        // Update basic fields
        if (fullName) user.fullName = fullName;
        if (email) user.email = email.toLowerCase();
        if (profileImageUrl) user.profileImageUrl = profileImageUrl;

        // Handle password change
        if (newPassword) {
            if (!currentPassword) {
                return res.status(400).json({ message: 'Current password is required to change password' });
            }

            // Verify current password
            const isPasswordValid = await user.comparePassword(currentPassword);
            if (!isPasswordValid) {
                return res.status(400).json({ message: 'Current password is incorrect' });
            }

            // Update password
            user.password = newPassword;
        }

        // Save user
        await user.save();

        // Return updated user (without password)
        const updatedUser = {
            _id: user._id,
            fullName: user.fullName,
            email: user.email,
            profileImageUrl: user.profileImageUrl,
            isVerified: user.isVerified,
            createdAt: user.createdAt,
            updatedAt: user.updatedAt
        };

        res.status(200).json({
            message: 'Profile updated successfully',
            user: updatedUser
        });

    } catch (error) {
        console.error('Profile update error:', error);
        res.status(500).json({ message: 'Error updating profile', error: error.message });
    }
};

// Upload profile image
exports.uploadProfileImage = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ message: 'No image file provided' });
        }

        const userId = req.user.id;

        // Get Cloudinary URL from uploaded file
        const imageUrl = req.file.path || req.file.secure_url; // Cloudinary returns the full URL in file.path (or secure_url)

        // Update user's profile image
        const user = await User.findByIdAndUpdate(
            userId,
            { profileImageUrl: imageUrl },
            { new: true, select: '-password' }
        );

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            message: 'Profile image uploaded successfully',
            profileImageUrl: user.profileImageUrl,
            imageUrl: imageUrl, // alias for consistency with other upload endpoint
            cloudinaryUrl: imageUrl
        });

    } catch (error) {
        console.error('Profile image upload error:', error);
        res.status(500).json({ message: 'Error uploading profile image', error: error.message });
    }
};

// Get user profile
exports.getProfile = async (req, res) => {
    try {
        const userId = req.user.id;

        const user = await User.findById(userId).select('-password');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json({
            user
        });

    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({ message: 'Error fetching profile', error: error.message });
    }
};
