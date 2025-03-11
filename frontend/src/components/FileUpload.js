import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

function FileUpload({ onUploadSuccess }) {
    const [uploading, setUploading] = useState(false);
    const [uploadError, setUploadError] = useState(null);

    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        if (!file)
            return;

        const formData = new FormData();
        formData.append('file', file);

        setUploading(true);
        setUploadError(null);

        try {
            await axios.post(`${process.env.REACT_APP_API_URL}/upload`, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            onUploadSuccess();
        } catch (error) {
            console.error('Upload error: ', error);
            setUploadError('Failed to upload file');
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
            {console.log(process.env.REACT_APP_API_URL)}
            <div
                {...getRootProps()}
                className={`dropzone ${isDragActive ? 'active' : ''}`}
            >
                <input {...getInputProps()} />
                {
                    isDragActive ?
                        <p>Drop the file here....</p> :
                        <p>Drag 'n' drop a file here, or click to select a file</p>
                }
            </div>

            {uploading && <p>Uploading....</p>}
            {uploadError && <p className='error-text'>{uploadError}</p>}
        </div>
    );
}

export default FileUpload;