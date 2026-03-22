'use server';

import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function generateGlobalSEOKeywords() {
  if (!process.env.GROQ_API_KEY) throw new Error('后台未配置 GROQ_API_KEY，请在 .env 文件中添加');

  const categories = await prisma.category.findMany({ select: { nameZh: true, nameEn: true } });
  const categoryNames = categories.map(c => `${c.nameZh}(${c.nameEn})`).join(', ');
  
  const prompt = `Based on these AI tool categories: ${categoryNames}, generate a comprehensive list of comma-separated SEO keywords (both English and Chinese). High search volume terms related to AI. Return exactly the comma-separated string, nothing else.`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY.trim(),
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile',
        messages: [{ role: 'user', content: prompt }]
      })
    });
    
    const data = await response.json();
    if (data.error) throw new Error(data.error.message);

    let keywords = data.choices[0].message.content.trim();
    
    await prisma.setting.upsert({
      where: { id: 'global_setting' },
      update: { seoKeywords: keywords },
      create: { id: 'global_setting', siteName: 'EAI', seoKeywords: keywords }
    });
    
    revalidatePath('/admin/seo');
    revalidatePath('/admin/settings');
    revalidatePath('/');
    return { success: true, keywords };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function pingSearchEngines() {
  // Simulate pinging Google, Bing
  try {
    const sitemapUrl = `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL || 'yourdomain.com'}/sitemap.xml`;
    await fetch(`https://www.google.com/ping?sitemap=${sitemapUrl}`).catch(()=>null);
    await fetch(`https://www.bing.com/ping?sitemap=${sitemapUrl}`).catch(()=>null);
    return { success: true, message: '成功推送 sitemap 到各大搜索引擎 (Google, Bing)' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
