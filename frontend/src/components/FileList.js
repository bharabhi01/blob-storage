import React, { useState } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import FilePreview from './FilePreview';

function FileList({ files, onDelete }) {
    const [viewUrls, setViewUrls] = useState({});
    const [loading, setLoading] = useState({});
    const [selectedFile, setSelectedFile] = useState(null);

    const getFileUrl = async (file) => {
        try {
            // Clear previous selection first
            setSelectedFile(null);

            setLoading(prev => ({ ...prev, [file.Key]: true }));

            // Get a new URL even if we already have one (it might be expired)
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/${file.Key}`);

            setViewUrls(prev => ({
                ...prev,
                [file.Key]: response.data.fileUrl,
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