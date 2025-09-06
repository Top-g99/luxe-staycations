export interface SEOConfig {
  siteName: string;
  siteDescription: string;
  siteUrl: string;
  siteImage: string;
  siteLogo: string;
  defaultLanguage: string;
  defaultLocale: string;
  author: string;
  publisher: string;
  contactEmail: string;
  socialMedia: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  analytics: {
    googleAnalytics?: string;
    googleTagManager?: string;
    facebookPixel?: string;
    hotjar?: string;
  };
  verification: {
    google?: string;
    bing?: string;
    yandex?: string;
    baidu?: string;
  };
  robots: {
    index: boolean;
    follow: boolean;
    noarchive: boolean;
    nosnippet: boolean;
    noimageindex: boolean;
    nocache: boolean;
  };
  sitemap: {
    enabled: boolean;
    priority: number;
    changefreq: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  };
}

export interface PageSEO {
  id: string;
  path: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: 'summary' | 'summary_large_image' | 'app' | 'player';
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  structuredData?: any;
  robots?: {
    index: boolean;
    follow: boolean;
    noarchive?: boolean;
    nosnippet?: boolean;
    noimageindex?: boolean;
    nocache?: boolean;
  };
  priority?: number;
  changefreq?: 'always' | 'hourly' | 'daily' | 'weekly' | 'monthly' | 'yearly' | 'never';
  lastModified?: string;
  createdAt: string;
  updatedAt: string;
}

export interface SEOAnalytics {
  pageViews: number;
  uniqueVisitors: number;
  bounceRate: number;
  avgSessionDuration: number;
  topPages: Array<{
    path: string;
    title: string;
    views: number;
    bounceRate: number;
  }>;
  topKeywords: Array<{
    keyword: string;
    position: number;
    clicks: number;
    impressions: number;
  }>;
  lastUpdated: string;
}

class SEOManager {
  private config: SEOConfig;
  private pages: PageSEO[] = [];
  private analytics: SEOAnalytics | null = null;
  private subscribers: (() => void)[] = [];

  constructor() {
    this.config = this.getDefaultConfig();
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  private getDefaultConfig(): SEOConfig {
    return {
      siteName: 'Luxe Staycations',
      siteDescription: 'Premium villa booking platform offering luxury accommodations across India',
      siteUrl: 'https://luxestaycations.com',
      siteImage: '/images/luxe-og-image.jpg',
      siteLogo: '/images/luxe-logo.svg',
      defaultLanguage: 'en',
      defaultLocale: 'en_IN',
      author: 'Luxe Staycations',
      publisher: 'Luxe Staycations',
      contactEmail: 'info@luxestaycations.com',
      socialMedia: {
        facebook: 'luxestaycations',
        twitter: 'luxestaycations',
        instagram: 'luxestaycations',
        linkedin: 'luxestaycations',
        youtube: 'luxestaycations'
      },
      analytics: {},
      verification: {},
      robots: {
        index: true,
        follow: true,
        noarchive: false,
        nosnippet: false,
        noimageindex: false,
        nocache: false
      },
      sitemap: {
        enabled: true,
        priority: 0.8,
        changefreq: 'weekly'
      }
    };
  }

  private loadFromStorage() {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('luxeSEOConfig');
      const savedPages = localStorage.getItem('luxeSEOPages');
      const savedAnalytics = localStorage.getItem('luxeSEOAnalytics');

      if (savedConfig) {
        this.config = { ...this.config, ...JSON.parse(savedConfig) };
      }

      if (savedPages) {
        this.pages = JSON.parse(savedPages);
      }

      if (savedAnalytics) {
        this.analytics = JSON.parse(savedAnalytics);
      }
    }
  }

  private saveToStorage() {
    if (typeof window !== 'undefined') {
      localStorage.setItem('luxeSEOConfig', JSON.stringify(this.config));
      localStorage.setItem('luxeSEOPages', JSON.stringify(this.pages));
      if (this.analytics) {
        localStorage.setItem('luxeSEOAnalytics', JSON.stringify(this.analytics));
      }
    }
  }

  // Initialization
  initialize(): void {
    if (typeof window !== 'undefined') {
      this.loadFromStorage();
    }
  }

  // Configuration Methods
  getConfig(): SEOConfig {
    return this.config;
  }

  updateConfig(updates: Partial<SEOConfig>): boolean {
    try {
      this.config = { ...this.config, ...updates };
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    } catch (error) {
      console.error('Error updating SEO config:', error);
      return false;
    }
  }

