import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  SlidersHorizontal,
  Search,
  ChevronLeft,
  X,
  ShieldCheck,
  Tag,
  AlertCircle,
} from 'lucide-react';
import API from '../../utils/axios';

const PublicCatalog = () => {
  // Search / Filters
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [brand, setBrand] = useState('');
  const [condition, setCondition] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  // Selected item modal detail
  const [selectedProduct, setSelectedProduct] = useState(null);

  // Fetch published products
  const { data: products, isLoading } = useQuery({
    queryKey: ['publicProductsCatalog', search, category, brand, condition, maxPrice],
    queryFn: async () => {
      const res = await API.get('/cms/public/products', {
        params: {
          search,
          category,
          brand,
          condition,
          maxPrice: maxPrice || undefined,
        },
      });
      return res.data;
    },
  });

  const availableBrands = [...new Set(products?.map((p) => p.brand) || [])];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-955/80 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="p-1.5 hover:bg-slate-900 rounded-lg text-slate-400 hover:text-white transition-colors"
          >
            <ChevronLeft size={16} />
          </Link>
          <span className="font-black text-white text-base tracking-tight">Public Catalog Catalog</span>
        </div>
        <Link
          to="/"
          className="text-xs font-bold text-slate-450 hover:text-white"
        >
          Back to Home
        </Link>
      </header>

      <div className="max-w-6xl mx-auto py-10 px-6 grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Filters Sidebar */}
        <div className="glass-panel p-6 rounded-xl space-y-5 h-fit text-xs border border-slate-900">
          <h3 className="font-bold text-white text-sm flex items-center gap-1.5 pb-2 border-b border-slate-800">
            <SlidersHorizontal size={15} className="text-primary-505" />
            Catalog Filters
          </h3>

          {/* Category */}
          <div className="space-y-1">
            <label className="font-bold text-slate-450 block">Device Category</label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
            >
              <option value="">All Categories</option>
              <option value="mobile">Mobiles</option>
              <option value="laptop">Laptops</option>
            </select>
          </div>

          {/* Brand */}
          <div className="space-y-1">
            <label className="font-bold text-slate-450 block">Filter Brand</label>
            <select
              value={brand}
              onChange={(e) => setBrand(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
            >
              <option value="">All Brands</option>
              {availableBrands.map((b) => (
                <option key={b} value={b}>{b}</option>
              ))}
            </select>
          </div>

          {/* Condition */}
          <div className="space-y-1">
            <label className="font-bold text-slate-455 block">Condition Grade</label>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300"
            >
              <option value="">All Grades</option>
              <option value="New">New / Open Box</option>
              <option value="Excellent">Excellent</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair / Scratched</option>
            </select>
          </div>

          {/* Max Price */}
          <div className="space-y-1">
            <label className="font-bold text-slate-455 block">Max Budget Price (INR)</label>
            <input
              type="number"
              placeholder="e.g. 50000"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded p-1.5 text-slate-300 focus:outline-none"
            />
          </div>

          {/* Clear Filters */}
          <button
            type="button"
            onClick={() => {
              setCategory('');
              setBrand('');
              setCondition('');
              setMaxPrice('');
              setSearch('');
            }}
            className="w-full bg-slate-900 hover:bg-slate-850 text-slate-400 py-1.5 rounded font-bold transition-colors border border-slate-800"
          >
            Reset All Filters
          </button>
        </div>

        {/* Catalog browser grid */}
        <div className="lg:col-span-3 space-y-6">
          {/* Search bar */}
          <div className="relative">
            <input
              type="text"
              placeholder="Search by keywords, brand, or model (e.g. Pro Max, Samsung)..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-slate-900/60 border border-slate-850 rounded-xl py-2.5 pl-10 pr-4 text-xs focus:outline-none focus:ring-1 focus:ring-primary-500 text-white placeholder-slate-500"
            />
            <Search className="absolute left-3.5 top-3.5 text-slate-500" size={15} />
          </div>

          {/* Products lists */}
          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="h-64 bg-slate-900 rounded-xl animate-pulse" />
              ))}
            </div>
          ) : products?.length === 0 ? (
            <div className="py-24 text-center text-xs text-slate-400 border border-dashed border-slate-850 rounded-xl">
              No devices matching your filters are currently published in stock.
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              {products?.map((p) => (
                <div
                  key={p._id}
                  onClick={() => setSelectedProduct(p)}
                  className="bg-slate-900/40 border border-slate-855 rounded-xl overflow-hidden hover:border-slate-800 hover:-translate-y-1 transition-all duration-350 cursor-pointer flex flex-col justify-between"
                >
                  <div className="h-44 w-full bg-slate-950 flex items-center justify-center overflow-hidden relative border-b border-slate-900">
                    {p.images && p.images.length > 0 ? (
                      <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                    ) : (
                      <Smartphone size={32} className="text-slate-700" />
                    )}
                    <span className="absolute top-2.5 right-2.5 bg-primary-600/10 border border-primary-500/20 text-primary-400 font-bold px-2 py-0.5 rounded text-[10px]">
                      {p.condition}
                    </span>
                  </div>

                  <div className="p-4 space-y-2.5 text-xs">
                    <div className="h-10">
                      <span className="font-bold text-white block line-clamp-2 leading-tight">{p.title}</span>
                    </div>
                    <div className="text-[10px] text-slate-400 flex gap-2">
                      <span>{p.ram}GB RAM</span>
                      <span>•</span>
                      <span>{p.storage}GB Storage</span>
                    </div>
                    <div className="flex justify-between items-center pt-2.5 border-t border-slate-900">
                      <span className="font-black text-white text-sm">₹{p.price.toLocaleString()}</span>
                      <span className="text-[10px] text-primary-450 font-bold hover:underline">View Specs</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Detail Popup Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden my-8 shadow-2xl">
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-850 bg-slate-950/40 flex justify-between items-center">
              <span className="font-bold text-white text-sm">Product Specifications</span>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-slate-450 hover:text-white"
              >
                <X size={18} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-6 max-h-[70vh] overflow-y-auto text-xs leading-relaxed">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Images slide */}
                <div className="space-y-2">
                  <div className="w-full h-48 bg-slate-950 rounded-xl overflow-hidden flex items-center justify-center border border-slate-850">
                    {selectedProduct.images && selectedProduct.images.length > 0 ? (
                      <img src={selectedProduct.images[0]} alt={selectedProduct.title} className="max-h-full max-w-full object-contain" />
                    ) : (
                      <Smartphone size={40} className="text-slate-700" />
                    )}
                  </div>
                  {/* Thumbnails grid */}
                  {selectedProduct.images && selectedProduct.images.length > 1 && (
                    <div className="flex gap-2 overflow-x-auto py-1">
                      {selectedProduct.images.map((img, idx) => (
                        <div key={idx} className="w-12 h-12 rounded bg-slate-950 border border-slate-800 overflow-hidden shrink-0">
                          <img src={img} alt="thumbnail" className="w-full h-full object-cover" />
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Details specs */}
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-white text-base leading-tight">{selectedProduct.title}</h3>
                    <p className="text-[10px] text-slate-450 mt-1 capitalize">Category: {selectedProduct.category}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-3 bg-slate-950/50 p-3 rounded-lg border border-slate-850">
                    <div>
                      <span className="text-[10px] text-slate-500 block">Condition Grade</span>
                      <span className="font-bold text-white">{selectedProduct.condition}</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">RAM & Storage</span>
                      <span className="font-bold text-white">{selectedProduct.ram}GB / {selectedProduct.storage}GB</span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-500 block">Brand & Model</span>
                      <span className="font-bold text-white capitalize">{selectedProduct.brand} {selectedProduct.model}</span>
                    </div>
                    {selectedProduct.batteryHealth && (
                      <div>
                        <span className="text-[10px] text-slate-500 block">Battery health</span>
                        <span className="font-bold text-emerald-500">{selectedProduct.batteryHealth}%</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-primary-505">₹{selectedProduct.price.toLocaleString()}</span>
                    <span className="text-[10px] text-slate-400 select-none">(GST inclusive bill)</span>
                  </div>
                </div>
              </div>

              {/* Description */}
              {selectedProduct.description && (
                <div className="space-y-1">
                  <span className="font-bold text-white block">Product Description</span>
                  <p className="text-slate-400 bg-slate-950/20 p-3 rounded-xl border border-slate-850">
                    {selectedProduct.description}
                  </p>
                </div>
              )}

              {/* Outlets note */}
              <div className="p-3 bg-primary-600/5 border border-primary-500/15 text-primary-400 rounded-xl flex items-start gap-2">
                <ShieldCheck size={16} className="shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-white text-[11px]">How to Purchase?</span>
                  <span>
                    To buy this device, visit our nearest outlet and quote model details. All catalog devices come with standard testing parameters and shop warranties.
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 justify-end pt-3 border-t border-slate-850">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(null)}
                  className="bg-slate-800 hover:bg-slate-755 text-white py-2 px-5 rounded-lg font-bold"
                >
                  Close specifications
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PublicCatalog;
