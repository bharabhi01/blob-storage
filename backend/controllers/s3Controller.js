const express = require('express');
const multer = require('multer');
const { uploadFile, getFileUrl, listFiles, deleteFile } = require('../service/s3');

const storage = multer.memoryStorage();
const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024,
    }
});

const uploadService = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({
                error: 'No file provided'
            });
        }

        const { s3Client, bucketName } = req.app.locals;
        const result = await uploadFile(s3Client, bucketName, req.file);

        // Add metadata to the result
        result.ContentType = req.file.mimetype;
        result.Size = req.file.size;
        result.UploadDate = new Date().toLocaleDateString();

        res.status(200).json(result);
    } catch (error) {
        console.error('Upload error: ', error);
        res.status(500).json({
            error: 'Failed to upload file'
        });
    }
};

const getFileName = async (req, res) => {
    try {
        const { s3Client, bucketName } = req.app.locals;
        const expiresIn = parseInt(process.env.expiresIn, 10) || 3600;
        const fileUrl = await getFileUrl(s3Client, bucketName, req.params.fileName, expiresIn);

        res.status(200).json({
            fileUrl
        });
    } catch (error) {
        console.error('Get file error: ', error);
        res.status(500).json({
            error: 'Failed to get file URL'
        });
    }
};

const getAllFiles = async (req, res) => {
    try {
        const { s3Client, bucketName } = req.app.locals;
        const files = await listFiles(s3Client, bucketName);

        res.status(200).json({ files });
    } catch (error) {
        console.error('List files error: ', error);
        res.status(500).json({
            error: 'Failed to list files'
        });
    }
};

const fileDelete = async (req, res) => {
    try {
        const { s3Client, bucketName } = req.app.locals;
        await deleteFile(s3Client, bucketName, req.params.fileName);

        res.status(200).json({ message: 'File deleted successfully' });
    } catch (error) {
        console.error('Delete file error: ', error);
        res.status(500).json({
            error: 'Failed to delete file'
        });
    }
};

module.exports = {
    upload,
    uploadService,
    getFileName,
    getAllFiles,
    fileDelete
};