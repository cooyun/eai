import Link from 'next/link';
import { logoutAdmin } from './actions';
import { cookies } from 'next/headers';

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const isLoggedIn = cookieStore.get('admin_token')?.value === 'authenticated';

  return (
    <div className="flex h-screen bg-gray-50 font-sans">
      {isLoggedIn && (
        <aside className="w-64 bg-slate-900 text-slate-300 flex flex-col shadow-2xl z-20">
          <div className="h-16 flex items-center justify-center border-b border-slate-800 text-xl font-black text-white tracking-wider">
            管理控制台
          </div>
          <nav className="flex-1 px-4 py-6 space-y-2">
            <Link href="/admin" className="block px-4 py-3 rounded-lg hover:bg-indigo-600 hover:text-white transition font-medium">📊 系统概览</Link>
            <Link href="/admin/categories" className="block px-4 py-3 rounded-lg hover:bg-indigo-600 hover:text-white transition font-medium">📂 分类管理</Link>
            <Link href="/admin/autopilot" className="block px-4 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition font-bold text-emerald-400 bg-emerald-900/40 border border-emerald-800/50 mb-2 mt-4 shadow-lg">✨ AI 全自动采集引擎</Link>
            <Link href="/admin/settings" className="block px-4 py-3 rounded-xl hover:bg-indigo-600 hover:text-white transition font-medium">⚙️ 全局商业配置</Link>
            <Link href="/admin/seo" className="block px-4 py-3 rounded-lg hover:bg-indigo-600 hover:text-white transition font-medium">🔍 收录管理 (SEO)</Link>
            <Link href="/admin/tools" className="block px-4 py-3 rounded-lg hover:bg-indigo-600 hover:text-white transition font-medium">🤖 AI 工具库</Link>
          </nav>
          <div className="p-4 border-t border-slate-800">
            <form action={logoutAdmin}>
              <button type="submit" className="w-full text-left px-4 py-2 text-rose-400 hover:bg-slate-800 rounded-lg transition font-medium">退出登录</button>
            </form>
          </div>
        </aside>
      )}
      <main className="flex-1 overflow-y-auto p-10 bg-gray-50">
        {children}
      </main>
    </div>
  );
}
