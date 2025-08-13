import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/studio/',
          '/_next/',
          '/private/',
        ],
      },
    ],
    sitemap: 'https://mazagk.vercel.app/sitemap.xml',
  }
}
