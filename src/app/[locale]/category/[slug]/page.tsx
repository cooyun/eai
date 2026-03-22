// src/app/[locale]/category/[slug]/page.tsx
import { PrismaClient } from '@prisma/client';
import { notFound } from 'next/navigation';
import Link from 'next/link';

const prisma = new PrismaClient();

// 1. 动态生成 SEO 元数据 (Meta Tags)
export async function generateMetadata({ params }: { params: { locale: string, slug: string } }) {
  const category = await prisma.category.findUnique({ where: { slug: params.slug } });
  
  if (!category) return { title: 'Not Found' };
  
  const isZh = params.locale === 'zh';
  const title = isZh ? `${category.nameZh}工具大全 - 提升生产力` : `Best ${category.nameEn} Tools Directory`;
  const description = isZh ? `发现全球最新最好用的${category.nameZh}工具。` : `Discover the best and latest ${category.nameEn} tools worldwide.`;

  return {
    title,
    description,
  };
}

// 2. 分类页面主内容
export default async function CategoryPage({ params }: { params: { locale: string, slug: string } }) {
  const isZh = params.locale === 'zh';
  
  // 查询当前分类及其包含的所有工具
  const category = await prisma.category.findUnique({
    where: { slug: params.slug },
    include: {
      tools: {
        orderBy: { createdAt: 'desc' }
      }
    }
  });

  // 如果分类不存在，返回 404 页面
  if (!category) notFound();

  return (
    <div className="min-h-screen bg-gray-50 font-sans">
      {/* 极简顶栏 */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
          <Link href={`/${params.locale}`} className="text-2xl font-black text-indigo-600 hover:opacity-80 transition">
            YOURDOMAIN<span className="text-indigo-300">.com</span>
          </Link>
          <Link href={`/${params.locale}`} className="text-sm font-medium text-gray-500 hover:text-indigo-600 transition">
            &larr; {isZh ? '返回首页' : 'Back to Home'}
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 py-12">
        {/* 面包屑导航 (极好的SEO加分项) */}
        <nav className="text-sm text-gray-500 mb-6">
          <Link href={`/${params.locale}`} className="hover:text-indigo-600">{isZh ? '首页' : 'Home'}</Link>
          <span className="mx-2">/</span>
          <span className="text-gray-900 font-medium">{isZh ? category.nameZh : category.nameEn}</span>
        </nav>

        {/* 分类标题 */}
        <div className="mb-10">
          <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
            {isZh ? category.nameZh : category.nameEn} {isZh ? '工具集' : 'Tools'}
          </h1>
          <p className="text-lg text-gray-600">
            {category.tools.length} {isZh ? '个精选应用' : 'handpicked apps'}
          </p>
        </div>

        {/* 工具列表 */}
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {category.tools.length === 0 ? (
            <p className="col-span-full text-gray-500">{isZh ? '该分类下暂无工具。' : 'No tools in this category yet.'}</p>
          ) : (
            category.tools.map((tool) => (
              <a key={tool.id} href={tool.url} target="_blank" rel="noopener noreferrer" className="block bg-white rounded-xl shadow-md hover:shadow-xl transition-shadow p-6 border border-gray-100 flex flex-col h-full">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{tool.name}</h3>
                  <p className="text-gray-600 text-sm line-clamp-3">
                    {isZh ? tool.descZh : tool.descEn}
                  </p>
                </div>
                <div className="mt-4 pt-4 border-t border-gray-100 flex justify-between items-center">
                  <span className="text-indigo-600 font-medium text-sm">{isZh ? '直达链接' : 'Visit Site'} &rarr;</span>
                </div>
              </a>
            ))
          )}
        </div>
      </main>
    </div>
  );
}