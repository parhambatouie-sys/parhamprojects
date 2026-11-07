import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://parhamprojects.vercel.app';
  
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: [
        '/admin/',
        '/api/',
        '/*/admin/',
      ],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}