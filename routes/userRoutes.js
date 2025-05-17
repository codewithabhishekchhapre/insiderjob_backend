import express from 'express'
import { applyForJob, getUserData, getUserJobApplications, updateUserResume, userlogin, usersignup, createUserIfNotExists } from '../controllers/userController.js'
import upload from '../config/multer.js'



const router = express.Router()

router.post("/signup", usersignup);
router.post("/login", userlogin);
router.post('/create-user', createUserIfNotExists);


// Get user Data    
router.get('/user',getUserData)

// Apply for a job 
router.post('/apply',applyForJob)

// Get applied jobs data 
router.get('/applications', getUserJobApplications)

//Update User profile(resume)
router.post('/update-resume', upload.single('resume'), updateUserResume)


export default router;