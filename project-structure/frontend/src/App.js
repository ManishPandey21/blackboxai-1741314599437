import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import DirectConversionUpload from './components/DirectConversionUpload';
import Dashboard from './components/Dashboard';

const App = () => {
    return (
        <Router>
            <div>
                <Routes>
                    <Route path="/" element={<DirectConversionUpload />} />
                    <Route path="/dashboard" element={<Dashboard />} />
                </Routes>
            </div>
        </Router>
    );
};

export default App;
