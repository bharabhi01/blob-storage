import React, { useState, useEffect } from 'react';

function FilePreview({ fileName, fileUrl, contentType }) {
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [imageLoaded, setImageLoaded] = useState(false);

    // Reset states when fileUrl changes
    useEffect(() => {
        setLoading(true);
        setError(null);
        setImageLoaded(false);

        // Set loading to false after a short delay to ensure component re-renders
        const timer = setTimeout(() => {
            setLoading(false);
        }, 300);

        return () => clearTimeout(timer);
    }, [fileUrl]);

    // Determine file type
    const isImage = contentType && contentType.startsWith('image/');
    const isPdf = contentType && contentType.startsWith('application/pdf');
    const canPreview = isImage || isPdf;

    const handleImageLoad = () => {
        setImageLoaded(true);
        setLoading(false);
    };

    const handleImageError = () => {
        console.error("Failed to load image:", fileUrl);
        setError("Image failed to load. Try downloading the file instead.");
        setLoading(false);
    };

    // If we can't preview this file type
    if (!canPreview) {
        return (
            <div className="file-preview">
                <div className="preview-header">
                    <h4>File Preview</h4>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                        Download
                    </a>
                </div>
                <div className="preview-content">
                    <p className="preview-info">Preview not available for this file type.</p>
                </div>
            </div>
        );
    }

    // Loading state
    if (loading) {
        return (
            <div className="file-preview">
                <div className="preview-header">
                    <h4>File Preview</h4>
                </div>
                <div className="preview-content loading">
                    Loading preview...
                </div>
            </div>
        );
    }

    // Error state
    if (error) {
        return (
            <div className="file-preview">
                <div className="preview-header">
                    <h4>File Preview</h4>
                    <a href={fileUrl} target="_blank" rel="noopener noreferrer" className="download-link">
                        Download
                    </a>
                </div>
                <div className="preview-content error">
                    <p>{error}</p>
                </div>
            </div>
        );
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
                {isImage && (
                    <div className="image-container">
                        {!imageLoaded && <div className="loading-overlay">Loading image...</div>}
                        <img
                            src={fileUrl}
                            alt={fileName}
                            className="image-preview"
                            onLoad={handleImageLoad}
                            onError={handleImageError}
                            style={{ display: imageLoaded ? 'block' : 'none' }}
                        />
                    </div>
                )}

                {isPdf && (
                    <iframe
                        src={fileUrl}
                        title={fileName}
                        className="pdf-preview"
                        onError={() => setError('Failed to load PDF')}
                    ></iframe>
                )}
            </div>
        </div>
    );
}

export default FilePreview;