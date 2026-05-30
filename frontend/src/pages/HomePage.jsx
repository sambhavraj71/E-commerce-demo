import React from 'react';
import HeroBanner from '../components/home/HeroBanner';
import CategoryGrid from '../components/home/CategoryGrid';
import FeaturedProducts from '../components/home/FeaturedProducts';
import TrendingProducts from '../components/home/TrendingProducts';
import OffersBanner from '../components/home/OffersBanner';
import Newsletter from '../components/home/Newsletter';

const HomePage = () => {
  return (
    <>
      <HeroBanner />
      <CategoryGrid />
      <FeaturedProducts />
      <OffersBanner />
      <TrendingProducts />
      <Newsletter />
    </>
  );
};

export default HomePage;