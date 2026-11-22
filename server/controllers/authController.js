const User = require('../models/User');
const jwt = require('jsonwebtoken');
const sendEmail = require('../utils/sendEmail');

const generateAuthToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '24h' });
};

//User.prototype.generateAuthToken = generateAuthToken;

exports.registerUser = async (req, res) => {
  try {
      const { username, email, password } = req.body;
      if (!username || !email || !password) {
          return res.status(400).json({ message: 'Please provide all required fields' });
      }
      if (password.length < 6) {
          return res.status(400).json({ message: 'Password must be at least 6 characters long' });  
      }
      if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
          return res.status(400).json({ message: 'Please provide a valid email address' });
      }

      const existingUser = await User.findOne({ email });
      if(existingUser) {
          return res.status(400).json({ message: 'User with this email already exists' });
      }

      const otp = Math.floor(100000 + Math.random() * 900000).toString();
      const otpExpiry = new Date(Date.now() + 10 * 60 * 1000); // OTP valid for 10 minutes    
      
      const user = await User.create({ username, email, password, otp, otpExpiry });
      res.status(201).json({ message: 'User registered successfully', user: {username: user.username, email:user.email}});

      //OTP Sending Logic
      try {
       await sendEmail({
        to: email,
        subject: 'Your OTP Code for AI Cold Mail Generator',
        text: `Your OTP code is ${otp}. It will expire in 10 minutes.`
       });
      }catch(error) {
       console.log({message: 'Error sending OTP', error: error.message});
        // Pass the error to the next middleware for centralized error handling
      }

  }
  catch (error) {
   // next(error);
    res.status(500).json({ message: 'Error registering user', error: error.message });
  }
}
 
exports.verifyOtp = async (req, res) => {
  try {
      const { email, otp } = req.body;
      if (!email || !otp) {
          return res.status(400).json({ message: 'Please provide both email and OTP' });
      }
      const user = await User.findOne({ email }).select('+otp +otpExpiry +isVerified');
      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }
      if (user.isVerified) {
          return res.status(400).json({ message: 'User is already verified' });
      }
      if (user.otp !== otp) {
          return res.status(400).json({ message: 'Invalid OTP' });
      }
      if (user.otpExpiry < new Date()) {
          return res.status(400).json({ message: 'OTP has expired' });
      }
      user.isVerified = true;
      user.otp = undefined;
      user.otpExpiry = undefined;
      await user.save();
      const token = generateAuthToken(user._id);
      res.status(200).json({ token, message: 'OTP verified successfully' });
    } 
    catch (error) {
        res.status(500).json({ message: 'Error verifying OTP', error: error.message });
    }
}

exports.login = async (req, res) => {
  try {
      const { email, password } = req.body;
        if (!email || !password) {
            return res.status(400).json({ message: 'Please provide both email and password' });
        }
        const user = await User.findOne({ email }).select('+password +isVerified');
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }
        if (!user.isVerified) {
            return res.status(400).json({ message: 'User is not verified. Please verify your email first.' });
        }
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid password' });
        }
        const token = generateAuthToken(user._id);
        return res.status(200).json({ message: 'Login successful', token, user: {username: user.username, email:user.email}});
  }
  catch (error) {
        res.status(500).json({ message: 'Error logging in', error: error.message });    
  }
}
