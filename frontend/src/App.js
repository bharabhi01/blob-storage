import React, { useState, useEffect } from 'react';
import FileUpload from './components/FileUpload';
import FileList from './components/FileList';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import './App.css';

// Import Amplify - FIXED IMPORTS
import { Amplify } from 'aws-amplify';
import { get, del } from 'aws-amplify/api';
import awsExports from './aws-exports';

// Configure Amplify
Amplify.configure(awsExports);

function App() {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchFiles = async () => {
    setLoading(true);
    try {
      // Use direct fetch instead of Amplify API
      const response = await fetch('https://7g4xu2jgp9.execute-api.eu-north-1.amazonaws.com/dev');

      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }

      const responseData = await response.json();
      console.log('Fetched data:', responseData);

      if (responseData && responseData.files) {
        setFiles(responseData.files);
      } else {
        setFiles([]);
      }

      setError(null);
    } catch (err) {
      setError('Failed to fetch files. Please check your connection and try again.');
      toast.error('Failed to fetch files');
      console.error('Fetch error:', err);
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
        // Use direct fetch instead of Amplify API
        const response = await fetch(`https://7g4xu2jgp9.execute-api.eu-north-1.amazonaws.com/dev/${fileName}`, {
          method: 'DELETE'
        });

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

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