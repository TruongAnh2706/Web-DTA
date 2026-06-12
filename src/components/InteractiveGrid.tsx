import { useEffect, useRef } from 'react';

export const InteractiveGrid = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0, targetX: 0, targetY: 0, active: false });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouseRef.current.targetX = e.clientX;
      mouseRef.current.targetY = e.clientY;
      mouseRef.current.active = true;
    };

    const handleMouseLeave = () => {
      mouseRef.current.active = false;
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseleave', handleMouseLeave);

    // Điểm lưới cách nhau 55px
    const gridSpacing = 55;

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      // Lerp mouse coordinates
      const mouse = mouseRef.current;
      mouse.x += (mouse.targetX - mouse.x) * 0.08;
      mouse.y += (mouse.targetY - mouse.y) * 0.08;

      // 1. Vẽ quầng sáng Radial Glow dịu mắt bám theo con trỏ chuột
      if (mouse.active) {
        const gradient = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 180);
        gradient.addColorStop(0, 'rgba(0, 240, 255, 0.06)'); // Sáng nhẹ ở tâm
        gradient.addColorStop(1, 'rgba(0, 240, 255, 0)');
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 180, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.strokeStyle = 'rgba(0, 240, 255, 0.045)'; // Tăng độ sáng đường lưới từ 0.025 lên 0.045
      ctx.lineWidth = 0.9; // Tăng độ dày nét vẽ lưới để hiển thị rõ ràng hơn

      const cols = Math.ceil(width / gridSpacing) + 2;
      const rows = Math.ceil(height / gridSpacing) + 2;

      // Điểm mốc gốc
      const startX = -(width % gridSpacing) / 2;
      const startY = -(height % gridSpacing) / 2;

      const getDistortedPoint = (gx: number, gy: number) => {
        if (!mouse.active) return { x: gx, y: gy };
        
        const dx = gx - mouse.x;
        const dy = gy - mouse.y;
        const distSq = dx * dx + dy * dy;
        const dist = Math.sqrt(distSq);
        
        // Tăng bán kính ảnh hưởng từ 260px lên 320px
        const radius = 320;
        if (dist < radius) {
          // Tăng lực lún lõm của lưới từ 22px lên 45px để nhìn rõ rệt cấu trúc tương tác
          const force = (1 - dist / radius) * 45;
          const angle = Math.atan2(dy, dx);
          return {
            x: gx - Math.cos(angle) * force,
            y: gy - Math.sin(angle) * force
          };
        }
        return { x: gx, y: gy };
      };

      // Vẽ các đường dọc
      for (let c = 0; c < cols; c++) {
        ctx.beginPath();
        const gx = startX + c * gridSpacing;
        for (let r = 0; r < rows; r++) {
          const gy = startY + r * gridSpacing;
          const p = getDistortedPoint(gx, gy);
          if (r === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      // Vẽ các đường ngang
      for (let r = 0; r < rows; r++) {
        ctx.beginPath();
        const gy = startY + r * gridSpacing;
        for (let c = 0; c < cols; c++) {
          const gx = startX + c * gridSpacing;
          const p = getDistortedPoint(gx, gy);
          if (c === 0) {
            ctx.moveTo(p.x, p.y);
          } else {
            ctx.lineTo(p.x, p.y);
          }
        }
        ctx.stroke();
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};

export default InteractiveGrid;
