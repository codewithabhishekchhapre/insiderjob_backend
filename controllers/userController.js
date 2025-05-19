import User from "../models/User.js"
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Company from '../models/Company.js'
import cloudinary from '../config/cloudinary.js'

// Generate JWT Token
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    })
}

// @desc    Register new user
// @route   POST /api/users/signup
// @access  Public
export const usersignup = async (req, res) => {
    const { name, email, password, role } = req.body
    let imageUrl = ''
    try {
        // Check if user exists
        const userExists = await User.findOne({ email })
        if (userExists) {
            return res.status(400).json({ success: false, message: 'User already exists' })
        }

        // Handle profile image upload if file is present
        if (req.file) {
            const result = await new Promise((resolve, reject) => {
                const stream = cloudinary.uploader.upload_stream(
                    { resource_type: 'image' },
                    (error, result) => {
                        if (error) reject(error);
                        else resolve(result);
                    }
                );
                stream.end(req.file.buffer);
            });
            imageUrl = result.secure_url;
        }

        // Hash password
        const salt = await bcrypt.genSalt(10)
        const hashedPassword = await bcrypt.hash(password, salt)

        // Create user
        const user = await User.create({
            name,
            email,
            password: hashedPassword,
            role: role || 'user',
            image: imageUrl
        })

        if (user) {
            const token = generateToken(user._id)
            // Set token and role in cookies
            res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
            res.cookie('role', user.role, { httpOnly: true, sameSite: 'lax' })
            res.status(201).json({
                success: true,
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    image: user.image,
                    role: user.role,
                },
                token
            })
        }
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Authenticate a user
// @route   POST /api/users/login
// @access  Public
export const userlogin = async (req, res) => {
    const { email, password } = req.body

    try {
        // Check for user email
        const user = await User.findOne({ email })
        if (!user) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' })
        }

        // Check password
        const isMatch = await bcrypt.compare(password, user.password)
        if (!isMatch) {
            return res.status(400).json({ success: false, message: 'Invalid credentials' })
        }

        const token = generateToken(user._id)
        // Set token and role in cookies
        res.cookie('token', token, { httpOnly: true, sameSite: 'lax' })
        res.cookie('role', user.role, { httpOnly: true, sameSite: 'lax' })
        res.status(200).json({
            success: true,
            user: {
                _id: user._id,
                name: user.name,
                email: user.email,
                image: user.image,
                role: user.role,
            },
            token
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Get user data
// @route   GET /api/users/me
// @access  Private
export const getUserData = async (req, res) => {
    try {
        let userId;
        if (req.user && req.user._id) {
            userId = req.user._id;
        } else if (req.query.userId) {
            userId = req.query.userId;
        } else if (req.body.userId) {
            userId = req.body.userId;
        } else {
            return res.status(400).json({ success: false, message: 'No user id provided' });
        }
        const user = await User.findById(userId).select('-password')
        res.status(200).json({
            success: true,
            user
        })
    } catch (error) {
        res.status(500).json({ success: false, message: error.message })
    }
}

// @desc    Update user resume
// @route   POST /api/users/update-resume
// @access  Private

// Delete a user by id
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Change user role by id
export const changeUserRole = async (req, res) => {
  try {
    const { role } = req.body;
    const user = await User.findByIdAndUpdate(req.params.id, { role }, { new: true });
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all users (admin)
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get the company a user has joined
export const getUserCompany = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).populate('company');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json(user.company);
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Upload resume for user
export const uploadResume = async (req, res) => {
  try {
    const { userId } = req.body;
    const isDefault = req.body.isDefault === 'true' || req.body.isDefault === true;
    if (!userId || !req.file) return res.status(400).json({ error: 'Missing user or file' });
    // Upload to cloudinary
    let resumeUrl = '';
    await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { resource_type: 'raw', folder: 'resumes' },
        (error, result) => {
          if (error) reject(error);
          else {
            resumeUrl = result.secure_url;
            resolve();
          }
        }
      );
      stream.end(req.file.buffer);
    });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    // If isDefault, unset previous default
    if (isDefault) {
      user.resumes.forEach(r => (r.isDefault = false));
    }
    user.resumes.push({ url: resumeUrl, name: req.file.originalname, isDefault });
    await user.save();
    res.status(201).json({ resumes: user.resumes });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update user profile
export const updateUserProfile = async (req, res) => {
  try {
    const userId = req.params.id;
    const updateFields = req.body;
    // Optionally handle image upload if file is present
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        resource_type: 'image',
      });
      updateFields.image = result.secure_url;
    }
    const user = await User.findByIdAndUpdate(userId, updateFields, { new: true }).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};