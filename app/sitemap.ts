import { MetadataRoute } from 'next';
import { query } from '@/lib/db';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://parhamprojects.vercel.app';
  const locales = ['fa', 'en'];

  // ۱. صفحات استاتیک اصلی
  const staticPages = locales.flatMap((locale) => [
    {
      url: `${baseUrl}/${locale}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/${locale}/blog`,
      lastModified: new Date(),
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${baseUrl}/${locale}/order`,
      lastModified: new Date(),
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
  ]);

  // ۲. دریافت نمونه‌کارها از دیتابیس
  let projectPages: MetadataRoute.Sitemap = [];
  try {
    const projectsResult = await query('SELECT id, created_at FROM projects WHERE is_published = true');
    projectPages = projectsResult.rows.flatMap((project: any) => 
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/work/${project.id}`,
        lastModified: new Date(project.created_at),
        changeFrequency: 'monthly' as const,
        priority: 0.6,
      }))
    );
  } catch (error) {
    console.error("Sitemap Projects Error:", error);
  }

  // ۳. دریافت مقالات وبلاگ از دیتابیس
  let postPages: MetadataRoute.Sitemap = [];
  try {
    const postsResult = await query('SELECT slug, created_at FROM posts WHERE is_published = true');
    postPages = postsResult.rows.flatMap((post: any) => 
      locales.map((locale) => ({
        url: `${baseUrl}/${locale}/blog/${post.slug}`,
        lastModified: new Date(post.created_at),
        changeFrequency: 'weekly' as const,
        priority: 0.8,
      }))
    );
  } catch (error) {
    console.error("Sitemap Posts Error:", error);
  }

  return [...staticPages, ...projectPages, ...postPages];
}