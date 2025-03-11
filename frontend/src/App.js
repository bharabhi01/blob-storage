import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

const API_URL = process.env.REACT_APP_API_URL;

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      const response = await axios.get(`${API_URL}/`);
      setFiles(response.data.files);
      setError(null);
    } catch (err) {
      setError('Failed to fetch files. Please check your connection and try again.');
      toast.error('Failed to fetch files');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, []);

  const handleUploadSuccess = () => {
    toast.success('File uploaded successfully!');
    fetchFiles();
  };

  const handleDeleteFile = async (fileName) => {
    if (window.confirm('Are you sure you want to delete this file?')) {
      try {
        await axios.delete(`${API_URL}/${fileName}`);
        toast.success('File deleted successfully');
        fetchFiles();
      } catch (err) {
        toast.error('Failed to delete file');
        setError('Failed to delete file');
        console.error(err);
      }
    }
  };

  return (
    <div className="App">
      <ToastContainer position="top-right" autoClose={3000} />
      <header className="App-header">
        <h1>S3 File Storage</h1>
        <p>A secure cloud-based file storage application</p>
      </header>
      <main>
        <FileUpload onUploadSuccess={handleUploadSuccess} />

        {error && <div className="error-message">{error}</div>}

        {loading ? (
          <div className="loading">Loading files</div>
        ) : (
          <FileList files={files} onDelete={handleDeleteFile} />
        )}
      </main>
    </div>
  );
}

export default App;