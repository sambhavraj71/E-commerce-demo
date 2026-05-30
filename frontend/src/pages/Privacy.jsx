import React from 'react';
import { motion } from 'framer-motion';

const Privacy = () => {
  const sections = [
    {
      title: 'Information We Collect',
      content: 'We collect information you provide directly to us, such as when you create an account, place an order, or contact us. This may include your name, email address, phone number, shipping address, and payment information.'
    },
    {
      title: 'How We Use Your Information',
      content: 'We use your information to process orders, communicate with you, improve our services, personalize your experience, and prevent fraud. We may also use your information to send you promotional offers (you can opt-out anytime).'
    },
    {
      title: 'Information Sharing',
      content: 'We do not sell your personal information. We may share your information with service providers who assist us in operating our website, processing payments, and delivering orders. We require these parties to maintain the confidentiality of your information.'
    },
    {
      title: 'Cookies and Tracking',
      content: 'We use cookies and similar tracking technologies to enhance your browsing experience, analyze site traffic, and personalize content. You can control cookie settings through your browser preferences.'
    },
    {
      title: 'Data Security',
      content: 'We implement industry-standard security measures to protect your information, including encryption, secure servers, and regular security audits. However, no method of transmission over the internet is 100% secure.'
    },
    {
      title: 'Your Rights',
      content: 'You have the right to access, correct, or delete your personal information. You may also request a copy of your data or ask us to stop processing your information. Contact us to exercise these rights.'
    },
    {
      title: 'Third-Party Links',
      content: 'Our website may contain links to third-party websites. We are not responsible for the privacy practices of these sites. We encourage you to read their privacy policies.'
    },
    {
      title: 'Children\'s Privacy',
      content: 'Our services are not directed to children under 13. We do not knowingly collect personal information from children. If you believe a child has provided us with information, please contact us.'
    },
    {
      title: 'Changes to This Policy',
      content: 'We may update this Privacy Policy from time to time. Changes will be posted on this page with an updated revision date. Your continued use of our services constitutes acceptance of the updated policy.'
    },
    {
      title: 'Contact Us',
      content: 'If you have questions about this Privacy Policy, please contact us at privacy@textura.com or call us at +91 ***** *****.'
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
          <h1 className="text-3xl md:text-4xl font-bold mb-4">Privacy Policy</h1>
          <p className="text-gray-500 mb-8">Last Updated: January 1, 2026</p>
          
          <div className="prose prose-lg max-w-none">
            <div className="mb-6 p-4 bg-blue-50 rounded-lg">
              <p className="text-blue-800">
                <strong>Summary:</strong> We respect your privacy and are committed to protecting your personal information. 
                This policy explains how we collect, use, and safeguard your data.
              </p>
            </div>
            
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
              <h3 className="font-semibold mb-2">Your Consent</h3>
              <p className="text-sm text-gray-500 mb-4">
                By using our website, you consent to our Privacy Policy and agree to its terms.
              </p>
              <p className="text-sm text-gray-500">
                For privacy-related concerns, email: privacy@textura.com
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Privacy;