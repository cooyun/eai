import './globals.css';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function generateMetadata() {
  const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
  
  return {
    title: {
      template: `%s | ${settings?.siteName || 'AI Directory'}`,
      default: settings?.siteName || 'AI Directory',
    },
    description: settings?.seoDescZh || 'AI tools directory.',
    keywords: settings?.seoKeywords?.split(',').map((k: string) => k.trim()) || ['AI Tools', 'AI Directory'],
    metadataBase: new URL(`https://${settings?.domain || 'yourdomain.com'}`),
    alternates: {
      canonical: '/',
      languages: {
        'en-US': '/en',
        'zh-CN': '/zh',
      },
    },
    openGraph: {
      title: settings?.siteName || 'AI Directory',
      description: settings?.seoDescZh || 'AI tools directory.',
      url: `https://${settings?.domain || 'yourdomain.com'}`,
      siteName: settings?.siteName || 'AI Directory',
      locale: 'zh_CN',
      type: 'website',
    },
    verification: {
      google: settings?.googleVerifyCode || undefined,
      yahoo: settings?.bingVerifyCode || undefined,
      other: {
        'baidu-site-verification': settings?.baiduVerifyCode ? [settings.baiduVerifyCode] : [],
      },
    },
  };
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html suppressHydrationWarning>
      <body suppressHydrationWarning>{children}</body>
    </html>
  );
}
