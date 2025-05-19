import mongoose from "mongoose";

const jobSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  recruiter: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  applications: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  status: { type: String, enum: ['active', 'paused', 'closed'], default: 'active' },
  experience: { type: String },
  skills: [{ type: String }],
  position: { type: String },
  location: { type: String },
  salary: { type: String }
}, {
  timestamps: true
});

const Job = mongoose.model('Job', jobSchema);

export default Job; 