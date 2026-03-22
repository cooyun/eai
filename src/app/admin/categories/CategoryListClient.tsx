"use client";
import { useState } from 'react';
import { Trash2, Edit2, Check, X, Wand2, RefreshCw } from 'lucide-react';

export default function CategoryListClient({ categories, deleteAction, updateAction, autoFillAction }: { categories: any[], deleteAction: any, updateAction: any, autoFillAction: any }) {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<any>({});
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const handleEditClick = (c: any) => {
    setEditingId(c.id);
    setEditForm({ slug: c.slug, nameZh: c.nameZh, nameEn: c.nameEn, descZh: c.descZh || '', descEn: c.descEn || '' });
  };

  const handleSave = async (id: string) => {
    setLoadingId(id);
    await updateAction(id, editForm);
    setEditingId(null);
    setLoadingId(null);
  };

  const handleAutoFill = async (id: string, nameZh: string) => {
    setLoadingId(id);
    await autoFillAction(id, nameZh);
    setLoadingId(null);
  };

  return (
    <>
      {categories.map((cat) => (
        <tr key={cat.id} className="hover:bg-slate-50/50 transition-colors">
          {editingId === cat.id ? (
            <td colSpan={4} className="px-6 py-4">
              <div className="flex flex-col gap-3">
                <div className="grid grid-cols-4 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">Slug</span>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.slug} onChange={e => setEditForm({...editForm, slug: e.target.value})} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">中文名称</span>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.nameZh} onChange={e => setEditForm({...editForm, nameZh: e.target.value})} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">英文名称</span>
                    <input type="text" className="w-full border rounded p-2 text-sm" value={editForm.nameEn} onChange={e => setEditForm({...editForm, nameEn: e.target.value})} />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">中文简介</span>
                    <textarea className="w-full border rounded p-2 text-sm" rows={2} value={editForm.descZh} onChange={e => setEditForm({...editForm, descZh: e.target.value})} />
                  </div>
                  <div>
                    <span className="text-xs text-slate-500 mb-1 block">英文简介</span>
                    <textarea className="w-full border rounded p-2 text-sm" rows={2} value={editForm.descEn} onChange={e => setEditForm({...editForm, descEn: e.target.value})} />
                  </div>
                </div>
                <div className="flex justify-end gap-2 mt-2">
                  <button onClick={() => setEditingId(null)} className="px-4 py-2 border rounded-lg text-sm bg-white hover:bg-slate-50"><X className="w-4 h-4 inline mr-1"/>取消</button>
                  <button onClick={() => handleSave(cat.id)} className="px-4 py-2 rounded-lg text-sm bg-indigo-600 text-white hover:bg-indigo-700" disabled={loadingId === cat.id}>
                    {loadingId === cat.id ? <RefreshCw className="w-4 h-4 inline animate-spin mr-1"/> : <Check className="w-4 h-4 inline mr-1"/>}
                    保存
                  </button>
                </div>
              </div>
            </td>
          ) : (
            <>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="font-mono text-sm text-emerald-600 bg-emerald-50 px-2 py-1 rounded-md border border-emerald-100">/{cat.slug}</span>
              </td>
              <td className="px-6 py-4">
                <div className="text-sm font-bold text-slate-900">{cat.nameZh}</div>
                <div className="text-xs text-slate-500">{cat.nameEn}</div>
                {(cat.descZh || cat.descEn) && (
                  <div className="text-xs text-slate-400 mt-1 line-clamp-1">{cat.descZh}</div>
                )}
              </td>
              <td className="px-6 py-4 whitespace-nowrap">
                <span className="inline-flex items-center justify-center px-2.5 py-1 text-xs font-bold rounded-full bg-slate-100 text-slate-700">
                  {cat._count.tools} 个工具
                </span>
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-right">
                <div className="flex justify-end gap-2">
                  {(!cat.descZh || !cat.descEn || !cat.nameEn) && (
                    <button onClick={() => handleAutoFill(cat.id, cat.nameZh)} title="AI 自动完善简介与翻译" disabled={loadingId === cat.id} className="text-amber-500 hover:text-amber-600 hover:bg-amber-50 p-2 rounded-lg transition-colors">
                      {loadingId === cat.id ? <RefreshCw className="h-4 w-4 animate-spin"/> : <Wand2 className="h-4 w-4" />}
                    </button>
                  )}
                  <button onClick={() => handleEditClick(cat)} className="text-indigo-500 hover:text-indigo-600 hover:bg-indigo-50 p-2 rounded-lg transition-colors">
                    <Edit2 className="h-4 w-4" />
                  </button>
                  <form action={deleteAction.bind(null, cat.id)} className="inline">
                    <button type="submit" className="text-rose-400 hover:text-rose-600 hover:bg-rose-50 p-2 rounded-lg transition-colors">
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </form>
                </div>
              </td>
            </>
          )}
        </tr>
      ))}
      {categories.length === 0 && (
        <tr><td colSpan={4} className="px-6 py-12 text-center text-slate-400 font-medium">尚未配置任何分类</td></tr>
      )}
    </>
  );
}
