'use client';
import { useState } from 'react';
import { generateGlobalSEOKeywords, pingSearchEngines } from './actions';
import { Sparkles, Send, RefreshCw, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SEOClient({ initialKeywords }: { initialKeywords: string }) {
  const [keywords, setKeywords] = useState(initialKeywords);
  const [loading, setLoading] = useState(false);
  const [loadingPing, setLoadingPing] = useState(false);
  const [msg, setMsg] = useState('');
  const [msgType, setMsgType] = useState<'success' | 'error'>('success');

  const handleGenerate = async () => {
    setLoading(true);
    setMsg('大模型正在分析全站分类及主要 AI 赛道，生成高商业价值的核心 SEO 关键字...');
    setMsgType('success');
    
    try {
      const res = await generateGlobalSEOKeywords();
      if (res.success) {
        setKeywords(res.keywords);
        setMsg('自动提取与设定完成！现已应用于前台首页 Meta Keywords 中。');
        setMsgType('success');
      } else {
        setMsg('提取失败: ' + res.message);
        setMsgType('error');
      }
    } catch (e: any) {
      setMsg('系统错误: ' + e.message);
      setMsgType('error');
    }
    setLoading(false);
  };

  const handlePing = async () => {
    setLoadingPing(true);
    setMsg('正在连接 Google & Bing Webmaster 接口推送 sitemap 收录...');
    setMsgType('success');
    try {
      const res = await pingSearchEngines();
      if (res.success) {
        setMsg(res.message);
        setMsgType('success');
      } else {
        setMsg('推送异常: ' + res.message);
        setMsgType('error');
      }
    } catch(e: any) {
      setMsg('网络异常: ' + e.message);
      setMsgType('error');
    }
    setLoadingPing(false);
  };

  return (
    <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col gap-6">
      <div>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-purple-50 text-purple-600 rounded-2xl"><Sparkles className="w-6 h-6" /></div>
          <h2 className="text-xl font-bold text-slate-800">全站智能 SEO 关键词提取</h2>
        </div>
        <p className="text-slate-500 text-sm leading-relaxed mb-6">
          自动根据当前所有的内容赛道 (分类) 调用大模型分析出对应的 SEO Meta 关键词。这可以帮助在没有专门 SEO 设置专家的情况下提高站点的基础检索率。
        </p>

        <div className="mb-4">
          <label className="block text-slate-700 font-bold mb-2">当前系统应用的 SEO 关键词：</label>
          <textarea 
            readOnly 
            rows={4} 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-sm text-slate-600 focus:outline-none"
            value={keywords || '（暂无关键字，点击下方按钮开始分析生成）'}
          />
        </div>

        <button 
          onClick={handleGenerate}
          disabled={loading}
          className={"w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 " + (loading ? 'bg-slate-100 text-slate-400' : 'bg-purple-600 hover:bg-purple-700 text-white shadow-md hover:shadow-purple-600/20 active:scale-95')}
        >
          {loading ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Sparkles className="w-5 h-5"/>}
          AI 一键深入分析提取并应用
        </button>
      </div>

      <div className="border-t border-slate-100 pt-6 mt-2">
        <h3 className="font-bold text-slate-800 mb-2">向搜索引擎主动申请新内容收录 (Ping)</h3>
        <p className="text-slate-500 text-xs mb-4">当您添加了一批新的 AI 工具后，可以使用此功能触发搜索引擎蜘蛛的抓取爬虫对您的站点进行强制收录。</p>
        <button 
          onClick={handlePing}
          disabled={loadingPing || loading}
          className={"w-full py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 border " + (loadingPing ? 'bg-slate-50 text-slate-400 border-slate-200' : 'bg-white border-emerald-600 text-emerald-600 hover:bg-emerald-50 active:scale-95')}
        >
          {loadingPing ? <RefreshCw className="w-5 h-5 animate-spin"/> : <Send className="w-5 h-5"/>}
          主推给 Google 和 Bing 强制收录
        </button>
      </div>

      {msg && (
        <div className={`p-4 rounded-xl border flex items-start gap-3 mt-4 text-sm font-medium ${msgType === 'error' ? 'bg-rose-50 border-rose-200 text-rose-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
          {msgType === 'error' ? <AlertTriangle className="w-5 h-5 shrink-0" /> : <CheckCircle className="w-5 h-5 shrink-0" />}
          <span>{msg}</span>
        </div>
      )}
    </div>
  );
}
