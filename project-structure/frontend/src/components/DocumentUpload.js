import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner, faCheckCircle, faTimesCircle, faEye } from '@fortawesome/free-solid-svg-icons';

const DocumentUpload = ({ onUploadSuccess }) => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [convertedUrl, setConvertedUrl] = useState(null);
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
    const onDrop = useCallback(async (acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);
        setError(null);
        
        // Create preview for images
        if (file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = () => {
                setPreview(reader.result);
            };
            reader.readAsDataURL(file);
        } else if (file.type === 'application/pdf') {
            // For PDFs, we'll create a preview URL
            setPreview(URL.createObjectURL(file));
        } else {
            setPreview(null);
        }

        try {
            // Extract text using OCR if it's an image or PDF
            if (file.type.startsWith('image/') || file.type === 'application/pdf') {
                const formData = new FormData();
                formData.append('file', file);
                
                const extractResponse = await axios.post('http://localhost:5000/extract-text', formData);
                if (extractResponse.data.success) {
                    // Analyze the extracted text with OpenAI
                    const aiResponse = await axios.post('http://localhost:5000/analyze-document', {
                        text: extractResponse.data.text
                    });

                    // Auto-fill metadata fields
                    setMetadata(prev => ({
                        ...prev,
                        incomingOutgoing: aiResponse.data.type || prev.incomingOutgoing,
                        letterDate: aiResponse.data.date || prev.letterDate,
                        letterNumber: aiResponse.data.reference || prev.letterNumber,
                        from: aiResponse.data.from || prev.from,
                        to: aiResponse.data.to || prev.to,
                        subject: aiResponse.data.subject || prev.subject,
                        reference: aiResponse.data.additionalReference || prev.reference,
                        summary: aiResponse.data.summary || prev.summary
                    }));
                }
            }
        } catch (error) {
            console.error('Error processing document:', error);
            // Don't show error to user, just log it as this is an enhancement
        }
    }, []);

    const { getRootProps, getInputProps, isDragActive, fileRejections } = useDropzone({
        onDrop,
        accept: {
            'image/*': [],
            'application/pdf': ['.pdf'],
            'application/msword': ['.doc'],
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
            'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
            'application/vnd.ms-excel': ['.xls']
        },
        maxSize: 10 * 1024 * 1024, // 10MB
        multiple: false
    });

    // Handle file rejections
    React.useEffect(() => {
        if (fileRejections.length > 0) {
            const rejection = fileRejections[0];
            if (rejection.errors[0].code === 'file-too-large') {
                setError('File is too large. Maximum size is 10MB.');
            } else {
                setError('Invalid file type. Please upload a supported document format.');
            }
        }
    }, [fileRejections]);

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

            if (response.data.success) {
                setSuccess('File uploaded and converted successfully!');
                setConvertedUrl(response.data.document.previewUrl);
                // Reset form but keep the success state and converted URL
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
                // Notify parent component about successful upload
                if (onUploadSuccess) {
                    onUploadSuccess();
                }
            }
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
                className={`border-2 border-dashed rounded-lg p-8 mb-6 text-center cursor-pointer transition-all duration-200 ease-in-out
                    ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
            >
                <input {...getInputProps()} />
                <FontAwesomeIcon 
                    icon={faCloudUploadAlt} 
                    className={`text-4xl mb-4 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
                />
                {isDragActive ? (
                    <p className="text-blue-500 font-medium">Drop the file here...</p>
                ) : (
                    <div>
                        <p className="text-gray-600 mb-2">Drag and drop a file here, or click to select a file</p>
                        <p className="text-sm text-gray-500">Supported formats: PDF, DOC, DOCX, Images</p>
                    </div>
                )}
            </div>

            {/* File Preview with enhanced styling */}
            {file && (
                <div className="mb-6 p-4 bg-white rounded-lg shadow-sm border border-gray-200">
                    <h2 className="text-lg font-semibold mb-3 flex items-center">
                        <span className="mr-2">Selected File</span>
                        {success && (
                            <span className="text-green-500 text-sm font-normal">
                                <FontAwesomeIcon icon={faCheckCircle} className="mr-1" />
                                Converted successfully
                            </span>
                        )}
                    </h2>
                    {preview ? (
                        <div className="relative group">
                            <img src={preview} alt="Preview" className="max-w-xs rounded-lg shadow-sm" />
                            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-10 transition-all duration-200 rounded-lg" />
                        </div>
                    ) : (
                        <div className="p-4 bg-gray-50 rounded-lg border border-gray-100">
                            <p className="font-medium text-gray-700">{file.name}</p>
                            <p className="text-sm text-gray-500 mt-1">{(file.size / 1024).toFixed(2)} KB</p>
                        </div>
                    )}
                    {convertedUrl && (
                        <a
                            href={convertedUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center mt-3 px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200"
                        >
                            <FontAwesomeIcon icon={faEye} className="mr-2" />
                            View Converted Document
                        </a>
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

            {/* Enhanced Error and Success Messages */}
            {error && (
                <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                    <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 mt-1 mr-3" />
                    <div>
                        <h3 className="text-red-700 font-medium mb-1">Upload Failed</h3>
                        <p className="text-red-600 text-sm">{error}</p>
                    </div>
                </div>
            )}
            {success && (
                <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                    <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3" />
                    <div>
                        <h3 className="text-green-700 font-medium mb-1">Upload Successful</h3>
                        <p className="text-green-600 text-sm">{success}</p>
                    </div>
                </div>
            )}

            {/* Enhanced Upload Button */}
            <button
                onClick={handleUpload}
                disabled={loading || !file}
                className={`px-6 py-3 rounded-lg flex items-center justify-center min-w-[120px] transition-all duration-200 ${
                    loading || !file
                        ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                        : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow'
                }`}
            >
                {loading ? (
                    <>
                        <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                        <span>Uploading...</span>
                    </>
                ) : (
                    <>
                        <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
                        <span>Upload</span>
                    </>
                )}
            </button>
        </div>
    );
};

export default DocumentUpload;
