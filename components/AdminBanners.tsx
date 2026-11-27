'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  Plus,
  Trash2,
  Edit3,
  Save,
  X,
  Image as ImageIcon,
  Link as LinkIcon,
  Check,
  AlertTriangle,
  Eye,
  EyeOff,
  ZoomIn,
  Crop,
  ArrowUp,
  ArrowDown,
  ExternalLink,
  Sparkles,
} from 'lucide-react'
import Image from 'next/image'
import Cropper from 'react-easy-crop'
import { getCroppedImg } from '@/lib/cropImage'

interface StoreBanner {
  id: string
  title: string | null
  subtitle: string | null
  image_url: string
  link_url: string | null
  is_active: boolean
  sort_order: number
}

interface Product {
  id: string
  ad: string
  slug: string
}

export default function AdminBanners({ supabase }: { supabase: any }) {
  const [banners, setBanners] = useState<StoreBanner[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)

  // New Banner Form State
  const [showForm, setShowForm] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [newBanner, setNewBanner] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
  })

  // Edit Banner State
  const [editingBanner, setEditingBanner] = useState<StoreBanner | null>(null)
  const [editForm, setEditForm] = useState({
    title: '',
    subtitle: '',
    image_url: '',
    link_url: '',
    sort_order: 0,
    is_active: true,
  })
  const [editLinkType, setEditLinkType] = useState<'none' | 'product' | 'custom'>('none')
  const [editSelectedProductId, setEditSelectedProductId] = useState('')
  const [editProductSearchTerm, setEditProductSearchTerm] = useState('')
  const [showEditProductDropdown, setShowEditProductDropdown] = useState(false)
  const [editImageFile, setEditImageFile] = useState<File | null>(null)
  const [editImagePreview, setEditImagePreview] = useState<string | null>(null)

  // Link selection type for New Banner
  const [linkType, setLinkType] = useState<'none' | 'product' | 'custom'>('none')
  const [selectedProductId, setSelectedProductId] = useState('')
  const [productSearchTerm, setProductSearchTerm] = useState('')
  const [showProductDropdown, setShowProductDropdown] = useState(false)
  const [imageFile, setImageFile] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string | null>(null)

  // Cropper State
  const [showCropModal, setShowCropModal] = useState(false)
  const [cropTarget, setCropTarget] = useState<'new' | 'edit'>('new')
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null)
  const [activeCropImage, setActiveCropImage] = useState<string | null>(null)

  const loadData = useCallback(async () => {
    setLoading(true)

    // Load banners
    const { data: bData } = await supabase
      .from('store_banners')
      .select('id, title, subtitle, image_url, link_url, is_active, sort_order, created_at')
      .order('sort_order', { ascending: true })
      .order('created_at', { ascending: false })

    if (bData) setBanners(bData)

    // Load products for dropdown (limit to avoid egress)
    const { data: pData } = await supabase
      .from('urunler')
      .select('id, ad, slug')
      .order('ad', { ascending: true })
      .limit(300)

    if (pData) setProducts(pData)

    setLoading(false)
  }, [supabase])

  useEffect(() => {
    loadData()
  }, [loadData])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>, target: 'new' | 'edit') => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const objectUrl = URL.createObjectURL(file)
    setActiveCropImage(objectUrl)
    setCropTarget(target)
    setShowCropModal(true)
    e.target.value = ''
  }

  const onCropComplete = useCallback((croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels)
  }, [])

  const handleCropSave = async () => {
    try {
      if (!activeCropImage || !croppedAreaPixels) return
      const croppedFile = await getCroppedImg(activeCropImage, croppedAreaPixels)

      if (cropTarget === 'new') {
        setImageFile(croppedFile)
        setImagePreview(URL.createObjectURL(croppedFile))
      } else {
        setEditImageFile(croppedFile)
        setEditImagePreview(URL.createObjectURL(croppedFile))
      }

      setShowCropModal(false)
      setActiveCropImage(null)
    } catch (e) {
      console.error(e)
      alert('Görsel kırpılırken bir hata oluştu.')
    }
  }

  // CREATE BANNER
  const handleSaveBanner = async () => {
    if (!imageFile && !newBanner.image_url) {
      alert('Lütfen bir kampanya görseli seçin!')
      return
    }

    setUploading(true)
    try {
      let finalImageUrl = newBanner.image_url

      if (imageFile) {
        const fileExt = imageFile.name.split('.').pop()
        const fileName = `banner-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('kampanya-gorselleri')
          .upload(filePath, imageFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('kampanya-gorselleri').getPublicUrl(filePath)
        finalImageUrl = data.publicUrl
      }

      let finalLinkUrl = newBanner.link_url
      if (linkType === 'product' && selectedProductId) {
        const prod = products.find((p) => p.id === selectedProductId)
        if (prod) {
          finalLinkUrl = `/urun/${prod.slug || prod.id}`
        }
      } else if (linkType === 'none') {
        finalLinkUrl = ''
      }

      const { error } = await supabase.from('store_banners').insert({
        title: newBanner.title || null,
        subtitle: newBanner.subtitle || null,
        image_url: finalImageUrl,
        link_url: finalLinkUrl || null,
        sort_order: Number(newBanner.sort_order) || 0,
      })

      if (error) throw error

      alert('Kampanya banner başarıyla eklendi!')
      setShowForm(false)
      resetForm()
      loadData()
    } catch (err: any) {
      console.error(err)
      alert('Banner kaydedilirken hata oluştu: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  // START EDITING BANNER
  const startEditing = (b: StoreBanner) => {
    setEditingBanner(b)
    setEditForm({
      title: b.title || '',
      subtitle: b.subtitle || '',
      image_url: b.image_url,
      link_url: b.link_url || '',
      sort_order: b.sort_order || 0,
      is_active: b.is_active,
    })
    setEditImageFile(null)
    setEditImagePreview(null)

    // Check link type
    if (!b.link_url) {
      setEditLinkType('none')
    } else if (b.link_url.startsWith('/urun/')) {
      setEditLinkType('product')
      const slugOrId = b.link_url.replace('/urun/', '')
      const found = products.find((p) => p.slug === slugOrId || p.id === slugOrId)
      if (found) {
        setEditSelectedProductId(found.id)
        setEditProductSearchTerm(found.ad)
      } else {
        setEditProductSearchTerm(slugOrId)
      }
    } else {
      setEditLinkType('custom')
    }
  }

  // SAVE EDITED BANNER
  const handleSaveEdit = async () => {
    if (!editingBanner) return

    setUploading(true)
    try {
      let finalImageUrl = editForm.image_url

      if (editImageFile) {
        const fileExt = editImageFile.name.split('.').pop()
        const fileName = `banner-${Date.now()}.${fileExt}`
        const filePath = `${fileName}`

        const { error: uploadError } = await supabase.storage
          .from('kampanya-gorselleri')
          .upload(filePath, editImageFile)

        if (uploadError) throw uploadError

        const { data } = supabase.storage.from('kampanya-gorselleri').getPublicUrl(filePath)
        finalImageUrl = data.publicUrl
      }

      let finalLinkUrl = editForm.link_url
      if (editLinkType === 'product' && editSelectedProductId) {
        const prod = products.find((p) => p.id === editSelectedProductId)
        if (prod) {
          finalLinkUrl = `/urun/${prod.slug || prod.id}`
        }
      } else if (editLinkType === 'none') {
        finalLinkUrl = ''
      }

      const { error } = await supabase
        .from('store_banners')
        .update({
          title: editForm.title || null,
          subtitle: editForm.subtitle || null,
          image_url: finalImageUrl,
          link_url: finalLinkUrl || null,
          sort_order: Number(editForm.sort_order) || 0,
          is_active: editForm.is_active,
        })
        .eq('id', editingBanner.id)

      if (error) throw error

      alert('Banner başarıyla güncellendi!')
      setEditingBanner(null)
      loadData()
    } catch (err: any) {
      console.error(err)
      alert('Güncelleme sırasında hata: ' + err.message)
    } finally {
      setUploading(false)
    }
  }

  const resetForm = () => {
    setNewBanner({ title: '', subtitle: '', image_url: '', link_url: '', sort_order: 0 })
    setImageFile(null)
    setImagePreview(null)
    setLinkType('none')
    setSelectedProductId('')
    setProductSearchTerm('')
    setShowProductDropdown(false)
  }

  const toggleActive = async (banner: StoreBanner) => {
    const { error } = await supabase
      .from('store_banners')
      .update({ is_active: !banner.is_active })
      .eq('id', banner.id)

    if (!error) {
      setBanners(banners.map((b) => (b.id === banner.id ? { ...b, is_active: !banner.is_active } : b)))
    }
  }

  const moveOrder = async (banner: StoreBanner, direction: 'up' | 'down') => {
    const newOrder = direction === 'up' ? banner.sort_order - 1 : banner.sort_order + 1
    const { error } = await supabase
      .from('store_banners')
      .update({ sort_order: newOrder })
      .eq('id', banner.id)

    if (!error) {
      loadData()
    }
  }

  const deleteBanner = async (id: string) => {
    if (!confirm('Bu bannerı silmek istediğinize emin misiniz?')) return

    const { error } = await supabase.from('store_banners').delete().eq('id', id)

    if (!error) {
      setBanners(banners.filter((b) => b.id !== id))
    }
  }

  return (
    <div className="space-y-8">
      {/* Page Title & Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/5 pb-6">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles size={16} className="text-brand-red" />
            <h2 className="text-xl font-display font-bold text-white uppercase tracking-widest">
              Anasayfa & Vitrin Banner Yönetimi
            </h2>
          </div>
          <p className="text-white/50 text-sm">
            Anasayfa tepe kısmındaki hero banner slider&apos;ı ve ürünler sayfasındaki vitrin kampanyalarını buradan yönetebilirsiniz.
          </p>
        </div>

        {!showForm && (
          <button onClick={() => setShowForm(true)} className="btn-primary self-start sm:self-auto">
            <Plus size={18} />
            Yeni Banner Ekle
          </button>
        )}
      </div>

      {/* NEW BANNER FORM */}
      {showForm && (
        <div className="bg-[#141414] border border-brand-red/40 p-6 shadow-2xl relative overflow-hidden">
          <div className="flex items-center justify-between mb-6 border-b border-white/10 pb-4">
            <h3 className="text-brand-red font-display font-bold uppercase tracking-widest text-lg">
              Yeni Hero / Vitrin Banner Oluştur
            </h3>
            <button
              onClick={() => {
                setShowForm(false)
                resetForm()
              }}
              className="text-white/40 hover:text-white"
            >
              <X size={20} />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-8 relative z-10">
            {/* Left: Image Upload */}
            <div>
              <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-2">
                Banner Görseli
              </label>

              <div className="flex items-start gap-2 bg-amber-500/10 border border-amber-500/30 p-3 mb-3 rounded-sm">
                <AlertTriangle size={14} className="text-amber-400 flex-shrink-0 mt-0.5" />
                <div className="text-xs text-amber-400/90 leading-relaxed">
                  <span className="font-bold">Yatay (landscape) fotoğraf kullanın.</span>
                  <br />
                  Önerilen boyut: <span className="font-mono font-bold">1920 × 720 px</span> veya{' '}
                  <span className="font-mono font-bold">1600 × 600 px</span>
                </div>
              </div>

              <div className="border-2 border-dashed border-white/10 hover:border-brand-red/50 transition-colors bg-[#0F0F0F] rounded-sm p-4 text-center cursor-pointer relative group">
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageSelect(e, 'new')}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-20"
                />

                {imagePreview ? (
                  <div className="relative aspect-[16/6] w-full overflow-hidden bg-black">
                    <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                      <span className="text-white text-xs font-semibold uppercase tracking-wider">Resmi Değiştir</span>
                    </div>
                  </div>
                ) : (
                  <div className="py-12 flex flex-col items-center justify-center text-white/30 group-hover:text-white/70">
                    <ImageIcon size={32} className="mb-3" />
                    <span className="text-sm">Görsel seçmek için tıklayın veya sürükleyin</span>
                    <span className="text-xs mt-1 text-white/20">PNG, JPG, WEBP — Yatay format</span>
                  </div>
                )}
              </div>
            </div>

            {/* Right: Details */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-1">
                  Başlık (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={newBanner.title}
                  onChange={(e) => setNewBanner({ ...newBanner, title: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                  placeholder="Örn: AKUSTEK YENİ NESİL OKUL SAATİ"
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-1">
                  Alt Açıklama (Opsiyonel)
                </label>
                <input
                  type="text"
                  value={newBanner.subtitle}
                  onChange={(e) => setNewBanner({ ...newBanner, subtitle: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                  placeholder="Örn: Akıllı zil ve okul anons sistemlerinde resmi ana bayilik güvencesi"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-1">
                    Sıralama (Sort Order)
                  </label>
                  <input
                    type="number"
                    value={newBanner.sort_order}
                    onChange={(e) => setNewBanner({ ...newBanner, sort_order: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm font-mono"
                    placeholder="0"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-2">
                  Tıklama Linki (Yönlendirme)
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => setLinkType('none')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                      linkType === 'none'
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-[#0F0F0F] border-white/5 text-white/40'
                    }`}
                  >
                    Yok
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType('product')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                      linkType === 'product'
                        ? 'bg-brand-red/20 border-brand-red/50 text-brand-red'
                        : 'bg-[#0F0F0F] border-white/5 text-white/40'
                    }`}
                  >
                    Ürün Seç
                  </button>
                  <button
                    type="button"
                    onClick={() => setLinkType('custom')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                      linkType === 'custom'
                        ? 'bg-brand-red/20 border-brand-red/50 text-brand-red'
                        : 'bg-[#0F0F0F] border-white/5 text-white/40'
                    }`}
                  >
                    Özel Link
                  </button>
                </div>

                {linkType === 'product' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={productSearchTerm}
                      onChange={(e) => {
                        setProductSearchTerm(e.target.value)
                        setShowProductDropdown(true)
                        setSelectedProductId('')
                      }}
                      onFocus={() => setShowProductDropdown(true)}
                      className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                      placeholder="Ürün adı arayın..."
                    />
                    {selectedProductId && (
                      <div className="absolute right-3 top-3 text-brand-red">
                        <Check size={16} />
                      </div>
                    )}
                    {showProductDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-white/10 max-h-56 overflow-y-auto shadow-2xl">
                        {products
                          .filter((p) => p.ad.toLowerCase().includes(productSearchTerm.toLowerCase()))
                          .slice(0, 30)
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setSelectedProductId(p.id)
                                setProductSearchTerm(p.ad)
                                setShowProductDropdown(false)
                              }}
                              className="px-4 py-2.5 hover:bg-brand-red/20 hover:text-white cursor-pointer text-xs text-white/70 transition-colors border-b border-white/5 last:border-0"
                            >
                              {p.ad}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {linkType === 'custom' && (
                  <input
                    type="text"
                    value={newBanner.link_url}
                    onChange={(e) => setNewBanner({ ...newBanner, link_url: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                    placeholder="Örn: /bayi/basvuru veya /urunler?marka=SHURE"
                  />
                )}
              </div>

              <div className="pt-4 flex gap-3 border-t border-white/5">
                <button
                  onClick={handleSaveBanner}
                  disabled={uploading}
                  className="btn-primary flex-1 justify-center text-xs"
                >
                  {uploading ? (
                    'Yükleniyor...'
                  ) : (
                    <>
                      <Save size={16} /> Kaydet ve Yayınla
                    </>
                  )}
                </button>
                <button
                  onClick={() => {
                    setShowForm(false)
                    resetForm()
                  }}
                  disabled={uploading}
                  className="px-4 border border-white/10 hover:bg-white/5 text-white text-xs uppercase font-bold tracking-wider transition-colors"
                >
                  İptal
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* EDIT BANNER MODAL */}
      {editingBanner && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/85 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          <div className="bg-[#141414] border border-brand-red/40 w-full max-w-3xl flex flex-col shadow-2xl relative overflow-hidden max-h-[90vh]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0F0F0F]">
              <div className="flex items-center gap-2 text-white">
                <Edit3 size={18} className="text-brand-red" />
                <h3 className="font-display font-bold uppercase tracking-widest text-sm">Bannerı Düzenle</h3>
              </div>
              <button onClick={() => setEditingBanner(null)} className="text-white/40 hover:text-white transition-colors">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-5">
              {/* Image Preview & Change */}
              <div>
                <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-2">
                  Banner Görseli
                </label>
                <div className="relative aspect-[16/6] w-full bg-black overflow-hidden border border-white/10 rounded-sm group">
                  <img
                    src={editImagePreview || editForm.image_url}
                    alt="Banner Edit Preview"
                    className="w-full h-full object-cover"
                  />
                  <label className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                    <span className="bg-brand-red text-white text-xs font-bold uppercase tracking-wider px-3 py-1.5 shadow-lg">
                      Resmi Değiştir
                    </span>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageSelect(e, 'edit')}
                      className="hidden"
                    />
                  </label>
                </div>
              </div>

              {/* Title & Subtitle */}
              <div>
                <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-1">
                  Başlık
                </label>
                <input
                  type="text"
                  value={editForm.title}
                  onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                  placeholder="Başlık girin..."
                />
              </div>

              <div>
                <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-1">
                  Alt Başlık
                </label>
                <input
                  type="text"
                  value={editForm.subtitle}
                  onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })}
                  className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                  placeholder="Açıklama girin..."
                />
              </div>

              {/* Order & Status */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-1">
                    Sıralama Değeri
                  </label>
                  <input
                    type="number"
                    value={editForm.sort_order}
                    onChange={(e) => setEditForm({ ...editForm, sort_order: Number(e.target.value) })}
                    className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm font-mono"
                  />
                </div>
                <div>
                  <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-1">
                    Yayın Durumu
                  </label>
                  <button
                    type="button"
                    onClick={() => setEditForm({ ...editForm, is_active: !editForm.is_active })}
                    className={`w-full py-2.5 px-4 font-display font-bold text-xs uppercase tracking-wider border transition-colors flex items-center justify-center gap-2 ${
                      editForm.is_active
                        ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-400'
                        : 'bg-white/5 border-white/10 text-white/40'
                    }`}
                  >
                    {editForm.is_active ? <Check size={14} /> : <EyeOff size={14} />}
                    {editForm.is_active ? 'Yayında (Aktif)' : 'Yayında Değil (Pasif)'}
                  </button>
                </div>
              </div>

              {/* Link Setting */}
              <div>
                <label className="block text-xs font-display font-bold text-white/50 tracking-widest uppercase mb-2">
                  Tıklama Linki
                </label>
                <div className="flex gap-2 mb-3">
                  <button
                    type="button"
                    onClick={() => {
                      setEditLinkType('none')
                      setEditForm({ ...editForm, link_url: '' })
                    }}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                      editLinkType === 'none'
                        ? 'bg-white/10 border-white/30 text-white'
                        : 'bg-[#0F0F0F] border-white/5 text-white/40'
                    }`}
                  >
                    Yok
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLinkType('product')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                      editLinkType === 'product'
                        ? 'bg-brand-red/20 border-brand-red/50 text-brand-red'
                        : 'bg-[#0F0F0F] border-white/5 text-white/40'
                    }`}
                  >
                    Ürün Seç
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditLinkType('custom')}
                    className={`px-3 py-1.5 text-xs font-bold uppercase tracking-wider border ${
                      editLinkType === 'custom'
                        ? 'bg-brand-red/20 border-brand-red/50 text-brand-red'
                        : 'bg-[#0F0F0F] border-white/5 text-white/40'
                    }`}
                  >
                    Özel Link
                  </button>
                </div>

                {editLinkType === 'product' && (
                  <div className="relative">
                    <input
                      type="text"
                      value={editProductSearchTerm}
                      onChange={(e) => {
                        setEditProductSearchTerm(e.target.value)
                        setShowEditProductDropdown(true)
                        setEditSelectedProductId('')
                      }}
                      onFocus={() => setShowEditProductDropdown(true)}
                      className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                      placeholder="Ürün adı arayın..."
                    />
                    {editSelectedProductId && (
                      <div className="absolute right-3 top-3 text-brand-red">
                        <Check size={16} />
                      </div>
                    )}
                    {showEditProductDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-[#1A1A1A] border border-white/10 max-h-56 overflow-y-auto shadow-2xl">
                        {products
                          .filter((p) => p.ad.toLowerCase().includes(editProductSearchTerm.toLowerCase()))
                          .slice(0, 30)
                          .map((p) => (
                            <div
                              key={p.id}
                              onClick={() => {
                                setEditSelectedProductId(p.id)
                                setEditProductSearchTerm(p.ad)
                                setEditForm({ ...editForm, link_url: `/urun/${p.slug || p.id}` })
                                setShowEditProductDropdown(false)
                              }}
                              className="px-4 py-2.5 hover:bg-brand-red/20 hover:text-white cursor-pointer text-xs text-white/70 transition-colors border-b border-white/5 last:border-0"
                            >
                              {p.ad}
                            </div>
                          ))}
                      </div>
                    )}
                  </div>
                )}

                {editLinkType === 'custom' && (
                  <input
                    type="text"
                    value={editForm.link_url}
                    onChange={(e) => setEditForm({ ...editForm, link_url: e.target.value })}
                    className="w-full bg-[#0F0F0F] border border-white/10 text-white px-4 py-2.5 focus:border-brand-red outline-none text-sm"
                    placeholder="Örn: /bayi/basvuru veya /urunler?marka=SHURE"
                  />
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="p-4 bg-[#0F0F0F] border-t border-white/10 flex justify-end gap-3">
              <button
                onClick={() => setEditingBanner(null)}
                disabled={uploading}
                className="px-4 py-2 border border-white/10 text-white hover:bg-white/5 text-xs font-bold uppercase tracking-wider transition-colors"
              >
                İptal
              </button>
              <button
                onClick={handleSaveEdit}
                disabled={uploading}
                className="btn-primary text-xs"
              >
                {uploading ? 'Kaydediliyor...' : <><Save size={14} /> Değişiklikleri Kaydet</>}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EXISTING BANNERS LIST */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display font-bold text-sm uppercase tracking-wider text-white">
            Mevcut Bannerlar ({banners.length})
          </h3>
          <span className="text-xs text-white/40">Sıralamayı ok butonlarıyla değiştirebilirsiniz</span>
        </div>

        {loading && <div className="text-white/40 py-12 text-center font-display uppercase tracking-widest text-xs">Yükleniyor...</div>}

        {!loading && banners.length === 0 && !showForm && (
          <div className="border border-dashed border-white/10 py-16 flex flex-col items-center justify-center text-white/40 bg-[#111]">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            <p className="font-display uppercase tracking-widest text-sm mb-4">Henüz hiç banner eklenmemiş</p>
            <button onClick={() => setShowForm(true)} className="btn-outline text-xs">
              İlk Bannerı Ekle
            </button>
          </div>
        )}

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map((banner, index) => (
            <div
              key={banner.id}
              className={`bg-[#141414] border overflow-hidden transition-all duration-300 flex flex-col justify-between ${
                !banner.is_active ? 'opacity-50 grayscale border-white/5' : 'border-white/10 hover:border-brand-red/40 shadow-xl'
              }`}
            >
              <div>
                {/* Banner Image with Badges */}
                <div className="relative aspect-[16/6] w-full border-b border-white/5 bg-black">
                  <img src={banner.image_url} alt={banner.title || 'Banner'} className="w-full h-full object-cover" />

                  {/* Sort order badge */}
                  <div className="absolute top-2 left-2 bg-black/80 backdrop-blur-md border border-white/10 px-2 py-0.5 text-[10px] font-mono font-bold text-white/80 rounded-sm">
                    Sıra: {banner.sort_order}
                  </div>

                  {!banner.is_active && (
                    <div className="absolute inset-0 bg-black/75 flex items-center justify-center backdrop-blur-sm">
                      <span className="bg-black/90 px-3 py-1 font-display font-bold text-xs uppercase tracking-widest text-white/70 border border-white/10">
                        Yayında Değil
                      </span>
                    </div>
                  )}
                </div>

                {/* Banner Info */}
                <div className="p-4">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <h4 className="font-display font-bold text-white text-sm truncate flex-1">
                      {banner.title || 'Başlıksız Banner'}
                    </h4>
                    <span
                      className={`text-[9px] font-display font-bold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                        banner.is_active
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : 'bg-white/5 text-white/30'
                      }`}
                    >
                      {banner.is_active ? 'Aktif' : 'Pasif'}
                    </span>
                  </div>

                  <p className="text-white/40 text-xs mb-3 line-clamp-2">
                    {banner.subtitle || 'Alt açıklama eklenmemiş'}
                  </p>

                  <div className="text-xs">
                    {banner.link_url ? (
                      <a
                        href={banner.link_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-brand-red hover:underline font-mono text-[11px]"
                      >
                        <ExternalLink size={12} />
                        <span className="truncate max-w-[200px]">{banner.link_url}</span>
                      </a>
                    ) : (
                      <span className="text-white/20 italic">Yönlendirme linki yok</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="p-3 bg-[#0E0E0E] border-t border-white/5 flex items-center justify-between">
                {/* Order up/down */}
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => moveOrder(banner, 'up')}
                    className="w-7 h-7 flex items-center justify-center bg-[#1A1A1A] border border-white/10 hover:border-brand-red text-white/70 hover:text-white transition-colors"
                    title="Öne Taşı (Sırayı Düşür)"
                  >
                    <ArrowUp size={12} />
                  </button>
                  <button
                    onClick={() => moveOrder(banner, 'down')}
                    className="w-7 h-7 flex items-center justify-center bg-[#1A1A1A] border border-white/10 hover:border-brand-red text-white/70 hover:text-white transition-colors"
                    title="Arkaya Taşı (Sırayı Artır)"
                  >
                    <ArrowDown size={12} />
                  </button>
                </div>

                {/* Edit, Toggle, Delete */}
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => startEditing(banner)}
                    className="w-7 h-7 flex items-center justify-center bg-[#1A1A1A] border border-white/10 hover:border-brand-red hover:text-brand-red text-white/70 transition-colors"
                    title="Düzenle"
                  >
                    <Edit3 size={12} />
                  </button>
                  <button
                    onClick={() => toggleActive(banner)}
                    className="w-7 h-7 flex items-center justify-center bg-[#1A1A1A] border border-white/10 hover:border-white/30 text-white/70 hover:text-white transition-colors"
                    title={banner.is_active ? 'Yayından Kaldır' : 'Yayına Al'}
                  >
                    {banner.is_active ? <EyeOff size={12} /> : <Eye size={12} />}
                  </button>
                  <button
                    onClick={() => deleteBanner(banner.id)}
                    className="w-7 h-7 flex items-center justify-center bg-[#1A1A1A] border border-white/10 hover:border-brand-red hover:text-brand-red text-white/70 transition-colors"
                    title="Sil"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CROP MODAL */}
      {showCropModal && activeCropImage && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-sm p-4 sm:p-6 animate-fade-in">
          <div className="bg-[#141414] border border-white/10 w-full max-w-4xl flex flex-col shadow-2xl relative overflow-hidden h-[80vh] md:h-[600px]">
            <div className="flex items-center justify-between p-4 border-b border-white/10 bg-[#0F0F0F]">
              <div className="flex items-center gap-2 text-white">
                <Crop size={18} className="text-brand-red" />
                <h3 className="font-display font-bold uppercase tracking-widest text-sm">Görseli Kırp ve Düzenle</h3>
              </div>
              <button
                onClick={() => {
                  setShowCropModal(false)
                  setActiveCropImage(null)
                }}
                className="text-white/40 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <div className="relative flex-1 bg-black overflow-hidden">
              <Cropper
                image={activeCropImage}
                crop={crop}
                zoom={zoom}
                aspect={16 / 6}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="p-4 bg-[#0F0F0F] border-t border-white/10 flex flex-col sm:flex-row items-center gap-4 justify-between">
              <div className="flex items-center gap-3 w-full sm:w-1/2">
                <ZoomIn size={16} className="text-white/40" />
                <input
                  type="range"
                  value={zoom}
                  min={1}
                  max={3}
                  step={0.1}
                  aria-labelledby="Zoom"
                  onChange={(e) => setZoom(Number(e.target.value))}
                  className="w-full accent-brand-red h-1 bg-white/10 rounded-full appearance-none outline-none"
                />
              </div>

              <button onClick={handleCropSave} className="btn-primary w-full sm:w-auto text-xs">
                <Check size={16} /> Kırpmayı Onayla
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
