import { MetadataRoute } from "next";
import { posts } from "@/lib/posts";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://parhamprojects.vercel.app";
  const staticPages = ["", "/blog", "/order"];
  const sitemapEntries: MetadataRoute.Sitemap = [];

  staticPages.forEach((page) => {
    sitemapEntries.push({
      url: `${baseUrl}/fa${page}`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: page === "" ? 1 : 0.8,
      alternates: {
        languages: { "fa-IR": `${baseUrl}/fa${page}`, "en": `${baseUrl}/en${page}` },
      },
    });
  });

  posts.forEach((post) => {
    sitemapEntries.push({
      url: `${baseUrl}/fa/blog/${post.slug}`,
      lastModified: new Date(post.date),
      changeFrequency: "monthly",
      priority: 0.7,
      alternates: {
        languages: { "fa-IR": `${baseUrl}/fa/blog/${post.slug}`, "en": `${baseUrl}/en/blog/${post.slug}` },
      },
    });
  });

  return sitemapEntries;
}