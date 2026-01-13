import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true }); // Optimized context
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastTime = 0;
    const fps = 30; // Limit to 30 FPS for performance
    const interval = 1000 / fps;
    let isVisible = true;

    // Use Intersection Observer to pause animation when off-screen
    const observer = new IntersectionObserver(
      ([entry]) => {
        isVisible = entry.isIntersecting;
      },
      { threshold: 0 }
    );

    if (containerRef.current) {
      observer.observe(containerRef.current);
    }

    const resize = () => {
      // Debounce resize could be added here, but simple assignment is okay for now
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);
        this.size = Math.random() * 4 + 2; // Increased size: 2-6px (was 0.5-2.5px) // Increased size: 2-6px (was 1-3px)
        this.speedX = (Math.random() - 0.5) * 0.2; // Slower speed
        this.speedY = (Math.random() - 0.5) * 0.2;
        this.opacity = Math.random() * 0.5 + 0.1;
        this.color = Math.random() > 0.5 ? '185, 100%, 55%' : '355, 100%, 60%';
      }

      update() {
        this.x += this.speedX;
        this.y += this.speedY;

        if (canvas) {
          if (this.x > canvas.width) this.x = 0;
          if (this.x < 0) this.x = canvas.width;
          if (this.y > canvas.height) this.y = 0;
          if (this.y < 0) this.y = canvas.height;
        }
      }

      draw() {
        if (!ctx) return;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fillStyle = `hsla(${this.color}, ${this.opacity})`;
        ctx.fill();
        // Removed shadowBlur for performance
      }
    }

    const init = () => {
      particles = [];
      const isMobile = window.innerWidth < 768;
      // Reduced particle count significantly
      // Mobile: 15, Desktop: 50
      const numberOfParticles = isMobile ? 15 : 50;

      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const connectParticles = () => {
      // Optimized connection logic: only check close particles? 
      // For now, just reducing the distance and count helps enough.
      const maxDistance = 100;

      for (let i = 0; i < particles.length; i++) {
        // Limit connections to avoid O(N^2) load on high count
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;

          // Quick check before sqrt
          if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) continue;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            ctx.strokeStyle = `hsla(185, 100%, 55%, ${0.1 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = 0.5;
            ctx.moveTo(particles[i].x, particles[i].y);
            ctx.lineTo(particles[j].x, particles[j].y);
            ctx.stroke();
          }
        }
      }
    };

    const animate = (timestamp: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Animation loop throttling
      const deltaTime = timestamp - lastTime;
      if (deltaTime < interval || !isVisible) return;

      lastTime = timestamp - (deltaTime % interval);

      ctx.clearRect(0, 0, canvas.width, canvas.height);

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();
    };

    resize();
    init();

    // Start animation loop
    animationFrameId = requestAnimationFrame(animate);

    window.addEventListener('resize', () => {
      resize();
      init();
    });

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
    };
  }, []);

  return (
    <div ref={containerRef} className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
      {/* Deep dark base */}
      <div className="absolute inset-0 bg-background" />

      {/* Static gradients instead of motion.div for better performance on weak devices */}
      <div className="absolute inset-0 opacity-30">
        <div
          className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, hsla(185, 100%, 55%, 0.2) 0%, transparent 70%)' }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full blur-[100px]"
          style={{ background: 'radial-gradient(circle, hsla(355, 100%, 60%, 0.15) 0%, transparent 70%)' }}
        />
      </div>

      {/* Particle canvas */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 opacity-60"
      />

      {/* Vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, transparent 0%, hsl(var(--background)) 90%)',
        }}
      />

      {/* Scan lines - Static CSS */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(0deg, transparent, transparent 2px, rgba(0, 0, 0, 0.3) 2px, rgba(0, 0, 0, 0.3) 4px)',
        }}
      />
    </div>
  );
};

export default AnimatedBackground;
