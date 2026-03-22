'use server'
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function updateCategory(id: string, data: any) {
  await prisma.category.update({ where: { id }, data });
  revalidatePath('/admin/categories');
}

export async function aiTranslate(zh: string) {
  const prompt = 'Translate category "'+zh+'" to English. Provide a url slug, a brief Chinese description (descZh) and English description (descEn). Reply ONLY with valid JSON: {"nameEn":"...","slug":"...","descZh":"...","descEn":"..."}';
  try {
    const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer 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', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await res.json();
    let c = data.choices[0].message.content;
    const match = c.match(/\{[\s\S]*\}/);
    if (!match) return null;
    return JSON.parse(match[0]);
  } catch(e: unknown) { return null; }
}