import { useState, useEffect, useRef, useCallback } from 'react';
import { Volume2, VolumeX, Pause, Play, Settings2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { motion, AnimatePresence } from 'framer-motion';

interface TextToSpeechProps {
  content: string;
}

const TextToSpeech = ({ content }: TextToSpeechProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [progress, setProgress] = useState(0);
  const [rate, setRate] = useState(1);
  const [volume, setVolume] = useState(1);
  const [error, setError] = useState('');
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [selectedVoiceName, setSelectedVoiceName] = useState('');
  const [statusText, setStatusText] = useState('');

  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef(0);
  const totalCharsRef = useRef(0);

  // Chuyển HTML → plain text
  const htmlToPlainText = useCallback((html: string): string => {
    const tmp = document.createElement('div');
    tmp.innerHTML = html;
    tmp.querySelectorAll('script, style, img, hr, svg, br').forEach(el => {
      if (el.tagName === 'BR') {
        el.replaceWith('. ');
      } else {
        el.remove();
      }
    });
    const text = tmp.textContent || tmp.innerText || '';
    return text.replace(/\s+/g, ' ').replace(/\.\s*\./g, '.').trim();
  }, []);

  // Load và sắp xếp giọng đọc - ưu tiên tiếng Việt
  useEffect(() => {
    const loadVoices = () => {
      const allVoices = speechSynthesis.getVoices();
      if (allVoices.length === 0) return;
      
      // Phân loại giọng
      const viVoices = allVoices.filter(v => v.lang.startsWith('vi'));
      const enVoices = allVoices.filter(v => v.lang.startsWith('en'));
      const sorted = [...viVoices, ...enVoices];
      
      setVoices(sorted);
      
      // Tự động chọn giọng Việt tốt nhất
      if (!selectedVoiceName || !sorted.find(v => v.name === selectedVoiceName)) {
        if (viVoices.length > 0) {
          // Ưu tiên giọng Online (chất lượng cao hơn)
          const onlineVi = viVoices.find(v => v.name.toLowerCase().includes('online') || v.name.toLowerCase().includes('google'));
          setSelectedVoiceName(onlineVi ? onlineVi.name : viVoices[0].name);
        } else if (sorted.length > 0) {
          setSelectedVoiceName(sorted[0].name);
        }
      }
    };

    loadVoices();
    speechSynthesis.addEventListener('voiceschanged', loadVoices);
    
    return () => {
      speechSynthesis.removeEventListener('voiceschanged', loadVoices);
      stopSpeech();
    };
  }, []);

  // Ước tính tiến trình đọc
  const startProgressTracking = useCallback((totalLength: number) => {
    if (intervalRef.current) clearInterval(intervalRef.current);
    
    totalCharsRef.current = totalLength;
    startTimeRef.current = Date.now();
    
    // ~2.5 từ/giây ở rate 1x, trung bình 5 ký tự/từ
    const charsPerMs = (2.5 * 5 * rate) / 1000;
    
    intervalRef.current = setInterval(() => {
      const elapsed = Date.now() - startTimeRef.current;
      const estimatedChars = elapsed * charsPerMs;
      const pct = Math.min((estimatedChars / totalLength) * 100, 95);
      setProgress(pct);
    }, 300);
  }, [rate]);

  const stopProgressTracking = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startSpeech = useCallback(() => {
    setError('');

    // Resume nếu đang pause
    if (isPaused) {
      speechSynthesis.resume();
      setIsPaused(false);
      setIsPlaying(true);
      setStatusText('Đang phát...');
      startProgressTracking(totalCharsRef.current);
      return;
    }

    // Dừng nếu đang phát
    speechSynthesis.cancel();
    stopProgressTracking();

    const text = htmlToPlainText(content);
    if (!text || text.length < 5) {
      setError('Không tìm thấy nội dung bài viết để đọc.');
      return;
    }

    if (voices.length === 0) {
      setError('Trình duyệt chưa tải xong giọng đọc. Hãy thử lại sau vài giây.');
      return;
    }

    const utterance = new SpeechSynthesisUtterance(text);
    utteranceRef.current = utterance;

    // Gán giọng đọc
    const voice = voices.find(v => v.name === selectedVoiceName);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    }

    utterance.rate = rate;
    utterance.volume = volume;
    utterance.pitch = 1;

    utterance.onstart = () => {
      setIsPlaying(true);
      setIsPaused(false);
      setStatusText('Đang phát...');
      startProgressTracking(text.length);
    };

    utterance.onend = () => {
      setIsPlaying(false);
      setIsPaused(false);
      setProgress(100);
      setStatusText('Hoàn thành');
      stopProgressTracking();
      setTimeout(() => { setProgress(0); setStatusText(''); }, 3000);
    };

    utterance.onerror = (e) => {
      console.error('TTS Error:', e);
      setIsPlaying(false);
      setIsPaused(false);
      stopProgressTracking();
      if (e.error === 'canceled' || e.error === 'interrupted') return;
      setError(`Lỗi phát: ${e.error || 'Không xác định'}. Thử đổi giọng đọc khác.`);
      setStatusText('');
    };

    utterance.onpause = () => {
      setIsPaused(true);
      setIsPlaying(false);
      stopProgressTracking();
    };

    utterance.onresume = () => {
      setIsPaused(false);
      setIsPlaying(true);
    };

    speechSynthesis.speak(utterance);
  }, [isPaused, content, voices, selectedVoiceName, rate, volume, htmlToPlainText, startProgressTracking]);

  const pauseSpeech = () => {
    speechSynthesis.pause();
    setIsPaused(true);
    setIsPlaying(false);
    setStatusText('Tạm dừng');
    stopProgressTracking();
  };

  const stopSpeech = () => {
    speechSynthesis.cancel();
    setIsPlaying(false);
    setIsPaused(false);
    setProgress(0);
    setStatusText('');
    stopProgressTracking();
  };

  const getVoiceLabel = (voice: SpeechSynthesisVoice) => {
    const lang = voice.lang;
    let flag = '🌐';
    if (lang.startsWith('vi')) flag = '🇻🇳';
    else if (lang.startsWith('en-US')) flag = '🇺🇸';
    else if (lang.startsWith('en-GB')) flag = '🇬🇧';
    else if (lang.startsWith('en-AU')) flag = '🇦🇺';
    else if (lang.startsWith('en')) flag = '🇬🇧';
    else if (lang.startsWith('ja')) flag = '🇯🇵';
    else if (lang.startsWith('ko')) flag = '🇰🇷';
    else if (lang.startsWith('zh')) flag = '🇨🇳';
    else if (lang.startsWith('fr')) flag = '🇫🇷';
    else if (lang.startsWith('de')) flag = '🇩🇪';
    
    const shortName = voice.name
      .replace(/Microsoft /g, '')
      .replace(/Google /g, '')
      .replace(/Apple /g, '')
      .replace(/ Online$/g, ' ⚡');
    
    return `${flag} ${shortName}`;
  };

  // Kiểm tra xem có giọng Việt không
  const hasVietnameseVoice = voices.some(v => v.lang.startsWith('vi'));
  const currentVoice = voices.find(v => v.name === selectedVoiceName);

  if (!('speechSynthesis' in window)) {
    return (
      <div className="glass-card rounded-2xl p-4 border border-destructive/20 text-center">
        <p className="text-sm text-destructive">Trình duyệt không hỗ trợ đọc văn bản.</p>
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl p-4 md:p-5 border border-primary/20 backdrop-blur-xl"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary/20 to-accent/20 flex items-center justify-center">
            <Volume2 className="w-4 h-4 text-primary" />
          </div>
          <div>
            <h4 className="font-bold text-sm tracking-tight">🎙️ Nghe bài viết</h4>
            <p className="text-[11px] text-muted-foreground">
              {statusText || (currentVoice ? `${currentVoice.lang.startsWith('vi') ? '🇻🇳' : '🌐'} ${currentVoice.name.replace(/Microsoft |Google /, '').substring(0, 20)}` : 'Đang tải giọng...')}
            </p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="rounded-xl w-8 h-8 hover:bg-primary/10"
          onClick={() => setShowSettings(!showSettings)}
        >
          <Settings2 className="w-4 h-4" />
        </Button>
      </div>

      {/* Warning: No Vietnamese voice */}
      {voices.length > 0 && !hasVietnameseVoice && (
        <div className="mb-3 p-2.5 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
          <p className="text-[11px] text-yellow-500">
            ⚠️ Không tìm thấy giọng Việt trên thiết bị. Trên Windows: vào Settings → Time & Language → Speech → Add voices → Thêm Vietnamese.
          </p>
        </div>
      )}

      {/* Error message */}
      {error && (
        <div className="mb-3 p-2.5 bg-destructive/10 border border-destructive/20 rounded-xl flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
          <p className="text-xs text-destructive">{error}</p>
        </div>
      )}

      {/* Progress bar */}
      {(isPlaying || isPaused || progress > 0) && (
        <div className="mb-3">
          <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-primary to-accent rounded-full"
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
          <p className="text-[10px] text-muted-foreground mt-1 text-right">{Math.round(progress)}%</p>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center gap-2">
        {!isPlaying && !isPaused ? (
          <Button
            onClick={startSpeech}
            className="flex-1 btn-neon rounded-xl py-5 font-bold text-sm tracking-wide"
            disabled={voices.length === 0}
          >
            <Play className="w-4 h-4 mr-2" />
            {voices.length === 0 ? 'Đang tải...' : 'Phát bài viết'}
          </Button>
        ) : (
          <>
            <Button
              onClick={isPlaying ? pauseSpeech : startSpeech}
              variant="outline"
              className="flex-1 rounded-xl py-5 border-primary/30 hover:bg-primary/10 font-bold text-sm"
            >
              {isPlaying ? (
                <><Pause className="w-4 h-4 mr-2" /> Tạm dừng</>
              ) : (
                <><Play className="w-4 h-4 mr-2" /> Tiếp tục</>
              )}
            </Button>
            <Button
              onClick={stopSpeech}
              variant="ghost"
              size="icon"
              className="rounded-xl w-10 h-10 hover:bg-destructive/10 hover:text-destructive"
              title="Dừng phát"
            >
              <VolumeX className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>

      {/* Volume Control - luôn hiển thị */}
      <div className="mt-3 flex items-center gap-3">
        <VolumeX className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <Slider
          value={[volume]}
          onValueChange={(v) => {
            setVolume(v[0]);
            // Cập nhật volume realtime nếu đang phát
            if (utteranceRef.current) {
              utteranceRef.current.volume = v[0];
            }
          }}
          min={0}
          max={1}
          step={0.1}
          className="flex-1"
        />
        <Volume2 className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
        <span className="text-[10px] text-muted-foreground w-8 text-right">{Math.round(volume * 100)}%</span>
      </div>

      {/* Settings Panel */}
      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <div className="mt-4 pt-4 border-t border-primary/10 space-y-4">
              {/* Voice Selection */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-muted-foreground">Chọn giọng đọc</label>
                <Select value={selectedVoiceName} onValueChange={(v) => { setSelectedVoiceName(v); setError(''); }}>
                  <SelectTrigger className="rounded-xl bg-black/20 border-primary/20 text-sm h-9">
                    <SelectValue placeholder="Chọn giọng..." />
                  </SelectTrigger>
                  <SelectContent className="max-h-[250px]">
                    {voices.filter(v => v.lang.startsWith('vi')).length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-bold text-primary">🇻🇳 Tiếng Việt</div>
                        {voices.filter(v => v.lang.startsWith('vi')).map((voice) => (
                          <SelectItem key={voice.name} value={voice.name} className="text-sm">
                            {getVoiceLabel(voice)}
                          </SelectItem>
                        ))}
                      </>
                    )}
                    {voices.filter(v => v.lang.startsWith('en')).length > 0 && (
                      <>
                        <div className="px-2 py-1.5 text-xs font-bold text-muted-foreground mt-2">🌐 English</div>
                        {voices.filter(v => v.lang.startsWith('en')).map((voice) => (
                          <SelectItem key={voice.name} value={voice.name} className="text-sm">
                            {getVoiceLabel(voice)}
                          </SelectItem>
                        ))}
                      </>
                    )}
                  </SelectContent>
                </Select>
              </div>

              {/* Speed Control */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-muted-foreground">Tốc độ đọc</label>
                  <span className="text-xs font-bold text-primary">{rate}x</span>
                </div>
                <Slider
                  value={[rate]}
                  onValueChange={(v) => setRate(v[0])}
                  min={0.5}
                  max={2}
                  step={0.25}
                  className="py-1"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground">
                  <span>Chậm (0.5x)</span>
                  <span>Nhanh (2x)</span>
                </div>
              </div>

              <p className="text-[10px] text-muted-foreground bg-primary/5 rounded-lg p-2.5 leading-relaxed">
                💡 <strong>Mẹo:</strong> Trên Edge có giọng Việt "Microsoft HoaiMy" rất tự nhiên. Trên Chrome có "Google tiếng Việt". Nếu chưa có giọng Việt, vào <strong>Windows Settings → Time & Language → Speech</strong> để cài thêm.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default TextToSpeech;
