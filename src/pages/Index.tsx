import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import LiveHud from '@/components/LiveHud';
import About from '@/components/About';
import Contact from '@/components/Contact';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    if (location.hash && !location.hash.includes('=')) {
      try {
        const element = document.querySelector(location.hash);
        if (element) {
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (e) {
        console.warn('Invalid hash selector:', location.hash);
      }
    }
  }, [location]);

  return (
    <>
      <Hero />
      <ProductGrid />
      <LiveHud />
      <About />
      <Contact />
    </>
  );
};

export default Index;
