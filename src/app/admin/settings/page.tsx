"use client";
import { useState, useEffect } from 'react';
import { updateSettings, aiCleanData, getSettings } from './actions';
import { Settings2, Megaphone, Globe, Mail, Wand2, RefreshCw, CheckCircle2 } from 'lucide-react';

export const maxDuration = 60; // Set Vercel maxDuration to 60 seconds

export default function SettingsPage() {
  const [loading, setLoading] = useState(false);
  const [cleanLoading, setCleanLoading] = useState(false);
  const [cleanCount, setCleanCount] = useState(5);
  const [msg, setMsg] = useState('');
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    getSettings().then(data => {
      if (data) setSettings(data);
    });
  }, []);

  const handleClean = async () => {
    setCleanLoading(true);
    try {
      const res = await aiCleanData(cleanCount);
      setMsg(res.message);
    } catch(e: any) { setMsg(e.message); }
    setCleanLoading(false);
  };

  if (!settings) return <div className="p-10 text-center text-slate-500 font-bold">加载配置中...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Settings2 className="w-8 h-8 text-indigo-600" /> 全局商业配置 (一键接管)
        </h1>
        <p className="text-slate-500 mt-2 font-medium">配置网站的基础信息、SEO、以及所有商业化广告代码。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 全局设置表单 */}
        <form action={async (formData) => {
          setLoading(true);
          await updateSettings(formData);
          setLoading(false);
          setMsg("✅ 网站全局配置更新成功！前台已生效！");
        }} className="bg-white rounded-3xl p-8 shadow-sm border border-slate-200/60 space-y-6">
          <h2 className="text-xl font-bold text-slate-800 border-b pb-3 flex items-center gap-2"><Globe className="w-5 h-5"/> 站点信息与 SEO</h2>
          
          <div className="space-y-4">
            <div>
              <label className="text-sm font-semibold text-slate-700">网站名称 (Logo 文字)</label>
              <input type="text" name="siteName" placeholder="如: AI Directory" defaultValue={settings.siteName} className="mt-1 w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">主域名 (无 https://)</label>
              <input type="text" name="domain" placeholder="如: mydomain.com" defaultValue={settings.domain} className="mt-1 w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 flex items-center gap-1"><Mail className="w-4 h-4"/> 联系/商务邮箱</label>
              <input type="email" name="contactEmail" placeholder="admin@domain.com" defaultValue={settings.contactEmail} className="mt-1 w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">全局动态节日主题自动切换 (中美主要节日)</label>
              <label className="flex items-center gap-2 cursor-pointer mt-1">
                <input type="checkbox" name="holidayThemeAuto" defaultChecked={settings.holidayThemeAuto !== false} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-slate-800">启用全站节日装扮自动切换 (推荐)</span>
              </label>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">SEO 主标题描述 (中)</label>
              <input type="text" name="seoDescZh" defaultValue={settings.seoDescZh} className="mt-1 w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700">SEO 核心关键词</label>
              <input type="text" name="seoKeywords" defaultValue={settings.seoKeywords} placeholder="如: AI导航, 人工智能工具, AI工具" className="mt-1 w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white" />
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">各搜索引擎收录代码 (Verify Code)</label>
              <div className="space-y-2">
                <input type="text" name="googleVerifyCode" defaultValue={settings.googleVerifyCode} placeholder="Google 验证代码" className="w-full border border-slate-200 rounded-xl p-3 text-sm" />
                <input type="text" name="bingVerifyCode" defaultValue={settings.bingVerifyCode} placeholder="Bing 验证代码" className="w-full border border-slate-200 rounded-xl p-3 text-sm" />
                <input type="text" name="baiduVerifyCode" defaultValue={settings.baiduVerifyCode} placeholder="Baidu 验证代码" className="w-full border border-slate-200 rounded-xl p-3 text-sm" />
              </div>
            </div>
          </div>

          <h2 className="text-xl font-bold text-slate-800 border-b pb-3 mt-8 flex items-center gap-2"><Megaphone className="w-5 h-5"/> 商业变现模块</h2>
          <div className="space-y-4">
            <div>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" name="adSenseEnabled" defaultChecked={settings.adSenseEnabled} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                <span className="text-sm font-bold text-slate-800">开启 Google AdSense 广告</span>
              </label>
            </div>
            <div>
              <label className="text-sm font-semibold text-slate-700 block mb-1">Google AdSense 代码</label>
              <textarea name="adSenseCode" rows={3} defaultValue={settings.adSenseCode} placeholder="<script async src='...'" className="w-full border border-slate-200 rounded-xl p-3 focus:ring-2 focus:ring-indigo-500 outline-none bg-slate-50 focus:bg-white font-mono text-xs"></textarea>
            </div>
            
            <div className="border-t border-slate-200 mt-6 pt-6">
              <div className="mb-4 bg-indigo-50/50 border border-indigo-100 p-4 rounded-xl text-indigo-700 text-sm">
                <p className="font-bold flex items-center gap-2"><Globe className="w-4 h-4"/> 推荐高佣金联盟 (获取广告代码/推广链接)</p>
                <div className="mt-2 text-xs flex flex-wrap gap-3">
                  <a href="https://partnernetwork.amazon.com/" target="_blank" className="font-bold hover:underline py-1">Amazon Associates</a>
                  <a href="https://www.impact.com/" target="_blank" className="font-bold hover:underline py-1">Impact Radius</a>
                  <a href="https://www.shareasale.com/" target="_blank" className="font-bold hover:underline py-1">ShareASale</a>
                  <a href="https://www.clickbank.com/" target="_blank" className="font-bold hover:underline py-1">ClickBank</a>
                </div>
              </div>
              
              <h3 className="font-bold text-slate-800 mb-2 mt-4">精准广告位配置与占位 (支持代码或自定图片)</h3>

              {/* 源生自定义广告保留 (兼容旧版数据) */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <h4 className="font-bold text-slate-700 mb-3 text-sm flex gap-2">🎯 全局统一覆盖自定义广告 (旧版功能保留)</h4>
                <div className="space-y-3">
                  <div>
                    <label className="flex items-center gap-2 cursor-pointer mb-2">
                       <input type="checkbox" name="customAdEnabled" defaultChecked={settings.customAdEnabled} className="w-5 h-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                       <span className="text-xs font-bold text-slate-800">强制启用旧版全局占位推广</span>
                    </label>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="customAdImageUrl" defaultValue={settings.customAdImageUrl} placeholder="全局推广横幅图片链接 (1000x200)" className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500" />
                    <input type="text" name="customAdLink" defaultValue={settings.customAdLink} placeholder="用户点击后跳转的引流链接" className="w-full border border-slate-200 rounded-lg p-2 text-xs focus:ring-1 focus:ring-indigo-500" />
                  </div>
                </div>
              </div>

              {/* 首页广告 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-700 text-sm flex gap-2">🕹️ 首页横幅广告预留位</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="homeAdEnabled" defaultChecked={settings.homeAdEnabled !== false} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs font-bold text-slate-600">在此处开启</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">广告联盟代码 (JS/HTML 片段, 留空则显示图片)</label>
                    <textarea name="homeAdCode" rows={2} defaultValue={settings.homeAdCode} className="w-full border border-slate-200 rounded-xl p-2 font-mono text-xs focus:ring-1 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="homeAdImage" defaultValue={settings.homeAdImage} placeholder="默认降级: 横幅图片链接" className="w-full border border-slate-200 rounded-lg p-2 text-xs" />
                    <input type="text" name="homeAdLink" defaultValue={settings.homeAdLink} placeholder="图片点击跳转链接" className="w-full border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                </div>
              </div>

              {/* 详情页广告 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 mb-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-700 text-sm flex gap-2">📄 详情页面广告预留位</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="detailAdEnabled" defaultChecked={settings.detailAdEnabled !== false} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs font-bold text-slate-600">在此处开启</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">广告联盟代码</label>
                    <textarea name="detailAdCode" rows={2} defaultValue={settings.detailAdCode} className="w-full border border-slate-200 rounded-xl p-2 font-mono text-xs focus:ring-1 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="detailAdImage" defaultValue={settings.detailAdImage} placeholder="详情页图片链接" className="w-full border border-slate-200 rounded-lg p-2 text-xs" />
                    <input type="text" name="detailAdLink" defaultValue={settings.detailAdLink} placeholder="点击跳转链接" className="w-full border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                </div>
              </div>

              {/* 侧边栏/浮动广告 */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                <div className="flex justify-between items-center mb-3">
                  <h4 className="font-bold text-slate-700 text-sm flex gap-2">🖼️ 全局侧边悬浮广告区 (规划中)</h4>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input type="checkbox" name="sidebarAdEnabled" defaultChecked={settings.sidebarAdEnabled !== false} className="w-4 h-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500" />
                    <span className="text-xs font-bold text-slate-600">在此处开启</span>
                  </label>
                </div>
                <div className="space-y-3">
                  <div>
                    <label className="text-xs font-semibold text-slate-600">广告联盟代码</label>
                    <textarea name="sidebarAdCode" rows={2} defaultValue={settings.sidebarAdCode} className="w-full border border-slate-200 rounded-xl p-2 font-mono text-xs focus:ring-1 focus:ring-indigo-500"></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <input type="text" name="sidebarAdImage" defaultValue={settings.sidebarAdImage} placeholder="侧边正方形图片链接" className="w-full border border-slate-200 rounded-lg p-2 text-xs" />
                    <input type="text" name="sidebarAdLink" defaultValue={settings.sidebarAdLink} placeholder="点击跳转链接" className="w-full border border-slate-200 rounded-lg p-2 text-xs" />
                  </div>
                </div>
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading} className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-indigo-600 transition-all shadow-lg active:scale-95 flex items-center justify-center">
            {loading ? <RefreshCw className="w-5 h-5 animate-spin"/> : '保存配置并全站生效'}
          </button>
        </form>

        {/* AI 数据清洗机面板 */}
        <div className="bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex flex-col justify-between">
          <div className="absolute right-0 top-0 p-8 opacity-10"><Wand2 className="w-48 h-48 text-white" /></div>
          
          <div className="relative z-10">
            <h2 className="text-xl font-bold text-white mb-2">✨ 智能内容大修机 (一键重新生成所有详情页双语数据)</h2>
            <p className="text-slate-400 text-sm leading-relaxed mb-4">如果详情页还是发生错误崩溃，或者您要批量重新生成优质内容，请执行本程序。大模型将自动扫描并尝试全新重写、翻译、修复所有信息及自动规整失效的Logo链接等数据。</p>
            
            <div className="flex gap-4 items-center">
              <select 
                value={cleanCount}
                onChange={(e) => setCleanCount(Number(e.target.value))}
                className="bg-slate-800 text-white border border-slate-700 rounded-xl px-4 py-4 font-bold outline-none focus:border-emerald-500"
                disabled={cleanLoading}
              >
                <option value={1}>每次修复 1 条</option>
                <option value={5}>每次修复 5 条</option>
                <option value={10}>每次修复 10 条</option>
                <option value={20}>每次修复 20 条 (可能会超时)</option>
              </select>
              
              <button 
                onClick={handleClean} disabled={cleanLoading}
                className={"flex-1 py-4 rounded-xl font-black transition-all flex items-center justify-center gap-2 " + (cleanLoading ? "bg-slate-700 text-slate-400" : "bg-gradient-to-r from-emerald-400 to-teal-500 text-slate-900 shadow-lg hover:scale-[1.02]")}
              >
                {cleanLoading ? <RefreshCw className="w-5 h-5 animate-spin" /> : <Wand2 className="w-5 h-5" />}
                {cleanLoading ? '大模型正在执行清洗纠错...' : `立即修复 ${cleanCount} 条劣缺数据`}
              </button>
            </div>
          </div>

          {msg && (
            <div className="mt-6 p-4 rounded-xl bg-slate-800/80 border border-slate-700 text-emerald-400 text-sm font-bold flex items-start gap-2 relative z-10">
              <CheckCircle2 className="w-5 h-5 shrink-0" />
              <span>{msg}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
