# Document Upload System with PDF/A-3 Conversion

A web application for uploading documents with metadata and automatic conversion to PDF/A-3 format.

## Features

- Drag-and-drop file upload interface
- Support for images and document files
- Automatic conversion to PDF/A-3 format
- Metadata input form
- File preview
- MongoDB storage for document metadata
- Error handling and validation

## Prerequisites

- Node.js (v14 or higher)
- MongoDB
- Ghostscript (for PDF/A-3 conversion)

## Project Structure

```
project-structure/
├── frontend/                # React frontend application
│   ├── src/
│   │   ├── components/     # React components
│   │   ├── App.js         # Main React component
│   │   └── index.js       # React entry point
│   ├── package.json       # Frontend dependencies
│   └── tailwind.config.js # Tailwind CSS configuration
├── models/                # MongoDB models
├── utils/                # Utility functions
├── server.js            # Express backend server
└── package.json        # Backend dependencies
```

## Installation

1. Install backend dependencies:
```bash
cd project-structure
npm install
```

2. Install frontend dependencies:
```bash
cd frontend
npm install
```

3. Make sure MongoDB is running on your system

## Configuration

1. Backend configuration:
   - MongoDB connection string in `server.js`
   - Port number (default: 5000)

2. Frontend configuration:
   - API endpoint in `src/components/DocumentUpload.js`
   - Tailwind CSS configuration in `tailwind.config.js`

## Running the Application

1. Start the backend server:
```bash
cd project-structure
npm start
```

2. Start the frontend development server:
```bash
cd frontend
npm start
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend API: http://localhost:5000

## API Endpoints

- POST `/upload`: Upload a file with metadata
  - Accepts multipart/form-data
  - Converts the file to PDF/A-3 format
  - Stores metadata in MongoDB

## Error Handling

- Frontend:
  - File type validation
  - Required metadata validation
  - API error handling
  - Loading states

- Backend:
  - File upload validation
  - Conversion error handling
  - Database error handling

## Technologies Used

- Frontend:
  - React
  - Tailwind CSS
  - react-dropzone
  - axios

- Backend:
  - Node.js
  - Express
  - MongoDB/Mongoose
  - Multer
  - Ghostscript

## License

MIT
