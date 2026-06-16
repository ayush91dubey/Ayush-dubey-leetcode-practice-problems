import { Request, Response } from 'express';
import db from '../configs/firebase.js';

export const getUsersThumbnails = async (req: Request, res: Response) => {
    try {
        const userId = req.userId; // ← session ki jagah

        const snapshot = await db.collection('thumbnails')
            .where('userId', '==', userId)
            .orderBy('createdAt', 'desc')
            .get();

        const thumbnails = snapshot.docs.map(doc => ({
            _id: doc.id,
            ...doc.data(),
        }));

        res.json({ thumbnails });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const getThumbnailbyId = async (req: Request, res: Response) => {
    try {
        const userId = req.userId;
        const { id } = req.params;

        const thumbnailDoc = await db.collection('thumbnails').doc(id).get();

        if (!thumbnailDoc.exists || thumbnailDoc.data()?.userId !== userId) {
            return res.status(404).json({ message: 'Thumbnail not found' });
        }

        res.json({ thumbnail: { _id: thumbnailDoc.id, ...thumbnailDoc.data() } });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};