import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  alpha: number;
  color: string;
}

// Biến toàn cục lưu trữ tọa độ chuột để không bao giờ bị reset khi component unmount/mount
let globalMousePos = { x: -100, y: -100 };

export const CustomCursor = () => {
  const cursorDotRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  const [isHovered, setIsHovered] = useState(false);
  const [isClicking, setIsClicking] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Mảng lưu các hạt trail (chỉ hạt ngôi sao lấp lánh)
  const particles = useRef<Particle[]>([]);

  useEffect(() => {
    const isDesktop = window.matchMedia('(pointer: fine)').matches;
    if (!isDesktop) return;

    setIsVisible(true);

    // Xử lý Canvas resize để phủ kín màn hình
    const updateCanvasSize = () => {
      if (canvasRef.current) {
        canvasRef.current.width = window.innerWidth;
        canvasRef.current.height = window.innerHeight;
      }
    };
    window.addEventListener('resize', updateCanvasSize);
    // Gọi thiết lập kích thước ban đầu
    setTimeout(updateCanvasSize, 100);

    // Gán vị trí ban đầu cho ngôi sao nếu đã có tọa độ chuột trước đó
    if (cursorDotRef.current && globalMousePos.x !== -100) {
      cursorDotRef.current.style.transform = `translate3d(${globalMousePos.x}px, ${globalMousePos.y}px, 0) translate(-50%, -50%)`;
    }

    const onMouseMove = (e: MouseEvent) => {
      globalMousePos.x = e.clientX;
      globalMousePos.y = e.clientY;

      // Cập nhật vị trí ngôi sao chính REALTIME lập tức trong sự kiện mousemove để giảm độ trễ tối đa
      if (cursorDotRef.current) {
        cursorDotRef.current.style.transform = `translate3d(${e.clientX}px, ${e.clientY}px, 0) translate(-50%, -50%)`;
      }

      // Tạo hạt ngôi sao lấp lánh (sparkle trail) khi di chuyển chuột
      const particleCount = Math.random() > 0.45 ? 2 : 1; 
      for (let i = 0; i < particleCount; i++) {
        const colors = [
          'rgba(0, 240, 255, 0.95)', // Neon Cyan
          'rgba(255, 0, 85, 0.95)',  // Neon Red
          'rgba(0, 150, 255, 0.95)'  // Neon Blue
        ];
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        
        particles.current.push({
          x: e.clientX,
          y: e.clientY,
          vx: (Math.random() - 0.5) * 1.8,
          vy: (Math.random() - 0.5) * 1.8 - 0.3, // trôi lên nhẹ
          size: Math.random() * 5 + 3, // Kích thước hạt 3px - 8px
          alpha: 1.0,
          color: randomColor
        });
      }

      // Giới hạn số lượng hạt tối đa để đảm bảo hiệu năng
      if (particles.current.length > 50) {
        particles.current.shift();
      }
    };

    const onMouseDown = () => setIsClicking(true);
    const onMouseUp = () => setIsClicking(false);

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mousedown', onMouseDown);
    window.addEventListener('mouseup', onMouseUp);

    const handleMouseOver = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target) return;

      if (
        target.tagName === 'A' ||
        target.tagName === 'BUTTON' ||
        target.closest('a') ||
        target.closest('button') ||
        target.closest('.glass-card') ||
        target.closest('.cyber-glass') ||
        target.closest('[role="button"]')
      ) {
        setIsHovered(true);
      } else {
        setIsHovered(false);
      }
    };

    window.addEventListener('mouseover', handleMouseOver);

    // Hàm vẽ ngôi sao 5 cánh bằng Canvas
    const drawStar = (
      ctx: CanvasRenderingContext2D,
      cx: number,
      cy: number,
      spikes: number,
      outerRadius: number,
      innerRadius: number,
      color: string
    ) => {
      let rot = (Math.PI / 2) * 3;
      let x = cx;
      let y = cy;
      const step = Math.PI / spikes;

      ctx.beginPath();
      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        x = cx + Math.cos(rot) * outerRadius;
        y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
    };

    let animationFrameId: number;
    
    // Vòng lặp cập nhật liên tục 60fps
    const updateCursor = () => {
      // Đảm bảo ngôi sao chính luôn nằm đúng vị trí chuột kể cả khi đứng yên (không bị reset do React re-render)
      if (cursorDotRef.current && globalMousePos.x !== -100) {
        cursorDotRef.current.style.transform = `translate3d(${globalMousePos.x}px, ${globalMousePos.y}px, 0) translate(-50%, -50%)`;
      }

      // Cập nhật và vẽ hạt trail trên Canvas
      const canvas = canvasRef.current;
      if (canvas) {
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          
          // Vẽ và cập nhật từng hạt ngôi sao
          for (let i = particles.current.length - 1; i >= 0; i--) {
            const p = particles.current[i];
            p.x += p.vx;
            p.y += p.vy;
            p.alpha -= 0.035; 

            if (p.alpha <= 0) {
              particles.current.splice(i, 1);
              continue;
            }

            ctx.save();
            ctx.globalAlpha = p.alpha;
            
            // Tạo hiệu ứng phát sáng cho ngôi sao
            ctx.shadowBlur = p.size * 1.6;
            ctx.shadowColor = p.color;

            // Vẽ ngôi sao
            drawStar(ctx, p.x, p.y, 5, p.size, p.size / 2.2, p.color);
            
            ctx.restore();
          }
        }
      }

      animationFrameId = requestAnimationFrame(updateCursor);
    };

    animationFrameId = requestAnimationFrame(updateCursor);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mousedown', onMouseDown);
      window.removeEventListener('mouseup', onMouseUp);
      window.removeEventListener('mouseover', handleMouseOver);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  if (!isVisible) return null;

  return createPortal(
    <>
      {/* Canvas vẽ các hạt ngôi sao lấp lánh (sparkle trail) đằng sau chuột */}
      <canvas
        ref={canvasRef}
        className="fixed inset-0 pointer-events-none z-[99998]"
        style={{ mixBlendMode: 'screen' }}
      />
      
      {/* Tâm con trỏ: Một ngôi sao 5 cánh phát sáng neon, xoay chậm và nổi bật. 
          Sử dụng class chuẩn w-6 h-6 để hiển thị hoàn hảo và ổn định */}
      <div
        ref={cursorDotRef}
        className="fixed top-0 left-0 pointer-events-none z-[100000] w-6 h-6 flex items-center justify-center"
        style={{
          willChange: 'transform',
        }}
      >
        <svg
          className="w-full h-full text-primary transition-all duration-300"
          style={{
            animation: 'spin 8s linear infinite',
            transform: isClicking ? 'scale(0.85)' : isHovered ? 'scale(1.4)' : 'scale(1)',
            color: isClicking ? 'hsl(var(--neon-red))' : isHovered ? 'hsl(var(--neon-cyan))' : 'hsl(var(--neon-cyan))',
            filter: isClicking 
              ? 'drop-shadow(0 0 8px rgba(255, 0, 85, 1)) drop-shadow(0 0 16px rgba(255, 0, 85, 0.6))'
              : 'drop-shadow(0 0 8px rgba(0, 240, 255, 1)) drop-shadow(0 0 16px rgba(0, 240, 255, 0.6))'
          }}
          viewBox="0 0 24 24"
          fill="currentColor"
        >
          <path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z" />
        </svg>
      </div>
    </>,
    document.body
  );
};

export default CustomCursor;
