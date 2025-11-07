import React from 'react';
import Hero from '@/components/Hero';
import Features from '@/components/Features';
import HowItWorks from '@/components/HowItWorks';
import UseCases from '@/components/UseCases';
import Testimonials from '@/components/Testimonials';
import Pricing from '@/components/Pricing';
import CTA from '@/components/CTA';

const Home = () => {
  return (
    <>

      <Hero />
      <Features />
      <HowItWorks />
      <UseCases />
      <Testimonials />
      <Pricing />
      <CTA />

    </>
  );
};

export default Home;