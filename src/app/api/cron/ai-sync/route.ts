import { NextResponse } from 'next/server';
import { runAIAgent } from '../../../admin/autopilot/actions';

export const maxDuration = 60;

function getErrorMessage(error: unknown) {
  return error instanceof Error ? error.message : String(error);
}

export async function GET(request: Request) {
  const isProd = process.env.NODE_ENV === 'production';

  if (isProd) {
    const secret = process.env.CRON_SECRET?.trim();
    if (!secret) {
      return new NextResponse('CRON_SECRET is not set', { status: 500 });
    }

    const authHeader = request.headers.get('authorization') || '';
    if (authHeader !== `Bearer ${secret}`) {
      return new NextResponse('Unauthorized', { status: 401 });
    }
  }

  try {
    // 你要求更强增长：这里保持 15
    const result = await runAIAgent(15);
    return NextResponse.json(result);
  } catch (error: unknown) {
    return NextResponse.json({ success: false, error: getErrorMessage(error) }, { status: 500 });
  }
}
