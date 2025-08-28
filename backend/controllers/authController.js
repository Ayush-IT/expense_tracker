const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User = require('../models/User');
const { sendEmail, buildVerificationEmail, buildPasswordResetEmail } = require('../utils/sendEmail');
const { OAuth2Client } = require('google-auth-library');

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);


const generateToken = (id) => {

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// Forgot Password: generate reset token and send email
exports.forgotPassword = async (req, res) => {
    const { email } = req.body || {};
    if (!email) return res.status(400).json({ message: 'Email is required' });

    try {
        const normEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normEmail });
        if (!user) {
            // Avoid user enumeration
            return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
        }

        const token = user.generatePasswordResetToken();
        await user.save({ validateBeforeSave: false });

        const { subject, html } = buildPasswordResetEmail({ name: user.fullName, email: user.email, token });
        try {
            await sendEmail({ to: user.email, subject, html });
        } catch (e) {
            // cleanup on send failure
            user.resetPasswordToken = null;
            user.resetPasswordExpires = null;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Failed to send reset email' });
        }

        return res.status(200).json({ message: 'If that email exists, a reset link has been sent' });
    } catch (err) {
        return res.status(500).json({ message: 'Error initiating password reset', error: err.message });
    }
};

// Reset Password: validate token and set new password
exports.resetPassword = async (req, res) => {
    const { token, email, newPassword } = req.body || {};
    if (!token || !email || !newPassword) {
        return res.status(400).json({ message: 'Token, email and newPassword are required' });
    }

    try {
        const normEmail = email.trim().toLowerCase();
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        const user = await User.findOne({
            email: normEmail,
            resetPasswordToken: hashed,
            resetPasswordExpires: { $gt: Date.now() },
        }).select('+resetPasswordToken +resetPasswordExpires');

        if (!user) {
            return res.status(400).json({ message: 'Invalid or expired reset token' });
        }

        user.password = newPassword;
        user.resetPasswordToken = null;
        user.resetPasswordExpires = null;
        await user.save(); // runs password hash pre-save

        return res.status(200).json({ message: 'Password has been reset successfully' });
    } catch (err) {
        return res.status(500).json({ message: 'Error resetting password', error: err.message });
    }
};

// exports.registerUser = async (req, res) => {

//     // const { fullName, email, password, profileImageUrl } = req.body;

//     if (!fullName || !email || !password) {
//         return res.status(400).json({ message: 'All fields required' });
//     }

//     try {
//         const existingUser = await User.findOne({ email });

//         if (existingUser) {
//             return res.status(400).json({ message: 'User already exists' });
//         }

//         const user = await User.create({
//             fullName,
//             email,
//             password,
//             profileImageUrl, 
//         });


//         res.status(201).json({
//             id: user._id,
//             user,
//             token: generateToken(user._id),
//         });
//     } catch (error) {
//         res.status(500).json({ message: 'Error Registering User', error: error.message });
//     }
// };

exports.registerUser = async (req, res) => {
    if (!req.body) {
        return res.status(400).json({ message: 'Request body is missing' });
    }

    const { fullName, email, password, profileImageUrl } = req.body;

    if (!fullName || !email || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        const normEmail = email.trim().toLowerCase();
        const existingUser = await User.findOne({ email: normEmail });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email: normEmail,
            password,
            profileImageUrl,
        });

        // Generate email verification token and send email
        const plainToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        const { subject, html } = buildVerificationEmail({ name: user.fullName, email: user.email, token: plainToken });
        try {
            await sendEmail({ to: user.email, subject, html });
        } catch (e) {
            // if email fails, clear token fields
            console.error('Email send error:', e); 
            user.verificationToken = null;
            user.verificationTokenExpires = null;
            await user.save({ validateBeforeSave: false });
            return res.status(500).json({ message: 'Failed to send verification email' });
        }

        res.status(201).json({
            message: 'Registration successful. Please verify your email to log in.',
        });
    } catch (error) {
        res.status(500).json({ message: 'Error Registering User', error: error.message });
    }
};


exports.loginUser = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({ message: 'All fields required' });
    }

    try {
        const normEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normEmail });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        if (!user.isVerified) {
            return res.status(403).json({ message: 'Email not verified. Please verify your email.' });
        }

        res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id), 
        });
    } catch (err) {
        res.status(500).json({ message: 'Error Logging In', error: err.message });
    } 
};

