// middleware.ts  (放在仓库根目录)
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(req: NextRequest) {
  const { pathname, search } = req.nextUrl;
  // 放行静态资源/API
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/favicon') ||
    pathname.startsWith('/assets') ||
    pathname.startsWith('/public')
  ) {
    return NextResponse.next();
  }

  const isAuthed = req.cookies.get('mc_auth')?.value === '1';

  // 未登录访问首页 -> /login
  if (pathname === '/' && !isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = '/login';
    url.search = search;
    return NextResponse.redirect(url);
  }

  // 已登录访问登录页 -> /
  if (pathname === '/login' && isAuthed) {
    const url = req.nextUrl.clone();
    url.pathname = '/';
    url.search = search;
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/', '/login'],
};