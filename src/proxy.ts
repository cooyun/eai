// src/proxy.ts
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

// 注意这里：函数名改成了 proxy，完美适配 Next.js 16
export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 后台路由保护
  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();
    const token = request.cookies.get('admin_token');
    if (token?.value !== 'authenticated') {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // 忽略静态文件和API
  if (pathname.includes('.') || pathname.startsWith('/api') || pathname.startsWith('/_next')) return;

  // 多语言跳转
  const locales = ['en', 'zh'];
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );
  if (pathnameHasLocale) return;

  request.nextUrl.pathname = `/zh${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(request.nextUrl);
}

export const config = { matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'] };