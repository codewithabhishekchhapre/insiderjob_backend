import jwt from 'jsonwebtoken'
import User from '../models/User.js'



// Middleware ( Protect User Routes )
export const protectUser = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        token = req.headers.authorization.split(' ')[1]
    } else if (req.cookies && req.cookies.token) {
        token = req.cookies.token
    }

    if (!token) {
        return res.status(401).json({
            success: false,
            message: 'Not authorized, no token'
        })
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        req.user = await User.findById(decoded.id).select('-password')
        next()
    } catch (error) {
        res.status(401).json({
            success: false,
            message: 'Not authorized'
        })
    }
}

// Role-based access middleware
export const requireRole = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: 'Forbidden: insufficient role' });
  }
  next();
};