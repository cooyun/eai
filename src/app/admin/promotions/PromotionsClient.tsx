"use client";
import { useState } from 'react';
import { fetchAffiliateLink } from './actions';
import { RefreshCw, Search, ExternalLink } from 'lucide-react';

export default function PromotionsClient({ tools }: { tools: any[] }) {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleFetch = async (id: string, url: string) => {
    setLoadingId(id);
    await fetchAffiliateLink(id, url);
    setLoadingId(null);
  };

  return (
    <>
      {tools.map(tool => (
        <tr key={tool.id} className="hover:bg-slate-50/50 transition-colors">
          <td className="px-6 py-4 whitespace-nowrap">
            <div className="flex items-center gap-3">
              {tool.logoUrl ? (
                <img src={tool.logoUrl} className="w-10 h-10 rounded-full bg-slate-100 object-cover border border-slate-200" />
              ) : (
                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center font-bold text-indigo-600 border border-indigo-200">
                  {tool.name.substring(0, 1)}
                </div>
              )}
              <div className="text-sm font-bold text-slate-900">{tool.name}</div>
            </div>
          </td>
          <td className="px-6 py-4">
            <a href={tool.url} target="_blank" className="text-emerald-600 hover:text-emerald-700 font-mono text-sm max-w-xs truncate block hover:underline">
              {tool.url}
            </a>
          </td>
          <td className="px-6 py-4 whitespace-nowrap text-right">
            <button 
              onClick={() => handleFetch(tool.id, tool.url)} 
              disabled={loadingId === tool.id}
              className="bg-indigo-50 text-indigo-700 hover:bg-indigo-600 hover:text-white px-4 py-2 rounded-xl text-sm font-bold transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm active:scale-95"
            >
              {loadingId === tool.id ? <RefreshCw className="h-4 w-4 animate-spin inline mr-1" /> : <Search className="h-4 w-4 inline mr-1" />}
              {loadingId === tool.id ? '检索中...' : '一键探索推广链接'}
            </button>
          </td>
        </tr>
      ))}
    </>
  );
}
