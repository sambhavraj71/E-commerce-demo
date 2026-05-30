import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { 
  FiArrowRight, FiTruck, FiShield, FiRefreshCw, FiHeadphones,
  FiPackage, FiPrinter, FiUsers, FiGift, FiWatch, FiSmartphone
} from 'react-icons/fi';
import axios from 'axios';
import ProductCard from '../components/products/ProductCard';
import { fetchFeaturedProducts } from '../redux/slices/productSlice';
import { useDispatch, useSelector } from 'react-redux';
import Loader from '../components/common/Loader';

const Home = () => {
  const dispatch = useDispatch();
  const { featuredProducts, isLoading } = useSelector((state) => state.products);
  const [categories, setCategories] = useState([]);
  const [loadingCategories, setLoadingCategories] = useState(true);

  // Map category names to their respective icons
  const getCategoryIcon = (categoryName, size = 28) => {
    const iconProps = { size, className: "text-gray-700 group-hover:text-white transition-colors" };
    
    switch (categoryName.toLowerCase()) {
      case 'custom apparel':
        return <FiPackage {...iconProps} />;
      case 'print on demand':
        return <FiPrinter {...iconProps} />;
      case 'uniforms':
        return <FiUsers {...iconProps} />;
      case 'corporate gifts':
        return <FiGift {...iconProps} />;
      case 'accessories':
        return <FiWatch {...iconProps} />;
      default:
        return <FiPackage {...iconProps} />;
    }
  };

  useEffect(() => {
    dispatch(fetchFeaturedProducts());
    fetchCategories();
  }, [dispatch]);

  const fetchCategories = async () => {
    try {
      const response = await axios.get('http://localhost:5000/api/categories');
      setCategories(response.data.data || []);
    } catch (error) {
      console.error('Error fetching categories:', error);
    } finally {
      setLoadingCategories(false);
    }
  };

  const features = [
    {
      icon: <FiTruck size={28} />,
      title: 'Free Shipping',
      description: 'On orders above ₹999',
    },
    {
      icon: <FiShield size={28} />,
      title: 'Secure Payment',
      description: '100% secure transactions',
    },
    {
      icon: <FiRefreshCw size={28} />,
      title: 'Easy Returns',
      description: '30-day return policy',
    },
    {
      icon: <FiHeadphones size={28} />,
      title: '24/7 Support',
      description: 'Customer service',
    },
  ];

  // Function to convert category name to slug
  const getCategorySlug = (name) => {
    return name.toLowerCase().replace(/ /g, '-');
  };

  return (
    <>
      {/* Hero Section */}
      <section className="relative h-[80vh] min-h-[600px] flex items-center justify-center overflow-hidden bg-gradient-to-r from-gray-900 to-gray-800">
        <div className="absolute inset-0">
          <img
            src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?ixlib=rb-4.0.3&auto=format&fit=crop&w=2070&q=80"
            alt="Hero Background"
            className="w-full h-full object-cover opacity-30"
          />
        </div>
        
        <div className="relative container-custom text-center text-white">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <span className="inline-block px-4 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm mb-6">
              Summer Collection 2026
            </span>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              Elevate Your Style
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-gray-200 max-w-2xl mx-auto">
              Discover the latest trends in fashion and lifestyle. Premium quality, timeless design.
            </p>
            <Link
              to="/shop"
              className="inline-flex items-center space-x-2 bg-white text-black px-8 py-4 rounded-full font-semibold hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              <span>Shop Now</span>
              <FiArrowRight size={20} />
            </Link>
          </motion.div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 animate-bounce">
          <div className="w-6 h-10 border-2 border-white rounded-full flex justify-center">
            <div className="w-1 h-2 bg-white rounded-full mt-2 animate-pulse"></div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                viewport={{ once: true }}
                className="text-center"
              >
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gray-100 rounded-full mb-4 text-black transition-colors">
                  {feature.icon}
                </div>
                <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-500">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Categories Section - Top Row with Icons */}
      <section className="py-16 bg-gray-50">
        <div className="container-custom">
          <div className="text-center mb-12">
            <h2 className="section-title">Shop by Category</h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Explore our premium collections
            </p>
          </div>
          
          {loadingCategories ? (
            <div className="text-center py-12">
              <Loader />
            </div>
          ) : (
            <>
              {/* Top Row - Icon Buttons */}
              <div className="flex flex-wrap justify-center gap-6 mb-16">
                {categories.map((category) => (
                  <Link
                    key={category._id}
                    to={`/shop?category=${getCategorySlug(category.name)}`}
                    className="group"
                  >
                    <div className="flex flex-col items-center p-4 rounded-2xl transition-all duration-300 hover:bg-white hover:shadow-lg">
                      <div className="w-20 h-20 bg-white rounded-full flex items-center justify-center shadow-md group-hover:bg-black transition-all duration-300 mb-3">
                        {getCategoryIcon(category.name, 32)}
                      </div>
                      <span className="font-medium text-gray-700 group-hover:text-black text-sm">
                        {category.name}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>

              {/* Bottom Row - Image Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
                {categories.map((category, index) => (
                  <motion.div
                    key={category._id}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.1 }}
                    viewport={{ once: true }}
                  >
                    <Link to={`/shop?category=${getCategorySlug(category.name)}`} className="block group">
                      <div className="relative overflow-hidden rounded-2xl shadow-md hover:shadow-xl transition-all duration-300">
                        <div className="relative h-56 overflow-hidden">
                          <img
                            src={category.image || 'https://via.placeholder.com/400x300?text=Category'}
                            alt={category.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                          <div className="absolute bottom-0 left-0 right-0 p-4">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center">
                                {getCategoryIcon(category.name, 16)}
                              </div>
                              <h3 className="text-white font-bold text-lg">{category.name}</h3>
                            </div>
                            <p className="text-white/80 text-sm line-clamp-2">{category.description}</p>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </>
          )}
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16 bg-white">
        <div className="container-custom">
          <h2 className="section-title">Featured Products</h2>
          <p className="text-center text-gray-600 mb-12 max-w-2xl mx-auto">
            Discover our hand-picked selection of premium products
          </p>
          
          {isLoading ? (
            <Loader />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {featuredProducts.slice(0, 4).map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          )}
          
          <div className="text-center mt-12">
            <Link to="/shop" className="btn-secondary inline-flex items-center space-x-2">
              <span>View All Products</span>
              <FiArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white">
        <div className="container-custom">
          <div className="max-w-3xl mx-auto text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-4">
                Subscribe to Our Newsletter
              </h2>
              <p className="text-gray-300 text-lg mb-8">
                Get the latest updates on new products, exclusive offers, and upcoming sales
              </p>
              <form className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-4 py-3 rounded-lg text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                />
                <button className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors">
                  Subscribe
                </button>
              </form>
              <p className="text-gray-400 text-xs mt-4">
                By subscribing, you agree to our Privacy Policy
              </p>
            </motion.div>
          </div>
        </div>
      </section>
    </>
  );
};

export default Home;