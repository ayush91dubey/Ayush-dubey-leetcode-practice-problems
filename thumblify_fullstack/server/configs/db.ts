

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config(); // ← Add this

const connectDB = async () => {
    try {
        mongoose.connection.on('connected', () => console.log('MongoDB connected'))
        await mongoose.connect(process.env.MONGODB_URI as string)
    } catch (error) {
        console.error('Error connecting to MongoDB:', error)
    }
}

export default connectDB;