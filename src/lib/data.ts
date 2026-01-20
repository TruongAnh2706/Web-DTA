// Static translations - used by LanguageContext and ProductGrid
// Apps data is now loaded from Supabase via useApps() hook

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
