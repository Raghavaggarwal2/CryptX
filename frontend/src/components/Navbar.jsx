import React from "react";
import { useNavigate } from "react-router-dom";
import toast from 'react-hot-toast';

const Navbar = ({ isAuthenticated, setIsAuthenticated }) => {
  const navigate = useNavigate();
  const userName = localStorage.getItem('userName');
  const userEmail = localStorage.getItem('userEmail');

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userName');
    setIsAuthenticated(false);
    toast.success('Logged out successfully');
    navigate('/login');
  };

  return (
    <nav className="bg-gradient-to-r from-gray-700 to-gray-800 text-white">
      <div className="flex justify-between items-center h-16 mycontainer">
        <div className="logo font-bold text-3xl">
          <span className="text-highlight1">&lt;</span>
          Crypt
          <span className="text-highlight1"> X/ &gt;</span>
        </div>
        
        <div className="flex items-center gap-4">
          {isAuthenticated && (
            <div className="hidden sm:flex items-center bg-gray-600 px-3 py-1 rounded-full text-sm">
              <span className="w-2 h-2 bg-green-400 rounded-full mr-2"></span>
              {userName || userEmail}
            </div>
          )}
          
          <button 
            onClick={() => window.open("https://github.com/Raghavaggarwal2", "_blank")}
            className="btn-primary hidden md:flex justify-center items-center ring-1 ring-white"
          >
            <img src="https://cdn-icons-png.flaticon.com/512/25/25231.png" className="w-6 invert p-1" alt="github logo" />
            <span className="px-2 text-sm">GitHub</span>
          </button>

          {isAuthenticated && (
            <button 
              onClick={handleLogout}
              className="bg-red-600 hover:bg-red-700 text-white text-sm font-semibold px-4 py-1.5 rounded-full ring-1 ring-white transition"
            >
              Logout
            </button>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
