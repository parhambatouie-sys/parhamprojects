export type Post = {
  slug: string;
  title: { fa: string; en: string; };
  excerpt: { fa: string; en: string; };
  content: { fa: string; en: string; };
  date: string;
  readTime: number;
  category: { fa: string; en: string; };
};

export const posts: Post[] = [
  {
    slug: "future-of-web-design",
    title: { 
      fa: "آینده طراحی وب در عصر هوش مصنوعی", 
      en: "The Future of Web Design in the Age of AI" 
    },
    excerpt: { 
      fa: "هوش مصنوعی چطور می‌تواند سرعت طراحی و توسعه وب‌سایت‌های مدرن را متحول کند؟ نگاهی به ابزارهای جدید.", 
      en: "How AI is revolutionizing the speed of modern web design and development. A look at new tools." 
    },
    content: { 
      fa: "هوش مصنوعی دیگر یک ابزار لوکس نیست، بلکه به بخشی جدایی‌ناپذیر از فرآیند طراحی و توسعه تبدیل شده است. از تولید کدهای پایه گرفته تا ساخت تصاویر اختصاصی، هوش مصنوعی به ما اجازه می‌دهد تا روی مسائل پیچیده‌تر و تجربه کاربری تمرکز کنیم.\n\nدر این مقاله به بررسی ابزارهای مختلف و نحوه استفاده از آن‌ها در پروژه‌های واقعی می‌پردازیم. ماژول‌هایی مثل تولید متن، تولید کد و حتی تست خودکار می‌توانند سرعت تحویل پروژه را دو برابر کنند.\n\nنکته مهم این است که هوش مصنوعی جایگزین طراح نمی‌شود، بلکه یک دستیار قدرتمند برای اوست. طراحانی که با این ابزارها کار می‌کنند، در آینده نزدیک مزیت رقابتی بزرگی خواهند داشت.", 
      en: "AI is no longer a luxury tool; it has become an integral part of the design and development process. From generating boilerplate code to creating custom images, AI allows us to focus on complex problems and user experience.\n\nIn this article, we explore various tools and how to use them in real-world projects. Modules like text generation, code generation, and even automated testing can double the speed of project delivery.\n\nThe important point is that AI doesn't replace the designer; it's a powerful assistant. Designers who work with these tools will have a huge competitive advantage in the near future." 
    },
    date: "2026-05-15",
    readTime: 5,
    category: { fa: "هوش مصنوعی", en: "AI" },
  },
  {
    slug: "minimalism-in-ui",
    title: { 
      fa: "چرا مینیمالیسم در رابط کاربری جواب می‌دهد؟", 
      en: "Why Minimalism in UI Works" 
    },
    excerpt: { 
      fa: "بررسی روانشناسی طراحی مینیمال و اینکه چطور کاربران را بیشتر جذب می‌کند و حواس‌پرتی را کم می‌کند.", 
      en: "Exploring the psychology behind minimal design and how it attracts more users while reducing distractions." 
    },
    content: { 
      fa: "طراحی مینیمال به معنای خالی بودن نیست، بلکه به معنای حذف موارد غیرضروری برای برجسته‌سازی موارد ضروری است. وقتی یک صفحه وب شلوغ است، مغز کاربر برای پردازش اطلاعات دچار اضافه‌بار می‌شود.\n\nبا استفاده از فضای خالی (Whitespace)، تایپوگرافی مناسب و پرهیز از رنگ‌های زیاد، می‌توانیم توجه کاربر را دقیقاً به جایی جلب کنیم که می‌خواهیم؛ مثلاً دکمه ثبت سفارش.\n\nشرکت‌های بزرگ مثل Apple و Vercel سال‌هاست که از این اصل استفاده می‌کنند و نتایج فوق‌العاده‌ای گرفته‌اند.", 
      en: "Minimal design doesn't mean empty; it means removing the unnecessary to highlight the necessary. When a web page is cluttered, the user's brain experiences cognitive overload.\n\nUsing whitespace, proper typography, and avoiding too many colors, we can direct the user's attention exactly where we want it; for example, the order button.\n\nCompanies like Apple and Vercel have used this principle for years with incredible results." 
    },
    date: "2026-04-10",
    readTime: 3,
    category: { fa: "طراحی وب", en: "Web Design" },
  },
  {
    slug: "nextjs-performance",
    title: { 
      fa: "چطور سرعت سایت Next.js خود را بهینه کنیم؟", 
      en: "How to Optimize Your Next.js Website Speed" 
    },
    excerpt: { 
      fa: "راهکارهای عملی برای رسیدن به نمره ۱۰۰ در Google PageSpeed با استفاده از قابلیت‌های داخلی Next.js.", 
      en: "Practical tips to hit 100 on Google PageSpeed using Next.js built-in features." 
    },
    content: { 
      fa: "سرعت سایت یکی از مهم‌ترین فاکتورهای سئو و تجربه کاربری است. خوشبختانه Next.js ابزارهای بسیار قدرتمندی برای این کار دارد.\n\nاولین قدم استفاده از کامپوننت next/image برای بهینه‌سازی خودکار تصاویر و فرمت‌های مدرن مثل WebP است. قدم دوم، استفاده از dynamic imports برای کاهش حجم جاوااسکریپت اولیه است.\n\nهمچنین با استفاده از Server Components (که در App Router پیش‌فرض است)، می‌توانیم حجم کدی که به مرورگر فرستاده می‌شود را به حداقل برسانیم.", 
      en: "Website speed is one of the most important SEO and user experience factors. Fortunately, Next.js has powerful tools for this.\n\nThe first step is using the next/image component for automatic image optimization and modern formats like WebP. The second step is using dynamic imports to reduce the initial JavaScript bundle size.\n\nAlso, by using Server Components (default in App Router), we can minimize the amount of code sent to the browser." 
    },
    date: "2026-03-22",
    readTime: 6,
    category: { fa: "توسعه وب", en: "Web Dev" },
  },
  {
    slug: "seo-for-freelancers",
    title: { 
      fa: "سئو برای فریلنسرها: چطور اولین مشتری خارجی را جذب کنیم؟", 
      en: "SEO for Freelancers: How to Attract Your First International Client" 
    },
    excerpt: { 
      fa: "سئوی بین‌المللی نیازی به جادو ندارد. با رعایت این اصول ساده، در نتایج گوگل دیده شوید.", 
      en: "International SEO doesn't require magic. Follow these simple principles to get seen on Google." 
    },
    content: { 
      fa: "برای جذب مشتری خارجی، فقط داشتن یک سایت زیبا کافی نیست. مشتری باید بتواند شما را در گوگل پیدا کند.\n\nاستفاده از تگ‌های Hreflang به گوگل می‌گوید که نسخه انگلیسی سایت شما برای مخاطبان خارجی است. همچنین تولید محتوای تخصصی به زبان انگلیسی (مثل همین مقالات) باعث می‌شود ربات‌های گوگل سایت شما را به عنوان یک مرجع بشناسند.\n\nنکته آخر، سرعت لود سایت است. اگر سایت شما در آمریکا یا اروپا کند باز شود، مشتری خارجی بلافاصله آن را می‌بندد.", 
      en: "To attract an international client, just having a beautiful website isn't enough. The client must be able to find you on Google.\n\nUsing Hreflang tags tells Google that your English version is for international audiences. Also, producing specialized content in English (like these articles) makes Google bots recognize your site as an authority.\n\nThe last tip is site load speed. If your site opens slowly in the US or Europe, the international client will immediately close it." 
    },
    date: "2026-02-05",
    readTime: 4,
    category: { fa: "سئو", en: "SEO" },
  },
];