import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { 
  faFileUpload, 
  faFileAlt, 
  faMagic, 
  faUser, 
  faSignOutAlt 
} from '@fortawesome/free-solid-svg-icons';

const Sidebar = ({ activeView, setActiveView, onLogout }) => {
  const menuItems = [
    { id: 'upload', icon: faFileUpload, label: 'Document Upload' },
    { id: 'list', icon: faFileAlt, label: 'Documents' },
    { id: 'direct-conversion', icon: faMagic, label: 'AI Upload' },
    { id: 'profile', icon: faUser, label: 'Profile' },
  ];

  return (
    <div className="w-64 bg-gray-800 min-h-screen text-white p-4">
      <div className="mb-8">
        <h1 className="text-xl font-bold">DMS</h1>
      </div>
      
      <nav>
        <ul className="space-y-2">
          {menuItems.map(item => (
            <li key={item.id}>
              <button
                onClick={() => setActiveView(item.id)}
                className={`w-full flex items-center space-x-3 px-4 py-2 rounded-lg transition-colors duration-200
                  ${activeView === item.id 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-300 hover:bg-gray-700'
                  }`}
              >
                <FontAwesomeIcon icon={item.icon} className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            </li>
          ))}
        </ul>
      </nav>

      <div className="absolute bottom-4 w-56">
        <button
          onClick={onLogout}
          className="w-full flex items-center space-x-3 px-4 py-2 text-gray-300 hover:bg-gray-700 rounded-lg transition-colors duration-200"
        >
          <FontAwesomeIcon icon={faSignOutAlt} className="w-5 h-5" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default Sidebar;
