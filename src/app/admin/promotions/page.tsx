import { PrismaClient } from '@prisma/client';
import { Activity, ExternalLink, Link as LinkIcon, AlertCircle } from 'lucide-react';
import PromotionsClient from './PromotionsClient';

const prisma = new PrismaClient();

export default async function PromotionsPage() {
  const tools = await prisma.tool.findMany({
    where: { isFeatured: true },
    orderBy: { createdAt: 'desc' }
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Activity className="w-8 h-8 text-indigo-600" /> 推广与高佣金工具管理
        </h1>
        <p className="text-slate-500 mt-2 font-medium">这里展示了所有标记为“推广/推荐” (isFeatured) 的工具。您可以使用自动采集功能来补充它们的推广/分销 (Affiliate) 链接以赚取佣金。</p>
      </div>
      
      {tools.length === 0 ? (
        <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center flex flex-col items-center justify-center">
          <AlertCircle className="w-12 h-12 text-slate-300 mb-4" />
          <h2 className="text-xl font-bold text-slate-700 mb-2">暂无推广工具</h2>
          <p className="text-slate-500 max-w-md">您尚未在工具库中将任何工具标记为“核心推荐/推广”。请前往 <a href="/admin/tools" className="text-indigo-600 underline">工具库管理</a> 进行设置。</p>
        </div>
      ) : (
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
          <table className="min-w-full divide-y divide-slate-100">
            <thead className="bg-slate-50/50">
              <tr>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">工具名称</th>
                <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">当前链接 (URL)</th>
                <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">高佣链接操作</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 bg-white">
              <PromotionsClient tools={tools} />
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
