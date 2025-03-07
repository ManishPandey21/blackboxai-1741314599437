import React from 'react';

const Profile = () => {
  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Profile</h1>
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center space-x-4 mb-6">
          <div className="w-20 h-20 bg-gray-200 rounded-full flex items-center justify-center">
            <span className="text-3xl text-gray-500">👤</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold">John Doe</h2>
            <p className="text-gray-600">john.doe@example.com</p>
          </div>
        </div>
        <div className="grid gap-4">
          <div className="border-t pt-4">
            <h3 className="font-medium mb-2">Account Details</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-gray-600">Full Name</label>
                <input
                  type="text"
                  value="John Doe"
                  readOnly
                  className="w-full p-2 border rounded bg-gray-50"
                />
              </div>
              <div>
                <label className="block text-sm text-gray-600">Email</label>
                <input
                  type="email"
                  value="john.doe@example.com"
                  readOnly
                  className="w-full p-2 border rounded bg-gray-50"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
