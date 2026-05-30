import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { FiMail, FiSend, FiBell, FiGift } from 'react-icons/fi';
import toast from 'react-hot-toast';

const Newsletter = () => {
  const [email, setEmail] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call
    setTimeout(() => {
      toast.success('Successfully subscribed to newsletter!');
      setEmail('');
      setIsSubmitting(false);
    }, 1000);
  };

  const benefits = [
    {
      icon: <FiBell className="text-yellow-400" size={20} />,
      text: "Exclusive offers & deals",
    },
    {
      icon: <FiGift className="text-yellow-400" size={20} />,
      text: "Birthday surprises",
    },
    {
      icon: <FiMail className="text-yellow-400" size={20} />,
      text: "Early access to sales",
    },
  ];

  return (
    <section className="py-20 bg-gradient-to-r from-gray-900 to-black text-white relative overflow-hidden">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-64 h-64 bg-white rounded-full filter blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-white rounded-full filter blur-3xl"></div>
      </div>

      <div className="container-custom relative z-10">
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

            {/* Benefits */}
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              {benefits.map((benefit, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ delay: index * 0.1 }}
                  className="flex items-center space-x-2 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2"
                >
                  {benefit.icon}
                  <span className="text-sm">{benefit.text}</span>
                </motion.div>
              ))}
            </div>

            {/* Subscription Form */}
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <div className="flex-1 relative">
                <FiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="w-full pl-12 pr-4 py-3 rounded-lg bg-white text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-white"
                  disabled={isSubmitting}
                />
              </div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="bg-white text-black px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors disabled:opacity-50 flex items-center justify-center space-x-2"
              >
                <span>{isSubmitting ? 'Subscribing...' : 'Subscribe'}</span>
                <FiSend size={18} />
              </button>
            </form>

            <p className="text-gray-400 text-xs mt-4">
              By subscribing, you agree to our Privacy Policy and consent to receive updates from our company.
            </p>

            {/* Social Proof */}
            <div className="mt-8 flex items-center justify-center space-x-4 text-sm text-gray-400">
              <span>Join 10,000+ subscribers</span>
              <span className="w-1 h-1 bg-gray-600 rounded-full"></span>
              <span>No spam, unsubscribe anytime</span>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Newsletter;