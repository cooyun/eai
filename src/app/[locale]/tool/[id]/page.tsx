import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { notFound } from 'next/navigation';

const prisma = new PrismaClient();

export async function generateMetadata({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale === 'zh' ? 'zh' : 'en';
  const isZh = locale === 'zh';

  const tool = await prisma.tool.findUnique({
    where: { id: resolvedParams.id },
    include: { category: true },
  });

  if (!tool) return { title: 'Not Found' };

  const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
  const siteName = settings?.siteName || 'AI Directory';

  const title = isZh
    ? `${tool.name} - ${tool.category?.nameZh || ''} | ${siteName}`
    : `${tool.name} - ${tool.category?.nameEn || ''} | ${siteName}`;

  const description = isZh ? tool.descZh : tool.descEn;

  return { title, description };
}

export default async function ToolDetailPage({ params }: { params: Promise<{ locale: string; id: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale === 'zh' ? 'zh' : 'en';
  const isZh = locale === 'zh';

  const tool = await prisma.tool.findUnique({
    where: { id: resolvedParams.id },
    include: { category: true },
  });

  if (!tool) notFound();

  const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
  const siteName = settings?.siteName || 'AI Directory';

  // 简单相关推荐：同分类最新 8 个
  const related = await prisma.tool.findMany({
    where: { categoryId: tool.categoryId, NOT: { id: tool.id } },
    orderBy: { createdAt: 'desc' },
    take: 8,
    include: { category: true },
  });

  let domain = '';
  try {
    domain = new URL(tool.url).hostname;
  } catch(e) {
    domain = tool.url.replace(/^https?:\/\//, '').split('/')[0] || '';
  }

  return (
    <div className="min-h-screen bg-[#0B0F19] font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      <header className="bg-[#0B0F19]/80 backdrop-blur-xl border-b border-slate-800 sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-4 py-4 flex items-center justify-between">
          <Link href={`/${locale}`} className="text-sm font-bold text-slate-400 hover:text-white transition-colors">
            ← {isZh ? '返回首页' : 'Back Home'}
          </Link>
          <div className="text-sm font-black text-white">{siteName}</div>
          <div className="w-16" />
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-10">
        <div className="bg-[#131620] border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row items-start gap-6 relative z-10">
            <div className={`w-24 h-24 shrink-0 rounded-2xl border border-slate-700/50 overflow-hidden flex items-center justify-center p-2 relative shadow-lg ${tool.name.toLowerCase().includes('open') ? 'bg-emerald-500/20' : tool.name.toLowerCase().includes('lm') ? 'bg-blue-500/20' : 'bg-indigo-500/20'}`}>
              <img
                src={tool.logoUrl || `https://logo.clearbit.com/${domain}`}
                alt={tool.name}
                loading="lazy"
                className="w-full h-full object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none';
                  if (e.currentTarget.nextElementSibling) {
                    (e.currentTarget.nextElementSibling as HTMLElement).style.display = 'flex';
                  }
                }}
              />
              <div className={`hidden w-full h-full items-center justify-center font-black text-4xl uppercase ${tool.name.toLowerCase().includes('open') ? 'text-emerald-400' : tool.name.toLowerCase().includes('lm') ? 'text-blue-400' : 'text-indigo-400'}`}>
                {tool.name.charAt(0)}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-3 mb-2">
                <h1 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">{tool.name}</h1>
                {tool.isFeatured && (
                  <span className="shrink-0 flex items-center justify-center bg-red-500/10 text-red-500 text-xs font-bold px-2 py-0.5 rounded border border-red-500/20">
                    热
                  </span>
                )}
              </div>

              <div className="mt-4 flex flex-wrap gap-2">
                <span className="px-3 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700 text-xs font-bold">
                  {isZh ? tool.category?.nameZh : tool.category?.nameEn}
                </span>
                <span className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
                  {tool.pricing}
                </span>
                <span className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold">
                  {isZh ? '社区热度' : 'Heat'} ↑ {tool.upvotes}
                </span>
                
                {/* 标签 */}
                {Array.isArray(isZh ? tool.tagsZh : tool.tagsEn) && (isZh ? tool.tagsZh : tool.tagsEn).map((tag, idx) => (
                  <span key={idx} className="px-3 py-1 rounded-full bg-[#1a1f33] border border-slate-700/50 text-slate-300 text-xs font-medium">
                    {tag}
                  </span>
                ))}
              </div>

              {/* 免费额度提示 */}
              {((isZh ? tool.freeQuotaZh : tool.freeQuotaEn) || tool.pricing === 'Free') && (
                 <div className="mt-5 flex items-center gap-2 text-cyan-400 text-sm font-medium bg-cyan-900/10 p-3 rounded-xl border border-cyan-800/30">
                    <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(34,211,238,0.6)]"></div>
                    {isZh ? '免费额度' : 'Free Quota'}: {isZh ? (tool.freeQuotaZh || '目前完全免费') : (tool.freeQuotaEn || 'Completely free')}
                 </div>
              )}

              <div className="mt-8 space-y-6">
                {tool.descZh && (
                  <div className="bg-[#1a1f33] border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">{isZh ? '产品介绍' : 'Chinese Intro'}</h3>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">{tool.descZh}</p>
                  </div>
                )}
                {tool.descEn && (
                  <div className="bg-[#1a1f33] border border-slate-700/50 rounded-2xl p-6">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-3">English Intro</h3>
                    <p className="text-slate-300 leading-relaxed text-sm md:text-base">{tool.descEn}</p>
                  </div>
                )}
              </div>

              <div className="mt-10 flex flex-wrap gap-4">
                <a
                  href={`/${locale}/out/${tool.id}`}
                  className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-indigo-500 to-violet-500 hover:from-indigo-600 hover:to-violet-600 text-white font-black transition-all shadow-lg hover:shadow-indigo-500/25 active:scale-95 text-sm"
                >
                  {isZh ? '获取工具 / 直达官网 →' : 'Get URL / Visit Site →'}
                </a>
                <a
                  href={tool.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-8 py-3.5 rounded-2xl bg-[#1a1f33] border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white font-bold transition-all shadow-sm text-sm"
                >
                  {isZh ? '新标签页打开' : 'Open in new tab'}
                </a>
                {tool.githubUrl && (
                  <a
                    href={tool.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-6 py-3.5 rounded-2xl bg-[#1a1f33] border border-slate-700 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white font-bold transition-all shadow-sm text-sm flex items-center gap-2"
                  >
                   <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4"><path d="M9 19c-5 1.5-5-2.5-7-3m14 6v-3.87a3.37 3.37 0 0 0-.94-2.61c3.14-.35 6.44-1.54 6.44-7A5.44 5.44 0 0 0 20 4.77 5.07 5.07 0 0 0 19.91 1S18.73.65 16 2.48a13.38 13.38 0 0 0-7 0C6.27.65 5.09 1 5.09 1A5.07 5.07 0 0 0 5 4.77a5.44 5.44 0 0 0-1.5 3.78c0 5.42 3.3 6.61 6.44 7A3.37 3.37 0 0 0 9 18.13V22"></path></svg>
                    GitHub
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* 详情页广告位 */}
        {settings?.detailAdEnabled && (settings?.detailAdCode || settings?.detailAdImage || settings?.adSenseEnabled) && (
          <div className="mt-10">
            {settings?.detailAdCode ? (
              <div className="w-full bg-[#131620] border border-slate-800 rounded-3xl p-4 overflow-hidden flex justify-center shadow-lg">
                <div dangerouslySetInnerHTML={{ __html: settings.detailAdCode }} className="w-full overflow-hidden" />
              </div>
            ) : settings?.detailAdImage ? (
              <div className="w-full bg-[#131620] border border-slate-800 rounded-3xl overflow-hidden shadow-lg hover:shadow-indigo-500/10 transition-shadow">
                <a href={settings.detailAdLink || '#'} target="_blank" rel="noopener noreferrer" className="block w-full">
                  <img src={settings.detailAdImage} alt="Sponsored Ad" className="w-full h-auto object-cover max-h-[160px]" />
                </a>
              </div>
            ) : settings?.adSenseEnabled && settings?.adSenseCode ? (
              <div className="w-full bg-[#131620] border border-slate-800 rounded-3xl p-4 overflow-hidden flex justify-center shadow-lg">
                <div dangerouslySetInnerHTML={{ __html: settings.adSenseCode }} className="w-full overflow-hidden" />
              </div>
            ) : null}
          </div>
        )}

        {related.length > 0 && (
          <section className="mt-16">
            <h2 className="text-2xl font-black text-white mb-6">
              {isZh ? '相似推荐 (同类竞品)' : 'Related Alternative Tools'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {related.map((r) => {
                 let dHost = '';
                 try { dHost = new URL(r.url).hostname; } catch(e) { dHost = r.url.replace(/^https?:\/\//, '').split('/')[0]; }
                 return (
                <Link
                  key={r.id}
                  href={`/${locale}/tool/${r.id}`}
                  className="block bg-[#131620] border border-slate-800 rounded-2xl p-5 hover:border-slate-700 hover:shadow-xl hover:shadow-indigo-500/10 hover:-translate-y-1 transition-all group"
                >
                  <div className="flex items-center gap-3 mb-3">
                     <div className="w-10 h-10 rounded-lg bg-[#1a1f33] flex items-center justify-center p-1.5 border border-slate-700/50">
                        <img src={r.logoUrl || `https://logo.clearbit.com/${dHost}`} alt="" className="w-full h-full object-contain" onError={e => e.currentTarget.style.display='none'} />
                     </div>
                     <div className="font-bold text-slate-100 group-hover:text-indigo-400 transition-colors truncate">{r.name}</div>
                  </div>
                  <div className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">{isZh ? r.descZh : r.descEn}</div>
                </Link>
              )})}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
