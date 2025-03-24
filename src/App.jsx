import React, { useState } from 'react';
import axios from 'axios';

function App() {
  const [files, setFiles] = useState([]);
  const [email, setEmail] = useState('');
  const [previewURLs, setPreviewURLs] = useState([]);
  const [uploadStatus, setUploadStatus] = useState('');

  const handleFileChange = (event) => {
    const selectedFiles = Array.from(event.target.files);
    const validFiles = selectedFiles.filter(file => file.type === 'application/pdf');
    
    if (validFiles.length !== selectedFiles.length) {
      alert('Please select only PDF files.');
    }
    
    if (validFiles.length > 0) {
      setFiles(prevFiles => [...prevFiles, ...validFiles]);
      
      const newPreviewURLs = validFiles.map(file => URL.createObjectURL(file));
      setPreviewURLs(prevURLs => [...prevURLs, ...newPreviewURLs]);
    }
  };
  
  const removeFile = (index) => {
    setFiles(prevFiles => prevFiles.filter((_, i) => i !== index));
    
    // Revoke the URL to prevent memory leaks
    URL.revokeObjectURL(previewURLs[index]);
    setPreviewURLs(prevURLs => prevURLs.filter((_, i) => i !== index));
  };

  const handleUpload = async () => {
    if (files.length === 0 || !email) {
      alert('Please provide an email and select at least one file.');
      return;
    }
    
    const formData = new FormData();
    formData.append('email_id', email);
    
    // Append all files to the formData
    files.forEach(file => {
      formData.append('files', file);
    });
    
    try {
      setUploadStatus('Uploading...');
      const response = await axios.post('http://34.16.121.9/astra/upload_pdf', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      
      if (response.status === 200) {
        setUploadStatus(`Upload successful! ${files.length} file(s) uploaded.`);
        // Clear files after successful upload
        previewURLs.forEach(url => URL.revokeObjectURL(url));
        setFiles([]);
        setPreviewURLs([]);
      } else {
        setUploadStatus('Upload failed.');
      }
    } catch (error) {
      setUploadStatus('Error uploading files: ' + (error.message || 'Unknown error'));
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '1rem',
      padding: '1rem'
    }}>
      <input
        type="email"
        placeholder="Enter your email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{
          padding: '0.5rem',
          border: '1px solid #ccc',
          borderRadius: '4px',
          width: '300px'
        }}
      />
      <input
        type="file"
        accept="application/pdf"
        onChange={handleFileChange}
        multiple
        style={{ width: '300px' }}
      />
      <div style={{ width: '100%', maxWidth: '600px' }}>
        {files.length > 0 && (
          <div style={{ marginBottom: '1rem' }}>
            <h3>Selected Files ({files.length}):</h3>
            <ul style={{ listStyle: 'none', padding: 0 }}>
              {files.map((file, index) => (
                <li 
                  key={index} 
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.5rem',
                    margin: '0.5rem 0',
                    backgroundColor: '#f5f5f5',
                    borderRadius: '4px'
                  }}
                >
                  <span>{file.name} ({(file.size / 1024).toFixed(2)} KB)</span>
                  <button 
                    onClick={() => removeFile(index)}
                    style={{
                      backgroundColor: '#dc3545',
                      color: 'white',
                      border: 'none',
                      borderRadius: '4px',
                      padding: '0.25rem 0.5rem'
                    }}
                  >
                    Remove
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
      
      {previewURLs.length > 0 && (
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          justifyContent: 'center',
          gap: '1rem',
          maxWidth: '100%'
        }}>
          {previewURLs.map((url, index) => (
            <div key={index} style={{
              width: '300px',
              height: '400px',
              border: '1px solid #ccc',
              overflow: 'hidden'
            }}>
              <iframe
                src={url}
                title={`PDF Preview ${index + 1}`}
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ))}
        </div>
      )}
      
      <button
        onClick={handleUpload}
        style={{
          padding: '0.5rem 1rem',
          backgroundColor: '#007bff',
          color: '#fff',
          border: 'none',
          borderRadius: '4px',
          cursor: 'pointer'
        }}
        disabled={files.length === 0 || !email}
      >
        Upload {files.length} PDF{files.length !== 1 ? 's' : ''}
      </button>
      
      {uploadStatus && (
        <p style={{
          padding: '0.5rem',
          backgroundColor: uploadStatus.includes('successful') ? '#d4edda' : '#f8d7da',
          borderRadius: '4px',
          color: uploadStatus.includes('successful') ? '#155724' : '#721c24'
        }}>
          {uploadStatus}
        </p>
      )}
    </div>
  );
}

export default App;