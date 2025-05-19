import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  image: { type: String },
  role: {
    type: String,
    enum: ['user', 'recruiter', 'admin'],
    default: 'user'
  },
  bio: { type: String },
  companyExperience: { type: String },
  company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company' },
  resumes: [
    {
      url: { type: String, required: true },
      name: { type: String, required: true },
      isDefault: { type: Boolean, default: false }
    }
  ]
}, {
  timestamps: true
});

const User = mongoose.model('User', userSchema);

export default User;