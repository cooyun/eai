'use server'
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function loginAdmin(formData: FormData): Promise<void> {
  const password = formData.get('password');
  if (password === process.env.ADMIN_PASSWORD) {
    const cookieStore = await cookies();
    cookieStore.set('admin_token', 'authenticated', { httpOnly: true, secure: true, maxAge: 60 * 60 * 24 });
    redirect('/admin');
  } else {
    redirect('/admin/login?error=1');
  }
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete('admin_token');
  redirect('/admin/login');
}

export async function addCategory(formData: FormData) {
  await prisma.category.create({
    data: {
      slug: (formData.get('slug') as string).toLowerCase().trim(),
      nameZh: formData.get('nameZh') as string,
      nameEn: formData.get('nameEn') as string,
      descZh: formData.get('descZh') as string || '',
      descEn: formData.get('descEn') as string || '',
    }
  });
  revalidatePath('/admin/categories');
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } });
  revalidatePath('/admin/categories');
}

export async function updateCategory(id: string, data: { slug?: string, nameZh?: string, nameEn?: string, descZh?: string, descEn?: string }) {
  await prisma.category.update({ where: { id }, data });
  revalidatePath('/admin/categories');
}

export async function autoFillCategory(id: string, currentNameZh: string) {
  const prompt = `You are an SEO expert. Please generate a detailed description in Chinese and English for the AI tool category "${currentNameZh}". Also provide an English translation for the category name if missing, and a URL slug. 
STRICT REQUIREMENT: Answer ONLY with a valid JSON object. Do not include markdown or backticks.
{
  "slug": "url-friendly-slug",
  "nameEn": "English Category Name",
  "descZh": "包含丰富的行业专属关键词的详细中文SEO介绍（50字以上），必须完全使用简体中文编写。",
  "descEn": "Detailed English SEO description for the category (50+ words)"
}`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer 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', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    let content = data.choices[0].message.content;
    const parsed = JSON.parse(content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1));
    if (parsed.slug || parsed.descZh || parsed.descEn) {
      await prisma.category.update({
        where: { id },
        data: {
          ...(parsed.slug && { slug: parsed.slug }),
          ...(parsed.nameEn && { nameEn: parsed.nameEn }),
          ...(parsed.descZh && { descZh: parsed.descZh }),
          ...(parsed.descEn && { descEn: parsed.descEn })
        }
      });
      revalidatePath('/admin/categories');
      return { success: true };
    }
    return { success: false, message: '解析失败' };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}

export async function addTool(formData: FormData) {
  await prisma.tool.create({
    data: {
      name: formData.get('name') as string,
      url: formData.get('url') as string,
      logoUrl: formData.get('logoUrl') as string,
      pricing: formData.get('pricing') as string,
      descZh: formData.get('descZh') as string,
      descEn: formData.get('descEn') as string,
      categoryId: formData.get('categoryId') as string,
      isFeatured: formData.get('isFeatured') === 'on',
      upvotes: Math.floor(Math.random() * 500) + 50, // 自动生成初始点赞数
    }
  });
  revalidatePath('/admin/tools');
  revalidatePath('/');
}
// --- 分类修改与 AI 翻译后端 ---

export async function aiTranslateCategory(nameZh: string) {
  const prompt = `Translate to English and provide a URL-friendly slug (lowercase, hyphenated). Category: "${nameZh}". Respond ONLY with JSON. Example: {"nameEn": "AI Video", "slug": "ai-video"}`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': 'Bearer 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',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    const content = data.choices[0].message.content;
    const jsonStr = content.substring(content.indexOf('{'), content.lastIndexOf('}') + 1);
    return JSON.parse(jsonStr);
  } catch (_error) {
    return null;
  }
}

export async function deleteTool(id: string) {
  await prisma.tool.delete({ where: { id } });
  revalidatePath('/admin/tools');
  revalidatePath('/');
}
