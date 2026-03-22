
"use client";
import { addCategory, deleteCategory, updateCategory, aiTranslateCategory } from '../actions';
import { Wand2, Trash2, Save } from 'lucide-react';

export default function ClientPage({ initialCats }: any) {
  const t = async (id:string) => {
    const zh = (document.getElementById('z-'+id) as any).value;
    const r = await aiTranslateCategory(zh);
    if(r) {
      (document.getElementById('e-'+id) as any).value = r.nameEn;
      (document.getElementById('s-'+id) as any).value = r.slug;
    }
  };
  const s = async (id:string) => {
    await updateCategory(id, {
      slug: (document.getElementById('s-'+id) as any).value,
      nameZh: (document.getElementById('z-'+id) as any).value,
      nameEn: (document.getElementById('e-'+id) as any).value
    });
    alert('✅ 保存成功');
  };

  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">分类在线编辑 (AI翻译)</h1>
      <form action={addCategory} className="flex gap-2 bg-white p-4 shadow rounded-xl">
        <input name="slug" placeholder="URL别名" className="border p-2 rounded w-1/4"/>
        <input name="nameZh" placeholder="中文" required className="border p-2 rounded w-1/4"/>
        <input name="nameEn" placeholder="英文" className="border p-2 rounded w-1/4"/>
        <button type="submit" className="bg-black text-white px-4 rounded">新增</button>
      </form>
      <div className="bg-white p-4 shadow rounded-xl space-y-2">
        {initialCats.map((c:any) => (
          <div key={c.id} className="flex gap-2 items-center border-b pb-2">
            <input id={'s-'+c.id} defaultValue={c.slug} className="border p-2 rounded w-1/4" title="Slug"/>
            <input id={'z-'+c.id} defaultValue={c.nameZh} className="border p-2 rounded w-1/4" title="中文"/>
            <input id={'e-'+c.id} defaultValue={c.nameEn} className="border p-2 rounded w-1/4" title="英文"/>
            <button onClick={()=>t(c.id)} className="p-2 bg-purple-100 text-purple-600 rounded" title="AI一键翻译别名"><Wand2 size={18}/></button>
            <button onClick={()=>s(c.id)} className="p-2 bg-emerald-100 text-emerald-600 rounded" title="保存修改"><Save size={18}/></button>
            <form action={deleteCategory.bind(null, c.id)}>
              <button className="p-2 bg-rose-100 text-rose-600 rounded"><Trash2 size={18}/></button>
            </form>
          </div>
        ))}
      </div>
    </div>
  );
}
