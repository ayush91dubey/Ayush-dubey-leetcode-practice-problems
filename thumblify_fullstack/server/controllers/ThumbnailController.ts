import { Request, Response } from 'express';
import db from '../configs/firebase.js';
import { GenerateContentConfig, HarmBlockThreshold, HarmCategory } from '@google/genai';
import ai from '../configs/ai.js';
import { v2 as cloudinary } from 'cloudinary';

const stylePrompts = {
    'Bold & Graphic': 'eye-catching thumbnail, bold typography, vibrant colors, expressive facial reaction, dramatic lighting, high contrast, click-worthy composition, professional style',
    'Tech/Futuristic': 'futuristic thumbnail, sleek modern design, digital UI elements, glowing accents, holographic effects, cyber-tech aesthetic, sharp lighting, high-tech atmosphere',
    'Minimalist': 'minimalist thumbnail, clean layout, simple shapes, limited color palette, plenty of negative space, modern flat design, clear focal point',
    'Photorealistic': 'photorealistic thumbnail, ultra-realistic lighting, natural skin tones, candid moment, DSLR-style photography, lifestyle realism, shallow depth of field',
    'Illustrated': 'illustrated thumbnail, custom digital illustration, stylized characters, bold outlines, vibrant colors, creative cartoon or vector art style',
};

const colorSchemeDescriptions = {
    vibrant: 'vibrant and energetic colors, high saturation, bold contrasts, eye-catching palette',
    sunset: 'warm sunset tones, orange pink and purple hues, soft gradients, cinematic glow',
    forest: 'natural green tones, earthy colors, calm and organic palette, fresh atmosphere',
    neon: 'neon glow effects, electric blues and pinks, cyberpunk lighting, high contrast glow',
    purple: 'purple-dominant color palette, magenta and violet tones, modern and stylish mood',
    monochrome: 'black and white color scheme, high contrast, dramatic lighting, timeless aesthetic',
    ocean: 'cool blue and teal tones, aquatic color palette, fresh and clean atmosphere',
    pastel: 'soft pastel colors, low saturation, gentle tones, calm and friendly aesthetic',
};

export const generateThumbnail = async (req: Request, res: Response) => {
    try {
        const userId = req.userId; // ← session.userId ki jagah
        const { title, prompt: user_prompt, style, aspect_ratio, color_scheme, text_overlay } = req.body;

        // Firestore mein thumbnail create karo
        const thumbnailRef = await db.collection('thumbnails').add({
            userId,
            title,
            prompt_used: user_prompt,
            user_prompt,
            style,
            aspect_ratio,
            color_scheme,
            text_overlay,
            isGenerating: true,
            image_url: '',
            createdAt: new Date(),
            updatedAt: new Date(),
        });

        const model = 'gemini-3-pro-image-preview';

        const generationConfig: GenerateContentConfig = {
            maxOutputTokens: 32768,
            temperature: 1,
            topP: 0.95,
            responseModalities: ['IMAGE'],
            imageConfig: {
                aspectRatio: aspect_ratio || '16:9',
                imageSize: '1K',
            },
            safetySettings: [
                { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.OFF },
                { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.OFF },
                { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.OFF },
                { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.OFF },
            ],
        };

        let prompt = `Create a ${stylePrompts[style as keyof typeof stylePrompts]} for: "${title}"`;
        if (color_scheme) prompt += `Use a ${colorSchemeDescriptions[color_scheme as keyof typeof colorSchemeDescriptions]} color scheme.`;
        if (user_prompt) prompt += `Additional details: ${user_prompt}. `;
        prompt += `The thumbnail should be ${aspect_ratio}, visually stunning, and designed to maximize click-through rate.`;

        const response: any = await ai.models.generateContent({
            model,
            contents: [prompt],
            config: generationConfig,
        });

        if (!response?.candidates?.[0]?.content?.parts) {
            throw new Error('Unexpected response');
        }

        const parts = response.candidates[0].content.parts;
        let finalBuffer: Buffer | null = null;

        for (const part of parts) {
            if (part.inlineData?.data) {
                finalBuffer = Buffer.from(part.inlineData.data, 'base64');
            }
        }

        if (!finalBuffer) throw new Error('Failed to generate image');

        const base64Image = `data:image/png;base64,${finalBuffer.toString('base64')}`;
        const uploadResult = await cloudinary.uploader.upload(base64Image, { resource_type: 'image' });

        // Firestore update karo
        await thumbnailRef.update({
            image_url: uploadResult.secure_url,
            isGenerating: false,
            updatedAt: new Date(),
        });

        const updatedDoc = await thumbnailRef.get();
        res.json({
            message: 'Thumbnail Generated',
            thumbnail: { _id: thumbnailRef.id, ...updatedDoc.data() },
        });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};

export const deleteThumbnail = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;
        const userId = req.userId; // ← session ki jagah

        const thumbnailRef = db.collection('thumbnails').doc(id);
        const thumbnailDoc = await thumbnailRef.get();

        if (!thumbnailDoc.exists || thumbnailDoc.data()?.userId !== userId) {
            return res.status(404).json({ message: 'Thumbnail not found' });
        }

        await thumbnailRef.delete();
        res.json({ message: 'Thumbnail deleted successfully' });
    } catch (error: any) {
        console.log(error);
        res.status(500).json({ message: error.message });
    }
};