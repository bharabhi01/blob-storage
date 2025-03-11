import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/files`);
      setFiles(response.data.files);
      setError(null);
    } catch (err) {
      setError('Failed to fetch files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadSuccess = () => {
    fetchFiles();
  };

  const handleDeleteFile = async (fileName) => {
    try {
      await axios.delete(`${API_URL}/files/${fileName}`);
      fetchFiles();
    } catch (err) {
      setError('Failed to delete file');
      console.error(err);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>S3 File Storage Demo</h1>
      </header>
      <main>
        <FileUpload onUploadSuccess={handleUploadSuccess} />

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div>Loading files...</div>
        ) : (
          <FileList files={files} onDelete={handleDeleteFile} />
        )}
      </main>
    </div>
  );
}

export default App;