import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const baseUrl = 'https://parhambatouie.com' // دامنه نهایی خود را اینجا بگذارید

  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: '/admin/', // به گوگل می‌گوییم پنل ادمین را ایندکس نکند
    },
    sitemap: `${baseUrl}/sitemap.xml`,
  }
}