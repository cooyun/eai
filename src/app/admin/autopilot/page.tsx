"use client";
import { useState } from 'react';
import { Bot, Zap, Database, CheckCircle, AlertTriangle, RefreshCw } from 'lucide-react';
import { runAIAgent } from './actions';

export default function AutoPilotPage() {
  const [loading, setLoading] = useState(false);
  const [logs, setLogs] = useState<{time: string, msg: string, type: 'info'|'success'|'error'}[]>([]);
  const [marketHeat, setMarketHeat] = useState<'Trending' | 'Newest' | 'HighVolume'>('Trending');

  const addLog = (msg: string, type: 'info'|'success'|'error' = 'info') => {
    setLogs(prev => [{time: new Date().toLocaleTimeString(), msg, type}, ...prev]);
  };

  const handleManualSync = async () => {
    setLoading(true);
    addLog(`🚀 启动大模型，正在按 [${marketHeat}] 策略全网搜索最新 AI 产品...`, 'info');
    
    try {
      const res = await runAIAgent(10, marketHeat);
      if (res.success) {
        addLog(res.message, 'success');
      } else {
        addLog('❌ 抓取失败: ' + res.message, 'error');
      }
    } catch (err) {
      addLog('❌ 发生系统错误, 请检查 GROQ_API_KEY 配置', 'error');
    }
    setLoading(false);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-fade-in-up">
      <div>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight flex items-center gap-3">
          <Bot className="w-8 h-8 text-indigo-600" /> AI 全自动巡航与采集引擎
        </h1>
        <p className="text-slate-500 mt-2 font-medium">配置大模型自动接管数据采集、双语翻译、Logo 抓取及分类归档。</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-slate-900 rounded-3xl p-8 shadow-2xl relative overflow-hidden">
          <div className="absolute right-0 top-0 p-8 opacity-5"><Database className="w-48 h-48 text-white" /></div>
          <h2 className="text-xl font-bold text-white mb-4">引擎状态面板</h2>
          
          <div className="flex gap-4 mb-6">
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 w-full">
              <div className="text-slate-400 text-sm font-medium mb-1">当前大模型驱动</div>
              <div className="text-emerald-400 font-black text-lg flex items-center gap-2"><div className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></div> Llama 3.3 70b</div>
            </div>
            <div className="bg-slate-800/50 p-4 rounded-2xl border border-slate-700 w-full">
              <div className="text-slate-400 text-sm font-medium mb-1">定时自动更新 (Cron)</div>
              <div className="text-indigo-400 font-black text-lg">每日凌晨 03:00</div>
            </div>
          </div>

          <div className="mb-8">
            <label className="text-slate-400 text-sm font-medium mb-2 block">目标市场热度挖掘策略</label>
            <select 
              value={marketHeat} 
              onChange={e => setMarketHeat(e.target.value as any)}
              disabled={loading}
              className="w-full bg-slate-800 border border-slate-700 text-white rounded-xl p-3 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
            >
              <option value="Trending">🔥 爆款趋势 (Trending - 近期快速增长)</option>
              <option value="Newest">✨ 最新发布 (Newest - 前沿早期产品)</option>
              <option value="HighVolume">📈 高搜索量 (High Volume - 主流刚需工具)</option>
            </select>
          </div>

          <button 
            onClick={handleManualSync} 
            disabled={loading}
            className={"w-full py-4 rounded-2xl font-black text-lg transition-all flex items-center justify-center gap-2 " + (loading ? "bg-slate-700 text-slate-400 cursor-not-allowed" : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white shadow-lg shadow-indigo-500/20 hover:scale-[1.02] active:scale-95")}
          >
            {loading ? <RefreshCw className="w-6 h-6 animate-spin" /> : <Zap className="w-6 h-6 fill-current" />}
            {loading ? 'AI 正在思考并提取数据 (约需 5-10 秒)...' : '立即执行一次：智能批量挖掘 10 个新应用'}
          </button>
        </div>

        <div className="bg-white border border-slate-200 rounded-3xl p-6 shadow-sm flex flex-col h-full">
          <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
            <ActivityIcon /> 实时运行日志
          </h3>
          <div className="flex-1 bg-slate-50 rounded-xl p-4 overflow-y-auto max-h-[300px] border border-slate-100 font-mono text-xs space-y-3">
            {logs.length === 0 ? (
              <div className="text-slate-400 text-center mt-10">暂无运行记录，点击左侧按钮开始。</div>
            ) : (
              logs.map((log, i) => (
                <div key={i} className={"pb-2 border-b border-slate-200/50 last:border-0 " + (log.type === 'error' ? 'text-rose-500' : log.type === 'success' ? 'text-emerald-600' : 'text-slate-600')}>
                  <span className="opacity-50 mr-2">[{log.time}]</span> 
                  {log.type === 'success' && <CheckCircle className="inline w-3 h-3 mr-1" />}
                  {log.type === 'error' && <AlertTriangle className="inline w-3 h-3 mr-1" />}
                  {log.msg}
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function ActivityIcon() {
  return <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-500"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>;
}
