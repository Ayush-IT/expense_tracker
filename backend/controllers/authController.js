const jwt = require('jsonwebtoken');
const User = require('../models/User');


const generateToken = (id) => {

    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
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
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const user = await User.create({
            fullName,
            email,
            password,
            profileImageUrl,
        });

        res.status(201).json({
            id: user._id,
            user,
            token: generateToken(user._id),
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
        const user = await User.findOne({ email });

        if (!user || !(await user.comparePassword(password))) {
            return res.status(401).json({ message: 'Invalid credentials' });
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
