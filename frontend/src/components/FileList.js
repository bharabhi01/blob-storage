import React, { useState } from 'react';
import axios from 'axios';

function FileList({ files, onDelete }) {
    const [viewUrls, setViewUrls] = useState({});

    const getFileUrl = async (fileName) => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_API_URL}/files/${fileName}`);
            setViewUrls(prev => ({
                ...prev,
                [fileName]: response.data.fileUrl,
            }));
        } catch (error) {
            console.error("Error getting file URL: ", error);
        }
    };

    if (!files || files.length === 0) {
        return <p>No files found</p>
    }

    return (
        <div>
            <h2>Files</h2>
            <ul>
                {files.map((file) => (
                    <li key={file.Key}>
                        <span>{file.Key}</span>
                        <div className="file-actions">
                            <button
                                onClick={() => getFileUrl(file.Key)}
                                className="view-btn"
                            >
                                View
                            </button>
                            <button
                                onClick={() => onDelete(file.Key)}
                                className="delete-btn"
                            >
                                Delete
                            </button>
                        </div>
                        {viewUrls[file.Key] && (
                            <div className="file-preview">
                                <a href={viewUrls[file.Key]} target="_blank" rel="noopener noreferrer">
                                    Open file
                                </a>
                            </div>
                        )}
                    </li>
                ))}
            </ul>
        </div>
    );
}

export default FileList;