import Job from "../models/Job.js"
import JobApplication from "../models/JobApplication.js"
import  User from "../models/User.js"
import {v2 as cloudinary} from "cloudinary"
import express from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const router = express.Router();
const JWT_SECRET = 'h2h34lh2hggg23';




// Signup Controller
export const usersignup = async (req, res) => {
    const { name, email, password, image, resume } = req.body;

    try {
        const existingUser = await User.findOne({ email });
        if (existingUser)
            return res.status(400).json({ message: "User already exists" });

        const hashedPassword = await bcrypt.hash(password, 10);

        const newUser = await User.create({
            name,
            email,
            password: hashedPassword,
            // image,
            // resume,
        });

        const token = jwt.sign({ id: newUser._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(201).json({ user: newUser, token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Login Controller
export const userlogin = async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });
        if (!user)
            return res.status(400).json({ message: "Invalid email or password" });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch)
            return res.status(400).json({ message: "Invalid email or password" });

        const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1h" });

        res.status(200).json({ user, token });
    } catch (error) {
        res.status(500).json({ message: "Server error", error: error.message });
    }
};

// Get  user data
export const getUserData = async(req,res) => {

    const userId = req.auth.userId 

    try {
        
        const user = await User.findOne({ clerkUserId: userId })

        if (!user) {
           return res.json({success: false, message:'User Not Found'}) 
        }

        res.json({success:true, user})

    } catch (error) {
            res.json({success:false, message:error.message})
    }

}

export const createUserIfNotExists = async (req, res) => {
    const { userId } = req.auth;
    const { firstName, lastName, email, image } = req.body;

    try {
        let user = await User.findOne({ clerkUserId: userId });

        // if (!user) {
        //     user = await User.create({
        //         _id: userId,
        //         name: `${firstName} ${lastName}`,
        //         email,
        //         image
        //     });
        // }
        if (!user) {
      user = await User.create({
        clerkUserId: userId, //  Save Clerk ID
        firstName,
        lastName,
        email,
        image,
      });
    }

        res.json({ success: true, user });
    } catch (error) {
        res.json({ success: false, message: error.message });
    }
};



// Apply for a  job 
export const applyForJob = async (req,res) => {

    const { jobId } = req.body 

    const userId = req.auth.userId

    try {
        
        const isAlreadyApplied = await JobApplication.find({jobId, userId})

        if (isAlreadyApplied.length > 0) {
            return res.json({success:false,message:'Already Applied'}) 
        }

        const jobData = await Job.findById(jobId)

        if (!jobData) {
            return res.json({success:false, message:'job Not Found'})
        }

        await JobApplication.create({
            companyId: jobData.companyId,
            userId,
            jobId,
            date: Date.now()
        })

        res.json({success:true, message:'Applied Successfully'})

    } catch (error) {
        res.json({success:false, message: error.message})
    }

}

// Get user applied applications
export const getUserJobApplications = async (req,res) => {
    
    try {
        
        const userId = req.auth.userId

        const applications = await JobApplication.find({userId})
        .populate('companyId','name email image')
        .populate('jobId', 'title description location category level salary')
        .exec()

        if (!applications) {
            return res.json({success: false, message:'No job application found for this user '})
        }

        return res.json({success:true, applications})

    } catch (error) {
        res.json({success:false, message:error.message})
    }

}

// update user resume
export const updateUserResume = async (req,res) => {
    try {

        const userId = req.auth.userId

        const resumeFile = req.file

        const userData = await User.findById(userId)

        if (resumeFile) {
            const resumeUpload = await cloudinary.uploader.upload(resumeFile.path)
            userData.resume = resumeUpload.secure_url
        }

        await userData.save()

        return res.json({success:true, message:'Resume Updated'})

    } catch (error) {
        
        res.json({success:false, message: error.message})

    }
}