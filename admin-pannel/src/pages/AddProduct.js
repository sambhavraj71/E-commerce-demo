import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const AddProduct = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState([]);
  const [formData, setFormData] = useState({
    name: '',
    price: '',
    description: '',
    stock: '',
    category: '',
    isFeatured: false,
    isPublished: true,
    images: []
  });
  const [imageFiles, setImageFiles] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('https://ecommerce-backend-sambhav.onrender.com/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
      toast.error('Failed to fetch categories');
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    setImageFiles(files);
    
    const previews = files.map(file => URL.createObjectURL(file));
    setImagePreviews(previews);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name || !formData.price || !formData.description) {
      toast.error('Please fill all required fields');
      return;
    }
    
    setLoading(true);
    
    try {
      const token = localStorage.getItem('adminToken');
      
      const productData = {
        name: formData.name,
        price: parseFloat(formData.price),
        description: formData.description,
        stock: parseInt(formData.stock) || 0,
        category: formData.category,
        isFeatured: formData.isFeatured,
        isPublished: formData.isPublished
      };
      
      const response = await axios.post('https://ecommerce-backend-sambhav.onrender.com/products', productData, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      const product = response.data.data;
      
      if (imageFiles.length > 0 && product) {
        const formDataImages = new FormData();
        imageFiles.forEach(file => {
          formDataImages.append('images', file);
        });
        
        await axios.post(`https://ecommerce-backend-sambhav.onrender.com/products/${product._id}/images`, formDataImages, {
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'multipart/form-data'
          }
        });
      }
      
      toast.success('Product added successfully!');
      navigate('/products');
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error(error.response?.data?.message || 'Failed to add product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '28px', fontWeight: 'bold', marginBottom: '24px' }}>Add New Product</h1>
      
      <form onSubmit={handleSubmit} style={{ background: 'white', padding: '24px', borderRadius: '12px', boxShadow: '0 1px 3px rgba(0,0,0,0.1)' }}>
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Product Name *</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            required
          />
        </div>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', marginBottom: '20px' }}>
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Price (₹) *</label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
              required
            />
          </div>
          
          <div>
            <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Stock Quantity</label>
            <input
              type="number"
              name="stock"
              value={formData.stock}
              onChange={handleChange}
              style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            />
          </div>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          >
            <option value="">Select Category</option>
            {categories.map(cat => (
              <option key={cat._id} value={cat._id}>
                {cat.icon || '📦'} {cat.name}
              </option>
            ))}
          </select>
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="5"
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
            required
          />
        </div>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontWeight: '500' }}>Product Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageChange}
            style={{ width: '100%', padding: '10px', border: '1px solid #ddd', borderRadius: '6px' }}
          />
          {imagePreviews.length > 0 && (
            <div style={{ display: 'flex', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
              {imagePreviews.map((preview, index) => (
                <img key={index} src={preview} alt={`Preview ${index + 1}`} style={{ width: '80px', height: '80px', objectFit: 'cover', borderRadius: '6px' }} />
              ))}
            </div>
          )}
        </div>
        
        <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isFeatured"
              checked={formData.isFeatured}
              onChange={handleChange}
            />
            Feature this product
          </label>
          
          <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              name="isPublished"
              checked={formData.isPublished}
              onChange={handleChange}
            />
            Publish immediately
          </label>
        </div>
        
        <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
          <button
            type="submit"
            disabled={loading}
            style={{
              background: '#000',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Adding Product...' : 'Add Product'}
          </button>
          
          <button
            type="button"
            onClick={() => navigate('/products')}
            style={{
              background: '#6b7280',
              color: 'white',
              padding: '12px 24px',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: '600'
            }}
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddProduct;
