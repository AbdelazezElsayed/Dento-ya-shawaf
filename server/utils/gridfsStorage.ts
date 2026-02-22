import multer from 'multer';
import { GridFSBucket, MongoClient } from 'mongodb';
import mongoose from 'mongoose';
import { Readable } from 'stream';
import logger from './logger';

let gridfsBucket: GridFSBucket;

// Initialize GridFS bucket
export async function initializeGridFS() {
    if (!gridfsBucket) {
        const client = (mongoose.connection.getClient() as MongoClient);
        const db = client.db();
        gridfsBucket = new GridFSBucket(db, {
            bucketName: 'xrays' // Collection name will be xrays.files and xrays.chunks
        });
        logger.info('GridFS initialized for X-ray storage');
    }
    return gridfsBucket;
}

// Get GridFS bucket (ensure initialized first)
export function getGridFSBucket(): GridFSBucket {
    if (!gridfsBucket) {
        throw new Error('GridFS not initialized. Call initializeGridFS() first.');
    }
    return gridfsBucket;
}

// Multer memory storage for file uploads
export const upload = multer({
    storage: multer.memoryStorage(),
    limits: {
        fileSize: 10 * 1024 * 1024, // 10MB max file size
    },
    fileFilter: (_req, file, cb) => {
        // Allowed MIME types for X-ray images
        const allowedTypes = [
            'image/jpeg',
            'image/jpg',
            'image/png',
            'image/dicom',
            'application/dicom',
            'image/x-dicom'
        ];

        if (allowedTypes.includes(file.mimetype) || file.originalname.endsWith('.dcm')) {
            cb(null, true);
        } else {
            cb(new Error('Only image files (JPEG, PNG, DICOM) are allowed'));
        }
    }
});

/**
 * Upload a file to GridFS
 * @param fileBuffer - Buffer containing the file data
 * @param filename - Original filename
 * @param metadata - Additional metadata to store with the file
 * @returns GridFS file ID
 */
export async function uploadToGridFS(
    fileBuffer: Buffer,
    filename: string,
    metadata?: any
): Promise<string> {
    const bucket = getGridFSBucket();

    return new Promise((resolve, reject) => {
        const readableStream = Readable.from(fileBuffer);
        const uploadStream = bucket.openUploadStream(filename, {
            metadata: {
                ...metadata,
                uploadDate: new Date(),
            }
        });

        uploadStream.on('error', (error) => {
            logger.error('GridFS upload error:', error);
            reject(error);
        });

        uploadStream.on('finish', () => {
            logger.info(`File uploaded to GridFS: ${filename} (ID: ${uploadStream.id})`);
            resolve(uploadStream.id.toString());
        });

        readableStream.pipe(uploadStream);
    });
}

/**
 * Download a file from GridFS
 * @param fileId - GridFS file ID
 * @returns File buffer and metadata
 */
export async function downloadFromGridFS(fileId: string): Promise<{
    buffer: Buffer;
    metadata: any;
    filename: string;
}> {
    const bucket = getGridFSBucket();
    const ObjectId = mongoose.Types.ObjectId;

    return new Promise((resolve, reject) => {
        const chunks: Buffer[] = [];
        const downloadStream = bucket.openDownloadStream(new ObjectId(fileId));

        downloadStream.on('error', (error) => {
            logger.error('GridFS download error:', error);
            reject(error);
        });

        downloadStream.on('data', (chunk) => {
            chunks.push(chunk);
        });

        downloadStream.on('end', async () => {
            const buffer = Buffer.concat(chunks);

            // Get file metadata
            const files = await bucket.find({ _id: new ObjectId(fileId) }).toArray();
            const file = files[0];

            if (!file) {
                reject(new Error('File not found in GridFS'));
                return;
            }

            resolve({
                buffer,
                metadata: file.metadata,
                filename: file.filename
            });
        });
    });
}

/**
 * Delete a file from GridFS
 * @param fileId - GridFS file ID
 */
export async function deleteFromGridFS(fileId: string): Promise<void> {
    const bucket = getGridFSBucket();
    const ObjectId = mongoose.Types.ObjectId;

    try {
        await bucket.delete(new ObjectId(fileId));
        logger.info(`File deleted from GridFS: ${fileId}`);
    } catch (error) {
        logger.error('GridFS delete error:', error);
        throw error;
    }
}
