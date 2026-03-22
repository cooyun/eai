// app/[locale]/out/[id]/route.ts
import { PrismaClient } from '@prisma/client';
import { NextResponse } from 'next/server';

const prisma = new PrismaClient();

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ locale: string; id: string }> }  // ← 必须是 Promise！
) {
  const { id } = await params;  // ← 现在合法了

  const tool = await prisma.tool.findUnique({
    where: { id }, // ← 直接用解构出来的 id，不要再写 params.id
  });

  if (!tool) {
    return new NextResponse('Not Found', { status: 404 });
  }

  // 可选：以后要统计点击量再打开
  // await prisma.tool.update({
  //   where: { id },
  //   data: { clicks: { increment: 1 } },
  // });

  return NextResponse.redirect(tool.url, 302);
}
