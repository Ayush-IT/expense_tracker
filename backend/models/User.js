const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    fullName: {
        type: String, required: true,
    },
    email: {  
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        index: true,
    },
    password: {
        type: String, required: true,
    },
    profileImageUrl: {
        type: String, default: null,    
    },
    isVerified: {
        type: Boolean,
        default: false,
    },
    verificationToken: {
        type: String,
        default: null,
        select: false,
    },
    verificationTokenExpires: {
        type: Date,
        default: null,
        select: false,
    },
    resetPasswordToken: {
        type: String,
        default: null,
        select: false,
    },
    resetPasswordExpires: {
        type: Date,
        default: null,
        select: false,
    },
}, { timestamps: true }); 


//Hash password before saving
UserSchema.pre('save', async function (next) { 
    if (!this.isModified('password')) {
        return next();
    }
    this.password = await bcrypt.hash(this.password, 10);
    next();
});

//Compare password
UserSchema.methods.comparePassword = async function (candidatePassword) {
    return await bcrypt.compare(candidatePassword, this.password);
}

// Generate and set password reset token (returns the plain token)
UserSchema.methods.generatePasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(resetToken).digest('hex');
    this.resetPasswordToken = hashed;
    // token valid for 1 hour
    this.resetPasswordExpires = Date.now() + 60 * 60 * 1000;
    return resetToken;
}

// Generate and set email verification token (returns the plain token)
UserSchema.methods.generateEmailVerificationToken = function () {
    const verificationToken = crypto.randomBytes(32).toString('hex');
    const hashed = crypto.createHash('sha256').update(verificationToken).digest('hex');
    this.verificationToken = hashed;
    // token valid for 1 hour
    this.verificationTokenExpires = Date.now() + 60 * 60 * 1000;
    return verificationToken;
}



module.exports = mongoose.model('User', UserSchema);