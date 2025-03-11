const {
    PutObjectCommand,
    GetObjectCommand,
    DeleteObjectCommand,
    ListObjectsV2Command,
    HeadObjectCommand,
} = require('@aws-sdk/client-s3');
const { getSignedUrl } = require('@aws-sdk/s3-request-presigner');
const crypto = require('crypto');

const generateUniqueFileName = (originalName) => {
    const timestamp = Date.now();
    const randomString = crypto.randomBytes(8).toString('hex');
    const extension = originalName.split('.').pop();

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

const deleteFile = async (s3Client, bucketName, fileName) => {
    const command = new DeleteObjectCommand({
        Bucket: bucketName,
        Key: fileName,
    });

    return await s3Client.send(command);
}

const listFiles = async (s3Client, bucketName) => {
    const command = new ListObjectsV2Command({
        Bucket: bucketName,
    });

    const response = await s3Client.send(command);
    const files = response.Contents || [];

    // Get detailed metadata for each file
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

    return filesWithMetadata;
};

module.exports = {
    uploadFile,
    getFileUrl,
    listFiles,
    deleteFile
};