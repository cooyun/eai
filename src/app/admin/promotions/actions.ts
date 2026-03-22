'use server';
import { PrismaClient } from '@prisma/client';
import { revalidatePath } from 'next/cache';

const prisma = new PrismaClient();

export async function fetchAffiliateLink(id: string, url: string) {
  const prompt = `Find or guess the affiliate / high commission application link for the AI tool at URL: ${url}. Return ONLY a valid URL or empty string if not found.`;
  try {
    const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
      method: 'POST',
      headers: { 'Authorization': 'Bearer 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', 'Content-Type': 'application/json' },
      body: JSON.stringify({ model: 'meta-llama/llama-3.1-8b-instruct:free', messages: [{ role: 'user', content: prompt }] })
    });
    const data = await response.json();
    let content = data.choices[0].message.content.trim();
    const link = content.startsWith('http') ? content : `https://${new URL(url).hostname}/affiliate`;
    
    // Auto replace the url with the affiliate link
    await prisma.tool.update({
      where: { id },
      data: { url: link }
    });
    revalidatePath('/admin/promotions');
    revalidatePath('/admin/page');
    return { success: true, link };
  } catch (e: any) {
    return { success: false, message: e.message };
  }
}
