import React, { useState } from 'react';
import { toast } from 'react-toastify';
import FilePreview from './FilePreview';
import { get } from 'aws-amplify/api';

function FileList({ files, onDelete }) {
    console.log('Files received in FileList:', files);
    const [viewUrls, setViewUrls] = useState({});
    const [loading, setLoading] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const getFileUrl = async (file) => {
        try {
            // Clear previous selection first
            setSelectedFile(null);

            setLoading(prev => ({ ...prev, [file.Key]: true }));

            // Use direct fetch instead of Amplify API
            const response = await fetch(`https://7g4xu2jgp9.execute-api.eu-north-1.amazonaws.com/dev/${file.Key}`);

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }

            const responseData = await response.json();

            setViewUrls(prev => ({
                ...prev,
                [file.Key]: responseData.fileUrl,
            }));

            // Only set selected file after URL is loaded
            setTimeout(() => {
                setSelectedFile(file);
            }, 100);

        } catch (error) {
            console.error("Error getting file URL: ", error);
            toast.error("Failed to load file preview");
        } finally {
            setLoading(prev => ({ ...prev, [file.Key]: false }));
        }
    };

    // Rest of your component remains unchanged
    const formatFileName = (name) => {
        // Remove timestamp-hash prefix from generated names
        const nameParts = name.split('-');
        if (nameParts.length > 2 && !isNaN(parseInt(nameParts[0]))) {
            // This is likely a generated name with timestamp
            return nameParts.slice(2).join('-');
        }
        return name;
    };

    if (!files || files.length === 0) {
        return (
            <div className="file-list">
                <h2>Files</h2>
                <div className="empty-state">
                    <p>No files found. Upload some files to get started!</p>
                </div>
            </div>
        );
    }

    return (
        <div className="file-container">
            <div className="file-list">
                <h2>Files</h2>
                <table className="file-table">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Type</th>
                            <th>Size</th>
                            <th>Uploaded</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {files.map((file) => (
                            <tr key={file.Key} className={selectedFile?.Key === file.Key ? 'selected' : ''}>
                                <td className="file-name" title={file.Key}>{formatFileName(file.Key)}</td>
                                <td>{file.ContentType || 'Unknown'}</td>
                                <td>{file.Size || '—'}</td>
                                <td>{file.UploadDate || '—'}</td>
                                <td>
                                    <div className="file-actions">
                                        <button
                                            onClick={() => getFileUrl(file)}
                                            className="view-btn"
                                            disabled={loading[file.Key]}
                                        >
                                            {loading[file.Key] ? 'Loading...' : 'Preview'}
                                        </button>
                                        <button
                                            onClick={() => onDelete(file.Key)}
                                            className="delete-btn"
                                        >
                                            Delete
                                        </button>
                                    </div>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {selectedFile && viewUrls[selectedFile.Key] && (
                <FilePreview
                    fileName={selectedFile.Key}
                    fileUrl={viewUrls[selectedFile.Key]}
                    contentType={selectedFile.ContentType}
                />
            )}
        </div>
    );
}

export default FileList;