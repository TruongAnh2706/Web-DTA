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

    const mouse = {
      x: 0,
      y: 0,
      targetX: 0,
      targetY: 0,
      active: false
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.targetX = e.clientX;
      mouse.targetY = e.clientY;
      mouse.active = true;
    };

    const handleMouseLeave = () => {
      mouse.active = false;
    };

    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);
    const fps = 60;
    const interval = 1000 / fps;
    let isVisible = true;

    const getThemeColors = () => {
      const computedStyle = getComputedStyle(document.documentElement);
      const cyan = computedStyle.getPropertyValue('--neon-cyan').trim() || '185 100% 50%';
      const red = computedStyle.getPropertyValue('--neon-red').trim() || '355 100% 55%';
      return { cyan, red };
    };

    let themeColors = getThemeColors();

    // Lắng nghe thay đổi theme (thông qua MutationObserver trên thẻ html class) 
    // hoặc đơn giản là lấy lại màu mỗi khung hình hoặc interval. Vì lấy mỗi frame tốn kém, 
    // ta sẽ update themeColors mỗi khi resize hoặc 2 giây 1 lần
    setInterval(() => {
        themeColors = getThemeColors();
    }, 2000);

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
      themeColors = getThemeColors(); 
    };

    class Particle {
      x: number;
      y: number;
      size: number;
      speedX: number;
      speedY: number;
      opacity: number;
      isCyan: boolean;
      depth: number;

      constructor() {
        this.x = Math.random() * (canvas?.width || window.innerWidth);
        this.y = Math.random() * (canvas?.height || window.innerHeight);

        this.depth = Math.random();
        this.size = 2 + this.depth * 4;

        const baseSpeed = 0.3 + this.depth * 0.6;
        this.speedX = (Math.random() - 0.5) * baseSpeed * 2;
        this.speedY = (Math.random() - 0.5) * baseSpeed * 2;

        // Tăng opacity tối thiếu lên 0.65 để các hạt sáng rực rỡ
        this.opacity = 0.65 + this.depth * 0.35;
        this.isCyan = Math.random() > 0.5;
      }

      update() {
        // Hút hạt nhẹ về phía con trỏ chuột
        if (mouse.active) {
          const dx = mouse.x - this.x;
          const dy = mouse.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          const influenceRadius = 180;
          if (dist < influenceRadius) {
            const force = (1 - dist / influenceRadius) * 0.8; // Lực hút nhẹ nhàng vừa phải
            const angle = Math.atan2(dy, dx);
            this.x += Math.cos(angle) * force;
            this.y += Math.sin(angle) * force;
          }
        }

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
        
        const currentColor = this.isCyan ? themeColors.cyan : themeColors.red;
        ctx.fillStyle = `hsl(${currentColor} / ${this.opacity})`;
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
            // Use cyan color for connections (tăng lên 0.6 và dày 1.2px)
            ctx.strokeStyle = `hsl(${themeColors.cyan} / ${0.6 * (1 - distance / maxDistance)})`;
            ctx.lineWidth = 1.2;
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

      // Lerp tọa độ chuột để di chuyển mượt mà
      if (mouse.active) {
        mouse.x += (mouse.targetX - mouse.x) * 0.08;
        mouse.y += (mouse.targetY - mouse.y) * 0.08;

        // Vẽ thêm quầng sáng mờ lan tỏa bám theo con trỏ chuột trên background (sáng 15%, bán kính 160px)
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 160);
        gradient.addColorStop(0, `hsl(${themeColors.cyan} / 0.15)`);
        gradient.addColorStop(1, `hsl(${themeColors.cyan} / 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 140, 0, Math.PI * 2);
        ctx.fill();
      }

      particles.forEach(particle => {
        particle.update();
        particle.draw();
      });

      connectParticles();

      // Kết nối con trỏ chuột với các hạt gần đó
      if (mouse.active) {
        const maxMouseDist = 160;
        for (let i = 0; i < particles.length; i++) {
          const dx = particles[i].x - mouse.x;
          const dy = particles[i].y - mouse.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance < maxMouseDist) {
            ctx.beginPath();
            ctx.strokeStyle = `hsl(${themeColors.cyan} / ${0.75 * (1 - distance / maxMouseDist)})`;
            ctx.lineWidth = 1.5;
            ctx.moveTo(mouse.x, mouse.y);
            ctx.lineTo(particles[i].x, particles[i].y);
            ctx.stroke();
          }
        }
      }
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
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
      if (containerRef.current) {
        observer.unobserve(containerRef.current);
      }
      observer.disconnect();
    };
  }, []); // Remove theme dependency to prevent reset on theme change

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
