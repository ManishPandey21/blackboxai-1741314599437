import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faCloudUploadAlt, faSpinner, faCheckCircle, faTimesCircle, faEye } from '@fortawesome/free-solid-svg-icons';

const DirectConversionUpload = () => {
    const [file, setFile] = useState(null);
    const [preview, setPreview] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [convertedUrl, setConvertedUrl] = useState(null);
    const [metadata, setMetadata] = useState({
        invoiceNumber: '',
        issueDate: '',
        terms: '',
        sellerName: '',
        buyerName: '',
        subtotal: '',
        taxRate: '',
        totalDue: ''
    });

    const onDrop = useCallback((acceptedFiles) => {
        const file = acceptedFiles[0];
        setFile(file);
        
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
            'application/pdf': ['.pdf']
        }
    });

    const handleConversion = async () => {
        if (!file) {
            setError('Please select a file to convert');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(null);

        const formData = new FormData();
        formData.append('file', file);

        try {
            const response = await axios.post('http://localhost:5000/direct-upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            if (response.data.success) {
                setSuccess('File converted successfully!');
                setConvertedUrl(response.data.document.previewUrl);
            }
        } catch (error) {
            setError(error.response?.data?.message || 'Error converting file');
        } finally {
            setLoading(false);
        }
    };

    const handleMetadataChange = (e) => {
        const { name, value } = e.target;
        setMetadata(prev => ({
            ...prev,
            [name]: value
        }));
    };

    return (
        <div className="flex max-w-4xl mx-auto p-6">
            {/* Left Sidebar for Metadata */}
            <div className="w-1/3 pr-4">
                <h1 className="text-2xl font-bold mb-4">Upload Metadata</h1>
                <div 
                    {...getRootProps()} 
                    className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ease-in-out
                        ${isDragActive ? 'border-blue-500 bg-blue-50 scale-105' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50'}`}
                >
                    <input {...getInputProps()} />
                    <FontAwesomeIcon 
                        icon={faCloudUploadAlt} 
                        className={`text-4xl mb-2 ${isDragActive ? 'text-blue-500' : 'text-gray-400'}`}
                    />
                    {isDragActive ? (
                        <p className="text-blue-500 font-medium">Drop the file here...</p>
                    ) : (
                        <p className="text-gray-600">Drag and drop a file here, or click to select a file</p>
                    )}
                </div>

                {/* Display Uploaded File Name */}
                {file && (
                    <div className="mt-4">
                        <p className="font-medium">Uploaded File: {file.name}</p>
                    </div>
                )}

                {/* Metadata Form */}
                <div className="mt-4">
                    <label className="block mb-1">Invoice Number</label>
                    <input
                        type="text"
                        name="invoiceNumber"
                        value={metadata.invoiceNumber}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Issue Date</label>
                    <input
                        type="date"
                        name="issueDate"
                        value={metadata.issueDate}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Terms</label>
                    <input
                        type="text"
                        name="terms"
                        value={metadata.terms}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Seller Name</label>
                    <input
                        type="text"
                        name="sellerName"
                        value={metadata.sellerName}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Buyer Name</label>
                    <input
                        type="text"
                        name="buyerName"
                        value={metadata.buyerName}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Subtotal</label>
                    <input
                        type="text"
                        name="subtotal"
                        value={metadata.subtotal}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Tax Rate</label>
                    <input
                        type="text"
                        name="taxRate"
                        value={metadata.taxRate}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                    <label className="block mb-1 mt-2">Total Due</label>
                    <input
                        type="text"
                        name="totalDue"
                        value={metadata.totalDue}
                        onChange={handleMetadataChange}
                        className="w-full p-2 border rounded"
                    />
                </div>

                {/* Error and Success Messages */}
                {error && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start">
                        <FontAwesomeIcon icon={faTimesCircle} className="text-red-500 mt-1 mr-3" />
                        <div>
                            <h3 className="text-red-700 font-medium mb-1">Conversion Failed</h3>
                            <p className="text-red-600 text-sm">{error}</p>
                        </div>
                    </div>
                )}
                {success && (
                    <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start">
                        <FontAwesomeIcon icon={faCheckCircle} className="text-green-500 mt-1 mr-3" />
                        <div>
                            <h3 className="text-green-700 font-medium mb-1">Conversion Successful</h3>
                            <p className="text-green-600 text-sm">{success}</p>
                        </div>
                    </div>
                )}

                {/* Convert Button */}
                <button
                    onClick={handleConversion}
                    disabled={loading || !file}
                    className={`mt-4 px-6 py-3 rounded-lg flex items-center justify-center min-w-[120px] transition-all duration-200 ${
                        loading || !file
                            ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                            : 'bg-blue-500 hover:bg-blue-600 text-white shadow-sm hover:shadow'
                    }`}
                >
                    {loading ? (
                        <>
                            <FontAwesomeIcon icon={faSpinner} className="animate-spin mr-2" />
                            <span>Converting...</span>
                        </>
                    ) : (
                        <>
                            <FontAwesomeIcon icon={faCloudUploadAlt} className="mr-2" />
                            <span>Convert to PDF/A</span>
                        </>
                    )}
                </button>
            </div>

            {/* PDF Preview on the Right */}
            <div className="w-2/3 pl-4">
                {preview && (
                    <div className="mb-6">
                        <h2 className="text-lg font-semibold mb-3">PDF Preview</h2>
                        <img src={preview} alt="Preview" className="max-w-full rounded-lg shadow-sm" />
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
        </div>
    );
};

export default DirectConversionUpload;
