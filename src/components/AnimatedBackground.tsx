import { useEffect, useRef } from 'react';
import { useTheme } from 'next-themes';

const AnimatedBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', {
      alpha: true,
      willReadFrequently: false,
    });
    if (!ctx) return;

    let animationFrameId: number;
    let particles: Particle[] = [];
    let lastTime = 0;
    const fps = 60;
    const interval = 1000 / fps;
    let isVisible = true;

    // Get theme colors from CSS variables
    const getThemeColors = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const cyan = computedStyle.getPropertyValue('--neon-cyan').trim() || '185 100% 50%';
      const red = computedStyle.getPropertyValue('--neon-red').trim() || '355 100% 55%';
      return { cyan, red };
    };

    let themeColors = getThemeColors();

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
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      themeColors = getThemeColors(); // Update colors on resize (which might happen on theme switch sometimes?? No, explicit theme dep is better)
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      color: string;
      depth: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);

        this.depth = Math.random();
        this.size = 2 + this.depth * 4;

        const baseSpeed = 0.3 + this.depth * 0.6;
        this.speedX = (Math.random() - 0.5) * baseSpeed * 2;
        this.speedY = (Math.random() - 0.5) * baseSpeed * 2;

        // Tăng opacity tối thiếu lên 0.3 (trước là 0.15) để rõ hơn trên nền sáng
        this.opacity = 0.3 + this.depth * 0.5;

        // Use colors from CSS variables
        this.color = Math.random() > 0.5 ? themeColors.cyan : themeColors.red;
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
        // Use modern HSL syntax: hsl(H S L / A) co support space-separated vars
        ctx.fillStyle = `hsl(${this.color} / ${this.opacity})`;
        ctx.fill();
      }
    }

    const init = () => {
      particles = [];
      const isMobile = window.innerWidth < 768;
      // Tăng số lượng hạt lên một chút
      const numberOfParticles = isMobile ? 20 : 60;

      for (let i = 0; i < numberOfParticles; i++) {
        particles.push(new Particle());
      }
    };

    const connectParticles = () => {
      const maxDistance = 100;

      for (let i = 0; i < particles.length; i++) {
        for (let j = i + 1; j < particles.length; j++) {
          const dx = particles[i].x - particles[j].x;
          const dy = particles[i].y - particles[j].y;

          if (Math.abs(dx) > maxDistance || Math.abs(dy) > maxDistance) continue;

          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < maxDistance) {
            ctx.beginPath();
            // Use cyan color for connections, with dynamic alpha
            ctx.strokeStyle = `hsl(${themeColors.cyan} / ${0.15 * (1 - distance / maxDistance)})`;
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

    // Initialize
    themeColors = getThemeColors(); // Ensure fresh colors
    resize();
    init();

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
  }, [theme]); // Re-run when theme changes

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
