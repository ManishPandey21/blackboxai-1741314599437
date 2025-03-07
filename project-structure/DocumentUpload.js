import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';

const DocumentUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [metadata, setMetadata] = useState({
        incomingOutgoing: '',
        letterDate: '',
        letterNumber: '',
        from: '',
        to: '',
        subject: '',
        reference: '',
        summary: ''
    });

    // Handle drag and drop
    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else {
            setPreview(null);
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx']
        }
    });

    // Handle metadata changes
    const handleMetadataChange = (e) => {
        const { name, value } = e.target;
        setMetadata(prev => ({
            ...prev,
            [name]: value
        }));
    };

    // Handle file upload
    const handleUpload = async () => {
        if (!file || !validateMetadata()) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('file', file);
        
        // Append metadata
        Object.keys(metadata).forEach(key => {
            formData.append(key, metadata[key]);
        });

        try {
            const response = await axios.post('http://localhost:5000/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            setSuccess('File uploaded and converted successfully!');
            // Reset form
            setFile(null);
            setPreview(null);
            setMetadata({
                incomingOutgoing: '',
                letterDate: '',
                letterNumber: '',
                from: '',
                to: '',
                subject: '',
                reference: '',
                summary: ''
            });
        } catch (error) {
            setError(error.response?.data?.message || 'Error uploading file');
        } finally {
            setLoading(false);
        }
    };

    // Validate metadata
    const validateMetadata = () => {
        const required = ['incomingOutgoing', 'letterDate', 'letterNumber', 'from', 'to', 'subject', 'summary'];
        return required.every(field => metadata[field].trim() !== '');
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <h1 className="text-2xl font-bold mb-6">Document Upload</h1>

            {/* Drag & Drop Zone */}
            <div 
                {...getRootProps()} 
                className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer
                    ${isDragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}`}
            >
                <input {...getInputProps()} />
                {isDragActive ? (
                    <p>Drop the file here...</p>
                ) : (
                    <p>Drag and drop a file here, or click to select a file</p>
                )}
            </div>

            {/* File Preview */}
            {file && (
                <div className="mb-6">
                    <h2 className="text-lg font-semibold mb-2">Selected File:</h2>
                    {preview ? (
                        <img src={preview} alt="Preview" className="max-w-xs rounded" />
                    ) : (
                        <div className="p-4 bg-gray-100 rounded">
                            <p>{file.name}</p>
                            <p className="text-sm text-gray-500">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    )}
                </div>
            )}

            {/* Metadata Form */}
            <div className="grid grid-cols-2 gap-4 mb-6">
                <div>
                    <label className="block mb-1">Type *</label>
                    <select
                        name="incomingOutgoing"
                        value={metadata.incomingOutgoing}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    >
                        <option value="">Select Type</option>
                        <option value="Incoming">Incoming</option>
                        <option value="Outgoing">Outgoing</option>
                    </select>
                </div>

                <div>
                    <label className="block mb-1">Letter Date *</label>
                    <input
                        type="date"
                        name="letterDate"
                        value={metadata.letterDate}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1">Letter Number *</label>
                    <input
                        type="text"
                        name="letterNumber"
                        value={metadata.letterNumber}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1">From *</label>
                    <input
                        type="text"
                        name="from"
                        value={metadata.from}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1">To *</label>
                    <input
                        type="text"
                        name="to"
                        value={metadata.to}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1">Subject *</label>
                    <input
                        type="text"
                        name="subject"
                        value={metadata.subject}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div>
                    <label className="block mb-1">Reference</label>
                    <input
                        type="text"
                        name="reference"
                        value={metadata.reference}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                <div className="col-span-2">
                    <label className="block mb-1">Summary *</label>
                    <textarea
                        name="summary"
                        value={metadata.summary}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                        rows="4"
                    />
                </div>
            </div>

            {/* Error and Success Messages */}
            {error && (
                <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
                    {error}
                </div>
            )}
            {success && (
                <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
                    {success}
                </div>
            )}

            {/* Upload Button */}
            <button
                onClick={handleUpload}
                disabled={loading || !file}
                className={`px-6 py-2 rounded ${
                    loading || !file
                        ? 'bg-gray-300 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white'
                }`}
            >
                {loading ? 'Uploading...' : 'Upload'}
            </button>
        </div>
    );
};

export default DocumentUpload;
