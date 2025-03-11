import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FilePreview({ fileName, fileUrl, contentType }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const isImage = contentType && contentType.startsWith('image/');
    const isPdf = contentType === 'application/pdf';
    const canPreview = isImage || isPdf;

    useEffect(() => {
        if (fileUrl) {
            setLoading(false);
        }
    }, [fileUrl]);

    if (!canPreview) {
        return (
            <div className="file-preview">
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                    Download file
                </a>
                <p className="preview-info">Preview not available for this file type</p>
            </div>
        );
    }

    if (loading) {
        return <div className="file-preview loading">Loading preview...</div>;
    }

    if (error) {
        return <div className="file-preview error">Error loading preview: {error}</div>;
    }

    return (
        <div className="file-preview">
            <div className="preview-header">
                <h4>File Preview</h4>
                <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                    Download
                </a>
            </div>
            <div className="preview-content">
                {isImage ? (
                    <img
                        src={fileUrl}
                        alt={fileName}
                        className="image-preview"
                        onError={() => setError('Failed to load image')}
                    />
                ) : isPdf ? (
                    <iframe
                        src={fileUrl}
                        title={fileName}
                        className="pdf-preview"
                        onError={() => setError('Failed to load PDF')}
                    ></iframe>
                ) : null}
            </div>
        </div>
    );
}

export default FilePreview;