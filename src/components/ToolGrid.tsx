"use client";

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { Search, ArrowUp, ExternalLink, Megaphone, Info } from 'lucide-react';

export default function ToolGrid({ initialTools, categories, isZh, settings }: any) {
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCategory, setActiveCategory] = useState<string | null>(null);

  const filteredTools = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    return initialTools.filter((tool: any) => {
      const text = (tool.name + ' ' + (isZh ? tool.descZh : tool.descEn)).toLowerCase();
      const matchesSearch = q ? text.includes(q) : true;
      const matchesCategory = activeCategory ? tool.categoryId === activeCategory : true;
      return matchesSearch && matchesCategory;
    });
  }, [initialTools, activeCategory, searchQuery, isZh]);

  return (
    <>
      {/* 搜索 */}
      <div className="max-w-2xl mx-auto mb-10 relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
        </div>
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder={isZh ? "输入关键词搜索 AI 工具..." : "Search AI tools..."}
          className="w-full pl-12 pr-4 py-4 bg-white border border-slate-200 rounded-2xl text-slate-700 focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all shadow-sm text-lg font-medium"
        />
      </div>

      {/* 分类筛选 */}
      <div className="flex overflow-x-auto gap-3 pb-4 mb-8 custom-scrollbar scroll-smooth px-2">
        <button
          onClick={() => setActiveCategory(null)}
          className={
            'flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border ' +
            (activeCategory === null
              ? 'bg-slate-900 text-white border-slate-900 shadow-slate-900/20'
              : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
          }
        >
          {isZh ? '🔥 全部分类' : '🔥 All'}
        </button>

        {categories.map((cat: any) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={
              'flex-shrink-0 px-6 py-2.5 rounded-full text-sm font-bold transition-all shadow-sm border ' +
              (activeCategory === cat.id
                ? 'bg-indigo-50 text-indigo-700 border-indigo-200 shadow-indigo-500/10'
                : 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50')
            }
          >
            {isZh ? cat.nameZh : cat.nameEn}
          </button>
        ))}
      </div>

      {/* 广告位：有代码就真正注入，无代码有图片则展示图片，全无则占位 */}
      <div className="mb-8">
        {settings?.customAdEnabled && (settings?.customAdImageUrl || settings?.customAdLink) ? (
          <div className="w-full bg-[#131620] border border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow mb-4">
            <a href={settings.customAdLink || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
              <img src={settings.customAdImageUrl} alt="Global Sponsored Ad" className="w-full h-auto object-cover max-h-[120px]" />
            </a>
          </div>
        ) : null}

        {settings?.homeAdEnabled ? (
          settings?.homeAdCode ? (
            <div className="w-full bg-[#131620] border border-slate-800 rounded-2xl overflow-hidden flex justify-center">
              <div dangerouslySetInnerHTML={{ __html: settings.homeAdCode }} className="w-full overflow-hidden" />
            </div>
          ) : settings?.homeAdImage ? (
            <div className="w-full bg-[#131620] border border-slate-800 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-indigo-500/10 transition-shadow">
              <a href={settings.homeAdLink || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
                <img src={settings.homeAdImage} alt="Sponsored Ad" className="w-full h-auto object-cover max-h-[120px]" />
              </a>
            </div>
          ) : settings?.adSenseEnabled && settings?.adSenseCode ? (
            <div className="w-full bg-[#131620] border border-slate-800 rounded-2xl overflow-hidden flex justify-center">
              <div dangerouslySetInnerHTML={{ __html: settings.adSenseCode }} className="w-full overflow-hidden" />
            </div>
          ) : (
            <div className="w-full bg-[#1a1f33]/50 border border-slate-700 border-dashed rounded-2xl p-6 flex flex-col items-center justify-center text-slate-400 font-medium">
              <Megaphone className="w-6 h-6 mb-2 text-indigo-400" /> 
              <span>[首页商业横幅广告位 / 推广链接 / 自动展示预留位]</span>
              <span className="text-xs text-slate-500 mt-1">可在后台"全局变现"中填写高佣联盟代码或图片链接</span>
            </div>
          )
        ) : null}
      </div>

      {/* 工具卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredTools.map((tool: any) => {
          // Prepare tags
          const rawTags = isZh ? tool.tagsZh : tool.tagsEn;
          const displayTags = (rawTags && rawTags.length > 0) 
            ? rawTags 
            : [isZh ? tool.category?.nameZh : tool.category?.nameEn, tool.pricing].filter(Boolean);

          return (
            <div
              key={tool.id}
              className="group relative bg-[#131620] rounded-2xl border border-slate-800 p-5 hover:border-slate-700 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all duration-300 flex flex-col h-full"
            >
              {/* Top Row: Name & Heat + Actions */}
              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="flex flex-col gap-1.5 min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-2xl font-black text-white truncate group-hover:text-indigo-400 transition-colors">
                      {tool.name}
                    </h3>
                    {tool.isFeatured && (
                      <span className="shrink-0 flex items-center justify-center bg-red-500/10 text-red-500 text-[10px] font-bold px-1.5 py-0.5 rounded border border-red-500/20">
                        热
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-400">
                     <span className="text-emerald-400 font-black">↑</span> {isZh ? '市场热度' : 'Market Heat'}: <span className="text-slate-200">{tool.upvotes}</span>
                  </div>
                </div>

                {/* Actions (GitHub/External) */}
                <div className="flex items-center gap-1.5 opacity-60 group-hover:opacity-100 transition-opacity shrink-0">
                  {tool.githubUrl && (
                    <a
                      href={tool.githubUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1f33] border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors text-slate-400"
                      title="GitHub"
                    >
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    </a>
                  )}
                  <a
                    href={`/${isZh ? 'zh' : 'en'}/out/${tool.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-8 h-8 flex items-center justify-center rounded-lg bg-[#1a1f33] border border-slate-700 hover:bg-slate-700 hover:text-white transition-colors text-slate-400"
                    title={isZh ? '直达链接' : 'Visit Site'}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              </div>

              {/* Description */}
              <p className="text-sm text-slate-400 leading-relaxed line-clamp-3 flex-grow mb-5">
                {isZh ? tool.descZh : tool.descEn}
              </p>

              {/* Tags */}
              <div className="flex flex-wrap gap-2 mb-5 mt-auto">
                {displayTags.map((tag: string, index: number) => (
                  <span key={index} className="px-2.5 py-1 bg-slate-800/50 text-slate-300 border border-slate-700/50 text-[11px] rounded-md backdrop-blur-sm">
                    {tag}
                  </span>
                ))}
              </div>

              {/* Divider */}
              <div className="w-full h-px bg-slate-800/80 mb-4" />

              {/* Bottom Info: Quota & Details */}
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="text-[10px] text-slate-500 mb-1">{isZh ? '免费额度' : 'Free Quota'}</div>
                  <div className="flex items-center gap-1.5 text-cyan-400">
                    <div className="w-1.5 h-1.5 shrink-0 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                    <span className="text-xs font-medium truncate">
                      {isZh ? (tool.freeQuotaZh || '目前完全免费') : (tool.freeQuotaEn || 'Completely free')}
                    </span>
                  </div>
                </div>

                <Link
                  href={`/${isZh ? 'zh' : 'en'}/tool/${tool.id}`}
                  className="shrink-0 inline-flex items-center justify-center px-4 py-2 bg-[#1a1f33] border border-slate-700 hover:border-slate-500 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold rounded-xl transition-all shadow-sm"
                >
                  {isZh ? '详情与优缺点' : 'Details & Pros/Cons'}
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
