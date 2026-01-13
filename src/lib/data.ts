import { Monitor, Globe, Zap, MousePointer2, Eye, Video, FileCode, Sparkles } from 'lucide-react';

export type Platform = 'web' | 'desktop';
export type Category = 'all' | 'web' | 'desktop' | 'automation';

export interface App {
  id: string;
  title: string;
  titleVi: string;
  description: string;
  descriptionVi: string;
  icon: typeof Monitor;
  platform: Platform;
  category: Category[];
  url: string;
  featured?: boolean;
}

export const apps: App[] = [
  {
    id: 'auto-clicker',
    title: 'DTA Auto Clicker',
    titleVi: 'DTA Tự Động Click',
    description: 'Advanced auto-clicking tool with customizable intervals, hotkeys, and multi-target support.',
    descriptionVi: 'Công cụ tự động click nâng cao với tùy chỉnh khoảng cách, phím tắt và hỗ trợ đa mục tiêu.',
    icon: MousePointer2,
    platform: 'desktop',
    category: ['desktop', 'automation'],
    url: '#',
    featured: true,
  },
  {
    id: 'gemini-vision',
    title: 'Gemini Vision Tool',
    titleVi: 'Công Cụ Gemini Vision',
    description: 'AI-powered image analysis and description generator using Google Gemini API.',
    descriptionVi: 'Phân tích hình ảnh và tạo mô tả bằng AI sử dụng Google Gemini API.',
    icon: Eye,
    platform: 'web',
    category: ['web', 'automation'],
    url: '#',
    featured: true,
  },
  {
    id: 'short-generator',
    title: 'DTA Short Generator',
    titleVi: 'DTA Tạo Video Ngắn',
    description: 'Automatically generate short-form videos from long content with AI editing.',
    descriptionVi: 'Tự động tạo video ngắn từ nội dung dài với chỉnh sửa AI.',
    icon: Video,
    platform: 'desktop',
    category: ['desktop', 'automation'],
    url: '#',
  },
  {
    id: 'code-formatter',
    title: 'Universal Code Formatter',
    titleVi: 'Định Dạng Code Đa Năng',
    description: 'Format and beautify code in 20+ programming languages instantly.',
    descriptionVi: 'Định dạng và làm đẹp code cho hơn 20 ngôn ngữ lập trình.',
    icon: FileCode,
    platform: 'web',
    category: ['web'],
    url: '#',
  },
  {
    id: 'task-automator',
    title: 'DTA Task Automator',
    titleVi: 'DTA Tự Động Hóa Tác Vụ',
    description: 'Create complex automation workflows with visual drag-and-drop interface.',
    descriptionVi: 'Tạo quy trình tự động phức tạp với giao diện kéo thả trực quan.',
    icon: Sparkles,
    platform: 'desktop',
    category: ['desktop', 'automation'],
    url: '#',
    featured: true,
  },
];

export const translations = {
  en: {
    nav: {
      home: 'Home',
      apps: 'Apps',
      about: 'About',
      contact: 'Contact',
    },
    hero: {
      badge: 'Innovation Hub',
      title: {
        line1: 'Build.',
        line2: 'Automate. Innovate.',
      },
      subtitle: 'DTA Studio creates powerful tools and applications that streamline your workflow and boost productivity.',
      cta: {
        explore: 'Explore Apps',
        learn: 'Learn More',
      },
    },
    categories: {
      all: 'All Apps',
      web: 'Web Apps',
      desktop: 'Desktop Apps',
      automation: 'Automation Tools',
    },
    apps: {
      title: 'Our Software Collection',
      subtitle: 'Discover our suite of carefully crafted tools designed to enhance your digital experience.',
      launch: 'Launch',
      download: 'Download',
    },
    about: {
      title: 'About DTA Studio',
      description: 'We are a passionate team dedicated to creating innovative software solutions. Our mission is to simplify complex tasks through intelligent automation and intuitive design.',
      features: {
        feature1: 'AI Powered',
        feature2: 'Fast & Reliable',
        feature3: 'Secure',
        feature4: 'Innovative',
      },
    },
    footer: {
      copyright: '© 2025 Made with',
      tagline: 'Crafting Digital Excellence',
    },
    badges: {
      web: 'Web',
      desktop: 'Windows',
    },
  },
  vi: {
    nav: {
      home: 'Trang Chủ',
      apps: 'Ứng Dụng',
      about: 'Giới Thiệu',
      contact: 'Liên Hệ',
    },
    hero: {
      badge: 'Trung Tâm Đổi Mới',
      title: {
        line1: 'Xây Dựng.',
        line2: 'Tự Động. Đổi Mới.',
      },
      subtitle: 'DTA Studio tạo ra các công cụ và ứng dụng mạnh mẽ giúp tối ưu quy trình làm việc và tăng năng suất của bạn.',
      cta: {
        explore: 'Khám Phá',
        learn: 'Tìm Hiểu',
      },
    },
    categories: {
      all: 'Tất Cả',
      web: 'Ứng Dụng Web',
      desktop: 'Ứng Dụng Desktop',
      automation: 'Công Cụ Tự Động',
    },
    apps: {
      title: 'Bộ Sưu Tập Phần Mềm',
      subtitle: 'Khám phá bộ công cụ được thiết kế tỉ mỉ để nâng cao trải nghiệm số của bạn.',
      launch: 'Khởi Chạy',
      download: 'Tải Xuống',
    },
    about: {
      title: 'Về DTA Studio',
      description: 'Chúng tôi là một đội ngũ đam mê tận tâm tạo ra các giải pháp phần mềm sáng tạo.',
      features: {
        feature1: 'AI Mạnh Mẽ',
        feature2: 'Nhanh & Ổn Định',
        feature3: 'Bảo Mật',
        feature4: 'Sáng Tạo',
      },
    },
    footer: {
      copyright: '© 2025 Made with',
      tagline: 'Kiến Tạo Sự Xuất Sắc Số',
    },
    badges: {
      web: 'Web',
      desktop: 'Windows',
    },
  },
};

export type Language = keyof typeof translations;
