import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, Calendar, CreditCard, Settings, Smile, User, FileText, Monitor, Search, Shield } from 'lucide-react';
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { useLanguage } from '@/contexts/LanguageContext';
import { useApps } from '@/hooks/useApps';
import { useAuth } from '@/hooks/useAuth';

export function SearchCommand() {
  const [open, setOpen] = useState(false);
  const { language } = useLanguage();
  const navigate = useNavigate();
  const { data: apps } = useApps();
  const { user, isAdmin } = useAuth();

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((open) => !open);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  const runCommand = useCallback((command: () => unknown) => {
    setOpen(false);
    command();
  }, []);

  const t = {
    vi: {
      placeholder: 'Gõ lệnh hoặc tìm kiếm...',
      empty: 'Không tìm thấy kết quả.',
      apps: 'Ứng dụng',
      pages: 'Trang',
      settings: 'Cài đặt',
      home: 'Trang chủ',
      blog: 'Bài viết',
      pricing: 'Bảng giá',
      tools: 'Công cụ Web',
      profile: 'Hồ sơ',
      dashboard: 'Bảng điều khiển',
      admin: 'Quản trị viên',
    },
    en: {
      placeholder: 'Type a command or search...',
      empty: 'No results found.',
      apps: 'Applications',
      pages: 'Pages',
      settings: 'Settings',
      home: 'Home',
      blog: 'Blog',
      pricing: 'Pricing',
      tools: 'Web Tools',
      profile: 'Profile',
      dashboard: 'Dashboard',
      admin: 'Admin',
    },
  };

  const texts = t[language as keyof typeof t] || t.en;

  return (
    <>
      <button
        onClick={() => setOpen((open) => !open)}
        className="hidden md:flex items-center gap-2 px-3 py-1.5 text-sm text-muted-foreground bg-secondary/30 hover:bg-secondary/50 rounded-xl transition-colors border border-primary/10 hover:border-primary/30"
      >
        <Search className="w-4 h-4" />
        <span className="hidden lg:inline-flex">{texts.placeholder}</span>
        <span className="inline-flex lg:hidden">Search...</span>
        <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground opacity-100 ml-2">
          <span className="text-xs">⌘</span>K
        </kbd>
      </button>

      <button
        onClick={() => setOpen((open) => !open)}
        className="flex md:hidden items-center justify-center w-10 h-10 rounded-xl hover:bg-primary/10 text-muted-foreground hover:text-primary transition-colors"
      >
        <Search className="w-5 h-5" />
      </button>

      <CommandDialog open={open} onOpenChange={setOpen}>
        <CommandInput placeholder={texts.placeholder} />
        <CommandList>
          <CommandEmpty>{texts.empty}</CommandEmpty>
          
          <CommandGroup heading={texts.pages}>
            <CommandItem onSelect={() => runCommand(() => navigate('/'))}>
              <Monitor className="mr-2 h-4 w-4" />
              <span>{texts.home}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/tools'))}>
              <Calculator className="mr-2 h-4 w-4" />
              <span>{texts.tools}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/blog'))}>
              <FileText className="mr-2 h-4 w-4" />
              <span>{texts.blog}</span>
            </CommandItem>
            <CommandItem onSelect={() => runCommand(() => navigate('/pricing'))}>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>{texts.pricing}</span>
            </CommandItem>
          </CommandGroup>
          
          <CommandSeparator />
          
          {apps && apps.length > 0 && (
            <CommandGroup heading={texts.apps}>
              {apps.map((app) => (
                <CommandItem
                  key={app.id}
                  onSelect={() => runCommand(() => navigate(`/app/${app.id}`))}
                >
                  <div className="w-4 h-4 mr-2 rounded-sm bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">A</div>
                  <span className="flex-1">{language === 'vi' ? app.title_vi : app.title}</span>
                  {app.platform && (
                    <span className="text-[10px] text-muted-foreground border px-1.5 py-0.5 rounded-md uppercase ml-2">
                      {app.platform}
                    </span>
                  )}
                </CommandItem>
              ))}
            </CommandGroup>
          )}
          
          {user && (
            <>
              <CommandSeparator />
              <CommandGroup heading={texts.settings}>
                <CommandItem onSelect={() => runCommand(() => navigate('/profile'))}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{texts.profile}</span>
                </CommandItem>
                <CommandItem onSelect={() => runCommand(() => navigate('/dashboard'))}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{texts.dashboard}</span>
                </CommandItem>
                {isAdmin && (
                  <CommandItem onSelect={() => runCommand(() => navigate('/admin'))}>
                    <Shield className="mr-2 h-4 w-4" />
                    <span>{texts.admin}</span>
                  </CommandItem>
                )}
              </CommandGroup>
            </>
          )}
        </CommandList>
      </CommandDialog>
    </>
  );
}
