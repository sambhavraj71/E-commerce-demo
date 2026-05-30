import React from 'react';
import { useNavigate } from 'react-router-dom';

const Admin = () => {
  const navigate = useNavigate();
  
  // Get user from localStorage directly
  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');
  
  console.log('=== Admin Page Debug ===');
  console.log('Token exists:', !!token);
  console.log('User string:', userStr);
  
  // If no token, redirect to login
  if (!token) {
    console.log('No token, redirecting to login');
    navigate('/login');
    return null;
  }
  
  let user = null;
  let isAdmin = false;
  
  if (userStr) {
    try {
      user = JSON.parse(userStr);
      console.log('Parsed user:', user);
      console.log('User role:', user.role);
      
      // Check if user has admin role
      isAdmin = (user.role === 'admin' || user.role === 'super-admin');
      console.log('Is admin:', isAdmin);
      
    } catch (e) {
      console.error('Error parsing user:', e);
    }
  }
  
  // If user doesn't have admin role, show access denied (DON'T auto-redirect)
  if (!isAdmin) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white p-8 rounded-lg shadow-lg text-center max-w-md">
          <h2 className="text-2xl font-bold mb-4 text-red-600">⛔ Access Denied</h2>
          <p className="text-gray-600 mb-2">You don't have admin access.</p>
          <p className="text-sm text-gray-500 mb-4">Your role: <strong>{user?.role || 'Unknown'}</strong></p>
          <button 
            onClick={() => navigate('/')}
            className="bg-black text-white px-6 py-2 rounded-lg hover:bg-gray-800"
          >
            Go to Home
          </button>
        </div>
      </div>
    );
  }
  
  // Show admin panel
  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="container mx-auto px-4">
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6">
          ✅ Admin Panel Access Granted! Welcome {user?.name}
        </div>
        
        <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>
        
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-bold mb-4">Admin Information</h2>
          <div className="space-y-2">
            <p><strong>Name:</strong> {user?.name}</p>
            <p><strong>Email:</strong> {user?.email}</p>
            <p><strong>Role:</strong> <span className="bg-purple-100 text-purple-700 px-2 py-1 rounded">{user?.role}</span></p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Orders</h3>
            <p className="text-3xl font-bold text-blue-600">0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Products</h3>
            <p className="text-3xl font-bold text-green-600">0</p>
          </div>
          
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-semibold mb-2">Total Users</h3>
            <p className="text-3xl font-bold text-purple-600">0</p>
          </div>
        </div>
        
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-sm text-blue-800">
            🎉 Admin Panel is working! You have successfully accessed the admin area.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Admin;