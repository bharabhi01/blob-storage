require('dotenv').config();

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const { S3Client } = require('@aws-sdk/client-s3');
const fileRoutes = require('./routes/routes');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet());
app.use(cors());
app.use(express.json());

// Create S3 client instance
const s3Client = new S3Client({
    region: process.env.AWS_REGION,
    credentials: {
        accessKeyId: process.env.AWS_ACCESS_KEY_ID,
        secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
    }
});

// Make S3 client available to routes
app.locals.s3Client = s3Client;
app.locals.bucketName = process.env.S3_BUCKET;

app.use('/', fileRoutes);

app.listen(PORT, () => {
    console.log(`Server is running on ${PORT}`);
});