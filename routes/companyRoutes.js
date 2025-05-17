import express from 'express'
import { ChangeJobApplicationsStatus, changeVisiblity, getCompanyData, getCompanyJobApplicants, getCompanyPostedJobs, loginCompany, postJob, registerCompany } from '../controllers/companyController.js'
import upload from '../config/multer.js'
import { protectCompany } from '../middleware/authMiddleware.js'

const router = express.Router()

// Register a company
router.post('/register', upload.single('image'), registerCompany)

//company login
router.post('/login',loginCompany)

// get company data 
router.get('/company',protectCompany, getCompanyData)

//Post a job
router.post('/post-job',protectCompany,postJob)

//Get Applicants Data of Company
router.get('/applicants',protectCompany,getCompanyJobApplicants)

//Get company Job List
router.get('/list-jobs',protectCompany,getCompanyPostedJobs)

//Change Application Status
router.post('/change-status',protectCompany,ChangeJobApplicationsStatus)

//Change Application Visibility 
router.post('/change-visiblity',protectCompany, changeVisiblity)

export default router