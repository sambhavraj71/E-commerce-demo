import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FiPackage, FiShoppingBag, FiUsers, FiDollarSign } from 'react-icons/fi';

const Dashboard = () => {
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalOrders: 0,
    totalUsers: 0,
    totalRevenue: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      // Get token - use 'token' instead of 'adminToken' (based on your auth logs)
      const token = localStorage.getItem('token');
      console.log('Fetching stats with token:', token ? 'Present' : 'Missing');
      
      // FIXED: Added /api prefix to all URLs
      const productsRes = await axios.get('https://ecommerce-backend-sambhav.onrender.com/api/products');
      const usersRes = await axios.get('https://ecommerce-backend-sambhav.onrender.com/api/users');
      
      // Fetch orders with auth token
      let ordersRes = { data: { data: [] } };
      if (token) {
        try {
          ordersRes = await axios.get('https://ecommerce-backend-sambhav.onrender.com/api/orders', {
            headers: { 
              'Authorization': `Bearer ${token}`
            }
          });
        } catch (orderError) {
          console.error('Error fetching orders:', orderError);
        }
      }
      
      // Calculate total revenue from orders
      const totalRevenue = ordersRes.data.data?.reduce((sum, order) => sum + (order.totalPrice || 0), 0) || 0;
      
      setStats({
        totalProducts: productsRes.data.data?.length || 0,
        totalOrders: ordersRes.data.data?.length || 0,
        totalUsers: usersRes.data.users?.length || 0,
        totalRevenue: totalRevenue
      });
    } catch (error) {
      console.error('Error fetching stats:', error);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Products', value: stats.totalProducts, icon: <FiPackage size={24} />, color: '#3b82f6' },
    { title: 'Total Orders', value: stats.totalOrders, icon: <FiShoppingBag size={24} />, color: '#10b981' },
    { title: 'Total Users', value: stats.totalUsers, icon: <FiUsers size={24} />, color: '#8b5cf6' },
    { title: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: <FiDollarSign size={24} />, color: '#ef4444' },
  ];

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px' }}>Loading dashboard...</div>;
  }

  return (
    <div>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Dashboard</h1>
      
      <div style={{ 
        display: 'grid', 
        gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', 
        gap: '20px', 
        marginBottom: '32px' 
      }}>
        {statCards.map((card, index) => (
          <div key={index} style={{ 
            background: 'white', 
            padding: '20px', 
            borderRadius: '12px', 
            boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <div style={{ color: card.color }}>{card.icon}</div>
              <span style={{ fontSize: '24px', fontWeight: 'bold' }}>{card.value}</span>
            </div>
            <h3 style={{ color: '#666', fontSize: '14px', fontWeight: '500' }}>{card.title}</h3>
          </div>
        ))}
      </div>
      
      <div style={{ 
        background: 'white', 
        borderRadius: '12px', 
        padding: '20px', 
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)' 
      }}>
        <h2 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '16px' }}>Welcome to Admin Panel</h2>
        <p style={{ color: '#666' }}>Manage your products, orders, and users from here.</p>
      </div>
    </div>
  );
};

export default Dashboard;
