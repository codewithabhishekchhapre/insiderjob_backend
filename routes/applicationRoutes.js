import express from 'express';
import { getApplicationsForJob, updateApplicationStatus, getAppliedJobsForUser, getJobsWithApplicationsForRecruiter } from '../controllers/applicationController.js';

const router = express.Router();

router.get('/job/:id', getApplicationsForJob);
router.put('/:id/status', updateApplicationStatus);
router.get('/user/:userId/applied', getAppliedJobsForUser);
router.get('/user/applied', getAppliedJobsForUser);
router.get('/recruiter/:recruiterId/jobs-applications', getJobsWithApplicationsForRecruiter);

export default router; 