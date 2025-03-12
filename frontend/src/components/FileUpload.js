import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { toast } from 'react-toastify';
import { post } from 'aws-amplify/api';

function FileUpload({ onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        setUploading(true);
        setUploadError(null);
        setProgress(0);

        try {
            console.log('Uploading file:', file.name);
            console.log('File type:', file.type);
            console.log('File size:', file.size);

            // Step 1: Get a pre-signed URL
            const presignedResponse = await fetch('https://7g4xu2jgp9.execute-api.eu-north-1.amazonaws.com/dev/presigned-upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    fileName: file.name,
                    contentType: file.type
                })
            });

            if (!presignedResponse.ok) {
                const errorText = await presignedResponse.text();
                console.error('Pre-signed URL error response:', errorText);
                throw new Error(`HTTP error! Status: ${presignedResponse.status}`);
            }

            const presignedData = await presignedResponse.json();
            console.log('Pre-signed URL response:', presignedData);

            // Step 2: Upload directly to S3 using the pre-signed URL
            const uploadResponse = await fetch(presignedData.uploadUrl, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type
                },
                body: file
            });

            if (!uploadResponse.ok) {
                const errorText = await uploadResponse.text();
                console.error('Upload error response:', errorText);
                throw new Error(`Upload failed! Status: ${uploadResponse.status}`);
            }

            console.log('File uploaded successfully to S3');

            // Simulate progress for better UX
            let simulatedProgress = 0;
            const interval = setInterval(() => {
                simulatedProgress += 10;
                if (simulatedProgress > 90) {
                    clearInterval(interval);
                }
                setProgress(simulatedProgress);
            }, 100);

            // After successful upload
            setTimeout(() => {
                clearInterval(interval);
                setProgress(100);
                onUploadSuccess();

                // Reset after completion
                setTimeout(() => {
                    setProgress(0);
                    setFileName('');
                }, 1500);
            }, 1000);
        } catch (error) {
            console.error('Upload error: ', error);
            setUploadError('Failed to upload file: ' + error.message);
            toast.error('Upload failed: ' + error.message);
        } finally {
            setUploading(false);
        }
    }, [onUploadSuccess]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        maxFiles: 1,
        accept: {
            'image/*': [],
            'application/pdf': [],
            'text/plain': []
        }
    });

    return (
        <div className="upload-container">
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the file here...</p>
                ) : (
                    <div>
                        <p>Drag 'n' drop a file here, or click to select a file</p>
                        <small>Accepts images, PDFs, and text files</small>
                    </div>
                )}
            </div>

            {fileName && (
                <div className="file-info">
                    <p>File: {fileName}</p>
                </div>
            )}

            {uploading && (
                <div className="upload-progress-container">
                    <p>Uploading... {progress}%</p>
                    <div className="upload-progress">
                        <div
                            className="upload-progress-bar"
                            style={{ width: `${progress}%` }}
                        ></div>
                    </div>
                </div>
            )}

            {uploadError && <p className='error-text'>{uploadError}</p>}
        </div>
    );
}

export default FileUpload;