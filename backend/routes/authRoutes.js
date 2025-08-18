const express = require('express');
const cors = require('cors');
const { protect } = require('../middleware/authMiddleware');

const{
    registerUser,
    loginUser,  
    getUserInfo,
    verifyEmail,
    resendVerification,
    forgotPassword,
    resetPassword,
}= require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');


const router = express.Router();

router.post('/register', registerUser);

router.post('/login', loginUser);

router.get('/getUser', protect, getUserInfo);

// Email verification
router.get('/verify-email', verifyEmail);
router.post('/resend-verification', resendVerification);

// Password reset
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

// Redirect legacy/reset-link hits on backend to frontend app
router.get('/reset', (req, res) => {
  const base = (process.env.CLIENT_URL || process.env.APP_BASE_URL || '').replace(/\/$/, '');
  if (!base) {
    return res.status(500).send('CLIENT_URL not configured on server');
  }
  const { token = '', email = '' } = req.query || {};
  const qs = new URLSearchParams({ token, email }).toString();
  return res.redirect(302, `${base}/auth/reset?${qs}`);
});

// router.post("/upload-image", upload.single('image'), (req, res) => {    
//     if (!req.file) {
//         return res.status(400).json({ message: 'No file uploaded.' });
//     }
//     const protocol = req.protocol;  // Use dynamic protocol instead of hardcoding
//     const imageUrl = `${protocol}://${req.get('host')}/uploads/${req.file.filename}`;
//     res.status(200).json({ imageUrl });
// });     


router.post("/upload-image", upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'No file uploaded.' });
  }
  // Cloudinary returns the image URL in req.file.path
  res.status(200).json({ imageUrl: req.file.path });
});

module.exports = router;

