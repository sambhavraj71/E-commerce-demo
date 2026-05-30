import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiGift, FiClock, FiTruck, FiShield, FiArrowRight } from 'react-icons/fi';

const OffersBanner = () => {
  const offers = [
    {
      title: "Summer Sale",
      discount: "50% OFF",
      description: "On selected items",
      bgColor: "bg-gradient-to-r from-red-500 to-orange-500",
      icon: <FiGift size={32} />,
      validUntil: "Limited time offer",
    },
    {
      title: "Free Shipping",
      discount: "₹999+",
      description: "Free delivery on orders above",
      bgColor: "bg-gradient-to-r from-green-500 to-teal-500",
      icon: <FiTruck size={32} />,
      validUntil: "PAN India",
    },
    {
      title: "New Customer",
      discount: "15% OFF",
      description: "On first purchase",
      bgColor: "bg-gradient-to-r from-purple-500 to-pink-500",
      icon: <FiShield size={32} />,
      validUntil: "Use code: WELCOME15",
    },
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container-custom">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {offers.map((offer, index) => (
            <motion.div
              key={index}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              whileHover={{ scale: 1.05 }}
              className={`${offer.bgColor} rounded-2xl p-6 text-white shadow-lg cursor-pointer`}
            >
              <div className="flex items-start justify-between mb-4">
                <div className="text-white/80">{offer.icon}</div>
                <div className="text-right">
                  <div className="text-3xl font-bold">{offer.discount}</div>
                  <div className="text-sm opacity-90">{offer.validUntil}</div>
                </div>
              </div>
              <h3 className="text-xl font-bold mb-2">{offer.title}</h3>
              <p className="text-white/90 mb-4">{offer.description}</p>
              <div className="flex items-center space-x-2 text-sm">
                <FiClock size={14} />
                <span>Hurry up! Offer ending soon</span>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Mid-season Banner */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="mt-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-gray-900 to-gray-800 text-white p-8 md:p-12"
        >
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full transform translate-x-32 -translate-y-32"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-white/5 rounded-full transform -translate-x-48 translate-y-48"></div>
          
          <div className="relative z-10 flex flex-col md:flex-row justify-between items-center">
            <div className="text-center md:text-left mb-6 md:mb-0">
              <div className="text-3xl md:text-4xl font-bold mb-2">
                Mid-Season Clearance Sale
              </div>
              <p className="text-gray-300 text-lg">
                Up to 70% off on select categories
              </p>
              <div className="flex items-center justify-center md:justify-start space-x-2 mt-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-center">
                  <div className="text-2xl font-bold">24</div>
                  <div className="text-xs">Hours</div>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-center">
                  <div className="text-2xl font-bold">59</div>
                  <div className="text-xs">Mins</div>
                </div>
                <div className="text-2xl font-bold">:</div>
                <div className="bg-white/20 backdrop-blur-sm rounded-lg px-3 py-1 text-center">
                  <div className="text-2xl font-bold">59</div>
                  <div className="text-xs">Secs</div>
                </div>
              </div>
            </div>
            <Link to="/shop?on-sale=true">
              <button className="bg-white text-black px-8 py-3 rounded-full font-semibold hover:bg-gray-100 transition-colors flex items-center space-x-2">
                <span>Shop Now</span>
                <FiArrowRight size={18} />
              </button>
            </Link>
          </div>
        </motion.div>

        {/* Brand Logos */}
        <div className="mt-12">
          <h3 className="text-center text-gray-500 text-sm uppercase tracking-wide mb-6">
            Trusted by leading brands
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center">
            {[1, 2, 3, 4, 5, 6].map((item) => (
              <div key={item} className="grayscale hover:grayscale-0 transition-all duration-300">
                <div className="bg-gray-100 h-12 rounded-lg flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Brand {item}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};

export default OffersBanner;