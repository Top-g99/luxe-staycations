'use client';

import React from 'react';
import Head from 'next/head';
import { seoManager, PageSEO } from '@/lib/seoManager';

interface SEOHeadProps {
  pageSEO?: PageSEO;
  title?: string;
  description?: string;
  keywords?: string[];
  image?: string;
  url?: string;
  type?: 'website' | 'article' | 'product' | 'profile';
  noIndex?: boolean;
  noFollow?: boolean;
  structuredData?: any;
}

export default function SEOHead({
  pageSEO,
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  noIndex = false,
  noFollow = false,
  structuredData
}: SEOHeadProps) {
  // Only access seoManager on client side
  const config = typeof window !== 'undefined' ? seoManager.getConfig() : {
    siteName: 'Luxe Staycations',
    siteDescription: 'Premium villa booking platform',
    siteUrl: 'https://luxestaycations.com',
    siteImage: '/images/luxe-og-image.jpg',
    siteLogo: '/images/luxe-logo.svg',
    defaultLanguage: 'en',
    defaultLocale: 'en_IN',
    author: 'Luxe Staycations',
    publisher: 'Luxe Staycations',
    contactEmail: 'info@luxestaycations.com',
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
    },
    robots: { index: true, follow: true, noarchive: false, nosnippet: false, noimageindex: false, nocache: false },
    sitemap: { enabled: true, priority: 0.8, changefreq: 'weekly' as const }
  };
  
  // Use pageSEO if provided, otherwise use individual props
  const seoData = pageSEO || {
    id: 'dynamic',
    path: url || '/',
    title: title || config.siteName,
    description: description || config.siteDescription,
    keywords: keywords || [],
    ogTitle: title,
    ogDescription: description,
    ogImage: image,
    ogType: type,
    robots: {
      index: !noIndex,
      follow: !noFollow
    },
    structuredData,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  };

  const metaTags = typeof window !== 'undefined' ? seoManager.generateMetaTags(seoData) : {
    title: seoData.title,
    description: seoData.description,
    keywords: seoData.keywords.join(', '),
    author: config.author,
    publisher: config.publisher,
    'og:title': seoData.ogTitle || seoData.title,
    'og:description': seoData.ogDescription || seoData.description,
    'og:image': seoData.ogImage || config.siteImage,
    'og:url': `${config.siteUrl}${seoData.path}`,
    'og:type': seoData.ogType || 'website',
    'og:site_name': config.siteName,
    'og:locale': config.defaultLocale,
    'twitter:card': seoData.twitterCard || 'summary_large_image',
    'twitter:title': seoData.twitterTitle || seoData.title,
    'twitter:description': seoData.twitterDescription || seoData.description,
    'twitter:image': seoData.twitterImage || seoData.ogImage || config.siteImage,
    'twitter:site': seoData.twitterSite || `@${config.socialMedia.twitter}`,
    'twitter:creator': seoData.twitterCreator || `@${config.socialMedia.twitter}`,
    'robots': seoData.robots?.index ? 'index, follow' : 'noindex, nofollow',
    'canonical': seoData.canonicalUrl || `${config.siteUrl}${seoData.path}`,
    'language': config.defaultLanguage,
    'revisit-after': '7 days'
  };
  
  const structuredDataJson = structuredData || (typeof window !== 'undefined' ? seoManager.generateStructuredData(seoData) : {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: config.siteName,
    description: config.siteDescription,
    url: config.siteUrl
  });

  return (
    <Head>
      {/* Basic Meta Tags */}
      <title>{metaTags.title}</title>
      <meta name="description" content={metaTags.description} />
      <meta name="keywords" content={metaTags.keywords} />
      <meta name="author" content={metaTags.author} />
      <meta name="publisher" content={metaTags.publisher} />
      <meta name="language" content={metaTags.language} />
      <meta name="revisit-after" content={metaTags['revisit-after']} />
      <meta name="robots" content={metaTags.robots} />
      
      {/* Canonical URL */}
      <link rel="canonical" href={metaTags.canonical} />
      
      {/* Open Graph Meta Tags */}
      <meta property="og:title" content={metaTags['og:title']} />
      <meta property="og:description" content={metaTags['og:description']} />
      <meta property="og:image" content={metaTags['og:image']} />
      <meta property="og:url" content={metaTags['og:url']} />
      <meta property="og:type" content={metaTags['og:type']} />
      <meta property="og:site_name" content={metaTags['og:site_name']} />
      <meta property="og:locale" content={metaTags['og:locale']} />
      
      {/* Twitter Card Meta Tags */}
      <meta name="twitter:card" content={metaTags['twitter:card']} />
      <meta name="twitter:title" content={metaTags['twitter:title']} />
      <meta name="twitter:description" content={metaTags['twitter:description']} />
      <meta name="twitter:image" content={metaTags['twitter:image']} />
      {metaTags['twitter:site'] && <meta name="twitter:site" content={metaTags['twitter:site']} />}
      {metaTags['twitter:creator'] && <meta name="twitter:creator" content={metaTags['twitter:creator']} />}
      
      {/* Additional Meta Tags */}
      <meta name="viewport" content="width=device-width, initial-scale=1" />
      <meta name="theme-color" content="#5a3d35" />
      <meta name="msapplication-TileColor" content="#5a3d35" />
      
      {/* Favicon */}
      <link rel="icon" href="/favicon.ico" />
      <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
      <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
      <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
      <link rel="manifest" href="/site.webmanifest" />
      
      {/* Structured Data */}
      {structuredDataJson && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify(structuredDataJson)
          }}
        />
      )}
      
      {/* Analytics */}
      {config.analytics?.googleAnalytics && (
        <>
          <script
            async
            src={`https://www.googletagmanager.com/gtag/js?id=${config.analytics.googleAnalytics}`}
          />
          <script
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${config.analytics.googleAnalytics}');
              `
            }}
          />
        </>
      )}
      
      {/* Google Tag Manager */}
      {config.analytics?.googleTagManager && (
        <>
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
                new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
                j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
                'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
                })(window,document,'script','dataLayer','${config.analytics.googleTagManager}');
              `
            }}
          />
          <noscript>
            <iframe
              src={`https://www.googletagmanager.com/ns.html?id=${config.analytics.googleTagManager}`}
              height="0"
              width="0"
              style={{ display: 'none', visibility: 'hidden' }}
            />
          </noscript>
        </>
      )}
      
      {/* Facebook Pixel */}
      {config.analytics?.facebookPixel && (
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '${config.analytics.facebookPixel}');
              fbq('track', 'PageView');
            `
          }}
        />
      )}
      
      {/* Search Engine Verification */}
      {config.verification?.google && (
        <meta name="google-site-verification" content={config.verification.google} />
      )}
      {config.verification?.bing && (
        <meta name="msvalidate.01" content={config.verification.bing} />
      )}
      {config.verification?.yandex && (
        <meta name="yandex-verification" content={config.verification.yandex} />
      )}
      {config.verification?.baidu && (
        <meta name="baidu-site-verification" content={config.verification.baidu} />
      )}
    </Head>
  );
}
