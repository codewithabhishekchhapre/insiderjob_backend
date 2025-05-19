import mongoose from "mongoose";

const applicationSchema = new mongoose.Schema({
  job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  resume: { type: String }, // URL to resume file
  status: { type: String, enum: ['applied', 'under review', 'rejected', 'selected'], default: 'applied' }
}, {
  timestamps: true
});

const Application = mongoose.model('Application', applicationSchema);

export default Application; 