import express from 'express';
import { createJob, getMyJobs, updateJob, deleteJob, getAllJobs, applyForJob } from '../controllers/jobController.js';

const router = express.Router();

router.get('/', getAllJobs);
router.post('/create', createJob);
router.get('/my', getMyJobs);
router.put('/:id', updateJob);
router.delete('/:id', deleteJob);
router.post('/:id/apply', applyForJob);

export default router; 