import { PrismaClient } from '@prisma/client';
import { Search, Globe, Target } from 'lucide-react';
import SEOClient from './SEOClient';

const prisma = new PrismaClient();

export default async function SEOPage() {
  const settings = await prisma.setting.findUnique({ where: { id: 'global_setting' } });

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Search className="w-8 h-8 text-emerald-600" /> 搜索引擎收录管理 (SEO)
        </h1>
        <p className="text-slate-500 mt-2 font-medium">利用 AI 自动分析网站关键词，一键验证并推送 URL 收录至 Google、Bing 等大厂搜索引擎。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SEOClient initialKeywords={settings?.seoKeywords || ''} />

        <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl"><Globe className="w-6 h-6" /></div>
              <h2 className="text-xl font-bold text-slate-800">站点所有权验证情况</h2>
            </div>
            <p className="text-slate-500 text-sm mb-6 leading-relaxed">如果尚未验证，搜索引擎很难索引您的网站。您可以在设置中配置平台各自的 HTML Meta Code，前端会自动集成。</p>
            
            <ul className="space-y-4">
              <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700">Google Search Console</span>
                {settings?.googleVerifyCode ? <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">✅ 已配置验证码</span> : <span className="text-rose-500 font-bold bg-rose-50 px-3 py-1 rounded-full text-xs">❌ 未配置验证码</span>}
              </li>
              <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700">Bing Webmaster</span>
                {settings?.bingVerifyCode ? <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">✅ 已配置验证码</span> : <span className="text-rose-500 font-bold bg-rose-50 px-3 py-1 rounded-full text-xs">❌ 未配置验证码</span>}
              </li>
              <li className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100">
                <span className="font-bold text-slate-700">Baidu Webmaster</span>
                {settings?.baiduVerifyCode ? <span className="text-emerald-600 font-bold bg-emerald-50 px-3 py-1 rounded-full text-xs">✅ 已配置验证码</span> : <span className="text-rose-500 font-bold bg-rose-50 px-3 py-1 rounded-full text-xs">❌ 未配置验证码</span>}
              </li>
            </ul>
          </div>
          
          <div className="mt-8 pt-6 border-t border-slate-100">
            <a href="/admin/settings" className="block text-center bg-slate-900 text-white font-bold py-3 rounded-xl hover:bg-slate-800 transition shadow">
              前往「系统设置」填写或修改验证码
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
