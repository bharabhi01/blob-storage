const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const generateUniqueFileName = (originalName) => {
    console.log("original Name: ", originalName);
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();
    console.log("extension: ", extension);

    return `${timestamp}-${randomString}.${extension}`;
}

const uploadFile = async (s3Client, bucketName, file) => {
    console.log("file", file)
    const fileName = generateUniqueFileName(file.originalname);

    const params = {
        Bucket: bucketName,
        Key: fileName,
        Body: file.buffer,
        ContentType: file.mimetype,
    };

    await s3Client.send(new PutObjectCommand(params));

    return {
        fileName,
        fileUrl: `https://${bucketName}.s3.amazonaws.com/${fileName}`
    };
};

const getFileUrl = async (s3Client, bucketName, fileName, expiresIn = process.env.expiresIn) => {
    const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    return await getSignedUrl(s3Client, command, { expiresIn });
};

const listFiles = async (s3Client, bucketName) => {
    const command = new ListObjectsV2Command({
        Bucket: bucketName,
    });

    const response = await s3Client.send(command);
    return response.Contents || [];
}

const deleteFile = async (s3Client, bucketName, fileName) => {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    return await s3Client.send(command);
}

module.exports = {
    uploadFile,
    getFileUrl,
    listFiles,
    deleteFile
};