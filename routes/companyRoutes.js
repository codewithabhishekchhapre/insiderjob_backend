import express from 'express';
import upload from '../utils/upload.js';
import {
  createCompany,
  getAllCompanies,
  getCompanyById,
  updateCompany,
  deleteCompany,
  addRecruiterToCompany,
  removeRecruiterFromCompany,
  getCompanyRecruiters,
  getCompanyJobs,
  getCompanyAnalytics,
  leaveCompany,
  joinCompany
} from '../controllers/companyController.js';

const router = express.Router();

router.post('/create', upload.single('logo'), createCompany);
router.get('/all', getAllCompanies);
router.get('/:id', getCompanyById);
router.put('/:id', upload.single('logo'), updateCompany);
router.delete('/:id', deleteCompany);

router.post('/:id/add-recruiter', addRecruiterToCompany);
router.post('/:id/remove-recruiter', removeRecruiterFromCompany);
router.get('/:id/recruiters', getCompanyRecruiters);

router.get('/:id/jobs', getCompanyJobs);
router.get('/:id/analytics', getCompanyAnalytics);

router.post('/:id/join', joinCompany);
router.post('/:id/leave', leaveCompany);

export default router; 