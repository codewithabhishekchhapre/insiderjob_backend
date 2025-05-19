import './config/instrument.js'
import express from 'express'
import cors from 'cors'
import 'dotenv/config'
import connectDB from './config/db.js'
import * as Sentry from "@sentry/node";
import cloudinary from './config/cloudinary.js'
import userRoutes from './routes/userRoutes.js'
import cookieParser from 'cookie-parser'
import companyRoutes from './routes/companyRoutes.js'
import jobRoutes from './routes/jobRoutes.js'
import applicationRoutes from './routes/applicationRoutes.js'

const app = express()
app.get('/api/test-cloudinary', async (req, res) => {
  try {
    const result = await cloudinary.api.ping();
    res.json({ success: true, result });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// Initialize Express

//Connect to database
connectDB()

// Middleware
const allowedOrigins = [
  'http://localhost:5173', // Vite default
  'http://localhost:3000', // React default (if used)
  // Add your deployed frontend URL here as well
];

app.use(cors({
  origin: allowedOrigins,
  credentials: true,
}));

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(cookieParser())

// Routes
app.use('/api/users', userRoutes)
app.use('/api/company', companyRoutes)
app.use('/api/job', jobRoutes)
app.use('/api/application', applicationRoutes)

const PORT = process.env.PORT || 5000

app.listen(PORT, () => console.log(`Server running on port ${PORT}`))