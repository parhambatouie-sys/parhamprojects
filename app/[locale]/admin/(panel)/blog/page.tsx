"use client";

import { useState, useEffect, FormEvent } from "react";
import { ImageUpload } from "@/components/admin/ImageUpload";

type Post = {
  id: number; 
  title: string; 
  slug: string; 
  excerpt: string; 
  content: string; 
  category: string;
  image_url: string; 
  author: string; 
  seo_title: string; 
  seo_description: string; 
  locale: string; 
  is_published: boolean;
};

const initialFormData = {
  title: "", 
  slug: "", 
  excerpt: "", 
  content: "", 
  category: "تکنولوژی",
  image_url: "", 
  author: "Parham Batouie", 
  seo_title: "", 
  seo_description: "", 
  locale: "fa", 
  is_published: true,
};

export default function AdminBlogPage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAIModalOpen, setIsAIModalOpen] = useState(false);
  const [currentPost, setCurrentPost] = useState<Post | null>(null);
  const [formData, setFormData] = useState(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [aiTopic, setAiTopic] = useState("");
  const [aiTone, setAiTone] = useState("حرفه‌ای و صمیمی");
  const [isGenerating, setIsGenerating] = useState(false);

  const fetchPosts = () => {
    setLoading(true);
    // استفاده از no-store برای جلوگیری از کش شدن
    fetch("/api/admin/blog", { credentials: "include", cache: "no-store" })
      .then((res) => res.json())
      .then((data) => { 
        if (data.posts) setPosts(data.posts); 
        setLoading(false); 
      });
  };

  useEffect(() => { fetchPosts(); }, []);

  const openModal = (post?: Post) => {
    if (post) {
      setCurrentPost(post);
      setFormData({
        title: post.title, 
        slug: post.slug, 
        excerpt: post.excerpt || "", 
        content: post.content || "", 
        category: post.category || "تکنولوژی", 
        image_url: post.image_url || "", 
        author: post.author || "Parham Batouie",
        seo_title: post.seo_title || "", 
        seo_description: post.seo_description || "", 
        locale: post.locale || "fa", 
        is_published: post.is_published,
      });
    } else {
      setCurrentPost(null);
      setFormData(initialFormData);
    }
    setIsModalOpen(true);
  };

  const handleGenerateAI = async (e: FormEvent) => {
    e.preventDefault();
    setIsGenerating(true);
    try {
      const res = await fetch("/api/admin/blog/generate", {
        method: "POST", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ topic: aiTopic, tone: aiTone, language: formData.locale }), 
        credentials: "include",
      });
      const data = await res.json();
      if (res.ok && data.data) {
        setFormData({ 
          ...formData, 
          title: data.data.title, 
          slug: data.data.slug, 
          excerpt: data.data.excerpt, 
          content: data.data.content, 
          category: data.data.category, 
          seo_title: data.data.seo_title, 
          seo_description: data.data.seo_description 
        });
        setIsAIModalOpen(false); 
        setIsModalOpen(true); 
      } else { 
        alert(`خطا: ${data.error}`); 
      }
    } catch (err) { 
      alert("خطا در ارتباط با هوش مصنوعی"); 
    } finally { 
      setIsGenerating(false); 
    }
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const url = currentPost ? `/api/admin/blog/${currentPost.id}` : "/api/admin/blog";
    const method = currentPost ? "PUT" : "POST";
    try {
      const res = await fetch(url, { 
        method, 
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(formData), 
        credentials: "include" 
      });
      if (res.ok) { 
        setIsModalOpen(false); 
        fetchPosts(); 
      } else { 
        const errData = await res.json().catch(() => ({})); 
        alert(`خطا: ${errData.error}`); 
      }
    } catch (err) { 
      alert("خطای شبکه"); 
    } finally { 
      setIsSubmitting(false); 
    }
  };

  const handleDelete = async (id: number) => {
    if (!window.confirm("آیا از حذف این مقاله مطمئن هستید؟")) return;
    await fetch(`/api/admin/blog/${id}`, { method: "DELETE", credentials: "include" });
    fetchPosts();
  };

  if (loading) return <div className="text-white text-center mt-10">در حال بارگذاری مقالات...</div>;

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <header>
          <h1 className="text-3xl font-bold text-foreground">مدیریت وبلاگ</h1>
          <p className="mt-2 text-muted">مقالات را مدیریت کنید یا با هوش مصنوعی مقاله جدید بسازید.</p>
        </header>
        <div className="flex gap-4">
          <button onClick={() => setIsAIModalOpen(true)} className="rounded-md border border-brand text-brand px-6 py-2.5 text-sm font-semibold hover:bg-brand/10 transition">
            ✨ تولید با هوش مصنوعی
          </button>
          <button onClick={() => openModal()} className="rounded-md bg-brand px-6 py-2.5 text-sm font-semibold text-brand-foreground hover:opacity-90">
            + مقاله جدید
          </button>
        </div>
      </div>

      {posts.length === 0 ? (
        <div className="rounded-xl border border-border bg-[#292D31] p-10 text-center text-muted">
          هنوز مقاله‌ای ثبت نکرده‌اید.
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {posts.map((post) => (
            <div key={post.id} className="rounded-xl border border-border bg-[#292D31] p-6 shadow-sm overflow-hidden flex flex-col">
              <div className="flex items-center gap-2 mb-2">
                <span className="rounded bg-black/40 px-2 py-0.5 text-[10px] font-mono border border-white/10 text-muted">
                  {post.locale === 'fa' ? '🇮🇷 فارسی' : '🇬🇧 English'}
                </span>
                <span className={post.is_published ? "text-green-500 text-xs" : "text-yellow-500 text-xs"}>
                  {post.is_published ? "منتشر شده" : "پیش‌نویس"}
                </span>
              </div>
              <h3 className="text-lg font-bold text-foreground mb-2">{post.title}</h3>
              <p className="text-xs text-muted line-clamp-2 mb-4 flex-1">{post.excerpt}</p>
              <div className="mt-4 flex gap-2">
                <button onClick={() => openModal(post)} className="flex-1 rounded border border-border py-2 text-xs font-medium hover:bg-white/5">
                  ویرایش
                </button>
                <button onClick={() => handleDelete(post.id)} className="rounded border border-red-500/30 px-3 py-2 text-xs font-medium text-red-400 hover:bg-red-500/10">
                  حذف
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* فرم تولید با هوش مصنوعی */}
      {isAIModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl border border-border bg-[#292D31] p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-foreground mb-4">✨ تولید مقاله با هوش مصنوعی</h2>
            <form onSubmit={handleGenerateAI} className="space-y-4">
              <div>
                <label className="mb-1 block text-xs text-muted">موضوع مقاله (پرامپت شما)</label>
                <textarea required rows={3} value={aiTopic} onChange={(e) => setAiTopic(e.target.value)} placeholder="مثلاً: ۵ تکنیک برتر سئو برای سال ۲۰۲۶..." className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">لحن نگارش</label>
                <input required value={aiTone} onChange={(e) => setAiTone(e.target.value)} placeholder="مثلاً: حرفه‌ای، صمیمی..." className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">زبان مقاله</label>
                <select value={formData.locale} onChange={(e) => setFormData({...formData, locale: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                  <option value="fa">🇮🇷 فارسی</option>
                  <option value="en">🇬🇧 English</option>
                </select>
              </div>
              <div className="pt-4 flex justify-end gap-3 border-t border-border">
                <button type="button" onClick={() => setIsAIModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm text-muted hover:bg-white/5">انصراف</button>
                <button type="submit" disabled={isGenerating} className="rounded-md bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground disabled:opacity-50">
                  {isGenerating ? "در حال تولید..." : "شروع تولید"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* فرم ذخیره مقاله */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-4xl rounded-2xl border border-border bg-[#292D31] p-6 shadow-2xl my-8">
            <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
              <h2 className="text-xl font-bold text-foreground">{currentPost ? "ویرایش مقاله" : "مقاله جدید"}</h2>
              <button onClick={() => setIsModalOpen(false)} className="text-muted hover:text-red-400">✕</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted">عنوان *</label>
                  <input required value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">آدرس (Slug) *</label>
                  <input required value={formData.slug} onChange={(e) => setFormData({...formData, slug: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" dir="ltr" />
                </div>
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">خلاصه (برای کارت ها)</label>
                <textarea rows={2} value={formData.excerpt} onChange={(e) => setFormData({...formData, excerpt: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none resize-none" />
              </div>
              <div>
                <label className="mb-1 block text-xs text-muted">محتوای اصلی (Markdown پشتیبانی می‌شود)</label>
                <textarea rows={10} required value={formData.content} onChange={(e) => setFormData({...formData, content: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none font-mono text-xs" dir="ltr" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted">دسته‌بندی</label>
                  <input value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">زبان</label>
                  <select value={formData.locale} onChange={(e) => setFormData({...formData, locale: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none">
                    <option value="fa">🇮🇷 فارسی</option>
                    <option value="en">🇬🇧 English</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-xs text-muted">نویسنده</label>
                  <input value={formData.author} onChange={(e) => setFormData({...formData, author: e.target.value})} className="w-full rounded-md border border-border bg-[#111315] px-3 py-2 text-sm text-foreground focus:border-brand focus:outline-none" />
                </div>
              </div>
              <div className="bg-black/20 p-4 rounded-lg border border-border/50 grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="mb-1 block text-xs text-muted">تصویر شاخص</label>
                  <ImageUpload onUpload={(url: string) => setFormData({...formData, image_url: url})} />
                  {formData.image_url && <p className="mt-2 text-xs text-green-400">تصویر آپلود شد</p>}
                </div>
                <div className="flex flex-col justify-center">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" checked={formData.is_published} onChange={(e) => setFormData({...formData, is_published: e.target.checked})} className="h-4 w-4 accent-brand" />
                    <span className="text-sm text-foreground">انتشار مقاله</span>
                  </label>
                </div>
              </div>
              <div className="mt-8 flex justify-end gap-3 border-t border-border pt-4">
                <button type="button" onClick={() => setIsModalOpen(false)} className="rounded-md border border-border px-4 py-2 text-sm font-medium text-muted hover:bg-white/5">انصراف</button>
                <button type="submit" disabled={isSubmitting} className="rounded-md bg-brand px-6 py-2 text-sm font-semibold text-brand-foreground transition hover:opacity-90 disabled:opacity-50">
                  {isSubmitting ? "در حال ذخیره..." : "ذخیره مقاله"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}