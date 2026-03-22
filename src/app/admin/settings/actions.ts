'use server'
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function getSettings() {
  const setting = await prisma.setting.findUnique({ where: { id: 'global' } });
  return setting;
}

export async function updateSettings(formData: FormData) {
  const data = {
    siteName: (formData.get('siteName') as string) || 'AI Directory',
    domain: (formData.get('domain') as string) || 'YOURDOMAIN.com',
    contactEmail: (formData.get('contactEmail') as string) || 'admin@domain.com',
    seoDescZh: (formData.get('seoDescZh') as string) || '',
    seoDescEn: (formData.get('seoDescEn') as string) || '',
    seoKeywords: (formData.get('seoKeywords') as string) || '',
    adSenseCode: (formData.get('adSenseCode') as string) || '',
    adSenseEnabled: formData.get('adSenseEnabled') === 'on',
    homeAdEnabled: formData.get('homeAdEnabled') === 'on',
    homeAdCode: (formData.get('homeAdCode') as string) || '',
    homeAdImage: (formData.get('homeAdImage') as string) || '',
    homeAdLink: (formData.get('homeAdLink') as string) || '',
    detailAdEnabled: formData.get('detailAdEnabled') === 'on',
    detailAdCode: (formData.get('detailAdCode') as string) || '',
    detailAdImage: (formData.get('detailAdImage') as string) || '',
    detailAdLink: (formData.get('detailAdLink') as string) || '',
    sidebarAdEnabled: formData.get('sidebarAdEnabled') === 'on',
    sidebarAdCode: (formData.get('sidebarAdCode') as string) || '',
    sidebarAdImage: (formData.get('sidebarAdImage') as string) || '',
    sidebarAdLink: (formData.get('sidebarAdLink') as string) || '',
    holidayThemeAuto: formData.get('holidayThemeAuto') === 'on',
    customAdEnabled: formData.get('customAdEnabled') === 'on',
    customAdImageUrl: (formData.get('customAdImageUrl') as string) || '',
    customAdLink: (formData.get('customAdLink') as string) || '',
    googleAnalytics: (formData.get('googleAnalytics') as string) || '',
    googleVerifyCode: (formData.get('googleVerifyCode') as string) || '',
    bingVerifyCode: (formData.get('bingVerifyCode') as string) || '',
    baiduVerifyCode: (formData.get('baiduVerifyCode') as string) || '',
  };

  await prisma.setting.upsert({
    where: { id: 'global' },
    update: data,
    create: { id: 'global', ...data }
  });
  
  revalidatePath('/', 'layout');
  return { success: true };
}

export async function aiCleanData(count: number = 5) {
  try {
    const toolsToFix = await prisma.tool.findMany({ take: count, orderBy: { createdAt: 'asc' } });
    if (toolsToFix.length === 0) return { success: true, count: 0, message: "所有数据均已完美，无需清洗。" };

    let fixCount = 0;
    for (const tool of toolsToFix) {
      const prompt = `Review AI tool: ${tool.name}, URL: ${tool.url}. 
Task:
1. Write 1-sentence description in Chinese (descZh) and English (descEn).
2. Determine best categorySlug.
3. Extract 2-3 tags in Chinese (tagsZh) and English (tagsEn) as arrays.
4. Guess free tier/quota in Chinese (freeQuotaZh) and English (freeQuotaEn).
Reply ONLY valid JSON, NO markdown \`\`\`json. Example: {"descZh":"...","descEn":"...","categorySlug":"ai-chat","tagsZh":["工具"],"tagsEn":["Tool"],"freeQuotaZh":"免费使用","freeQuotaEn":"Free to use"}`;
      
      const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: { 'Authorization': 'Bearer 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', 'Content-Type': 'application/json' },
        body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: prompt }] })
      });

      const data = await response.json();
      
      if (data.error) {
         throw new Error(`API 报错: ${data.error.message || JSON.stringify(data.error)}`);
      }
      
      if (!data.choices || data.choices.length === 0) {
         throw new Error(`API 返回空或格式异常: ${JSON.stringify(data).substring(0, 100)}`);
      }
      
      let content = data.choices[0].message.content;
      
      // Better JSON extraction
      let parsed;
      try {
        const match = content.match(/\{[\s\S]*\}/);
        const jsonStr = match ? match[0] : content;
        parsed = JSON.parse(jsonStr);
      } catch (e) {
        console.error("JSON parse failed. Content:", content);
        continue;
      }

      if (parsed.descZh && parsed.descEn) {
        let cat = parsed.categorySlug ? await prisma.category.findUnique({ where: { slug: parsed.categorySlug } }) : null;
        await prisma.tool.update({
          where: { id: tool.id },
          data: {
            descZh: parsed.descZh,
            descEn: parsed.descEn,
            tagsZh: parsed.tagsZh || [],
            tagsEn: parsed.tagsEn || [],
            freeQuotaZh: parsed.freeQuotaZh || null,
            freeQuotaEn: parsed.freeQuotaEn || null,
            logoUrl: tool.logoUrl || ("https://logo.clearbit.com/" + new URL(tool.url).hostname),
            ...(cat && { categoryId: cat.id })
          }
        });
        fixCount++;
      }
    }
    revalidatePath('/');
    return { success: true, count: fixCount, message: "成功清洗并修复了 " + fixCount + " 个数据！(注意: 若请求数量多请在后台增加Vercel maxDuration配置: export const maxDuration = 60;)" };
  } catch (e: unknown) {
    return { success: false, count: 0, message: "接口超时或返回格式异常: " + (e as Error).message };
  }
}