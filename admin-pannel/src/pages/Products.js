import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import toast from 'react-hot-toast';

const Products = () => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await axios.get(
        'http://localhost:5000/api/products'
      );

      setProducts(response.data?.data || []);
    } catch (error) {
      console.error('Error fetching products:', error);
      toast.error('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (productId) => {
    const confirmed = window.confirm(
      'Are you sure you want to delete this product?'
    );

    if (!confirmed) return;

    try {
      const token = localStorage.getItem('adminToken');

      await axios.delete(
        `http://localhost:5000/api/products/${productId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      toast.success('Product deleted successfully');
      fetchProducts();
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const handleEdit = (productId) => {
    navigate(`/edit-product/${productId}`);
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading products...
      </div>
    );
  }

  return (
    <div>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '24px',
        }}
      >
        <h1 style={{ fontSize: '28px', fontWeight: 'bold' }}>
          Products
        </h1>

        <button
          onClick={() => navigate('/add-product')}
          style={{
            background: '#000',
            color: '#fff',
            padding: '10px 20px',
            border: 'none',
            borderRadius: '8px',
            cursor: 'pointer',
            fontWeight: '600',
          }}
        >
          + Add Product
        </button>
      </div>

      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          overflow: 'auto',
          boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
        }}
      >
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            minWidth: '800px',
          }}
        >
          <thead style={{ background: '#f9fafb' }}>
            <tr>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                Image
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                Name
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                Category
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                Price
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                Stock
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                Status
              </th>
              <th style={{ padding: '12px', textAlign: 'left' }}>
                Actions
              </th>
            </tr>
          </thead>

          <tbody>
            {products.length === 0 ? (
              <tr>
                <td
                  colSpan="7"
                  style={{
                    textAlign: 'center',
                    padding: '40px',
                    color: '#666',
                  }}
                >
                  No products found. Click "Add Product" to create one.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr
                  key={product._id}
                  style={{
                    borderTop: '1px solid #e5e7eb',
                  }}
                >
                  <td style={{ padding: '12px' }}>
                    {product.images?.[0]?.url ? (
                      <img
                        src={product.images[0].url}
                        alt={product.name}
                        style={{
                          width: '50px',
                          height: '50px',
                          objectFit: 'cover',
                          borderRadius: '6px',
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '50px',
                          height: '50px',
                          background: '#f0f0f0',
                          borderRadius: '6px',
                        }}
                      />
                    )}
                  </td>

                  <td
                    style={{
                      padding: '12px',
                      fontWeight: '500',
                    }}
                  >
                    {product.name}
                  </td>

                  <td style={{ padding: '12px' }}>
                    {product.category?.name || 'Uncategorized'}
                  </td>

                  <td style={{ padding: '12px' }}>
                    ₹{product.price}
                  </td>

                  <td style={{ padding: '12px' }}>
                    {product.stock}
                  </td>

                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        background: product.isPublished
                          ? '#10b981'
                          : '#ef4444',
                        color: '#fff',
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                      }}
                    >
                      {product.isPublished
                        ? 'Published'
                        : 'Draft'}
                    </span>
                  </td>

                  <td style={{ padding: '12px' }}>
                    <button
                      onClick={() => handleEdit(product._id)}
                      style={{
                        marginRight: '8px',
                        padding: '4px 12px',
                        cursor: 'pointer',
                        background: '#3b82f6',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Edit
                    </button>

                    <button
                      onClick={() =>
                        handleDelete(product._id)
                      }
                      style={{
                        padding: '4px 12px',
                        cursor: 'pointer',
                        background: '#ef4444',
                        color: '#fff',
                        border: 'none',
                        borderRadius: '4px',
                      }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Products;