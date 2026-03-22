import { MetadataRoute } from 'next';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const settings = await prisma.setting.findUnique({ where: { id: 'global' } });
  const domain = settings?.domain || 'yourdomain.com';
  const baseUrl = `https://www.${domain}`;

  const categories = await prisma.category.findMany();
  const tools = await prisma.tool.findMany({ select: { id: true, createdAt: true } });

  const routes = [
    { url: `${baseUrl}/en`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1.0 },
    { url: `${baseUrl}/zh`, lastModified: new Date(), changeFrequency: 'hourly' as const, priority: 1.0 },
  ];

  const categoryRoutes = categories.flatMap((cat) => [
    { url: `${baseUrl}/en/category/${cat.slug}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
    { url: `${baseUrl}/zh/category/${cat.slug}`, lastModified: new Date(), changeFrequency: 'daily' as const, priority: 0.8 },
  ]);

  const toolRoutes = tools.flatMap((tool) => [
    { url: `${baseUrl}/en/tool/${tool.id}`, lastModified: tool.createdAt || new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
    { url: `${baseUrl}/zh/tool/${tool.id}`, lastModified: tool.createdAt || new Date(), changeFrequency: 'weekly' as const, priority: 0.6 },
  ]);

  return [...routes, ...categoryRoutes, ...toolRoutes];
}
