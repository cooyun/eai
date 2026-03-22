import { PrismaClient } from '@prisma/client';
import { addCategory, deleteCategory, updateCategory, autoFillCategory } from '../actions';
import { FolderPlus, Hash, Wand2 } from 'lucide-react';
import CategoryListClient from './CategoryListClient';

import { revalidatePath } from 'next/cache';
import SubmitButton from '../components/SubmitButton';

const prisma = new PrismaClient();

async function autoFixAllCategories() {
  'use server'
  const cats = await prisma.category.findMany({
    where: {
      OR: [
        { descZh: "" },
        { descZh: null },
        { descEn: "" },
        { descEn: null },
        { nameEn: "" }
      ]
    }
  });
  
  for (const c of cats) {
    if (!c.descZh || !c.descEn || !c.nameEn) {
       await autoFillCategory(c.id, c.nameZh);
    }
  }
}

export default async function CategoriesPage() {
  const categories = await prisma.category.findMany({ 
    include: { _count: { select: { tools: true } } },
    orderBy: { createdAt: 'desc' } 
  });

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900 tracking-tight">内容赛道配置</h1>
          <p className="text-slate-500 mt-1">设置正确的分类有助于 SEO 排名和流量精准转化。</p>
        </div>
        
        <form action={autoFixAllCategories}>
          <SubmitButton 
            className="flex items-center gap-2 bg-amber-50 text-amber-700 border border-amber-200 hover:bg-amber-100 hover:text-amber-800 px-4 py-2 rounded-xl text-sm font-bold transition-colors"
            pendingText="正在请求 AI 检测补全..."
          >
            <Wand2 className="w-4 h-4" /> 一键自动检测并修复所有分类本地化缺失项
          </SubmitButton>
        </form>
      </div>
      
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-200/60 flex flex-col md:flex-row gap-8 items-start">
        <div className="w-full md:w-1/3">
          <div className="flex items-center gap-2 mb-2">
            <FolderPlus className="w-5 h-5 text-emerald-600" />
            <h2 className="text-xl font-bold text-slate-800">新建分类轴</h2>
          </div>
          <p className="text-sm text-slate-500 mb-6 leading-relaxed">分类别名 (Slug) 将直接出现在您的域名 URL 中，例如 yourdomain.com/en/category/ai-writing，请务必使用英文和小写连字符。</p>
        </div>
        
        <div className="w-full md:w-2/3">
          <form action={addCategory} className="bg-slate-50 p-6 rounded-2xl border border-slate-100 space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                <Hash className="w-4 h-4 text-slate-400"/> URL 路由别名 (Slug)
              </label>
              <input type="text" name="slug" required placeholder="如: video-generation" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all focus:bg-white" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">中文名称</label>
                <input type="text" name="nameZh" required placeholder="如: AI 视频生成" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all focus:bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">英文名称 (SEO 关键)</label>
                <input type="text" name="nameEn" required placeholder="如: AI Video Generators" className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all focus:bg-white" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">中文简介 (SEO Meta)</label>
                <input type="text" name="descZh" placeholder="针对该品类的详细介绍..." className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all focus:bg-white" />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-semibold text-slate-700">英文简介 (SEO Meta)</label>
                <input type="text" name="descEn" placeholder="Description for SEO metadata..." className="w-full border border-slate-200 rounded-xl p-3 text-sm focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 outline-none transition-all focus:bg-white" />
              </div>
            </div>
            <div className="pt-2">
              <button type="submit" className="w-full bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-emerald-600 transition-all font-bold shadow-md hover:shadow-emerald-600/20 active:scale-95">
                创建新赛道
              </button>
            </div>
          </form>
        </div>
      </div>

      <div className="bg-white rounded-3xl shadow-sm border border-slate-200/60 overflow-hidden">
        <table className="min-w-full divide-y divide-slate-100">
          <thead className="bg-slate-50/50">
            <tr>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">路由 / URL Slug</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">本地化展现 (中/英)</th>
              <th className="px-6 py-4 text-left text-xs font-bold text-slate-500 uppercase">收录资产数</th>
              <th className="px-6 py-4 text-right text-xs font-bold text-slate-500 uppercase">管理操作</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 bg-white">
            <CategoryListClient 
              categories={categories} 
              deleteAction={deleteCategory} 
              updateAction={updateCategory} 
              autoFillAction={autoFillCategory}
            />
          </tbody>
        </table>
      </div>
    </div>
  );
}
