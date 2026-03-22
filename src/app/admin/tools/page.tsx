import { PrismaClient } from '@prisma/client';
import { addTool, deleteTool } from '../actions';
import { Trash2, ExternalLink, PlusCircle, LayoutGrid, Image as ImageIcon } from 'lucide-react';

import SubmitButton from '../components/SubmitButton';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

async function fixToolLogosAndCategories() {
  'use server'
  const tools = await prisma.tool.findMany({ where: { OR: [{ logoUrl: "" }, { logoUrl: null }] } });
  for (const t of tools) {
     let dHost = '';
     try { dHost = new URL(t.url).hostname; } catch(e) { dHost = t.url.replace(/^https?:\/\//, '').split('/')[0]; }
     const clLogo = `https://logo.clearbit.com/${dHost}`;
     await prisma.tool.update({ where: { id: t.id }, data: { logoUrl: clLogo } });
  }
  revalidatePath('/admin/tools');
}

export default async function ToolsPage() {
  const tools = await prisma.tool.findMany({ include: { category: true }, orderBy: { createdAt: 'desc' } });
  const categories = await prisma.category.findMany();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">产品库管理</h1>
          <p className="text-slate-500 mt-1">添加带有专属推广链接的 AI 工具以实现盈利。</p>
        </div>
        
        <form action={fixToolLogosAndCategories}>
          <SubmitButton 
            className="flex items-center gap-2 bg-indigo-50 text-indigo-700 border border-indigo-200 hover:bg-indigo-100 hover:text-indigo-800 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            pendingText="正在检测并修复全库数据..."
          >
            <ImageIcon className="w-4 h-4" /> 一键自动检测并修复Logo及缺失项
          </SubmitButton>
        </form>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60">
        <div className="flex items-center gap-2 mb-6">
          <PlusCircle className="w-5 h-5 text-indigo-600" />
          <h2 className="text-xl font-bold text-slate-800">发布新资产</h2>
        </div>
        
        {categories.length === 0 ? (
          <p className="text-rose-600 text-sm font-medium bg-rose-50 p-4 rounded-xl border border-rose-100">⚠ 请先在左侧“分类管理”中创建至少一个类别。</p>
        ) : (
          <form action={addTool} className="grid grid-cols-1 md:grid-cols-3 gap-x-6 gap-y-5">
            <div className="space-y-1 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">产品名称 <span className="text-rose-500">*</span></label>
              <input type="text" name="name" required placeholder="如: Midjourney" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white" />
            </div>
            
            <div className="space-y-1 md:col-span-2">
              <label className="text-sm font-semibold text-slate-700">目标 URL / Affiliate 推广链接 <span className="text-rose-500">*</span></label>
              <input type="url" name="url" required placeholder="https://..." className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white" />
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1"><ImageIcon className="w-4 h-4 text-slate-400"/> Logo 图标地址</label>
              <input type="url" name="logoUrl" placeholder="图片直链 (非必填)" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white" />
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">所属赛道分类 <span className="text-rose-500">*</span></label>
              <select name="categoryId" required className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white cursor-pointer">
                {categories.map((cat) => <option key={cat.id} value={cat.id}>{cat.nameZh} ({cat.nameEn})</option>)}
              </select>
            </div>

            <div className="space-y-1 md:col-span-1">
              <label className="text-sm font-semibold text-slate-700">商业模式</label>
              <select name="pricing" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white cursor-pointer">
                <option value="Freemium">免费增值 (Freemium)</option>
                <option value="Free">完全免费 (Free)</option>
                <option value="Paid">需付费 (Paid)</option>
              </select>
            </div>

            <div className="space-y-1 md:col-span-3 mt-2 border-t border-slate-100 pt-4">
              <label className="flex items-center gap-3 cursor-pointer p-4 border border-indigo-100 bg-indigo-50/50 rounded-xl hover:bg-indigo-50 transition-colors">
                <div className="relative flex items-center">
                  <input type="checkbox" name="isFeatured" className="w-5 h-5 border-slate-300 rounded text-indigo-600 focus:ring-indigo-500 cursor-pointer" />
                </div>
                <div>
                  <span className="block text-sm font-bold text-indigo-900">推荐并置顶此资产 (Featured)</span>
                  <span className="block text-xs text-indigo-600/70 mt-0.5">将显示在首页最上方并带有特殊 UI 样式，适合放置高佣金产品。</span>
                </div>
              </label>
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">SEO 优化中文描述 <span className="text-rose-500">*</span></label>
              <textarea name="descZh" required rows={2} placeholder="用一两句话说明它能解决什么痛点..." className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"></textarea>
            </div>

            <div className="space-y-1 md:col-span-3">
              <label className="text-sm font-semibold text-slate-700">Global Market English Description <span className="text-rose-500">*</span></label>
              <textarea name="descEn" required rows={2} placeholder="Explain the value proposition in English..." className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 outline-none transition-all bg-slate-50 focus:bg-white"></textarea>
            </div>

            <div className="md:col-span-3 flex justify-end mt-2">
              <button type="submit" className="bg-slate-900 hover:bg-indigo-600 text-white px-8 py-3 rounded-xl transition-all font-bold shadow-lg shadow-slate-900/20 hover:shadow-indigo-600/20 active:scale-95">
                确认发布至生产环境
              </button>
            </div>
          </form>
        )}
      </div>

      {/* 数据表格区域 */}
      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
  <tr>
    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">资产详情</th>
    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">归属赛道</th>
    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">市场热度</th>
    <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase tracking-wider">推荐评级</th>
    <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase tracking-wider">风险操作</th>
  </tr>

  <tr className="border-t border-slate-100">
    <th colSpan={5} className="px-6 py-3 text-left text-xs font-medium text-slate-400">
      提示：Featured 适合放高佣金/可赞助产品；“市场热度”当前使用 upvotes（可后续升级为点击/转化）。
    </th>
  </tr>
</thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            {tools.map((tool) => (
              <tr key={tool.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-5">
                  <div className="flex items-center">
                    <div>
                      <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                        {tool.name}
                        <a href={tool.url} target="_blank" className="text-slate-400 hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity">
                          <ExternalLink className="h-3.5 w-3.5" />
                        </a>
                      </div>
                      <div className="text-xs text-slate-500 mt-1 max-w-[250px] truncate">{tool.descZh}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-slate-100 text-slate-600 border border-slate-200/60">
                    {tool.category.nameZh} / {tool.category.nameEn}
                  </span>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  <div className="text-sm font-medium text-slate-900 flex items-center gap-1.5">
                    <span className="text-emerald-500 font-black">↑</span> {tool.upvotes}
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{tool.pricing}</div>
                </td>
                <td className="px-6 py-5 whitespace-nowrap">
                  {tool.isFeatured ? (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-bold rounded-md bg-indigo-50 text-indigo-700 border border-indigo-100">
                      首页置顶
                    </span>
                  ) : (
                    <span className="px-2 py-1 inline-flex text-xs leading-5 font-medium rounded-md bg-slate-50 text-slate-500 border border-slate-100">
                      常规收录
                    </span>
                  )}
                </td>
                <td className="px-6 py-5 whitespace-nowrap text-right text-sm font-medium">
                  <form action={deleteTool.bind(null, tool.id)}>
                    <button type="submit" className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors" title="永久删除">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </td>
              </tr>
            ))}
            {tools.length === 0 && (
              <tr>
                <td colSpan={5} className="px-6 py-16 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <LayoutGrid className="h-8 w-8 text-slate-300" />
                    <p className="font-medium mt-2">产品库空空如也，您的数字资产正在等待充值</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
