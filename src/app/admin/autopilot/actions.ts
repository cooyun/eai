'use server'
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function runAIAgent(batchSize = 5, marketHeat: 'Trending' | 'Newest' | 'HighVolume' = 'Trending') {
  if (!process.env.GROQ_API_KEY) throw new Error('后台未配置 GROQ_API_KEY，请在 .env 文件中添加');

  const existingTools = await prisma.tool.findMany({ select: { name: true } });
  const existingNames = existingTools.map(t => t.name).join(', ');

  const prompt = `You are an AI directory curator. Discover ${batchSize} highly useful AI tools. Focus on the market criteria: ${marketHeat}. Do NOT include tools with these names: [${existingNames}].
STRICT INSTRUCTIONS FOR THE JSON ARRAY RESPONSE:
1. "name": Tool name (If it has a Chinese name, include it, e.g. "Notion (笔记软件)").
2. "url": Valid URL starting with https://
3. "categorySlug": MUST be ONE of: [ai-writing, ai-image, ai-video, ai-chat, productivity, design, coding, marketing, seo, business]. Do not invent slugs.
4. "categoryZh": Authentic Simplified Chinese name for the category.
5. "categoryEn": Authentic English name for the category.
6. "categoryDescZh": A 50-word Chinese description of what this category of tools is used for.
7. "categoryDescEn": A 50-word English description of what this category of tools is used for.
8. "pricing": "Free", "Paid", or "Freemium".
9. "descZh": Comprehensive introduction in 100% Simplified Chinese. AT LEAST 3 sentences covering features, pros, and use cases. Do NOT output English here.
10. "descEn": Comprehensive introduction in English. AT LEAST 3 sentences.
11. "tagsZh": Array of 3-5 tags in Simplified Chinese.
12. "tagsEn": Array of 3-5 tags in English.
13. "freeQuotaZh": If it has a free tier, write a short description in Chinese.
14. "freeQuotaEn": If it has a free tier, write a short description in English.
MUST return ONLY valid JSON array. For example: [{"name":"...","url":"...",...}]`;

  try {
    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer ' + process.env.GROQ_API_KEY.trim(), // 确保没有多余的空格
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'llama-3.3-70b-versatile', // 切换到目前 Groq 最新最稳定且免费额度最高的 Llama 3.3 模型
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        response_format: { type: "json_object" }
      })
    });

    const data = await response.json();
    
    // 🔥 核心修复：检查接口是否返回了错误信息，直接抛出！
    if (data.error) {
      console.error("Groq 接口报错详细信息:", data.error);
      throw new Error("大模型接口拒绝请求: " + (data.error.message || "未知错误"));
    }

    if (!data.choices || data.choices.length === 0) {
        throw new Error("接口返回为空或格式异常");
    }

    let content = data.choices[0].message.content;
    
    if (content.startsWith('```json')) {
      content = content.replace(/```json/g, '').replace(/```/g, '');
    }
    
    const parsed = JSON.parse(content);
    const toolsData = Array.isArray(parsed) ? parsed : (parsed.tools || parsed[Object.keys(parsed)[0]]);

    let addedCount = 0;

    for (const tool of toolsData) {
      if (!tool.name || !tool.url || !tool.categorySlug) continue; // Skip invalid entries

      let category = await prisma.category.findUnique({ where: { slug: tool.categorySlug } });
      if (!category) {
        category = await prisma.category.create({
          data: { 
            slug: tool.categorySlug, 
            nameZh: tool.categoryZh || '未分类', 
            nameEn: tool.categoryEn || 'Uncategorized',
            descZh: tool.categoryDescZh || '',
            descEn: tool.categoryDescEn || ''
          }
        });
      } else if (!category.descZh || !category.descEn || !category.nameEn || !category.nameZh) {
        // Automatically fill empty category descriptions if provided
        await prisma.category.update({
          where: { id: category.id },
          data: {
            ...(tool.categoryDescZh && !category.descZh && { descZh: tool.categoryDescZh }),
            ...(tool.categoryDescEn && !category.descEn && { descEn: tool.categoryDescEn }),
            ...(tool.categoryZh && !category.nameZh && { nameZh: tool.categoryZh }),
            ...(tool.categoryEn && !category.nameEn && { nameEn: tool.categoryEn })
          }
        });
      }

      let dHost = 'example.com';
      try { dHost = new URL(tool.url).hostname; } catch(e) { dHost = String(tool.url).replace(/^https?:\/\//, '').split('/')[0]; }
      const logoUrl = 'https://logo.clearbit.com/' + dHost;

      const exists = await prisma.tool.findFirst({ where: { name: tool.name } });
      if (!exists) {
        await prisma.tool.create({
          data: {
            name: tool.name,
            url: tool.url,
            logoUrl: logoUrl,
            pricing: tool.pricing || 'Freemium',
            descZh: tool.descZh || tool.descEn || 'No description available',
            descEn: tool.descEn || tool.descZh || 'No description available',
            tagsZh: tool.tagsZh && Array.isArray(tool.tagsZh) ? tool.tagsZh : [],
            tagsEn: tool.tagsEn && Array.isArray(tool.tagsEn) ? tool.tagsEn : [],
            freeQuotaZh: tool.freeQuotaZh || null,
            freeQuotaEn: tool.freeQuotaEn || null,
            upvotes: Math.floor(Math.random() * 9000) + 1000,
            categoryId: category.id,
            isFeatured: Math.random() > 0.8
          }
        });
        addedCount++;
      }
    }

    revalidatePath('/');
    revalidatePath('/admin/tools');
    return { success: true, count: addedCount, message: '成功从全网捕获并入库 ' + addedCount + ' 个全新 AI 资产！' };

  } catch (error: unknown) {
  console.error(error);
  const message = error instanceof Error ? error.message : String(error);
  return { success: false, count: 0, message };
 }
}
