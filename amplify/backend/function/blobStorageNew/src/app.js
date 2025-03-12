/* Amplify Params - DO NOT EDIT
  ENV
  REGION
  STORAGE_BLOBSTORAGE_BUCKETNAME
  S3_BUCKET
  expiresIn
Amplify Params - DO NOT EDIT */

const express = require('express');
const bodyParser = require('body-parser');
const awsServerlessExpressMiddleware = require('aws-serverless-express/middleware');
const { S3Client, PutObjectCommand, GetObjectCommand, ListObjectsV2Command, DeleteObjectCommand, HeadObjectCommand } = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const multer = require('multer');
const cors = require('cors');

// Initialize Express app
const app = express();
app.use(bodyParser.json());
app.use(awsServerlessExpressMiddleware.eventContext());
app.use(cors());

// Enable CORS for all methods
app.use(function (req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "*");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS,DELETE");
  next();
});

// Initialize S3 client
const s3Client = new S3Client({ region: process.env.REGION });
const bucketName = process.env.STORAGE_BLOBSTORAGE_BUCKETNAME || process.env.S3_BUCKET;
const expiresIn = parseInt(process.env.expiresIn || '3600', 10);

// Configure multer for memory storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 } // Limit to 5MB
});

// Helper function to generate unique file names
const generateUniqueFileName = (originalName) => {
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  const extension = originalName.split('.').pop();
  return `${timestamp}-${randomString}.${extension}`;
};

// List all files
app.get('/', async function (req, res) {
  try {
    const command = new ListObjectsV2Command({ Bucket: bucketName });
    const response = await s3Client.send(command);
    const files = response.Contents || [];

    // Get detailed metadata for files
    const filesWithMetadata = await Promise.all(
      files.map(async (file) => {
        try {
          const headCommand = new HeadObjectCommand({
            Bucket: bucketName,
            Key: file.Key,
          });

          const fileMetadata = await s3Client.send(headCommand);

          // Format upload date
          const uploadDate = fileMetadata.LastModified
            ? new Date(fileMetadata.LastModified).toLocaleDateString()
            : 'Unknown';

          // Format file size
          const fileSizeInBytes = fileMetadata.ContentLength || 0;
          let fileSize;

          if (fileSizeInBytes < 1024) {
            fileSize = `${fileSizeInBytes} B`;
          } else if (fileSizeInBytes < 1024 * 1024) {
            fileSize = `${(fileSizeInBytes / 1024).toFixed(1)} KB`;
          } else {
            fileSize = `${(fileSizeInBytes / (1024 * 1024)).toFixed(1)} MB`;
          }

          return {
            ...file,
            Size: fileSize,
            ContentType: fileMetadata.ContentType || 'Unknown',
            UploadDate: uploadDate,
            LastModified: fileMetadata.LastModified,
          };
        } catch (error) {
          console.error(`Error getting metadata for ${file.Key}:`, error);
          return file;
        }
      })
    );

    res.json({ files: filesWithMetadata });
  } catch (error) {
    console.error('Error listing files:', error);
    res.status(500).json({ error: 'Failed to list files' });
  }
});

// Get presigned URL for a file
app.get('/:fileName', async function (req, res) {
  try {
    const command = new GetObjectCommand({
      Bucket: bucketName,
      Key: req.params.fileName,
    });

    const url = await getSignedUrl(s3Client, command, { expiresIn });
    res.json({ fileUrl: url });
  } catch (error) {
    console.error('Error generating URL:', error);
    res.status(500).json({ error: 'Failed to get file URL' });
  }
});

// Upload a file
app.post('/upload', upload.single('file'), async function (req, res) {
  if (!req.file) {
    return res.status(400).json({ error: 'No file provided' });
  }

  try {
    console.log('Uploading file:', req.file.originalname);
    console.log('File mimetype:', req.file.mimetype);
    console.log('File size:', req.file.size);

    const fileName = generateUniqueFileName(req.file.originalname);

    // Make sure we're correctly setting the ContentType
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      Body: req.file.buffer,
      ContentType: req.file.mimetype,
      ContentLength: req.file.size
    });

    await s3Client.send(command);

    // Log success for debugging
    console.log('File uploaded successfully to S3:', fileName);

    res.json({
      success: true,
      fileName,
      fileUrl: `https://${bucketName}.s3.amazonaws.com/${fileName}`,
      ContentType: req.file.mimetype,
      Size: req.file.size,
      UploadDate: new Date().toLocaleDateString()
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ error: 'Failed to upload file' });
  }
});

// Delete a file
app.delete('/:fileName', async function (req, res) {
  try {
    const command = new DeleteObjectCommand({
      Bucket: bucketName,
      Key: req.params.fileName,
    });

    await s3Client.send(command);
    res.json({ success: true, message: 'File deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ error: 'Failed to delete file' });
  }
});

app.listen(3000, function () {
  console.log("App started");
});

app.post('/presigned-upload', async function (req, res) {
  try {
    if (!req.body.fileName || !req.body.contentType) {
      return res.status(400).json({ error: 'fileName and contentType are required' });
    }

    console.log('Generating pre-signed URL for:', req.body.fileName);
    console.log('Content type:', req.body.contentType);
    console.log('Bucket name:', bucketName);

    const fileName = generateUniqueFileName(req.body.fileName);

    // Create a pre-signed URL for PUT operation
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: req.body.contentType
    });

    // Increase expiration time to 15 minutes
    const url = await getSignedUrl(s3Client, command, { expiresIn: 900 });

    console.log('Generated pre-signed URL:', url);

    res.json({
      success: true,
      fileName,
      uploadUrl: url,
      ContentType: req.body.contentType
    });
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    res.status(500).json({ error: 'Failed to generate upload URL', details: error.message });
  }
});

module.exports = app;