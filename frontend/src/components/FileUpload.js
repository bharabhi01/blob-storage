import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { toast } from 'react-toastify';

function FileUpload({ onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);
    const [progress, setProgress] = useState(0);
    const [fileName, setFileName] = useState('');

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file) return;

        setFileName(file.name);
        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadError(null);
        setProgress(0);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
                onUploadProgress: (progressEvent) => {
                    const percentCompleted = Math.round(
                        (progressEvent.loaded * 100) / progressEvent.total
                    );
                    setProgress(percentCompleted);
                },
            });

            onUploadSuccess();
            setTimeout(() => {
                setProgress(0);
                setFileName('');
            }, 1500);
        } catch (error) {
            console.error('Upload error: ', error);
            setUploadError('Failed to upload file');
            toast.error('Upload failed');
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