export type Post = {
  slug: string;
  title: { fa: string; en: string; };
  excerpt: { fa: string; en: string; };
  content: { fa: string; en: string; };
  date: string;
  readTime: number;
};

export const posts: Post[] = [
  {
    slug: "future-of-web-design",
    title: { fa: "آینده طراحی وب در عصر هوش مصنوعی", en: "The Future of Web Design in the Age of AI" },
    excerpt: { fa: "هوش مصنوعی چطور می‌تواند سرعت طراحی و توسعه وب‌سایت‌های مدرن را متحول کند؟", en: "How AI is revolutionizing the speed of modern web design and development." },
    content: { fa: "هوش مصنوعی دیگر یک ابزار لوکس نیست، بلکه به بخشی جدایی‌ناپذیر از فرآیند طراحی و توسعه تبدیل شده است. از تولید کدهای پایه گرفته تا ساخت تصاویر اختصاصی، هوش مصنوعی به ما اجازه می‌دهد تا روی مسائل پیچیده‌تر و تجربه کاربری تمرکز کنیم...\n\nدر این مقاله به بررسی ابزارهای مختلف و نحوه استفاده از آن‌ها در پروژه‌های واقعی می‌پردازیم.", en: "AI is no longer a luxury tool; it has become an integral part of the design and development process. From generating boilerplate code to creating custom images, AI allows us to focus on complex problems and user experience...\n\nIn this article, we explore various tools and how to use them in real-world projects." },
    date: "2024-05-15",
    readTime: 5,
  },
  {
    slug: "minimalism-in-ui",
    title: { fa: "چرا مینیمالیسم در رابط کاربری جواب می‌دهد؟", en: "Why Minimalism in UI Works" },
    excerpt: { fa: "بررسی روانشناسی طراحی مینیمال و اینکه چطور کاربران را بیشتر جذب می‌کند.", en: "Exploring the psychology behind minimal design and how it attracts more users." },
    content: { fa: "طراحی مینیمال به معنای خالی بودن نیست، بلکه به معنای حذف موارد غیرضروری برای برجسته‌سازی موارد ضروری است...", en: "Minimal design doesn't mean empty; it means removing the unnecessary to highlight the necessary..." },
    date: "2024-04-10",
    readTime: 3,
  },
];