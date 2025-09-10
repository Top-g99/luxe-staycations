/** @type {import('next-sitemap').IConfig} */
module.exports = {
    siteUrl: process.env.NEXT_PUBLIC_APP_URL || 'https://luxestaycations.in',
    generateRobotsTxt: true,
    generateIndexSitemap: false,
    exclude: [
        '/admin/*',
        '/api/*',
        '/debug/*',
        '/test-*',
        '/check-*',
        '/guest/*',
        '/host/*',
        '/partner/*',
        '/booking/checkout',
        '/booking/confirmation',
        '/loyalty',
        '/about-us',
        '/contact-us',
        '/help',
        '/faq',
        '/privacy-policy',
        '/terms-of-service',
        '/refund-policy',
        '/cancellation-policy',
        '/partner-with-us'
    ],
    robotsTxtOptions: {
        policies: [{
            userAgent: '*',
            allow: '/',
            disallow: [
                '/admin/',
                '/api/',
                '/debug/',
                '/test-',
                '/check-',
                '/guest/',
                '/host/',
                '/partner/',
                '/booking/checkout',
                '/booking/confirmation',
                '/loyalty'
            ],
        }, ],
        additionalSitemaps: [
            `${process.env.NEXT_PUBLIC_APP_URL || 'https://luxestaycations.in'}/sitemap.xml`,
        ],
    },
    transform: async(config, path) => {
        // Custom transform for dynamic routes
        if (path.includes('/villas/')) {
            return {
                loc: path,
                changefreq: 'weekly',
                priority: 0.8,
                lastmod: new Date().toISOString(),
            }
        }

        return {
            loc: path,
            changefreq: 'daily',
            priority: 0.7,
            lastmod: new Date().toISOString(),
        }
    },
}