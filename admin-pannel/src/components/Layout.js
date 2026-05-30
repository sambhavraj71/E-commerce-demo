import React from 'react';
import { Outlet, Link, useNavigate } from 'react-router-dom';
import { FiHome, FiPackage, FiShoppingBag, FiUsers, FiLogOut } from 'react-icons/fi';
import { useAuth } from '../hooks/useAuth';
import toast from 'react-hot-toast';

const Layout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    toast.success('Logged out successfully');
    navigate('/login');
  };

  const menuItems = [
    { path: '/', label: 'Dashboard', icon: <FiHome size={20} /> },
    { path: '/products', label: 'Products', icon: <FiPackage size={20} /> },
    { path: '/orders', label: 'Orders', icon: <FiShoppingBag size={20} /> },
    { path: '/users', label: 'Users', icon: <FiUsers size={20} /> },
  ];

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{ 
        width: '260px', 
        background: '#1a1a1a', 
        color: 'white', 
        position: 'fixed', 
        height: '100vh', 
        overflowY: 'auto' 
      }}>
        <div style={{ padding: '24px', borderBottom: '1px solid #333', marginBottom: '20px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 'bold' }}>Textura Admin</h2>
          <p style={{ fontSize: '12px', color: '#888', marginTop: '4px' }}>{user?.email}</p>
        </div>
        
        <nav>
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                padding: '12px 24px',
                color: 'white',
                textDecoration: 'none',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
              onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
            >
              {item.icon}
              <span>{item.label}</span>
            </Link>
          ))}
          
          <button
            onClick={handleLogout}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              padding: '12px 24px',
              color: 'white',
              background: 'none',
              border: 'none',
              width: '100%',
              textAlign: 'left',
              cursor: 'pointer',
              marginTop: '20px',
              borderTop: '1px solid #333'
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = '#333'}
            onMouseLeave={(e) => e.currentTarget.style.background = 'none'}
          >
            <FiLogOut size={20} />
            <span>Logout</span>
          </button>
        </nav>
      </div>
      
      {/* Main Content */}
      <div style={{ marginLeft: '260px', flex: 1, padding: '24px' }}>
        <Outlet />
      </div>
    </div>
  );
};

export default Layout;