  // Page SEO Methods
  getPageSEO(path: string): PageSEO | undefined {
    return this.pages.find(page => page.path === path);
  }

  getAllPages(): PageSEO[] {
    return this.pages;
  }

  addPageSEO(pageSEO: Omit<PageSEO, 'id' | 'createdAt' | 'updatedAt'>): PageSEO {
    const newPage: PageSEO = {
      ...pageSEO,
      id: Date.now().toString(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    this.pages.push(newPage);
    this.saveToStorage();
    this.notifySubscribers();
    return newPage;
  }

  updatePageSEO(id: string, updates: Partial<PageSEO>): boolean {
    const index = this.pages.findIndex(page => page.id === id);
    if (index !== -1) {
      this.pages[index] = {
        ...this.pages[index],
        ...updates,
        updatedAt: new Date().toISOString()
      };
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  deletePageSEO(id: string): boolean {
    const index = this.pages.findIndex(page => page.id === id);
    if (index !== -1) {
      this.pages.splice(index, 1);
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    }
    return false;
  }

  // Meta Tags Generation
  generateMetaTags(pageSEO?: PageSEO): Record<string, string> {
    const page = pageSEO || this.getDefaultPageSEO();
    const config = this.config;

    return {
      title: page.title,
      description: page.description,
      keywords: page.keywords.join(', '),
      author: config.author,
      publisher: config.publisher,
      'og:title': page.ogTitle || page.title,
      'og:description': page.ogDescription || page.description,
      'og:image': page.ogImage || config.siteImage,
      'og:url': `${config.siteUrl}${page.path}`,
      'og:type': page.ogType || 'website',
      'og:site_name': config.siteName,
      'og:locale': config.defaultLocale,
      'twitter:card': page.twitterCard || 'summary_large_image',
      'twitter:title': page.twitterTitle || page.title,
      'twitter:description': page.twitterDescription || page.description,
      'twitter:image': page.twitterImage || page.ogImage || config.siteImage,
      'twitter:site': page.twitterSite || `@${config.socialMedia.twitter}`,
      'twitter:creator': page.twitterCreator || `@${config.socialMedia.twitter}`,
      'robots': this.generateRobotsTag(page.robots),
      'canonical': page.canonicalUrl || `${config.siteUrl}${page.path}`,
      'language': config.defaultLanguage,
      'revisit-after': '7 days'
    };
  }

  private getDefaultPageSEO(): PageSEO {
    return {
      id: 'default',
      path: '/',
      title: this.config.siteName,
      description: this.config.siteDescription,
      keywords: ['luxury villas', 'villa booking', 'premium accommodations', 'India'],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
  }

  private generateRobotsTag(robots?: PageSEO['robots']): string {
    const robotConfig = robots || this.config.robots;
    const directives: string[] = [];

    if (robotConfig.index) directives.push('index');
    else directives.push('noindex');

    if (robotConfig.follow) directives.push('follow');
    else directives.push('nofollow');

    if (robotConfig.noarchive) directives.push('noarchive');
    if (robotConfig.nosnippet) directives.push('nosnippet');
    if (robotConfig.noimageindex) directives.push('noimageindex');
    if (robotConfig.nocache) directives.push('nocache');

    return directives.join(', ');
  }

  // Structured Data Generation
  generateStructuredData(pageSEO?: PageSEO): any {
    const page = pageSEO || this.getDefaultPageSEO();
    const config = this.config;

    const baseStructuredData = {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: config.siteName,
      description: config.siteDescription,
      url: config.siteUrl,
      logo: `${config.siteUrl}${config.siteLogo}`,
      sameAs: Object.values(config.socialMedia).filter(Boolean).map(handle => 
        handle?.startsWith('@') ? `https://twitter.com/${handle.slice(1)}` : handle
      )
    };

    if (page.path === '/') {
      return {
        ...baseStructuredData,
        '@type': 'WebSite',
        potentialAction: {
          '@type': 'SearchAction',
          target: `${config.siteUrl}/search?q={search_term_string}`,
          'query-input': 'required name=search_term_string'
        }
      };
    }

    if (page.path.includes('/villas/')) {
      return {
        '@context': 'https://schema.org',
        '@type': 'LodgingBusiness',
        name: page.title,
        description: page.description,
        url: `${config.siteUrl}${page.path}`,
        image: page.ogImage || config.siteImage,
        address: {
          '@type': 'PostalAddress',
          addressCountry: 'IN'
        },
        telephone: config.contactEmail,
        email: config.contactEmail
      };
    }

    return baseStructuredData;
  }

  // Sitemap Generation
  generateSitemap(): string {
    const config = this.config;
    const pages = this.pages.filter(page => page.robots?.index !== false);
    
    let sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n';
    sitemap += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Add homepage
    sitemap += '  <url>\n';
    sitemap += `    <loc>${config.siteUrl}</loc>\n`;
    sitemap += `    <lastmod>${new Date().toISOString().split('T')[0]}</lastmod>\n`;
    sitemap += `    <changefreq>${config.sitemap.changefreq}</changefreq>\n`;
    sitemap += `    <priority>1.0</priority>\n`;
    sitemap += '  </url>\n';

    // Add other pages
    pages.forEach(page => {
      sitemap += '  <url>\n';
      sitemap += `    <loc>${config.siteUrl}${page.path}</loc>\n`;
      sitemap += `    <lastmod>${page.lastModified || page.updatedAt.split('T')[0]}</lastmod>\n`;
      sitemap += `    <changefreq>${page.changefreq || config.sitemap.changefreq}</changefreq>\n`;
      sitemap += `    <priority>${page.priority || config.sitemap.priority}</priority>\n`;
      sitemap += '  </url>\n';
    });

    sitemap += '</urlset>';
    return sitemap;
  }

  // Robots.txt Generation
  generateRobotsTxt(): string {
    const config = this.config;
    let robots = '';

    if (config.robots.index) {
      robots += 'User-agent: *\n';
      robots += 'Allow: /\n';
      robots += `Sitemap: ${config.siteUrl}/sitemap.xml\n`;
    } else {
      robots += 'User-agent: *\n';
      robots += 'Disallow: /\n';
    }

    // Add specific rules for different bots
    if (config.verification.google) {
      robots += `\nUser-agent: Googlebot\n`;
      robots += 'Allow: /\n';
    }

    return robots;
  }

  // Analytics Methods
  getAnalytics(): SEOAnalytics | null {
    return this.analytics;
  }

  updateAnalytics(analytics: SEOAnalytics): boolean {
    try {
      this.analytics = analytics;
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    } catch (error) {
      console.error('Error updating SEO analytics:', error);
      return false;
    }
  }

  // Utility Methods
  subscribe(callback: () => void) {
    this.subscribers.push(callback);
    return () => {
      this.subscribers = this.subscribers.filter(sub => sub !== callback);
    };
  }

  private notifySubscribers() {
    this.subscribers.forEach(callback => callback());
  }

  // SEO Score Calculation
  calculateSEOScore(pageSEO: PageSEO): number {
    let score = 0;
    const maxScore = 100;

    // Title (20 points)
    if (pageSEO.title && pageSEO.title.length >= 30 && pageSEO.title.length <= 60) {
      score += 20;
    } else if (pageSEO.title) {
      score += 10;
    }

    // Description (20 points)
    if (pageSEO.description && pageSEO.description.length >= 120 && pageSEO.description.length <= 160) {
      score += 20;
    } else if (pageSEO.description) {
      score += 10;
    }

    // Keywords (10 points)
    if (pageSEO.keywords && pageSEO.keywords.length >= 3) {
      score += 10;
    }

    // Open Graph (15 points)
    if (pageSEO.ogTitle && pageSEO.ogDescription && pageSEO.ogImage) {
      score += 15;
    } else if (pageSEO.ogTitle || pageSEO.ogDescription || pageSEO.ogImage) {
      score += 8;
    }

    // Twitter Cards (10 points)
    if (pageSEO.twitterCard && pageSEO.twitterTitle && pageSEO.twitterDescription) {
      score += 10;
    } else if (pageSEO.twitterCard) {
      score += 5;
    }

    // Canonical URL (10 points)
    if (pageSEO.canonicalUrl) {
      score += 10;
    }

    // Structured Data (15 points)
    if (pageSEO.structuredData) {
      score += 15;
    }

    return Math.min(score, maxScore);
  }

  // Export/Import
  exportData(): string {
    return JSON.stringify({
      config: this.config,
      pages: this.pages,
      analytics: this.analytics
    }, null, 2);
  }

  importData(data: string): boolean {
    try {
      const parsed = JSON.parse(data);
      if (parsed.config) this.config = parsed.config;
      if (parsed.pages) this.pages = parsed.pages;
      if (parsed.analytics) this.analytics = parsed.analytics;
      this.saveToStorage();
      this.notifySubscribers();
      return true;
    } catch (error) {
      console.error('Error importing SEO data:', error);
      return false;
    }
  }
}

export const seoManager = new SEOManager();
