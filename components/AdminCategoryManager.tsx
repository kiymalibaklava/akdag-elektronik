'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase'
import { ChevronRight, Folder, FolderOpen, Tag, Plus, Trash2, Edit2, X, Check } from 'lucide-react'

interface Category {
  id: string
  name: string
  slug: string
  parent_id: string | null
}

export default function AdminCategoryManager() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [expanded, setExpanded] = useState<string[]>([])
  const [modalOpen, setModalOpen] = useState(false)
  const [editingCat, setEditingCat] = useState<Category | null>(null)
  const [formData, setFormData] = useState({ name: '', slug: '', parent_id: '' as string | null })
  const [saving, setSaving] = useState(false)

  const supabase = createClient()

  useEffect(() => {
    loadCategories()
  }, [])

  const loadCategories = async () => {
    setLoading(true)
    const { data } = await supabase.from('categories').select('*').order('name')
    setCategories(data || [])
    setLoading(false)
  }

  const slugify = (text: string) => {
    const trMap: { [key: string]: string } = { 'ç': 'c', 'ğ': 'g', 'ı': 'i', 'ö': 'o', 'ş': 's', 'ü': 'u', 'Ç': 'c', 'Ğ': 'g', 'İ': 'i', 'Ö': 'o', 'Ş': 's', 'Ü': 'u' }
    return text.toLowerCase()
      .replace(/[çğışüö]/g, (m) => trMap[m])
      .replace(/[^a-z0-9 -]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '')
  }

  const handleOpenModal = (cat: Category | null = null, parentId: string | null = null) => {
    if (cat) {
      setEditingCat(cat)
      setFormData({ name: cat.name, slug: cat.slug, parent_id: cat.parent_id })
    } else {
      setEditingCat(null)
      setFormData({ name: '', slug: '', parent_id: parentId })
    }
    setModalOpen(true)
  }

  const handleSave = async () => {
    if (!formData.name || !formData.slug) return
    setSaving(true)
    
    try {
      if (editingCat) {
        await supabase.from('categories').update({
          name: formData.name,
          slug: formData.slug,
          parent_id: formData.parent_id || null
        }).eq('id', editingCat.id)
      } else {
        await supabase.from('categories').insert([{
          name: formData.name,
          slug: formData.slug,
          parent_id: formData.parent_id || null
        }])
      }
      await loadCategories()
      setModalOpen(false)
    } catch (err) {
      console.error('Kategori kaydedilemedi:', err)
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Bu kategoriyi ve varsa alt kategorilerini silmek istediğinize emin misiniz?')) return
    await supabase.from('categories').delete().eq('id', id)
    loadCategories()
  }

  const toggleExpand = (id: string) => {
    setExpanded(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id])
  }

  const renderTree = (parentId: string | null = null, level: number = 0) => {
    const children = categories.filter(c => c.parent_id === parentId)
    
    if (children.length === 0) return null

    return (
      <div className={`${level > 0 ? 'ml-6 border-l border-white/5 pl-4' : ''} space-y-1 mt-1`}>
        {children.map(cat => {
          const isExpanded = expanded.includes(cat.id)
          const hasChildren = categories.some(c => c.parent_id === cat.id)

          return (
            <div key={cat.id} className="group">
              <div className="flex items-center gap-3 py-2 px-3 hover:bg-white/[0.03] transition-colors rounded-sm">
                <button 
                  onClick={() => toggleExpand(cat.id)}
                  disabled={!hasChildren}
                  className={`p-1 hover:bg-white/10 rounded transition-colors ${!hasChildren ? 'opacity-0 cursor-default' : 'opacity-100'}`}
                >
                  <ChevronRight size={14} className={`transition-transform ${isExpanded ? 'rotate-90' : ''}`} />
                </button>
                
                {level === 0 ? <Folder size={16} className="text-brand-red" /> : 
                 level === 1 ? <FolderOpen size={16} className="text-white/40" /> : 
                 <Tag size={14} className="text-white/20" />}
                
                <div className="flex-1">
                  <span className={`text-sm font-display tracking-wide ${level === 0 ? 'font-bold uppercase text-white' : 'text-white/70'}`}>
                    {cat.name}
                  </span>
                  <span className="ml-3 text-[10px] font-body text-white/20 opacity-0 group-hover:opacity-100 transition-opacity">
                    /{cat.slug}
                  </span>
                </div>

                <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  {level < 2 && (
                    <button onClick={() => handleOpenModal(null, cat.id)} className="p-1.5 hover:text-green-400 text-white/30 transition-colors" title="Alt Kategori Ekle">
                      <Plus size={12} />
                    </button>
                  )}
                  <button onClick={() => handleOpenModal(cat)} className="p-1.5 hover:text-white text-white/30 transition-colors" title="Düzenle">
                    <Edit2 size={12} />
                  </button>
                  <button onClick={() => handleDelete(cat.id)} className="p-1.5 hover:text-brand-red text-white/30 transition-colors" title="Sil">
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>

              {isExpanded && renderTree(cat.id, level + 1)}
            </div>
          )
        })}
      </div>
    )
  }

  if (loading) return <div className="flex justify-center py-12"><div className="w-6 h-6 border-2 border-brand-red border-t-transparent rounded-full animate-spin" /></div>

  return (
    <div className="bg-[#141414] border border-white/8 p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h2 className="font-display font-bold text-xl uppercase tracking-wide text-white red-line">Kategori Yönetimi</h2>
          <p className="font-body text-white/30 text-xs mt-1">Sürükle bırak özelliği yakında eklenecektir.</p>
        </div>
        <button onClick={() => handleOpenModal()} className="btn-primary text-xs">
          <Plus size={14} /> Ana Kategori Ekle
        </button>
      </div>

      <div className="space-y-2">
        {renderTree(null)}
      </div>

      {categories.length === 0 && (
        <div className="text-center py-12 border border-dashed border-white/10">
          <p className="text-white/20 text-sm font-body">Henüz kategori eklenmemiş.</p>
        </div>
      )}

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="bg-[#1A1A1A] border border-white/10 p-8 w-full max-w-md shadow-2xl relative">
            <button onClick={() => setModalOpen(false)} className="absolute top-4 right-4 text-white/20 hover:text-white transition-colors">
              <X size={20} />
            </button>
            
            <h3 className="font-display font-black text-xl uppercase text-white mb-6">
              {editingCat ? 'Kategoriyi Düzenle' : 'Yeni Kategori'}
            </h3>

            <div className="space-y-6">
              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/40 mb-2">Kategori Adı</label>
                <input 
                  type="text" 
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value, slug: slugify(e.target.value)})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-white font-body focus:border-brand-red outline-none transition-colors"
                  placeholder="Örn: Aktif Hoparlörler"
                />
              </div>

              <div>
                <label className="block text-[10px] font-display font-bold uppercase tracking-widest text-white/40 mb-2">Slug (URL)</label>
                <input 
                  type="text" 
                  value={formData.slug}
                  onChange={(e) => setFormData({...formData, slug: e.target.value})}
                  className="w-full bg-white/5 border border-white/10 p-4 text-white font-body focus:border-brand-red outline-none transition-colors"
                  placeholder="orn-aktif-hoparlorler"
                />
              </div>

              <button 
                onClick={handleSave}
                disabled={saving || !formData.name}
                className="btn-primary w-full justify-center py-4 text-sm disabled:opacity-50"
              >
                {saving ? 'Kaydediliyor...' : editingCat ? 'Güncelle' : 'Ekle'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
