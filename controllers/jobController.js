import Job from '../models/Job.js';
import Company from '../models/Company.js';
import Application from '../models/Application.js';
import User from '../models/User.js';

// Create a job post
export const createJob = async (req, res) => {
  try {
    const { title, description, experience, skills, position, status, recruiter } = req.body;
    // Fetch recruiter and their joined company
    const recruiterUser = await (await import('../models/User.js')).default.findById(recruiter);
    if (!recruiterUser) return res.status(404).json({ error: 'Recruiter not found' });
    if (!recruiterUser.company) return res.status(400).json({ error: 'Recruiter must join a company to post jobs' });
    const company = recruiterUser.company;
    const job = new Job({
      title,
      description,
      company,
      recruiter,
      experience,
      skills,
      position,
      status: status || 'active',
    });
    await job.save();
    // Optionally add job to company.jobPosts
    await Company.findByIdAndUpdate(company, { $push: { jobPosts: job._id } });
    res.status(201).json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get jobs created by a recruiter for their joined company
export const getMyJobs = async (req, res) => {
  try {
    const recruiterId = req.query.recruiterId;
    const recruiterUser = await (await import('../models/User.js')).default.findById(recruiterId);
    if (!recruiterUser) return res.status(404).json({ error: 'Recruiter not found' });
    if (!recruiterUser.company) return res.json([]); // No company joined, no jobs
    const jobs = await Job.find({ recruiter: recruiterId, company: recruiterUser.company });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a job post
export const updateJob = async (req, res) => {
  try {
    const job = await Job.findOneAndUpdate(
      { _id: req.params.id, recruiter: req.body.recruiter },
      req.body,
      { new: true }
    );
    if (!job) return res.status(404).json({ error: 'Job not found or not authorized' });
    res.json(job);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a job post
export const deleteJob = async (req, res) => {
  try {
    const job = await Job.findOneAndDelete({ _id: req.params.id, recruiter: req.body.recruiter });
    if (!job) return res.status(404).json({ error: 'Job not found or not authorized' });
    // Optionally remove job from company.jobPosts
    await Company.findByIdAndUpdate(job.company, { $pull: { jobPosts: job._id } });
    res.json({ message: 'Job deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all jobs (for public listing)
export const getAllJobs = async (req, res) => {
  try {
    const jobs = await Job.find()
      .populate('company', 'name logo website')
      .populate('recruiter', 'name email');
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Apply for a job
export const applyForJob = async (req, res) => {
  try {
    const { userId, resumeUrl } = req.body;
    const jobId = req.params.id;
    if (!userId || !jobId) return res.status(400).json({ error: 'Missing user or job' });
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    if (!user.resumes || user.resumes.length === 0) {
      return res.status(400).json({ error: 'No resume uploaded. Please upload a resume before applying.' });
    }
    // Check if already applied
    const existing = await Application.findOne({ user: userId, job: jobId });
    if (existing) return res.status(400).json({ error: 'Already applied to this job.' });
    const application = new Application({ user: userId, job: jobId, resume: resumeUrl, status: 'applied' });
    await application.save();
    await application.populate('job user');
    res.status(201).json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 