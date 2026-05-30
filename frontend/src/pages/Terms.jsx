import React from 'react';
import { motion } from 'framer-motion';

const Terms = () => {
  const sections = [
    {
      title: '1. Acceptance of Terms',
      content: 'By accessing and using Textura\'s website and services, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use our services.'
    },
    {
      title: '2. Account Registration',
      content: 'To place orders, you must create an account with accurate information. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.'
    },
    {
      title: '3. Product Information',
      content: 'We strive to display accurate product information, including prices, descriptions, and images. However, we do not warrant that product descriptions or other content are error-free.'
    },
    {
      title: '4. Pricing and Payment',
      content: 'All prices are in Indian Rupees (INR) and include applicable taxes. We reserve the right to change prices without notice. Payment must be made at the time of order placement.'
    },
    {
      title: '5. Shipping and Delivery',
      content: 'Delivery times are estimates and may vary. We are not responsible for delays caused by courier services or customs. Risk of loss passes to you upon delivery.'
    },
    {
      title: '6. Returns and Refunds',
      content: 'Please refer to our Return Policy for detailed information about returns, exchanges, and refunds. Most items can be returned within 30 days of delivery.'
    },
    {
      title: '7. Intellectual Property',
      content: 'All content on this site, including text, graphics, logos, and images, is the property of Textura and protected by copyright laws.'
    },
    {
      title: '8. Limitation of Liability',
      content: 'Textura shall not be liable for any indirect, incidental, or consequential damages arising from your use of our services.'
    },
    {
      title: '9. Governing Law',
      content: 'These terms shall be governed by and construed in accordance with the laws of India. Any disputes shall be subject to the exclusive jurisdiction of courts in Mumbai.'
    },
    {
      title: '10. Changes to Terms',
      content: 'We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting. Your continued use of our services constitutes acceptance of modified terms.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="container-custom">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white rounded-lg shadow-sm p-8"
        >
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Terms & Conditions</h1>
          <p className="text-gray-500 mb-8">Last Updated: January 1, 2026</p>
          
          <div className="prose prose-lg max-w-none">
            {sections.map((section, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className="mb-6"
              >
                <h2 className="text-xl font-semibold mb-3">{section.title}</h2>
                <p className="text-gray-600 leading-relaxed">{section.content}</p>
              </motion.div>
            ))}
            
            <div className="mt-8 pt-6 border-t">
              <p className="text-sm text-gray-500">
                For questions about these Terms, please contact us at legal@textura.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Terms;