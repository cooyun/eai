import { loginAdmin } from '../actions';

export default function AdminLogin({
  searchParams,
}: {
  searchParams?: { error?: string };
}) {
  const hasError = searchParams?.error === '1';

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-900 to-indigo-900">
      <div className="bg-white p-10 rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-black text-gray-800 tracking-tight">管理控制台</h1>
          <p className="text-gray-500 mt-2 text-sm">请输入管理员密码以继续</p>
        </div>

        {hasError && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm text-center">
            密码错误，请重试
          </div>
        )}

        <form action={loginAdmin} className="space-y-6">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">安全密钥</label>
            <input
              type="password"
              name="password"
              required
              autoComplete="off"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
              placeholder="••••••••"
            />
          </div>
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 rounded-xl shadow-md text-sm font-bold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition-all hover:scale-[1.02]"
          >
            安全登录 &rarr;
          </button>
        </form>

        <div className="mt-6 text-center text-xs text-gray-400">
          Powered by Your 5-Letter Domain
        </div>
      </div>
    </div>
  );
}
