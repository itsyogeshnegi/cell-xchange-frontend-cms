import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import {
  Smartphone,
  Laptop,
  CheckCircle,
  HelpCircle,
  ShieldCheck,
  Zap,
  MapPin,
  Phone,
  Mail,
  User,
  Star,
  ChevronDown,
  ArrowRight,
} from 'lucide-react';
import API from '../../utils/axios';
import { useAuthStore } from '../../store/authStore';

const PublicHome = () => {
  const { isAuthenticated } = useAuthStore();
  const [activeFaq, setActiveFaq] = useState(null);

  // 1. Fetch homepage configs
  const { data: home, isLoading: homeLoading } = useQuery({
    queryKey: ['publicHomepage'],
    queryFn: async () => {
      const res = await API.get('/cms/public/homepage');
      return res.data;
    },
  });

  // 2. Fetch public featured products
  const { data: products, isLoading: prodsLoading } = useQuery({
    queryKey: ['publicProductsFeatured'],
    queryFn: async () => {
      const res = await API.get('/cms/public/products');
      return res.data;
    },
  });

  const featuredProducts = products?.filter((p) => p.isFeatured) || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-primary-500 selection:text-white">
      {/* 1. Header Navigation */}
      <header className="sticky top-0 z-40 bg-slate-950/70 backdrop-blur-md border-b border-slate-900 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center font-black text-white text-base">C</div>
          <span className="font-black text-white text-lg tracking-tight">Cell Xchange</span>
        </div>

        <nav className="hidden md:flex gap-6 text-xs font-semibold text-slate-400">
          <a href="#features" className="hover:text-white transition-colors">How it Works</a>
          <Link to="/catalog" className="hover:text-white transition-colors">Browse Catalog</Link>
          <a href="#about" className="hover:text-white transition-colors">About</a>
          <a href="#faqs" className="hover:text-white transition-colors">FAQs</a>
        </nav>

        <div>
          {isAuthenticated ? (
            <Link
              to="/admin"
              className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-1.5 px-4 rounded-lg text-xs transition-all flex items-center gap-1"
            >
              Control Panel
              <ArrowRight size={13} />
            </Link>
          ) : (
            <Link
              to="/"
              className="bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold py-1.5 px-4 rounded-lg text-xs border border-slate-800 transition-colors"
            >
              Staff Portal
            </Link>
          )}
        </div>
      </header>

      {/* 2. Hero Section */}
      <section className="relative py-24 px-6 text-center max-w-4xl mx-auto space-y-6 overflow-hidden">
        {/* Glow meshes */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-primary-700/10 rounded-full blur-[100px] pointer-events-none" />
        
        <div className="inline-flex items-center gap-1.5 bg-primary-500/10 border border-primary-500/20 text-primary-400 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider">
          <Zap size={12} className="fill-primary-400" />
          Pre-Owned Tech Hub
        </div>

        <h1 className="text-4xl md:text-6xl font-black text-white leading-tight tracking-tight">
          {home?.heroTitle || 'Premium Pre-Owned Tech at Unbeatable Prices'}
        </h1>
        
        <p className="text-sm md:text-base text-slate-400 max-w-xl mx-auto leading-relaxed">
          {home?.heroSubtitle || 'Fully tested, certified second-hand mobiles and laptops with shop warranties.'}
        </p>

        <div className="flex justify-center gap-3 pt-4">
          <Link
            to="/catalog"
            className="bg-primary-600 hover:bg-primary-500 text-white font-bold py-2.5 px-6 rounded-xl text-xs transition-all shadow-lg shadow-primary-950/20"
          >
            Explore Catalog
          </Link>
          <a
            href="#features"
            className="bg-slate-900 hover:bg-slate-850 text-slate-350 font-bold py-2.5 px-6 rounded-xl text-xs border border-slate-800 transition-colors"
          >
            Sell Your Device
          </a>
        </div>
      </section>

      {/* 3. Featured Showcase Grid */}
      <section className="py-20 px-6 max-w-6xl mx-auto space-y-8">
        <div className="text-center md:text-left md:flex justify-between items-end">
          <div>
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Featured In Stock Catalog</h2>
            <p className="text-xs text-slate-450 mt-1">Browse our hand-selected certified pre-owned devices.</p>
          </div>
          <Link to="/catalog" className="text-xs font-bold text-primary-450 hover:underline flex items-center gap-1 mt-2 md:mt-0">
            View All Catalog Products
            <ArrowRight size={13} />
          </Link>
        </div>

        {prodsLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-64 bg-slate-900 rounded-xl animate-pulse" />
            ))}
          </div>
        ) : featuredProducts.length === 0 ? (
          <div className="text-center py-12 text-xs text-slate-400 border border-dashed border-slate-850 rounded-xl">
            Currently no featured listings. Check out the general catalog!
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-6">
            {featuredProducts.map((p) => (
              <div
                key={p._id}
                className="bg-slate-900/50 border border-slate-850 rounded-xl overflow-hidden hover:-translate-y-1 hover:border-slate-800 transition-all duration-300 flex flex-col justify-between"
              >
                {/* Image */}
                <div className="h-44 w-full bg-slate-950/60 flex items-center justify-center overflow-hidden relative border-b border-slate-900">
                  {p.images && p.images.length > 0 ? (
                    <img src={p.images[0]} alt={p.title} className="h-full w-full object-cover" />
                  ) : (
                    <Smartphone size={32} className="text-slate-700" />
                  )}
                  {/* Condition badge */}
                  <span className="absolute top-3 right-3 bg-primary-600/10 border border-primary-500/20 text-primary-400 font-bold px-2 py-0.5 rounded text-[10px]">
                    {p.condition}
                  </span>
                </div>

                {/* Specs */}
                <div className="p-4 space-y-2.5">
                  <div className="h-10">
                    <span className="font-bold text-white text-xs block line-clamp-2 leading-tight">{p.title}</span>
                  </div>

                  <div className="text-[10px] text-slate-450 flex gap-2">
                    <span>{p.ram}GB RAM</span>
                    <span>•</span>
                    <span>{p.storage}GB Storage</span>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-900">
                    <span className="font-black text-white text-xs">₹{p.price.toLocaleString()}</span>
                    <Link
                      to="/catalog"
                      className="bg-slate-800 hover:bg-slate-755 text-slate-205 font-bold py-1 px-2.5 rounded text-[10px] transition-colors"
                    >
                      Inquire Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* 4. How it works (Trade-in process) */}
      <section id="features" className="py-20 bg-slate-900/40 border-y border-slate-900 px-6">
        <div className="max-w-6xl mx-auto space-y-12">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Sell Your Old Device in 3 Easy Steps</h2>
            <p className="text-xs text-slate-400 leading-relaxed">
              Bring your laptop or mobile to our shop, complete a quick verification, and leave with immediate cash.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-xs leading-relaxed">
            <div className="glass-card p-6 rounded-xl space-y-3">
              <span className="text-2xl font-black text-primary-505 block">01</span>
              <h4 className="font-bold text-white text-sm">Specs Inwarding</h4>
              <p className="text-slate-400">
                We test the specifications, battery health, and hardware components of your device to give a fair market valuation.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-3">
              <span className="text-2xl font-black text-emerald-505 block">02</span>
              <h4 className="font-bold text-white text-sm">Operator Verification</h4>
              <p className="text-slate-400">
                We upload and link your Aadhaar or PAN card documents to our CRM database to ensure secure, compliant trade transactions.
              </p>
            </div>

            <div className="glass-card p-6 rounded-xl space-y-3">
              <span className="text-2xl font-black text-amber-505 block">03</span>
              <h4 className="font-bold text-white text-sm">Immediate Payout</h4>
              <p className="text-slate-400">
                The trade-in voucher is finalized and you are paid instantly via UPI, bank transfer, or cash.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 5. About us */}
      <section id="about" className="py-20 px-6 max-w-4xl mx-auto text-center space-y-4">
        <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">About Cell Xchange</h2>
        <p className="text-xs md:text-sm text-slate-400 leading-relaxed max-w-2xl mx-auto">
          {home?.aboutUs || 'At Cell Xchange, we specialize in certified pre-owned tech. Every item is inspected with a comprehensive checklist to guarantee full hardware usability.'}
        </p>
      </section>

      {/* 6. Testimonials Reviews */}
      {home?.testimonials?.length > 0 && (
        <section className="py-20 bg-slate-900/20 px-6 border-t border-slate-900">
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="text-center">
              <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">What Our Customers Say</h2>
              <p className="text-xs text-slate-400 mt-1">Real ratings left by buyers and sellers at our outlet.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs">
              {home.testimonials.map((t, index) => (
                <div key={index} className="glass-panel p-5 rounded-xl space-y-3 border border-slate-850">
                  <div className="flex justify-between items-center">
                    <span className="font-bold text-white">{t.name}</span>
                    <div className="flex text-amber-500 gap-0.5">
                      {[...Array(t.rating || 5)].map((_, i) => (
                        <Star key={i} size={11} className="fill-amber-500" />
                      ))}
                    </div>
                  </div>
                  <p className="text-slate-400 leading-relaxed italic">"{t.text}"</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 7. FAQs */}
      {home?.faqs?.length > 0 && (
        <section id="faqs" className="py-20 px-6 max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h2 className="text-xl md:text-2xl font-black text-white tracking-tight">Frequently Asked Questions</h2>
            <p className="text-xs text-slate-400 mt-1">Got questions about warranty, trade-in, and bills? We have answers.</p>
          </div>

          <div className="space-y-3">
            {home.faqs.map((faq, index) => {
              const isOpen = activeFaq === index;
              return (
                <div key={index} className="bg-slate-900/60 border border-slate-850 rounded-xl overflow-hidden transition-all text-xs">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : index)}
                    className="w-full text-left p-4 font-bold text-white flex justify-between items-center"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown size={14} className={`text-slate-450 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-4 pt-0 text-slate-400 leading-relaxed border-t border-slate-950/20">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* 8. Footer */}
      <footer className="bg-slate-950 border-t border-slate-900 py-12 px-6 text-xs text-slate-500">
        <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8 leading-relaxed">
          <div className="space-y-3">
            <span className="font-bold text-white text-sm">Cell Xchange</span>
            <p className="text-[11px]">
              Certified second-hand technology and compliant trade-ins.
            </p>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white text-sm">Contact Info</span>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <MapPin size={12} className="text-slate-400" />
                <span>{home?.address || '123 Tech Square, Sector 4, Delhi, India'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone size={12} className="text-slate-400" />
                <span>{home?.phone || '+91 98765 43210'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Mail size={12} className="text-slate-400" />
                <span>{home?.email || 'support@cellxchange.com'}</span>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <span className="font-bold text-white text-sm">Legal & Compliance</span>
            <p className="text-[10px] leading-normal">
              All trade-in transactions require KYC authentication document scans. GSTIN invoices provided on all catalog sales.
            </p>
          </div>
        </div>

        <div className="text-center border-t border-slate-900 mt-10 pt-6 text-[10px] text-slate-600">
          © {new Date().getFullYear()} Cell Xchange. All rights reserved.
        </div>
      </footer>
    </div>
  );
};

export default PublicHome;
