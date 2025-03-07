import React, { useEffect, useState } from 'react';
import axios from 'axios';

const Dashboard = () => {
    const [data, setData] = useState({
        totalUploaded: 0,
        successfullyProcessed: 0,
        totalStraightThrough: 0,
        totalReviewPending: 0,
        averageAccuracy: 0,
        averageTimePerDocument: 0,
        usageStats: []
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await axios.get('http://localhost:5000/dashboard-data');
                setData(response.data);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
            }
        };

        fetchData();
    }, []);

    return (
        <div className="p-6">
            <h1 className="text-3xl font-bold mb-6">Dashboard</h1>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl">Total Uploaded</h2>
                    <p className="text-2xl font-bold">{data.totalUploaded}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl">Successfully Processed</h2>
                    <p className="text-2xl font-bold">{data.successfullyProcessed}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl">Total Straight Through</h2>
                    <p className="text-2xl font-bold">{data.totalStraightThrough}</p>
                </div>
            </div>
            <div className="grid grid-cols-3 gap-4 mb-6">
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl">Total Review Pending</h2>
                    <p className="text-2xl font-bold">{data.totalReviewPending}</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl">Average Accuracy</h2>
                    <p className="text-2xl font-bold">{data.averageAccuracy}%</p>
                </div>
                <div className="bg-white p-4 rounded shadow">
                    <h2 className="text-xl">Average Time Per Document</h2>
                    <p className="text-2xl font-bold">{data.averageTimePerDocument} Sec</p>
                </div>
            </div>
            {/* Chart for Usage Stats */}
            <div className="bg-white p-4 rounded shadow">
                <h2 className="text-xl">Usage Stats</h2>
                {/* Chart component can be integrated here */}
            </div>
        </div>
    );
};

export default Dashboard;
