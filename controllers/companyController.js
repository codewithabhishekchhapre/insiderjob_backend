import Company from '../models/Company.js';
import User from '../models/User.js';
import Job from '../models/Job.js';
import cloudinary from '../config/cloudinary.js';
import mongoose from 'mongoose';

export const createCompany = async (req, res) => {
  try {
    const { name, description, website, size, address } = req.body;
    let logoUrl = '';
    if (req.file) {
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'company_logos' },
          (error, result) => {
            if (error) reject(error);
            else {
              logoUrl = result.secure_url;
              resolve();
            }
          }
        );
        stream.end(req.file.buffer);
      });
    }
    const company = new Company({ name, description, logo: logoUrl, website, size, address });
    await company.save();
    res.status(201).json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllCompanies = async (req, res) => {
  try {
    const companies = await Company.find();
    res.json(companies);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyById = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id)
      .populate('recruiters', 'name email role')
      .populate('jobPosts');
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const updateCompany = async (req, res) => {
  try {
    const { name, description, website, size, address } = req.body;
    let logoUrl;
    if (req.file) {
      await new Promise((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          { resource_type: 'image', folder: 'company_logos' },
          (error, result) => {
            if (error) reject(error);
            else {
              logoUrl = result.secure_url;
              resolve();
            }
          }
        );
        stream.end(req.file.buffer);
      });
    }
    const update = { name, description, website, size, address };
    if (logoUrl) update.logo = logoUrl;
    const company = await Company.findByIdAndUpdate(req.params.id, update, { new: true });
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteCompany = async (req, res) => {
  try {
    const company = await Company.findByIdAndDelete(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json({ message: 'Company deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const addRecruiterToCompany = async (req, res) => {
  try {
    const { userId } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    if (!company.recruiters.includes(userId)) {
      company.recruiters.push(userId);
      await company.save();
    }
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const removeRecruiterFromCompany = async (req, res) => {
  try {
    const { userId } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    company.recruiters = company.recruiters.filter(r => r.toString() !== userId);
    await company.save();
    res.json(company);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyRecruiters = async (req, res) => {
  try {
    const company = await Company.findById(req.params.id).populate('recruiters', 'name email role');
    if (!company) return res.status(404).json({ error: 'Company not found' });
    res.json(company.recruiters);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ company: req.params.id });
    res.json(jobs);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

export const getCompanyAnalytics = async (req, res) => {
  try {
    const companyId = req.params.id;
    const jobCount = await Job.countDocuments({ company: companyId });
    const recruiterCount = await Company.findById(companyId).then(c => c?.recruiters.length || 0);
    const jobs = await Job.find({ company: companyId });
    const totalApplications = jobs.reduce((sum, job) => sum + (job.applications?.length || 0), 0);
    res.json({ jobCount, recruiterCount, totalApplications });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Recruiter joins a company by id (no code)
export const joinCompany = async (req, res) => {
  try {
    const { recruiterId } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter not found' });
    // If recruiter is already in a company, remove from that company
    if (recruiter.company && recruiter.company.toString() !== company._id.toString()) {
      await Company.findByIdAndUpdate(recruiter.company, { $pull: { recruiters: recruiterId } });
    }
    // Add recruiter to new company if not already present
    if (!company.recruiters.includes(recruiterId)) {
      company.recruiters.push(recruiterId);
      await company.save();
    }
    recruiter.company = company._id;
    await recruiter.save();
    res.json({ message: 'Joined company', company });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Recruiter leaves a company
export const leaveCompany = async (req, res) => {
  try {
    const { recruiterId } = req.body;
    const company = await Company.findById(req.params.id);
    if (!company) return res.status(404).json({ error: 'Company not found' });
    const recruiter = await User.findById(recruiterId);
    if (!recruiter) return res.status(404).json({ error: 'Recruiter not found' });
    company.recruiters = company.recruiters.filter(r => r.toString() !== recruiterId);
    await company.save();
    recruiter.company = null;
    await recruiter.save();
    res.json({ message: 'Left company' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}; 