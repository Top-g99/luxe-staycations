// Minimal SEO manager for admin functionality
export interface SEOData {
  id: string;
  page: string;
  title: string;
  description: string;
  keywords: string[];
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
  created_at: string;
  updated_at: string;
}

export class SEOManager {
  private static instance: SEOManager;
  private seoData: SEOData[] = [];

  static getInstance(): SEOManager {
    if (!SEOManager.instance) {
      SEOManager.instance = new SEOManager();
    }
    return SEOManager.instance;
  }

  async initialize() {
    // Mock initialization
    return Promise.resolve();
  }

  async getAll(): Promise<SEOData[]> {
    return this.seoData;
  }

  async getById(id: string): Promise<SEOData | null> {
    return this.seoData.find(s => s.id === id) || null;
  }

  async getByPage(page: string): Promise<SEOData | null> {
    return this.seoData.find(s => s.page === page) || null;
  }

  async create(seo: Omit<SEOData, 'id' | 'created_at' | 'updated_at'>): Promise<SEOData> {
    const newSEO: SEOData = {
      ...seo,
      id: Date.now().toString(),
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.seoData.push(newSEO);
    return newSEO;
  }

  async update(id: string, updates: Partial<SEOData>): Promise<SEOData | null> {
    const index = this.seoData.findIndex(s => s.id === id);
    if (index !== -1) {
      this.seoData[index] = { ...this.seoData[index], ...updates, updated_at: new Date().toISOString() };
      return this.seoData[index];
    }
    return null;
  }

  async delete(id: string): Promise<boolean> {
    const index = this.seoData.findIndex(s => s.id === id);
    if (index !== -1) {
      this.seoData.splice(index, 1);
      return true;
    }
    return false;
  }

  generateRobotsTxt(): string {
    return `User-agent: *
Allow: /

Sitemap: https://luxestaycations.in/sitemap.xml`;
  }

  generateSitemap(): string {
    return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>https://luxestaycations.in/</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>daily</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>https://luxestaycations.in/destinations</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>weekly</changefreq>
    <priority>0.8</priority>
  </url>
  <url>
    <loc>https://luxestaycations.in/contact-us</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.6</priority>
  </url>
</urlset>`;
  }

  updateAnalytics(analytics: SEOAnalytics): void {
    // Store analytics data (in a real app, this would save to database)
    console.log('Analytics updated:', analytics);
  }

  getConfig() {
    return {
      siteName: 'Luxe Staycations',
      siteDescription: 'Premium villa booking platform',
      siteUrl: 'https://luxestaycations.com',
      defaultImage: '/images/og-default.jpg',
      twitterHandle: '@luxestaycations',
      author: 'Luxe Staycations Team',
      publisher: 'Luxe Staycations',
      siteImage: '/images/og-default.jpg',
      sitemap: {
        url: 'https://luxestaycations.com/sitemap.xml',
        lastmod: new Date().toISOString()
      },
      defaultLocale: 'en_US',
      defaultLanguage: 'en',
      socialMedia: {
        twitter: 'luxestaycations'
      },
      analytics: {
        googleAnalytics: 'GA_MEASUREMENT_ID',
        googleTagManager: 'GTM-XXXXXXX',
        facebookPixel: 'FB_PIXEL_ID'
      },
      verification: {
        google: 'GOOGLE_VERIFICATION_CODE',
        bing: 'BING_VERIFICATION_CODE',
        yandex: 'YANDEX_VERIFICATION_CODE',
        baidu: 'BAIDU_VERIFICATION_CODE'
      }
    } as const;
  }

  generateMetaTags(seoData: PageSEO) {
    const config = this.getConfig();
    return {
      title: seoData.title,
      description: seoData.description,
      keywords: seoData.keywords.join(', '),
      canonical: seoData.canonicalUrl,
      author: config.author,
      publisher: config.publisher,
      language: config.defaultLanguage,
      'revisit-after': '7 days',
      ogTitle: seoData.ogTitle || seoData.title,
      ogDescription: seoData.ogDescription || seoData.description,
      ogImage: seoData.ogImage || '/images/og-default.jpg',
      twitterCard: seoData.twitterCard || 'summary_large_image',
      twitterTitle: seoData.twitterTitle || seoData.title,
      twitterDescription: seoData.twitterDescription || seoData.description,
      twitterImage: seoData.twitterImage || seoData.ogImage || '/images/og-default.jpg',
      robots: seoData.robots?.index ? 'index, follow' : 'noindex, nofollow',
      'og:title': seoData.ogTitle || seoData.title,
      'og:description': seoData.ogDescription || seoData.description,
      'og:image': seoData.ogImage || '/images/og-default.jpg',
      'og:url': `${config.siteUrl}${seoData.path || ''}`,
      'og:type': seoData.ogType || 'website',
      'og:site_name': config.siteName,
      'og:locale': config.defaultLocale,
      'twitter:card': seoData.twitterCard || 'summary_large_image',
      'twitter:title': seoData.twitterTitle || seoData.title,
      'twitter:description': seoData.twitterDescription || seoData.description,
      'twitter:image': seoData.twitterImage || seoData.ogImage || '/images/og-default.jpg',
      'twitter:site': seoData.twitterSite || `@${config.socialMedia.twitter}`,
      'twitter:creator': seoData.twitterCreator || `@${config.socialMedia.twitter}`,
      noIndex: seoData.noIndex || false,
      noFollow: seoData.noFollow || false
    };
  }

  generateStructuredData(seoData: PageSEO) {
    return {
      '@context': 'https://schema.org',
      '@type': 'WebSite',
      name: seoData.title,
      description: seoData.description,
      url: seoData.canonicalUrl || `https://luxestaycations.com${seoData.path || ''}`,
      image: seoData.ogImage || '/images/og-default.jpg',
      publisher: {
        '@type': 'Organization',
        name: 'Luxe Staycations',
        url: 'https://luxestaycations.com'
      }
    };
  }
}

export interface PageSEO {
  id?: string;
  path?: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  robots?: {
    index: boolean;
    follow: boolean;
  };
  structuredData?: any;
  noIndex?: boolean;
  noFollow?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  h1Tags: string[];
  h2Tags: string[];
  imageAlts: string[];
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  readabilityScore: number;
  mobileFriendly: boolean;
  loadTime: number;
  lastAnalyzed: string;
  lastUpdated: string;
}

export const seoManager = SEOManager.getInstance();

// Add missing interfaces for admin functionality
export interface PageSEO {
  id?: string;
  path?: string;
  title: string;
  description: string;
  keywords: string[];
  canonicalUrl?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: 'website' | 'article' | 'product' | 'profile';
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
  twitterSite?: string;
  twitterCreator?: string;
  robots?: {
    index: boolean;
    follow: boolean;
  };
  structuredData?: any;
  noIndex?: boolean;
  noFollow?: boolean;
  createdAt?: string;
  updatedAt?: string;
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
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  h1Tags: string[];
  h2Tags: string[];
  imageAlts: string[];
  internalLinks: number;
  externalLinks: number;
  wordCount: number;
  readabilityScore: number;
  mobileFriendly: boolean;
  loadTime: number;
  lastAnalyzed: string;
  lastUpdated: string;
}
