import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';

const Navigation = () => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('isAuthenticated');
    navigate('/login');
  };

  return (
    <nav className="bg-teal-700 text-white shadow-lg">
      <div className="max-w-7xl mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold">Gewürz Guru</h1>
            <span className="bg-teal-600 text-xs px-2 py-1 rounded">Admin</span>
          </div>

          <div className="flex items-center gap-6">
            <NavLink
              to="/chat-history"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-teal-600 font-semibold'
                    : 'hover:bg-teal-600'
                }`
              }
            >
              Chat History
            </NavLink>

            <NavLink
              to="/test-questions"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-teal-600 font-semibold'
                    : 'hover:bg-teal-600'
                }`
              }
            >
              Test Questions
            </NavLink>

            <NavLink
              to="/test-results"
              className={({ isActive }) =>
                `px-4 py-2 rounded-lg transition ${
                  isActive
                    ? 'bg-teal-600 font-semibold'
                    : 'hover:bg-teal-600'
                }`
              }
            >
              Test Results
            </NavLink>

            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition font-semibold"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;