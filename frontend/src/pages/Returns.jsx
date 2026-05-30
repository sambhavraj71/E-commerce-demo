import React from 'react';
import { motion } from 'framer-motion';
import { FiPackage, FiClock, FiRefreshCw, FiDollarSign, FiTruck, FiShield } from 'react-icons/fi';

const Returns = () => {
  const returnSteps = [
    {
      icon: <FiPackage size={24} />,
      title: 'Request Return',
      description: 'Log into your account and submit a return request within 30 days of delivery',
    },
    {
      icon: <FiClock size={24} />,
      title: 'Get Approval',
      description: 'Our team will review and approve your return request within 24 hours',
    },
    {
      icon: <FiTruck size={24} />,
      title: 'Ship Back',
      description: 'Pack the item securely and ship it back using our free return label',
    },
    {
      icon: <FiRefreshCw size={24} />,
      title: 'Quality Check',
      description: 'We inspect returned items to ensure they meet our return criteria',
    },
    {
      icon: <FiDollarSign size={24} />,
      title: 'Get Refund',
      description: 'Refund is processed within 5-7 business days after approval',
    },
  ];

  const conditions = [
    'Items must be returned within 30 days of delivery',
    'Products must be unused, unworn, and in original packaging',
    'All tags and labels must be attached',
    'Original invoice must be included',
    'Items on sale are eligible for exchange only',
    'Customized/personalized items cannot be returned',
    'Intimate items (underwear, swimwear) cannot be returned for hygiene reasons',
  ];

  const nonReturnableItems = [
    'Gift cards',
    'Perishable goods',
    'Personal care items (opened)',
    'Downloadable software products',
    'Clearance items (marked "Final Sale")',
    'Customized products',
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-gray-900 to-gray-800 text-white py-20">
        <div className="container-custom text-center">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-4xl md:text-5xl font-bold mb-4"
          >
            Return & Exchange Policy
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-xl text-gray-300 max-w-2xl mx-auto"
          >
            Hassle-free returns within 30 days
          </motion.p>
        </div>
      </section>

      <div className="container-custom py-16">
        {/* Quick Info Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-green-50 border border-green-200 rounded-lg p-6 mb-12"
        >
          <div className="flex items-start space-x-4">
            <FiShield className="text-green-600 text-2xl flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 mb-1">30-Day Easy Returns</h3>
              <p className="text-green-700">
                Not satisfied with your purchase? You can return any item within 30 days of delivery 
                for a full refund or exchange. We'll even provide a free return shipping label!
              </p>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Return Process */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6">How to Return an Item</h2>
            <div className="space-y-6">
              {returnSteps.map((step, index) => (
                <div key={index} className="flex space-x-4">
                  <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center text-black">
                    {step.icon}
                  </div>
                  <div>
                    <div className="flex items-center space-x-2 mb-1">
                      <span className="text-sm text-gray-500">Step {index + 1}</span>
                      <h3 className="font-semibold">{step.title}</h3>
                    </div>
                    <p className="text-gray-600 text-sm">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          {/* Return Conditions */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
          >
            <h2 className="text-2xl font-bold mb-6">Return Conditions</h2>
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="font-semibold mb-3">Items must meet these criteria:</h3>
              <ul className="space-y-2">
                {conditions.map((condition, index) => (
                  <li key={index} className="flex items-start space-x-2 text-sm text-gray-600">
                    <span className="text-green-500">✓</span>
                    <span>{condition}</span>
                  </li>
                ))}
              </ul>
            </div>
          </motion.div>
        </div>

        {/* Non-Returnable Items */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          viewport={{ once: true }}
          className="mt-12 bg-red-50 border border-red-200 rounded-lg p-6"
        >
          <h3 className="text-lg font-semibold text-red-800 mb-3">Non-Returnable Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {nonReturnableItems.map((item, index) => (
              <div key={index} className="flex items-center space-x-2">
                <span className="text-red-500">✗</span>
                <span className="text-sm text-red-700">{item}</span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Refund Info */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          viewport={{ once: true }}
          className="mt-12 bg-white rounded-lg shadow-sm p-6"
        >
          <h3 className="text-xl font-semibold mb-4">Refund Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Refund Timeline</h4>
              <p className="text-sm text-gray-600">
                5-7 business days after we receive and inspect your return
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Refund Method</h4>
              <p className="text-sm text-gray-600">
                Refunded to original payment method or store credit
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-2">Shipping Costs</h4>
              <p className="text-sm text-gray-600">
                Original shipping costs are non-refundable unless item is defective
              </p>
            </div>
          </div>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          viewport={{ once: true }}
          className="mt-12"
        >
          <h2 className="text-2xl font-bold mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-2">How do I initiate a return?</h4>
              <p className="text-gray-600 text-sm">
                Log into your account, go to "My Orders", select the order, and click "Return Item". 
                Follow the instructions to complete your return request.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-2">Do I have to pay for return shipping?</h4>
              <p className="text-gray-600 text-sm">
                We provide free return shipping for most items. A prepaid return label will be emailed 
                to you once your return is approved.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-2">Can I exchange an item?</h4>
              <p className="text-gray-600 text-sm">
                Yes, you can request an exchange for a different size or color. If the requested item 
                is unavailable, we'll process a refund instead.
              </p>
            </div>
            <div className="bg-white rounded-lg shadow-sm p-4">
              <h4 className="font-semibold mb-2">What if I received a defective item?</h4>
              <p className="text-gray-600 text-sm">
                We're sorry to hear that! Please contact our customer support immediately with photos 
                of the defect, and we'll arrange a replacement or full refund at no cost to you.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Contact Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          viewport={{ once: true }}
          className="mt-12 text-center p-8 bg-gray-100 rounded-lg"
        >
          <h3 className="text-xl font-semibold mb-2">Need Help?</h3>
          <p className="text-gray-600 mb-4">
            Our customer support team is here to assist you with any return-related questions.
          </p>
          <button className="btn-primary">
            Contact Support
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default Returns;