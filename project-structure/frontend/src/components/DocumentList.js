import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEye, faCalendarAlt, faFileAlt, faSpinner } from '@fortawesome/free-solid-svg-icons';

const DocumentList = () => {
    const [documents, setDocuments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchDocuments();
    }, []);

    const fetchDocuments = async () => {
        try {
            const response = await axios.get('http://localhost:5000/documents');
            setDocuments(response.data);
            setLoading(false);
        } catch (error) {
            setError('Failed to fetch documents');
            setLoading(false);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <FontAwesomeIcon icon={faSpinner} className="animate-spin text-4xl text-blue-500" />
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {error}
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold mb-6">Uploaded Documents</h2>
            <div className="grid gap-6">
                {documents.map((doc) => (
                    <div key={doc._id} className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <div className="flex justify-between items-start">
                            <div>
                                <h3 className="text-lg font-semibold mb-2">{doc.fileName}</h3>
                                <div className="grid grid-cols-2 gap-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faCalendarAlt} className="mr-2" />
                                        <span>Letter Date: {formatDate(doc.metadata.letterDate)}</span>
                                    </div>
                                    <div className="flex items-center">
                                        <FontAwesomeIcon icon={faFileAlt} className="mr-2" />
                                        <span>Type: {doc.metadata.incomingOutgoing}</span>
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium">From:</span> {doc.metadata.from}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium">To:</span> {doc.metadata.to}
                                    </div>
                                    <div className="col-span-2">
                                        <span className="font-medium">Subject:</span> {doc.metadata.subject}
                                    </div>
                                    {doc.metadata.reference && (
                                        <div className="col-span-2">
                                            <span className="font-medium">Reference:</span> {doc.metadata.reference}
                                        </div>
                                    )}
                                    <div className="col-span-2">
                                        <span className="font-medium">Summary:</span>
                                        <p className="mt-1 text-gray-600">{doc.metadata.summary}</p>
                                    </div>
                                </div>
                            </div>
                            <a
                                href={doc.previewUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded-md hover:bg-blue-100 transition-colors duration-200"
                            >
                                <FontAwesomeIcon icon={faEye} className="mr-2" />
                                View Document
                            </a>
                        </div>
                        <div className="mt-4 text-sm text-gray-500">
                            Uploaded on {formatDate(doc.uploadedAt)}
                        </div>
                    </div>
                ))}
                {documents.length === 0 && (
                    <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">No documents have been uploaded yet.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default DocumentList;
