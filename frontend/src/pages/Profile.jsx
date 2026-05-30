import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Formik, Form } from 'formik';
import * as Yup from 'yup';
import { FiUser, FiMail, FiPhone, FiMapPin, FiEdit2, FiSave, FiX, FiTrash2 } from 'react-icons/fi';
import { motion } from 'framer-motion';
import api from '../services/api';
import { logout } from '../redux/slices/authSlice';
import toast from 'react-hot-toast';
import Loader from '../components/common/Loader';

const Profile = () => {
  const { user } = useSelector((state) => state.auth);
  const dispatch = useDispatch();
  const [isEditing, setIsEditing] = useState(false);
  const [addresses, setAddresses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddressForm, setShowAddressForm] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');

  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    try {
      const response = await api.get('/users/addresses');
      setAddresses(response.data.data);
    } catch (error) {
      console.error('Error fetching addresses:', error);
    } finally {
      setLoading(false);
    }
  };

  const profileValidationSchema = Yup.object({
    name: Yup.string().required('Name is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Phone must be 10 digits'),
  });

  const addressValidationSchema = Yup.object({
    fullName: Yup.string().required('Full name is required'),
    addressLine1: Yup.string().required('Address is required'),
    city: Yup.string().required('City is required'),
    state: Yup.string().required('State is required'),
    postalCode: Yup.string().matches(/^[0-9]{6}$/, 'Invalid postal code').required('Postal code is required'),
    phone: Yup.string().matches(/^[0-9]{10}$/, 'Invalid phone number').required('Phone is required'),
  });

  const handleProfileUpdate = async (values) => {
    try {
      await api.put('/auth/profile', values);
      toast.success('Profile updated successfully');
      setIsEditing(false);
      const updatedUser = { ...user, ...values };
      localStorage.setItem('user', JSON.stringify(updatedUser));
    } catch (error) {
      toast.error('Failed to update profile');
    }
  };

  const handleAddAddress = async (values, { resetForm }) => {
    try {
      await api.post('/users/addresses', values);
      toast.success('Address added successfully');
      fetchAddresses();
      setShowAddressForm(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to add address');
    }
  };

  const handleDeleteAddress = async (addressId) => {
    if (window.confirm('Are you sure you want to delete this address?')) {
      try {
        await api.delete(`/users/addresses/${addressId}`);
        toast.success('Address deleted successfully');
        fetchAddresses();
      } catch (error) {
        toast.error('Failed to delete address');
      }
    }
  };

  const handleSetDefaultAddress = async (addressId) => {
    try {
      await api.put(`/users/addresses/${addressId}`, { isDefault: true });
      toast.success('Default address updated');
      fetchAddresses();
    } catch (error) {
      toast.error('Failed to update default address');
    }
  };

  if (loading) return <Loader />;

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container-custom">
        <h1 className="text-3xl font-bold mb-8">My Profile</h1>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm p-6 sticky top-24">
              <div className="text-center mb-6">
                <div className="w-24 h-24 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
                  <FiUser size={40} className="text-gray-500" />
                </div>
                <h3 className="font-semibold text-lg">{user?.name}</h3>
                <p className="text-gray-500 text-sm">{user?.email}</p>
              </div>

              <div className="space-y-2">
                <button
                  onClick={() => setActiveTab('profile')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'profile' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  Profile Information
                </button>
                <button
                  onClick={() => setActiveTab('addresses')}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    activeTab === 'addresses' ? 'bg-black text-white' : 'hover:bg-gray-100'
                  }`}
                >
                  Address Book
                </button>
                <button
                  onClick={() => dispatch(logout())}
                  className="w-full text-left px-4 py-2 text-red-600 hover:bg-red-50 rounded-lg"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Profile Information Tab */}
            {activeTab === 'profile' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Profile Information</h2>
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="flex items-center space-x-2 text-black hover:text-gray-600"
                    >
                      <FiEdit2 size={16} />
                      <span>Edit</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex items-center space-x-2 text-red-500 hover:text-red-600"
                    >
                      <FiX size={16} />
                      <span>Cancel</span>
                    </button>
                  )}
                </div>

                {!isEditing ? (
                  <div className="space-y-4">
                    <div className="flex flex-col md:flex-row md:items-center py-2 border-b">
                      <div className="md:w-32 text-gray-500 font-medium">Full Name:</div>
                      <div className="flex-1">{user?.name}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center py-2 border-b">
                      <div className="md:w-32 text-gray-500 font-medium">Email:</div>
                      <div className="flex-1">{user?.email}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center py-2 border-b">
                      <div className="md:w-32 text-gray-500 font-medium">Phone:</div>
                      <div className="flex-1">{user?.phone || 'Not provided'}</div>
                    </div>
                    <div className="flex flex-col md:flex-row md:items-center py-2">
                      <div className="md:w-32 text-gray-500 font-medium">Member Since:</div>
                      <div className="flex-1">{new Date(user?.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ) : (
                  <Formik
                    initialValues={{ name: user?.name || '', phone: user?.phone || '' }}
                    validationSchema={profileValidationSchema}
                    onSubmit={handleProfileUpdate}
                  >
                    {({ values, errors, touched, handleChange, handleBlur, isSubmitting }) => (
                      <Form className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium mb-1">Full Name</label>
                          <input
                            type="text"
                            name="name"
                            value={values.name}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.name && touched.name && <p className="text-sm text-red-500 mt-1">{errors.name}</p>}
                        </div>
                        <div>
                          <label className="block text-sm font-medium mb-1">Phone Number</label>
                          <input
                            type="tel"
                            name="phone"
                            value={values.phone}
                            onChange={handleChange}
                            onBlur={handleBlur}
                            className="input-field"
                          />
                          {errors.phone && touched.phone && <p className="text-sm text-red-500 mt-1">{errors.phone}</p>}
                        </div>
                        <button type="submit" disabled={isSubmitting} className="btn-primary">
                          <FiSave size={16} className="inline mr-2" />
                          Save Changes
                        </button>
                      </Form>
                    )}
                  </Formik>
                )}
              </div>
            )}

            {/* Address Book Tab */}
            {activeTab === 'addresses' && (
              <div className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl font-bold">Address Book</h2>
                  <button
                    onClick={() => setShowAddressForm(!showAddressForm)}
                    className="text-black hover:text-gray-600"
                  >
                    + Add New Address
                  </button>
                </div>

                {showAddressForm && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mb-6 p-4 bg-gray-50 rounded-lg"
                  >
                    <Formik
                      initialValues={{
                        fullName: user?.name || '',
                        addressLine1: '',
                        addressLine2: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        phone: user?.phone || '',
                        addressType: 'home',
                      }}
                      validationSchema={addressValidationSchema}
                      onSubmit={handleAddAddress}
                    >
                      {({ values, errors, touched, handleChange, handleBlur, isSubmitting, resetForm }) => (
                        <Form className="space-y-3">
                          <h3 className="font-semibold mb-3">Add New Address</h3>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={values.fullName}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input-field"
                              />
                              {errors.fullName && touched.fullName && <p className="text-sm text-red-500">{errors.fullName}</p>}
                            </div>
                            <div>
                              <input
                                type="tel"
                                name="phone"
                                placeholder="Phone Number"
                                value={values.phone}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input-field"
                              />
                              {errors.phone && touched.phone && <p className="text-sm text-red-500">{errors.phone}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <input
                                type="text"
                                name="addressLine1"
                                placeholder="Address Line 1"
                                value={values.addressLine1}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input-field"
                              />
                              {errors.addressLine1 && touched.addressLine1 && <p className="text-sm text-red-500">{errors.addressLine1}</p>}
                            </div>
                            <div className="md:col-span-2">
                              <input
                                type="text"
                                name="addressLine2"
                                placeholder="Address Line 2 (Optional)"
                                value={values.addressLine2}
                                onChange={handleChange}
                                className="input-field"
                              />
                            </div>
                            <div>
                              <input
                                type="text"
                                name="city"
                                placeholder="City"
                                value={values.city}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input-field"
                              />
                              {errors.city && touched.city && <p className="text-sm text-red-500">{errors.city}</p>}
                            </div>
                            <div>
                              <input
                                type="text"
                                name="state"
                                placeholder="State"
                                value={values.state}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input-field"
                              />
                              {errors.state && touched.state && <p className="text-sm text-red-500">{errors.state}</p>}
                            </div>
                            <div>
                              <input
                                type="text"
                                name="postalCode"
                                placeholder="Postal Code"
                                value={values.postalCode}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className="input-field"
                              />
                              {errors.postalCode && touched.postalCode && <p className="text-sm text-red-500">{errors.postalCode}</p>}
                            </div>
                            <div>
                              <select
                                name="addressType"
                                value={values.addressType}
                                onChange={handleChange}
                                className="input-field"
                              >
                                <option value="home">Home</option>
                                <option value="work">Work</option>
                                <option value="other">Other</option>
                              </select>
                            </div>
                          </div>
                          <div className="flex space-x-3">
                            <button type="submit" disabled={isSubmitting} className="btn-primary">
                              Save Address
                            </button>
                            <button
                              type="button"
                              onClick={() => setShowAddressForm(false)}
                              className="px-4 py-2 border rounded-lg"
                            >
                              Cancel
                            </button>
                          </div>
                        </Form>
                      )}
                    </Formik>
                  </motion.div>
                )}

                <div className="space-y-4">
                  {addresses.map((address) => (
                    <div key={address._id} className="border rounded-lg p-4 relative">
                      {address.isDefault && (
                        <span className="absolute top-4 right-4 bg-green-100 text-green-700 text-xs px-2 py-1 rounded">
                          Default
                        </span>
                      )}
                      <div className="space-y-1">
                        <p className="font-semibold">{address.fullName}</p>
                        <p>{address.addressLine1}</p>
                        {address.addressLine2 && <p>{address.addressLine2}</p>}
                        <p>{address.city}, {address.state} - {address.postalCode}</p>
                        <p>Phone: {address.phone}</p>
                        <p className="capitalize text-gray-500">{address.addressType}</p>
                      </div>
                      <div className="flex space-x-3 mt-3">
                        {!address.isDefault && (
                          <button
                            onClick={() => handleSetDefaultAddress(address._id)}
                            className="text-sm text-black hover:underline"
                          >
                            Set as Default
                          </button>
                        )}
                        <button
                          onClick={() => handleDeleteAddress(address._id)}
                          className="text-sm text-red-500 hover:underline"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))}

                  {addresses.length === 0 && (
                    <p className="text-gray-500 text-center py-4">No addresses saved yet</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;