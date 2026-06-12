import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Activity, ShieldCheck, Database, HardDrive, Cpu } from 'lucide-react';
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from 'recharts';

// Dữ liệu mô phỏng hoạt động render video và database queries của DTA Studio
const liveData = [
  { time: '08:00', render: 12, queries: 140 },
  { time: '10:00', render: 28, queries: 320 },
  { time: '12:00', render: 45, queries: 410 },
  { time: '14:00', render: 34, queries: 290 },
  { time: '16:00', render: 56, queries: 580 },
  { time: '18:00', render: 62, queries: 640 },
  { time: '20:00', render: 85, queries: 890 },
  { time: '22:00', render: 48, queries: 450 },
];

export const LiveHud = () => {
  const [serverStatus, setServerStatus] = useState<'online' | 'busy'>('online');
  const [pulseCount, setPulseCount] = useState(124590);
  const [cpuUsage, setCpuUsage] = useState(24);

  // Giả lập dữ liệu động nhảy số liên tục theo thời gian thực
  useEffect(() => {
    const interval = setInterval(() => {
      setPulseCount(prev => prev + Math.floor(Math.random() * 3) + 1);
      setCpuUsage(Math.floor(Math.random() * 25) + 15); // 15% - 40%
      
      // Ngẫu nhiên thay đổi trạng thái server
      if (Math.random() > 0.85) {
        setServerStatus(prev => prev === 'online' ? 'busy' : 'online');
      }
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section id="hud" className="py-20 px-4 relative z-10 bg-[hsl(var(--background))]/30">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="mb-12"
        >
          <div className="flex items-center gap-3 justify-center md:justify-start">
            <div className="w-10 h-10 rounded-xl bg-[hsl(var(--neon-cyan))]/10 border border-[hsl(var(--neon-cyan))]/20 flex items-center justify-center">
              <Activity className="w-5 h-5 text-[hsl(var(--neon-cyan))] animate-pulse" />
            </div>
            <div>
              <h2 className="text-3xl font-black text-white uppercase tracking-wider text-center md:text-left">
                DTA Live HUD
              </h2>
              <p className="text-xs text-muted-foreground uppercase tracking-widest text-center md:text-left">
                Real-time System Control Center
              </p>
            </div>
          </div>
        </motion.div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Cột trái: Server status widgets (4 columns) */}
          <div className="lg:col-span-4 flex flex-col gap-6">
            
            {/* Widget 1: Hanoi Server Connect */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="cyber-glass p-6 rounded-2xl relative overflow-hidden border border-white/5"
            >
              <div className="flex justify-between items-start">
                <div className="flex gap-3">
                  <div className="w-12 h-12 rounded-xl bg-green-500/10 border border-green-500/20 flex items-center justify-center">
                    <Cpu className="w-6 h-6 text-green-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-white text-base">Hanoi Task Server</h4>
                    <p className="text-xs text-gray-400">Banana Pi M2 Ultra</p>
                  </div>
                </div>
                
                {/* Đèn nháy Pulse xanh lá */}
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20">
                  <span className={`w-2.5 h-2.5 rounded-full ${serverStatus === 'online' ? 'bg-green-500 animate-ping' : 'bg-amber-500 animate-pulse'}`} />
                  <span className="text-[10px] font-black uppercase text-green-400 tracking-wider">
                    {serverStatus === 'online' ? 'ONLINE' : 'BUSY'}
                  </span>
                </div>
              </div>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">CPU Load</span>
                  <span className="text-lg font-black text-white font-mono">{cpuUsage}%</span>
                </div>
                <div className="bg-white/5 p-3 rounded-lg border border-white/5">
                  <span className="text-[10px] text-gray-400 uppercase tracking-wider block">Temp</span>
                  <span className="text-lg font-black text-white font-mono">42°C</span>
                </div>
              </div>
            </motion.div>

            {/* Widget 2: Telemetry Data */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.15 }}
              className="cyber-glass p-6 rounded-2xl relative overflow-hidden border border-white/5"
            >
              <div className="flex gap-3">
                <div className="w-12 h-12 rounded-xl bg-[hsl(var(--neon-cyan))]/10 border border-[hsl(var(--neon-cyan))]/20 flex items-center justify-center">
                  <Database className="w-6 h-6 text-[hsl(var(--neon-cyan))]" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-base">Supabase Database</h4>
                  <p className="text-xs text-gray-400">Active Keep-Alive</p>
                </div>
              </div>

              <div className="mt-6">
                <div className="flex justify-between items-baseline mb-2">
                  <span className="text-xs text-gray-400">Total API Logs</span>
                  <span className="text-xl font-black text-[hsl(var(--neon-cyan))] font-mono">
                    {pulseCount.toLocaleString('vi-VN')}
                  </span>
                </div>
                <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                  <motion.div 
                    animate={{ width: `${(pulseCount % 100)}%` }}
                    transition={{ duration: 1 }}
                    className="bg-gradient-to-r from-[hsl(var(--neon-cyan))] to-[hsl(var(--neon-blue))] h-full"
                  />
                </div>
              </div>
            </motion.div>

            {/* Widget 3: Security Status */}
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="cyber-glass p-6 rounded-2xl border border-white/5 flex items-center justify-between"
            >
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-[hsl(var(--neon-red))]" />
                <div>
                  <h5 className="text-sm font-bold text-white">Security Guard</h5>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest">SSL & Firewall Active</p>
                </div>
              </div>
              <span className="text-xs font-mono text-[hsl(var(--neon-red))] font-black tracking-wider">
                SECURE
              </span>
            </motion.div>
          </div>

          {/* Cột phải: Line Chart (8 columns) */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            className="lg:col-span-8 cyber-glass p-6 rounded-2xl border border-white/5 flex flex-col justify-between"
          >
            <div className="flex justify-between items-center mb-6">
              <div>
                <h4 className="font-bold text-white text-base">Ecosystem Render & Queries</h4>
                <p className="text-xs text-gray-400">Tần suất xử lý hệ thống trong 24 giờ</p>
              </div>
              
              <div className="flex gap-4 text-xs font-bold uppercase tracking-wider">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--neon-cyan))]" />
                  <span className="text-gray-300">Render (Lần)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-[hsl(var(--neon-red))]" />
                  <span className="text-gray-300">Queries (x10)</span>
                </div>
              </div>
            </div>

            {/* Biểu đồ Recharts */}
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={liveData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                  <XAxis 
                    dataKey="time" 
                    stroke="rgba(255,255,255,0.3)" 
                    style={{ fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <YAxis 
                    stroke="rgba(255,255,255,0.3)" 
                    style={{ fontSize: 10, fontFamily: 'monospace' }} 
                  />
                  <Tooltip 
                    contentStyle={{ 
                      backgroundColor: 'rgba(5, 7, 11, 0.95)', 
                      borderColor: 'rgba(0, 240, 255, 0.2)',
                      borderRadius: '12px',
                      color: '#fff',
                      fontFamily: 'sans-serif'
                    }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="render" 
                    stroke="rgb(0, 240, 255)" 
                    strokeWidth={3} 
                    dot={{ fill: 'rgb(0, 240, 255)', strokeWidth: 2 }} 
                    activeDot={{ r: 6 }} 
                  />
                  <Line 
                    type="monotone" 
                    dataKey="queries" 
                    stroke="rgb(255, 0, 85)" 
                    strokeWidth={2} 
                    strokeDasharray="3 3"
                    dot={{ fill: 'rgb(255, 0, 85)', r: 3 }} 
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[10px] text-gray-500 uppercase tracking-widest font-bold">
              <span>Data source: Supabase Keep-Alive</span>
              <span>Updated: 3s ago</span>
            </div>
          </motion.div>

        </div>
      </div>
    </section>
  );
};

export default LiveHud;
