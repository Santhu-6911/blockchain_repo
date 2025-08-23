const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models/User');
const authMiddleware = require('../middlewares/auth.js');

const router = express.Router();

router.post('/traditional/register', async (req, res) => {
  try {
    const { username, email, password, confirmPassword } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ message: 'Username, email, and password are required' });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ message: 'Passwords do not match' });
    }

    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists with this email' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await User.create({
      name: username,
      email,
      password: hashedPassword,
      walletAddress: null
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email, type: 'traditional' },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Traditional registration successful',
      token,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        type: 'traditional'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Registration failed: ' + error.message 
    });
  }
});

router.post('/traditional/login', async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;

    if (!email || !password) {
      return res.status(400).json({ 
        success: false,
        message: 'Email and password are required' 
      });
    }

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(400).json({ 
        success: false,
        message: 'Invalid email or password' 
      });
    }

    const expiresIn = rememberMe ? '7d' : '24h';
    const token = jwt.sign(
      { userId: user.id, email: user.email, type: 'traditional' },
      process.env.JWT_SECRET,
      { expiresIn }
    );

    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        type: 'traditional'
      }
    });

  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Login failed: ' + error.message 
    });
  }
});



router.get('/profile', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    if (!user) {
      return res.status(404).json({ 
        success: false,
        message: 'User not found' 
      });
    }

    res.json({
      success: true,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        type: user.walletAddress ? 'blockchain' : 'traditional'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Failed to get profile' 
    });
  }
});

router.get('/verify', authMiddleware, async (req, res) => {
  try {
    const user = await User.findByPk(req.userId);
    res.json({
      success: true,
      valid: true,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        type: user.walletAddress ? 'blockchain' : 'traditional'
      }
    });
  } catch (error) {
    res.status(500).json({ 
      success: false,
      message: 'Token verification failed' 
    });
  }
});












router.post('/blockchain/register', async (req, res) => {
  try {
    const { username, email, walletAddress, signature, transactionHash, gasUsed } = req.body;

    // Only validate what we actually need for blockchain
    if (!username || !email || !walletAddress) {
      return res.status(400).json({ 
        success: false, 
        message: 'Username, email, and wallet address are required' 
      });
    }

    // Check if email already exists
    const existingUserByEmail = await User.findOne({ where: { email } });
    if (existingUserByEmail) {
      return res.status(400).json({ 
        success: false, 
        message: 'User already exists with this email' 
      });
    }

    // Check if wallet already exists
    const existingUserByWallet = await User.findOne({ where: { walletAddress } });
    if (existingUserByWallet) {
      return res.status(400).json({ 
        success: false, 
        message: 'This wallet address is already registered' 
      });
    }

    // Create user using ONLY existing database fields
    const user = await User.create({
      name: username,
      email: email,
      password: 'BLOCKCHAIN_USER', // Placeholder since field is required
      walletAddress: walletAddress,
      isActive: true,
      loginCount: 0,
      lastLoginAt: null
    });

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        walletAddress: user.walletAddress, 
        type: 'blockchain' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.status(201).json({
      success: true,
      message: 'Blockchain registration successful',
      token,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        type: 'blockchain'
      }
    });

  } catch (error) {
    console.error('Blockchain registration error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Registration failed: ' + error.message 
    });
  }
});

router.post('/blockchain/login', async (req, res) => {
  try {
    const { walletAddress, signature, message, sessionId } = req.body;

    if (!walletAddress) {
      return res.status(400).json({ 
        success: false,
        message: 'Wallet address is required for blockchain authentication' 
      });
    }

    // Find user by wallet address
    const user = await User.findOne({ where: { walletAddress } });
    if (!user) {
      return res.status(400).json({ 
        success: false,
        message: 'Wallet not registered. Please register first.' 
      });
    }

    // Update login stats using existing fields
    user.loginCount = user.loginCount + 1;
    user.lastLoginAt = new Date();
    await user.save();

    const token = jwt.sign(
      { 
        userId: user.id, 
        email: user.email, 
        walletAddress: user.walletAddress, 
        type: 'blockchain' 
      },
      process.env.JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({
      success: true,
      message: 'Blockchain login successful',
      token,
      user: {
        id: user.id,
        username: user.name,
        email: user.email,
        walletAddress: user.walletAddress,
        type: 'blockchain'
      }
    });

  } catch (error) {
    console.error('Blockchain login error:', error);
    res.status(500).json({ 
      success: false,
      message: 'Login failed: ' + error.message 
    });
  }
});
module.exports = router;