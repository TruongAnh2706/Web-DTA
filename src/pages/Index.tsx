import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import AnimatedBackground from '@/components/AnimatedBackground';
import Header from '@/components/Header';
import Hero from '@/components/Hero';
import ProductGrid from '@/components/ProductGrid';
import About from '@/components/About';
import Contact from '@/components/Contact';
import Footer from '@/components/Footer';

const Index = () => {
  const location = useLocation();

  useEffect(() => {
    // Check if there's a hash in the URL
    // Check if there's a hash in the URL and it's a valid ID selector
    if (location.hash && !location.hash.includes('=')) {
      try {
        const element = document.querySelector(location.hash);
        if (element) {
          // Add a small delay to ensure content is loaded/rendered
          setTimeout(() => {
            element.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }
      } catch (e) {
        // Ignore invalid selectors
        console.warn('Invalid hash selector:', location.hash);
      }
    }
  }, [location]);

  return (
    <div className="relative min-h-screen overflow-x-hidden">
      <AnimatedBackground />
      <Header />
      <main>
        <Hero />
        <section id="apps">
          <ProductGrid />
        </section>
        <About />
        <Contact />
      </main>
      <Footer />
    </div>
  );
};

export default Index;
