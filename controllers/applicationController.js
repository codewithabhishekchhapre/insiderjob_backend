import Application from '../models/Application.js';
import User from '../models/User.js';
import Job from '../models/Job.js';

// Get all applications for a job
export const getApplicationsForJob = async (req, res) => {
  try {
    const applications = await Application.find({ job: req.params.id }).populate('user', 'name email');
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update application status
export const updateApplicationStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const application = await Application.findByIdAndUpdate(req.params.id, { status }, { new: true });
    if (!application) return res.status(404).json({ error: 'Application not found' });
    res.json(application);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all jobs a user has applied to
export const getAppliedJobsForUser = async (req, res) => {
  try {
    const userId = req.query.userId || req.params.userId;
    if (!userId) return res.status(400).json({ error: 'Missing userId' });
    const applications = await Application.find({ user: userId })
      .populate({
        path: 'job',
        populate: [
          { path: 'company', select: 'name logo website' },
          { path: 'recruiter', select: 'name email' }
        ]
      })
      .sort({ createdAt: -1 });
    res.json(applications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get all jobs posted by a recruiter, with applications and candidate details
export const getJobsWithApplicationsForRecruiter = async (req, res) => {
  try {
    const recruiterId = req.query.recruiterId || req.params.recruiterId;
    if (!recruiterId) return res.status(400).json({ error: 'Missing recruiterId' });
    const recruiter = await User.findById(recruiterId);
    if (!recruiter || !recruiter.company) return res.json([]);
    const jobs = await Job.find({ recruiter: recruiterId, company: recruiter.company })
      .populate({
        path: 'company',
        select: 'name logo website'
      });
    // For each job, get its applications with candidate details
    const jobsWithApplications = await Promise.all(jobs.map(async (job) => {
      const applications = await Application.find({ job: job._id })
        .populate('user', 'name email resumes');
      return {
        _id: job._id,
        title: job.title,
        company: job.company,
        applications: applications.map(app => ({
          _id: app._id,
          name: app.user?.name,
          email: app.user?.email,
          resume: app.resume,
          status: app.status
        }))
      };
    }));
    res.json(jobsWithApplications);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 