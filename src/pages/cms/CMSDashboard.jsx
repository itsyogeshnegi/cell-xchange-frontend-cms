import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  FileText,
  Smartphone,
  Plus,
  Edit,
  Trash2,
  X,
  AlertCircle,
  Eye,
  Settings,
  HelpCircle,
  MessageSquare,
} from 'lucide-react';
import API from '../../utils/axios';
import { MultipleFileUploadField } from '../../components/FileUpload';

const CMSDashboard = () => {
  const queryClient = useQueryClient();
  
  // Tabs: 'catalog' or 'copywriting'
  const [activeTab, setActiveTab] = useState('catalog');

  // Page States for Catalog items
  const [catalogPage, setCatalogPage] = useState(1);
  const [showProductModal, setShowProductModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);

  // Preview modal states
  const [previewImage, setPreviewImage] = useState(null);
  const [previewTitle, setPreviewTitle] = useState('');

  // Form States for Catalog products
  const [prodForm, setProdForm] = useState({
    title: '',
    category: 'mobile',
    brand: '',
    model: '',
    price: '',
    ram: '',
    storage: '',
    condition: 'Excellent',
    description: '',
    isFeatured: false,
    isPublished: true,
  });
  const [prodImages, setProdImages] = useState([]);
  const [prodError, setProdError] = useState('');
  const [prodSubmitting, setProdSubmitting] = useState(false);

  // Copywriting editor forms
  const [showCopyModal, setShowCopyModal] = useState(false);
  const [copyForm, setCopyForm] = useState({
    heroTitle: '',
    heroSubtitle: '',
    aboutUs: '',
  });

  const [faqs, setFaqs] = useState([]);
  const [faqInput, setFaqInput] = useState({ question: '', answer: '' });
  
  const [testimonials, setTestimonials] = useState([]);
  const [testInput, setTestInput] = useState({ name: '', text: '', rating: 5 });

  // 1. Fetch CMS Products (Dashboard list)
  const { data: prodData, isLoading: prodsLoading } = useQuery({
    queryKey: ['cmsProducts', catalogPage],
    queryFn: async () => {
      const res = await API.get('/cms/products', {
        params: { page: catalogPage, limit: 8 },
      });
      return res.data;
    },
  });

  const products = prodData?.products || [];
  const totalPages = prodData?.pages || 1;

  // 2. Fetch Homepage Copywriting settings
  const { data: homeSettings, isLoading: homeLoading } = useQuery({
    queryKey: ['cmsHomepage'],
    queryFn: async () => {
      const res = await API.get('/cms/homepage');
      // Populate copywriting local state when fetched
      setCopyForm({
        heroTitle: res.data.heroTitle || '',
        heroSubtitle: res.data.heroSubtitle || '',
        aboutUs: res.data.aboutUs || '',
      });
      setFaqs(res.data.faqs || []);
      setTestimonials(res.data.testimonials || []);
      return res.data;
    },
  });

  // mutations for product
  const deleteProductMutation = useMutation({
    mutationFn: async (id) => {
      await API.delete(`/cms/products/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cmsProducts']);
      alert('Product template deleted.');
    },
  });

  const toggleVisibilityMutation = useMutation({
    mutationFn: async ({ id, isPublished }) => {
      await API.put(`/cms/products/${id}/toggle`, { isPublished });
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['cmsProducts']);
    },
  });

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      title: '',
      category: 'mobile',
      brand: '',
      model: '',
      price: '',
      ram: '',
      storage: '',
      condition: 'Excellent',
      description: '',
      isFeatured: false,
      isPublished: true,
    });
    setProdImages([]);
    setProdError('');
    setShowProductModal(true);
  };

  const handleOpenEditProduct = (p) => {
    setEditingProduct(p);
    setProdForm({
      title: p.title || '',
      category: p.category || 'mobile',
      brand: p.brand || '',
      model: p.model || '',
      price: p.price || '',
      ram: p.ram || '',
      storage: p.storage || '',
      condition: p.condition || 'Excellent',
      description: p.description || '',
      isFeatured: p.isFeatured || false,
      isPublished: p.isPublished || false,
    });
    setProdImages([]);
    setProdError('');
    setShowProductModal(true);
  };

  const handleProductSubmit = async (e) => {
    e.preventDefault();
    setProdSubmitting(true);
    setProdError('');

    const formData = new FormData();
    Object.keys(prodForm).forEach((key) => {
      formData.append(key, prodForm[key]);
    });

    for (let i = 0; i < prodImages.length; i++) {
      formData.append('images', prodImages[i]);
    }

    try {
      if (editingProduct) {
        await API.put(`/cms/products/${editingProduct._id}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      } else {
        await API.post('/cms/products', formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });
      }
      queryClient.invalidateQueries(['cmsProducts']);
      setShowProductModal(false);
    } catch (err) {
      setProdError(err.response?.data?.message || 'Error saving catalog product.');
    } finally {
      setProdSubmitting(false);
    }
  };

  // Homepage copywriter save
  const handleSaveHomepage = async () => {
    try {
      const payload = {
        ...copyForm,
        faqs,
        testimonials,
      };
      await API.put('/cms/homepage', payload);
      queryClient.invalidateQueries(['cmsHomepage']);
      alert('Homepage copywriting updated successfully.');
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save settings.');
    }
  };

  return (
    <div className="space-y-6">
      {/* Tab select headers */}
      <div className="flex justify-between items-center border-b border-slate-200 dark:border-slate-800 pb-2">
        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab('catalog')}
            className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'catalog'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <Smartphone size={16} />
            Storefront Catalog Items
          </button>
          <button
            onClick={() => setActiveTab('copywriting')}
            className={`pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-1.5 ${
              activeTab === 'copywriting'
                ? 'border-primary-500 text-primary-500'
                : 'border-transparent text-slate-500 hover:text-slate-700 dark:hover:text-white'
            }`}
          >
            <FileText size={16} />
            Homepage sections Copywriter
          </button>
        </div>
      </div>

      {/* TAB 1: Catalog Products templates */}
      {activeTab === 'catalog' && (
        <div className="space-y-6">
          <div className="glass-panel rounded-xl overflow-hidden">
            {prodsLoading ? (
              <div className="py-24 text-center text-xs text-slate-450 skeleton-item font-medium">
                Fetching storefront catalog templates...
              </div>
            ) : products.length === 0 ? (
              <div className="py-24 text-center text-xs text-slate-450">
                No catalog items registered. Click "Create Catalog Item" to get started.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-slate-50 dark:bg-slate-900/40 border-b border-slate-200 dark:border-slate-850 text-slate-500 dark:text-slate-400 font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Product Title</th>
                      <th className="py-4 px-3">Specs Details</th>
                      <th className="py-4 px-3 text-right">Retail Listing Price</th>
                      <th className="py-4 px-6 text-center">Store Visibility</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-slate-850/60 text-slate-700 dark:text-slate-300">
                    {products.map((p) => (
                      <tr key={p._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-800/10 transition-colors">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div 
                              className={`w-10 h-10 rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 overflow-hidden flex items-center justify-center font-bold text-slate-400 shrink-0 ${p.images && p.images.length > 0 ? 'cursor-pointer hover:ring-2 hover:ring-primary-500 transition-all' : ''}`}
                              onClick={() => {
                                  if (p.images && p.images.length > 0) {
                                    setPreviewImage(p.images[0]);
                                    setPreviewTitle(`${p.title} Image`);
                                  }
                              }}
                            >
                              {p.images && p.images.length > 0 ? (
                                <img src={p.images[0]} alt={p.title} className="w-full h-full object-cover" />
                              ) : (
                                <Smartphone size={16} />
                              )}
                            </div>
                            <div>
                              <span className="font-bold text-slate-900 dark:text-white text-sm block">{p.title}</span>
                              <span className="text-[10px] text-slate-450 capitalize">{p.brand} {p.model}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-3">
                          <div className="font-medium text-slate-800 dark:text-slate-200">
                            {p.ram}GB RAM / {p.storage}GB Storage
                          </div>
                          <div className="text-[10px] text-slate-450 mt-0.5">Condition: {p.condition}</div>
                        </td>
                        <td className="py-4 px-3 text-right font-bold text-slate-900 dark:text-white">
                          ₹{p.price.toLocaleString()}
                        </td>
                        <td className="py-4 px-6 text-center">
                          <button
                            type="button"
                            onClick={() => toggleVisibilityMutation.mutate({ id: p._id, isPublished: !p.isPublished })}
                            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${
                              p.isPublished
                                ? 'bg-emerald-100 hover:bg-emerald-200 dark:bg-emerald-950/40 text-emerald-500 border-emerald-500/20'
                                : 'bg-rose-105 hover:bg-rose-200 dark:bg-rose-950/40 text-rose-500 border-rose-500/20'
                            }`}
                          >
                            {p.isPublished ? 'Published (Show)' : 'Hidden (Hide)'}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="p-4 bg-slate-50 dark:bg-slate-900/20 border-t border-slate-200 dark:border-slate-850 flex justify-between items-center text-xs">
                <span className="text-slate-450 font-medium">Page {catalogPage} of {totalPages}</span>
                <div className="flex gap-2">
                  <button
                    disabled={catalogPage === 1}
                    onClick={() => setCatalogPage(catalogPage - 1)}
                    className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-3 py-1 rounded-md text-slate-650 disabled:opacity-40"
                  >
                    Prev
                  </button>
                  <button
                    disabled={catalogPage === totalPages}
                    onClick={() => setCatalogPage(catalogPage + 1)}
                    className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-3 py-1 rounded-md text-slate-650 disabled:opacity-40"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: Homepage copywriter */}
      {activeTab === 'copywriting' && !homeLoading && (
        <div className="space-y-6">
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <Settings size={18} className="text-primary-500" />
              Hero Banner & About Copywriting
            </h3>

            <div className="space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hero Banner Headline</label>
                <input
                  type="text"
                  value={copyForm.heroTitle}
                  onChange={(e) => setCopyForm({ ...copyForm, heroTitle: e.target.value })}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Hero Subtitle Copy</label>
                <textarea
                  value={copyForm.heroSubtitle}
                  onChange={(e) => setCopyForm({ ...copyForm, heroSubtitle: e.target.value })}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
                  rows={2}
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">About Us Paragraph</label>
                <textarea
                  value={copyForm.aboutUs}
                  onChange={(e) => setCopyForm({ ...copyForm, aboutUs: e.target.value })}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded p-2 text-slate-900 dark:text-white"
                  rows={2}
                />
              </div>
            </div>
          </div>

          {/* FAQS Editor */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <HelpCircle size={18} className="text-primary-500" />
              Frequently Asked Questions (FAQs)
            </h3>

            {/* List */}
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{faq.question}</div>
                    <div className="text-slate-450 mt-1">{faq.answer}</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFaqs(faqs.filter((_, i) => i !== index))}
                    className="text-rose-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add FAQ inline */}
            <div className="bg-slate-50 dark:bg-slate-900/10 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="font-bold block text-slate-700 dark:text-slate-300">Add FAQ Item</span>
              <input
                type="text"
                placeholder="Question text..."
                value={faqInput.question}
                onChange={(e) => setFaqInput({ ...faqInput, question: e.target.value })}
                className="w-full bg-white dark:bg-slate-950 border border-slate-200 rounded p-1.5"
              />
              <textarea
                placeholder="Answer text..."
                value={faqInput.answer}
                onChange={(e) => setFaqInput({ ...faqInput, answer: e.target.value })}
                className="w-full bg-white dark:bg-slate-955 border border-slate-200 rounded p-1.5"
                rows={2}
              />
              <button
                type="button"
                onClick={() => {
                  if (faqInput.question && faqInput.answer) {
                    setFaqs([...faqs, faqInput]);
                    setFaqInput({ question: '', answer: '' });
                  }
                }}
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-1.5 px-4 rounded"
              >
                Add FAQ
              </button>
            </div>
          </div>

          {/* Testimonial Editor */}
          <div className="glass-panel p-6 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-800">
              <MessageSquare size={18} className="text-primary-500" />
              Customer Reviews & Testimonials
            </h3>

            {/* List */}
            <div className="space-y-3">
              {testimonials.map((test, index) => (
                <div key={index} className="bg-slate-50 dark:bg-slate-900/30 p-3 rounded-lg border border-slate-200 dark:border-slate-800 flex justify-between items-start">
                  <div>
                    <div className="font-bold text-slate-900 dark:text-white">{test.name} ({test.rating}★)</div>
                    <div className="text-slate-455 mt-1 italic">"{test.text}"</div>
                  </div>
                  <button
                    type="button"
                    onClick={() => setTestimonials(testimonials.filter((_, i) => i !== index))}
                    className="text-rose-500 font-bold hover:underline"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>

            {/* Add Testimonial inline */}
            <div className="bg-slate-50 dark:bg-slate-900/10 p-3.5 border border-slate-200 dark:border-slate-800 rounded-xl space-y-2">
              <span className="font-bold block text-slate-705 dark:text-slate-300">Add Testimonial</span>
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Reviewer Name..."
                  value={testInput.name}
                  onChange={(e) => setTestInput({ ...testInput, name: e.target.value })}
                  className="bg-white dark:bg-slate-950 border border-slate-200 rounded p-1.5"
                />
                <select
                  value={testInput.rating}
                  onChange={(e) => setTestInput({ ...testInput, rating: Number(e.target.value) })}
                  className="bg-white dark:bg-slate-955 border border-slate-200 rounded p-1.5"
                >
                  <option value={5}>5 Stars</option>
                  <option value={4}>4 Stars</option>
                  <option value={3}>3 Stars</option>
                </select>
              </div>
              <textarea
                placeholder="Review text content..."
                value={testInput.text}
                onChange={(e) => setTestInput({ ...testInput, text: e.target.value })}
                className="w-full bg-white dark:bg-slate-955 border border-slate-200 rounded p-1.5"
                rows={2}
              />
              <button
                type="button"
                onClick={() => {
                  if (testInput.name && testInput.text) {
                    setTestimonials([...testimonials, testInput]);
                    setTestInput({ name: '', text: '', rating: 5 });
                  }
                }}
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-1.5 px-4 rounded"
              >
                Add Testimonial
              </button>
            </div>
          </div>

          {/* Master Save Button */}
          <div className="flex justify-end p-4 bg-slate-900/40 rounded-xl border border-slate-800">
            <button
              onClick={handleSaveHomepage}
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2 px-6 rounded-lg shadow-lg shadow-primary-950/20"
            >
              Save Homepage Copywriting Settings
            </button>
          </div>
        </div>
      )}

      {/* Catalog Product Add/Edit Modal */}
      {showProductModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-250 dark:border-slate-800 w-full max-w-2xl my-8 overflow-hidden shadow-2xl">
            <div className="px-6 py-4 border-b border-slate-105 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <h3 className="font-bold text-slate-850 dark:text-white">
                {editingProduct ? 'Edit Catalog listing item' : 'Create new storefront catalog template'}
              </h3>
              <button onClick={() => setShowProductModal(false)} className="text-slate-450 hover:text-slate-700">
                <X size={18} />
              </button>
            </div>

            {prodError && (
              <div className="mx-6 mt-4 flex items-center gap-2 text-rose-500 text-xs bg-rose-500/5 dark:bg-rose-500/10 p-3 rounded-xl border border-rose-500/15">
                <AlertCircle size={15} />
                <span>{prodError}</span>
              </div>
            )}

            <form onSubmit={handleProductSubmit} className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Public Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apple iPhone 14 Pro Max (Excellent condition)"
                  value={prodForm.title}
                  onChange={(e) => setProdForm({ ...prodForm, title: e.target.value })}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Category</label>
                  <select
                    value={prodForm.category}
                    onChange={(e) => setProdForm({ ...prodForm, category: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded"
                  >
                    <option value="mobile">Mobile</option>
                    <option value="laptop">Laptop</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Condition Grade</label>
                  <select
                    value={prodForm.condition}
                    onChange={(e) => setProdForm({ ...prodForm, condition: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded"
                  >
                    <option value="New">New / Open Box</option>
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair / Scratched</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Brand *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Apple"
                    value={prodForm.brand}
                    onChange={(e) => setProdForm({ ...prodForm, brand: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Model *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. iPhone 14 Pro Max"
                    value={prodForm.model}
                    onChange={(e) => setProdForm({ ...prodForm, model: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">RAM (GB) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 6"
                    value={prodForm.ram}
                    onChange={(e) => setProdForm({ ...prodForm, ram: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Storage (GB) *</label>
                  <input
                    type="number"
                    required
                    placeholder="e.g. 256"
                    value={prodForm.storage}
                    onChange={(e) => setProdForm({ ...prodForm, storage: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Price (INR) *</label>
                  <input
                    type="number"
                    required
                    placeholder="Listed retail price"
                    value={prodForm.price}
                    onChange={(e) => setProdForm({ ...prodForm, price: e.target.value })}
                    className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded focus:outline-none font-bold"
                  />
                </div>

                <div className="flex gap-4 pt-4">
                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodForm.isFeatured}
                      onChange={(e) => setProdForm({ ...prodForm, isFeatured: e.target.checked })}
                    />
                    Featured on homepage
                  </label>

                  <label className="flex items-center gap-1.5 font-bold cursor-pointer">
                    <input
                      type="checkbox"
                      checked={prodForm.isPublished}
                      onChange={(e) => setProdForm({ ...prodForm, isPublished: e.target.checked })}
                    />
                    Publish instantly
                  </label>
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Product Description</label>
                <textarea
                  placeholder="Details of battery state, screen grade, packaging accessories..."
                  value={prodForm.description}
                  onChange={(e) => setProdForm({ ...prodForm, description: e.target.value })}
                  className="w-full bg-slate-55 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2 rounded focus:outline-none"
                  rows={3}
                />
              </div>

              <MultipleFileUploadField
                label="Product Public Images"
                id="product-public-images"
                files={prodImages}
                setFiles={setProdImages}
              />

              <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex justify-end gap-2 bg-slate-50 dark:bg-slate-900/50 p-4 -mx-6 -mb-6">
                <button
                  type="button"
                  onClick={() => setShowProductModal(false)}
                  className="bg-white dark:bg-slate-900 border border-slate-250 dark:border-slate-800 px-4 py-2 rounded-lg text-xs font-semibold text-slate-700 dark:text-slate-350 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={prodSubmitting}
                  className="bg-primary-600 hover:bg-primary-500 disabled:bg-primary-800 text-white px-5 py-2 rounded-lg text-xs font-bold"
                >
                  {prodSubmitting ? 'Saving Catalog Item...' : 'Save Catalog Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Image Preview Modal */}
      {previewImage && (
        <div 
          className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setPreviewImage(null)}
        >
          <div 
            className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 w-full max-w-2xl overflow-hidden shadow-2xl relative animate-fade-in-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-between items-center">
              <span className="font-bold text-slate-800 dark:text-white text-xs">{previewTitle}</span>
              <button 
                onClick={() => setPreviewImage(null)} 
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white font-bold"
              >
                Close
              </button>
            </div>
            {/* Image Container */}
            <div className="p-6 flex items-center justify-center bg-slate-100 dark:bg-slate-950 max-h-[70vh] overflow-hidden">
              <img 
                src={previewImage} 
                alt={previewTitle} 
                className="max-h-[60vh] max-w-full object-contain rounded-lg shadow-md"
              />
            </div>
            {/* Footer */}
            <div className="px-6 py-3 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/50 flex justify-end gap-3">
              <a
                href={previewImage}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-colors shadow"
              >
                Open in New Tab
              </a>
              <button
                onClick={() => setPreviewImage(null)}
                className="bg-white dark:bg-slate-800 border border-slate-250 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold py-1.5 px-4 rounded-lg text-xs transition-colors hover:bg-slate-100 dark:hover:bg-slate-700"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CMSDashboard;
