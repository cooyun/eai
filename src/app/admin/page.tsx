import { PrismaClient } from '@prisma/client';
import { Activity, LayoutGrid, Link as LinkIcon, TrendingUp, ExternalLink } from 'lucide-react';
import Link from 'next/link';

const prisma = new PrismaClient();

export default async function AdminDashboard() {
  const toolCount = await prisma.tool.count();
  const catCount = await prisma.category.count();
  const featuredCount = await prisma.tool.count({ where: { isFeatured: true } });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">商业洞察看板</h1>
          <p className="text-slate-500 mt-1">欢迎回来，这是您的资产核心数据。</p>
        </div>
        <Link href="/" target="_blank" className="flex items-center gap-2 bg-white border border-slate-200 text-slate-700 px-4 py-2 rounded-xl hover:bg-slate-50 transition shadow-sm font-medium text-sm">
          <ExternalLink className="w-4 h-4" /> 前台预览
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
          <div className="absolute right-0 top-0 p-4 opacity-10"><LayoutGrid className="w-16 h-16" /></div>
          <p className="text-sm font-medium text-slate-500 mb-1">活跃工具库</p>
          <p className="text-4xl font-black text-slate-900">{toolCount}</p>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm relative overflow-hidden">
           <div className="absolute right-0 top-0 p-4 opacity-10"><LinkIcon className="w-16 h-16" /></div>
          <p className="text-sm font-medium text-slate-500 mb-1">核心分类</p>
          <p className="text-4xl font-black text-slate-900">{catCount}</p>
        </div>
        <Link href="/admin/promotions" className="bg-gradient-to-br from-indigo-600 to-violet-600 p-6 rounded-2xl shadow-md relative overflow-hidden text-white md:col-span-2 block hover:scale-[1.02] transition-transform cursor-pointer">
           <div className="absolute right-0 top-0 p-4 opacity-20"><Activity className="w-24 h-24" /></div>
          <p className="text-sm font-medium text-indigo-100 mb-1">推广/高佣金工具 (点击管理)</p>
          <p className="text-4xl font-black">{featuredCount}</p>
        </Link>
      </div>
    </div>
  );
}
