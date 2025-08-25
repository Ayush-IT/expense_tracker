const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const uploadMiddleware = require('../middleware/uploadMiddleware');
const {
    updateProfile,
    uploadProfileImage,
    getProfile
} = require('../controllers/profileController');

// Get user profile
router.get('/', protect, getProfile);

// Update user profile
router.put('/update', protect, updateProfile);

// Upload profile image
router.post('/upload-image', protect, uploadMiddleware.single('profileImage'), uploadProfileImage);

module.exports = router;
