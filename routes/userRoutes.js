import express from 'express'
import {  getUserData,  userlogin, usersignup, deleteUser, changeUserRole, getAllUsers, getUserCompany, uploadResume, updateUserProfile } from '../controllers/userController.js'
import upload from '../config/multer.js'
import { requireRole } from '../middleware/authMiddleware.js'

const router = express.Router()

// Public routes
router.post('/signup', upload.single('image'), usersignup)
router.post('/login', userlogin)

// Resume upload
router.post('/:id/upload-resume', upload.single('resume'), uploadResume)

// Protected routes
router.get('/me', getUserData)

// Admin routes
router.get('/all', getAllUsers)
router.delete('/:id', deleteUser)
router.put('/:id/role', changeUserRole)

// Recruiter: get joined company
router.get('/:id/company', getUserCompany)

// Update user profile
router.put('/:id/profile', upload.single('image'), updateUserProfile)

export default router