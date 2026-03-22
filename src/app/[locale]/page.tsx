import { PrismaClient } from '@prisma/client';
import Link from 'next/link';
import { Zap } from 'lucide-react';
import ToolGrid from '../../components/ToolGrid';

const prisma = new PrismaClient();

function getHolidayTheme() {
  const d = new Date();
  const m = d.getMonth() + 1;
  const day = d.getDate();
  
  // 春节 (1月20日-2月20日)
  if ((m === 1 && day >= 20) || (m === 2 && day <= 20)) {
    return { 
      bg: "bg-[#1A0A0A]", 
      gradient: "from-red-500 via-orange-500 to-red-500",
      pill: "bg-red-500/10 border-red-500/20 text-red-500",
      decor: "🏮"
    };
  }
  // 万圣节 (美国)
  if (m === 10 && day === 31) {
    return { 
      bg: "bg-[#110A1A]", 
      gradient: "from-orange-500 via-purple-500 to-orange-500",
      pill: "bg-orange-500/10 border-orange-500/20 text-orange-500",
      decor: "🎃"
    };
  }
  // 独立日 (美国)
  if (m === 7 && day === 4) {
    return { 
      bg: "bg-[#0A0D1A]", 
      gradient: "from-blue-500 via-gray-100 to-red-500",
      pill: "bg-blue-500/10 border-blue-500/20 text-blue-400",
      decor: "🎆"
    };
  }
  // 圣诞节/元旦 (12月20日-1月5日)
  if ((m === 12 && day >= 20) || (m === 1 && day <= 5)) {
    return { 
      bg: "bg-[#0A1A12]", 
      gradient: "from-emerald-500 via-red-500 to-emerald-500",
      pill: "bg-emerald-500/10 border-emerald-500/20 text-emerald-500",
      decor: "🎄"
    };
  }
  // 国庆 (10月1日-10月7日)
  if (m === 10 && day <= 7) {
    return {
      bg: "bg-[#1A0A0A]",
      gradient: "from-red-500 via-yellow-500 to-red-500",
      pill: "bg-red-500/10 border-red-500/20 text-red-500",
      decor: "🎇"
    };
  }
  
  // 默认日常暗色主题
  return { 
    bg: "bg-[#0B0F19]", 
    gradient: "from-blue-400 via-indigo-500 to-violet-500",
    pill: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    decor: "✨"
  };
}

function getDefaultTheme() {
  return { 
    bg: "bg-[#0B0F19]", 
    gradient: "from-blue-400 via-indigo-500 to-violet-500",
    pill: "bg-indigo-500/10 border-indigo-500/20 text-indigo-400",
    decor: "✨"
  };
}

export default async function Home({ params }: { params: Promise<{ locale: string }> }) {
  const resolvedParams = await params;
  const locale = resolvedParams.locale;
  const isZh = locale === 'zh';

  const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
  const categories = await prisma.category.findMany();
  const tools = await prisma.tool.findMany({
    orderBy: [{ isFeatured: 'desc' }, { upvotes: 'desc' }],
    include: { category: true },
  });

  const theme = settings?.holidayThemeAuto !== false ? getHolidayTheme() : getDefaultTheme();

  return (
    <div className={`min-h-screen ${theme.bg} font-sans selection:bg-indigo-500/30 selection:text-indigo-200 transition-colors duration-1000 flex flex-col`}>
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#0B0F19]/80 border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 h-16 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(0,0,0,0.5)] bg-gradient-to-br ${theme.gradient}`}>
              <Zap className="w-4 h-4 text-white" fill="currentColor" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">
              {settings?.siteName || 'AI Directory'}
              <span className="font-light text-slate-500">.com</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/admin"
              className="text-sm font-bold text-slate-400 hover:text-white transition-colors"
            >
              {isZh ? '提交产品 (后台)' : 'Admin'}
            </Link>
            <div className="flex items-center bg-[#131620] rounded-full p-1 border border-slate-800">
              <Link
                href="/en"
                className={`px-3 py-1 text-xs font-black rounded-full transition-all ${
                  !isZh
                    ? 'bg-slate-800 shadow-sm text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                EN
              </Link>
              <Link
                href="/zh"
                className={`px-3 py-1 text-xs font-black rounded-full transition-all ${
                  isZh
                    ? 'bg-slate-800 shadow-sm text-white'
                    : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                ZH
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-16 flex-grow">
        <div className="text-center max-w-4xl mx-auto mb-16 space-y-6">
          <div className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-full border text-xs font-bold tracking-wide ${theme.pill}`}>
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-current opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-current"></span>
            </span>
            {isZh ? `已收录 ${tools.length} 款顶级数字资产` : `Tracking ${tools.length} Top Digital Assets`}
          </div>
          <h1 className="text-5xl md:text-7xl font-extrabold text-white tracking-tight leading-[1.1]">
            {isZh ? '提升生产力的' : 'Discover the Best'} {theme.decor} <br />
            <span className={`text-transparent bg-clip-text bg-gradient-to-r ${theme.gradient}`}>
              {isZh ? '终极工作流引擎' : 'AI Workflows'}
            </span>
          </h1>
          <p className="text-lg text-slate-400 max-w-2xl mx-auto font-medium leading-relaxed">
            {isZh
              ? '每日更新的精选智能工具库，帮您找到提升十倍效率的终极武器。'
              : 'Daily updated, hand-picked AI directory to help you find the ultimate weapons for 10x productivity.'}
          </p>
        </div>

        <ToolGrid initialTools={tools} categories={categories} isZh={isZh} settings={settings} />
      </main>

      <footer className="bg-[#0B0F19] text-slate-500 py-16 mt-20 border-t border-slate-800/80">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="col-span-1 md:col-span-2">
            <span className="text-2xl font-black text-white tracking-tight mb-4 block">{settings?.siteName || 'ENAHU'}.com</span>
            <p className="text-sm leading-relaxed max-w-sm font-medium">
              {isZh
                ? '全自动多语言流量引擎。我们帮助企业和独立开发者发现最强大的生产力工具。'
                : 'The leading AI asset directory. We help enterprises and indie hackers discover powerful productivity tools.'}
            </p>
          </div>
          <div>
            <h4 className="text-slate-300 font-bold mb-4 uppercase text-xs tracking-wider">
              {isZh ? '商业合作' : 'Business'}
            </h4>
            <ul className="space-y-3 text-sm font-medium">
              <li>
                <a href="/admin" className="hover:text-white transition">
                  Submit Tool (提交工具)
                </a>
              </li>
              <li>
                <a href="mailto:admin@domain.com" className="hover:text-white transition">
                  Advertise (广告投放)
                </a>
              </li>
              <li>
                <a
                  href="mailto:admin@domain.com"
                  className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-cyan-400 hover:opacity-80 transition font-black"
                >
                  Acquire this Domain (收购此域名)
                </a>
              </li>
            </ul>
          </div>
        </div>
      </footer>
    </div>
  );
}