// Verify email handler (redirects to frontend)
exports.verifyEmail = async (req, res) => {
    const { token, email } = req.query;
    const frontendBase = (process.env.CLIENT_URL || process.env.APP_BASE_URL || '').replace(/\/$/, '');
    const successUrl = frontendBase ? `${frontendBase}/auth/verified?status=success` : null;
    const failedUrl = frontendBase ? `${frontendBase}/auth/verified?status=failed&reason=invalid_or_expired` : null;

    if (!token || !email) {
        if (failedUrl) return res.redirect(failedUrl);
        return res.status(400).json({ message: 'Token and email are required' });
    }

    try {
        const hashed = crypto.createHash('sha256').update(token).digest('hex');
        const normEmail = email.trim().toLowerCase();
        const user = await User.findOne({
            email: normEmail,
            verificationToken: hashed,
            verificationTokenExpires: { $gt: Date.now() },
        });

        if (!user) {
            if (failedUrl) return res.redirect(failedUrl);
            return res.status(400).json({ message: 'Invalid or expired verification token' });
        }

        user.isVerified = true;
        user.verificationToken = null;
        user.verificationTokenExpires = null;
        await user.save({ validateBeforeSave: false });

        if (successUrl) return res.redirect(successUrl);
        return res.status(200).json({ message: 'Email verified successfully. You can now log in.' });
    } catch (error) {
        if (failedUrl) return res.redirect(failedUrl);
        return res.status(500).json({ message: 'Error verifying email', error: error.message });
    }
};

// Resend verification email
exports.resendVerification = async (req, res) => {
    const { email } = req.body;
    if (!email) {
        return res.status(400).json({ message: 'Email is required' });
    }

    try {
        const normEmail = email.trim().toLowerCase();
        const user = await User.findOne({ email: normEmail });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (user.isVerified) {
            return res.status(400).json({ message: 'Email already verified' });
        }

        const plainToken = user.generateEmailVerificationToken();
        await user.save({ validateBeforeSave: false });

        const { subject, html } = buildVerificationEmail({ name: user.fullName, email: user.email, token: plainToken });
        await sendEmail({ to: user.email, subject, html });

        return res.status(200).json({ message: 'Verification email resent' });
    } catch (error) {
        return res.status(500).json({ message: 'Error resending verification email', error: error.message });
    }
};

exports.getUserInfo = async (req, res) => {
    const userId = req.user.id;

    try {
        const user = await User.findById(userId).select('-password'); // Exclude password from response

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        res.status(200).json(user);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching user info', error: error.message });
    }
}; 

// Google OAuth Login: verify ID token from Google Identity Services and issue our JWT
exports.googleLogin = async (req, res) => {
    const { idToken } = req.body || {};
    if (!idToken) {
        return res.status(400).json({ message: 'idToken is required' });
    }

    try {
        // Verify token with Google
        const ticket = await googleClient.verifyIdToken({
            idToken,
            audience: process.env.GOOGLE_CLIENT_ID,
        });
        const payload = ticket.getPayload();
        const email = (payload?.email || '').toLowerCase();
        const fullName = payload?.name || 'Google User';
        const picture = payload?.picture || null;
        const emailVerified = !!payload?.email_verified;

        if (!email || !emailVerified) {
            return res.status(400).json({ message: 'Google account email not verified' });
        }

        // Upsert user
        let user = await User.findOne({ email });
        if (!user) {
            // Create a random password (never used) to satisfy schema requirements
            const randomPassword = crypto.randomBytes(16).toString('hex');
            user = await User.create({
                fullName,
                email,
                password: randomPassword,
                profileImageUrl: picture,
                isVerified: true,
            });
        } else {
            // Ensure verified and update basic profile fields if empty
            if (!user.isVerified) user.isVerified = true;
            if (!user.profileImageUrl && picture) user.profileImageUrl = picture;
            if (!user.fullName && fullName) user.fullName = fullName;
            await user.save({ validateBeforeSave: false });
        }

        return res.status(200).json({
            id: user._id,
            user,
            token: generateToken(user._id),
        });
    } catch (err) {
        return res.status(401).json({ message: 'Invalid Google token', error: err.message });
    }
};
