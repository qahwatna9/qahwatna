import { useEffect, useState } from 'react'
import { Pencil, Trash2, Plus } from 'lucide-react'
import { supabase } from '../lib/supabase.js'

const empty = { name: '', display_order: 0, is_active: true }

export default function CategoryManager() {
  const [list, setList] = useState([])
  const [form, setForm] = useState(null)
  const [msg, setMsg] = useState('')

  const load = async () => {
    const { data } = await supabase.from('categories').select('*').order('display_order')
    setList(data || [])
  }
  useEffect(() => { load() }, [])

  const save = async (e) => {
    e.preventDefault()
    const row = { name: form.name.trim(), display_order: Number(form.display_order) || 0, is_active: form.is_active }
    const q = form.id ? supabase.from('categories').update(row).eq('id', form.id) : supabase.from('categories').insert(row)
    const { error } = await q
    if (error) return setMsg('تعذر الحفظ: ' + error.message)
    setForm(null); setMsg(''); load()
  }

  const remove = async (c) => {
    if (!confirm(`حذف القسم "${c.name}" وكل أصنافه؟`)) return
    const { error } = await supabase.from('categories').delete().eq('id', c.id)
    if (error) setMsg('تعذر الحذف: ' + error.message); else load()
  }

  return (
    <div className="space-y-4">
      <button className="btn btn-main" onClick={() => setForm({ ...empty, display_order: list.length + 1 })}><Plus size={16} />قسم جديد</button>
      {msg && <p className="text-sm text-red-800">{msg}</p>}
      {form && (
        <form onSubmit={save} className="space-y-3 rounded-xl bg-white p-4">
          <input className="field" placeholder="اسم القسم" value={form.name} required
            onChange={(e) => setForm({ ...form, name: e.target.value })} />
          <label className="block text-sm">الترتيب
            <input className="field mt-1" type="number" value={form.display_order}
              onChange={(e) => setForm({ ...form, display_order: e.target.value })} /></label>
          <label className="flex items-center gap-2"><input type="checkbox" checked={form.is_active}
            onChange={(e) => setForm({ ...form, is_active: e.target.checked })} />ظاهر للزبائن</label>
          <div className="flex gap-2">
            <button className="btn btn-main">حفظ</button>
            <button type="button" className="btn btn-soft" onClick={() => setForm(null)}>إلغاء</button>
          </div>
        </form>
      )}
      <ul className="space-y-2">
        {list.map((c) => (
          <li key={c.id} className="flex items-center gap-3 rounded-xl bg-white p-3">
            <span className="w-6 text-center text-espresso/50">{c.display_order}</span>
            <span className="flex-1 font-semibold">{c.name}{!c.is_active && <em className="mr-2 text-sm text-red-800">مخفي</em>}</span>
            <button className="btn btn-soft !p-2" aria-label="تعديل" onClick={() => setForm(c)}><Pencil size={16} /></button>
            <button className="btn btn-danger !p-2" aria-label="حذف" onClick={() => remove(c)}><Trash2 size={16} /></button>
          </li>
        ))}
      </ul>
    </div>
  )
}
