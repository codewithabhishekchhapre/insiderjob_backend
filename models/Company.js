import mongoose from "mongoose";

const companySchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  logo: { type: String },
  website: { type: String },
  size: { type: String },
  address: { type: String },
  recruiters: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  jobPosts: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }]
}, {
  timestamps: true
});

const Company = mongoose.model('Company', companySchema);

export default Company; 