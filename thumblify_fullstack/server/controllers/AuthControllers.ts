import { Request, Response } from 'express';
import db from '../configs/firebase.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

// Helper: JWT cookie set karna
const setTokenCookie = (res: Response, userId: string) => {
    const token = jwt.sign(
        { userId },
        process.env.JWT_SECRET as string,
        { expiresIn: '7d' }
    );
    res.cookie('token', token, {
        httpOnly: true,
        secure: false,
        sameSite: 'lax',
        maxAge: 1000 * 60 * 60 * 24 * 7,
        path: '/',
    });
};

// Register
export const registerUser = async (req: Request, res: Response) => {
    try {
        console.log('Register request received:', req.body);
        const { name, email, password } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        const existingUsers = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (!existingUsers.empty) {
            return res.status(400).json({ message: 'User already exists' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUserRef = await db.collection('users').add({
            name,
            email,
            password: hashedPassword,
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        setTokenCookie(res, newUserRef.id);

        return res.json({
            message: 'Account created successfully',
            user: { _id: newUserRef.id, name, email },
        });
    } catch (error: any) {
        console.error('Register error:', error);
        res.status(500).json({ message: error.message });
    }
};

// Login
export const loginUser = async (req: Request, res: Response) => {
    try {
        const { email, password } = req.body;

        const userSnapshot = await db.collection('users')
            .where('email', '==', email)
            .get();

        if (userSnapshot.empty) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        const userDoc = userSnapshot.docs[0];
        const userData = userDoc.data();

        const isPasswordCorrect = await bcrypt.compare(password, userData.password);
        if (!isPasswordCorrect) {
            return res.status(400).json({ message: 'Invalid email or password' });
        }

        setTokenCookie(res, userDoc.id);

        return res.json({
            message: 'Login successful',
            user: {
                _id: userDoc.id,
                name: userData.name,
                email: userData.email,
            },
        });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

// Logout
export const logoutUser = async (req: Request, res: Response) => {
    res.clearCookie('token', { path: '/' });
    return res.json({ message: 'Logout successful' });
};

// Verify
export const verifyUser = async (req: Request, res: Response) => {
    try {
        const userDoc = await db.collection('users').doc(req.userId as string).get();

        if (!userDoc.exists) {
            return res.status(400).json({ message: 'Invalid user' });
        }

        const { password, ...userData } = userDoc.data()!;

        return res.json({ user: { _id: userDoc.id, ...userData } });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};