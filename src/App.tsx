/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect, useMemo } from 'react';
import { 
  ShoppingCart, 
  Search, 
  MapPin, 
  Phone, 
  Clock, 
  Star, 
  Plus, 
  Minus, 
  X, 
  ChevronRight, 
  CheckCircle2, 
  LayoutDashboard,
  ClipboardList,
  Package,
  Gift,
  Settings,
  LogOut,
  User,
  Info,
  ArrowRight,
  Menu
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

// Types
interface Product {
  id: number;
  name: string;
  division: 'corporate' | 'social' | 'daily' | 'cake';
  price: number;
  stock: number;
  description: string;
  image: string;
  rating: number;
  soldCount?: number;
  isPromo?: boolean;
}

interface CartItem extends Product {
  quantity: number;
}

interface Order {
  id: number;
  orderId: string;
  paymentId: string;
  refId: string;
  items: CartItem[];
  subtotal: number;
  discountAmount: number;
  total: number;
  timestamp: string;
  deliveryDate: string;
  orderType: 'now' | 'scheduled';
  promoCode: string;
  customer: {
    name: string;
    phone: string;
    address: string;
  };
  notes: string;
  paymentStatus: 'unpaid' | 'paid';
}

interface Promo {
  code: string;
  discount: number;
  description: string;
}

const INITIAL_PRODUCTS: Product[] = [
  // CORPORATE
  { id: 1, name: 'Nasi Kuning Box', division: 'corporate', price: 65000, stock: 100, description: 'Nasi kuning dengan lauk pauk premium: ayam goreng, sambal goreng ati, dan perkedel.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', rating: 4.8, soldCount: 1250 },
  { id: 2, name: 'Tumpeng Standard', division: 'corporate', price: 450000, stock: 30, description: 'Tumpeng nasi kuning lengkap untuk 10-15 orang dengan hiasan sayuran segar.', image: 'https://images.unsplash.com/photo-1596040217288-aac18f87057f?w=800&q=80', rating: 4.9, soldCount: 450 },
  { id: 3, name: 'Snack Box Premium', division: 'corporate', price: 45000, stock: 150, description: '3 jenis kue premium (asin & manis) + Air Mineral.', image: 'https://images.unsplash.com/photo-1584897882534-4e95aaff08a6?w=800&q=80', rating: 4.7, soldCount: 3200 },
  { id: 4, name: 'Paket Nasi Bento Box', division: 'corporate', price: 55000, stock: 80, description: 'Nasi bento dengan plating modern, cocok untuk meeting eksekutif.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', rating: 4.9, soldCount: 890 },
  { id: 25, name: 'Paket Prasmanan Corporate', division: 'corporate', price: 2500000, stock: 25, description: 'Buffet lengkap untuk 50 orang. Menu bisa custom sesuai request.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561121?w=800&q=80', rating: 4.8, soldCount: 120 },

  // SOCIAL/EVENT
  { id: 5, name: 'Paket Prasmanan 50 Orang', division: 'social', price: 3500000, stock: 20, description: 'Menu prasmanan lengkap untuk acara keluarga atau komunitas.', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561121?w=800&q=80', rating: 4.9, soldCount: 85 },
  { id: 6, name: 'Paket Prasmanan 100 Orang', division: 'social', price: 6500000, stock: 15, description: 'Solusi catering lengkap untuk resepsi atau acara besar.', image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800&q=80', rating: 4.8, soldCount: 42 },
  { id: 7, name: 'Paket Cocktail Party', division: 'social', price: 1500000, stock: 30, description: 'Finger food premium untuk networking event (30 pax).', image: 'https://images.unsplash.com/photo-1555939594-58d7cb561121?w=800&q=80', rating: 4.7, soldCount: 64 },

  // DAILY
  { id: 8, name: 'Nasi Merah Keluarga', division: 'daily', price: 150000, stock: 40, description: 'Paket catering sehat nasi merah untuk 4 orang.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', rating: 4.9, soldCount: 310 },
  { id: 9, name: 'Paket Ayam Goreng Spesial', division: 'daily', price: 180000, stock: 60, description: '8 potong ayam goreng bumbu rempah + sambal korek.', image: 'https://images.unsplash.com/photo-1569718212165-3a8278d5f624?w=800&q=80', rating: 4.7, soldCount: 520 },
  { id: 10, name: 'Nasi Rames Sehari-hari', division: 'daily', price: 85000, stock: 100, description: 'Lauk pauk rumahan yang berganti setiap hari.', image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=800&q=80', rating: 4.8, soldCount: 1100 },

  // CAKE
  { id: 11, name: 'Kue Tart Brownies Premium', division: 'cake', price: 350000, stock: 15, description: 'Rich chocolate brownies dengan ganache cokelat belgian.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.9, soldCount: 180 },
  { id: 12, name: 'Kue Ulang Tahun Custom', division: 'cake', price: 450000, stock: 20, description: 'Cake custom 20cm dengan desain sesuai keinginan Anda.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 5.0, soldCount: 95 },
  { id: 13, name: 'Macaron Tower Premium', division: 'cake', price: 550000, stock: 10, description: 'Tower macaron 30pcs dengan aneka rasa premium.', image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?w=800&q=80', rating: 4.8, soldCount: 34 },
];

const INITIAL_PROMOS: Promo[] = [
  { code: 'SELAMAT10', discount: 10, description: 'Diskon 10% semua produk' },
  { code: 'PROMO20', discount: 20, description: 'Diskon 20% min 1juta' },
];

const BANNERS = [
  { 
    id: 1, 
    title: 'Elegansi di Setiap Sajian', 
    subtitle: 'Premium Corporate Catering untuk Meeting Bisnis Anda', 
    image: 'https://images.unsplash.com/photo-1555244162-803834f70033?w=1600&q=80' 
  },
  { 
    id: 2, 
    title: 'Rayakan Momen Spesial', 
    subtitle: 'Paket Event & Social Gathering Tanpa Ribet', 
    image: 'https://images.unsplash.com/photo-1511795409834-ef04bbd61622?w=1600&q=80' 
  },
  { 
    id: 3, 
    title: 'Kelezatan Setiap Hari', 
    subtitle: 'Catering Harian Keluarga dengan Bahan Berkualitas', 
    image: 'https://images.unsplash.com/photo-1547523106-2c6724660e00?w=1600&q=80' 
  }
];

const ProductCard = ({ product, onAdd }: { product: Product, onAdd: (p: Product) => void, key?: number }) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ y: -5 }}
    className="bg-white rounded-[32px] overflow-hidden shadow-sm border border-neutral-100 hover:shadow-xl hover:shadow-neutral-200/50 transition-all duration-300 flex flex-col h-full"
  >
    <div className="relative group">
      <img 
        src={product.image} 
        alt={product.name} 
        className="w-full h-56 object-cover transform group-hover:scale-105 transition-transform duration-700"
      />
      <div className="absolute top-4 left-4 flex flex-col gap-2">
         <span className="bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[11px] font-bold text-primary flex items-center gap-1 shadow-sm">
           <Star className="w-3 h-3 fill-primary" /> {product.rating}
         </span>
         {product.soldCount && product.soldCount > 100 && (
           <span className="bg-primary/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-white shadow-sm">
             BEST SELLER
           </span>
         )}
      </div>
    </div>
    <div className="p-6 flex flex-col flex-1">
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-xl font-bold text-neutral-800 leading-tight">{product.name}</h3>
      </div>
      <p className="text-neutral-500 text-sm mb-6 line-clamp-2">{product.description}</p>
      
      <div className="mt-auto flex items-center justify-between pt-4 border-t border-neutral-50">
        <div>
          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider mb-0.5">Mulai dari</p>
          <p className="text-lg font-extrabold text-neutral-900">Rp {product.price.toLocaleString('id-ID')}</p>
        </div>
        <button 
          onClick={() => onAdd(product)}
          className="bg-primary hover:bg-primary-dark text-white p-3 rounded-2xl transition-all shadow-lg shadow-primary/20 active:scale-95 cursor-pointer"
        >
          <Plus className="w-6 h-6" />
        </button>
      </div>
    </div>
  </motion.div>
);

export default function App() {
  const [appMode, setAppMode] = useState<'login' | 'customer' | 'admin-login' | 'admin' | 'admin-orders' | 'admin-products' | 'admin-promos' | 'admin-settings' | 'success'>('customer');
  const [adminUser, setAdminUser] = useState<any>(null);
  const [division, setDivision] = useState<'corporate' | 'social' | 'daily' | 'cake'>('corporate');
  const [cart, setCart] = useState<CartItem[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [customerAddress, setCustomerAddress] = useState('');
  const [orderNotes, setOrderNotes] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [orderType] = useState<'now' | 'scheduled'>('now');
  const [orderDate] = useState('');
  const [products] = useState<Product[]>(() => {
    const saved = localStorage.getItem('tt_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });
  const [promos] = useState<Promo[]>(() => {
    const saved = localStorage.getItem('tt_promos');
    return saved ? JSON.parse(saved) : INITIAL_PROMOS;
  });

  const [currentBanner, setCurrentBanner] = useState(0);

  // Sync with LocalStorage
  useEffect(() => {
    localStorage.setItem('tt_products', JSON.stringify(products));
  }, [products]);

  useEffect(() => {
    localStorage.setItem('tt_promos', JSON.stringify(promos));
  }, [promos]);

  // Banner Auto-slide
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentBanner((prev) => (prev + 1) % BANNERS.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const promoDiscount = useMemo(() => {
    const promo = promos.find(p => p.code === promoCode.toUpperCase());
    return promo ? promo.discount : 0;
  }, [promoCode, promos]);

  const subtotal = cart.reduce((s, i) => s + (i.price * i.quantity), 0);
  const discountAmount = Math.floor(subtotal * (promoDiscount / 100));
  const total = subtotal - discountAmount;

  const addToCart = (product: Product) => {
    const existing = cart.find(i => i.id === product.id);
    if (existing) {
      setCart(cart.map(i => i.id === product.id ? { ...i, quantity: i.quantity + 1 } : i));
    } else {
      setCart([...cart, { ...product, quantity: 1 }]);
    }
  };

  const updateQuantity = (id: number, delta: number) => {
    setCart(prev => prev.map(item => {
      if (item.id === id) {
        const newQty = Math.max(0, item.quantity + delta);
        return { ...item, quantity: newQty };
      }
      return item;
    }).filter(item => item.quantity > 0));
  };

  const checkout = () => {
    if (!cart.length || !customerName || !customerPhone || !customerAddress) return;
    
    // const deliveryDate = orderType === 'now' ? new Date().toLocaleDateString('id-ID') : orderDate;
    const orderId = `ORD-${Math.floor(100 + Math.random() * 900)}`;
    const refId = `TT-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
    
    const newOrder: Order = {
      id: Date.now(),
      orderId, paymentId: `PAY-${Date.now()}`, refId,
      items: cart, subtotal, discountAmount, total,
      timestamp: new Date().toLocaleString('id-ID'),
      deliveryDate: orderType === 'now' ? new Date().toLocaleDateString('id-ID') : orderDate,
      orderType, promoCode,
      customer: { name: customerName, phone: customerPhone, address: customerAddress },
      notes: orderNotes,
      paymentStatus: 'unpaid'
    };

    setOrders([newOrder, ...orders]);
    setCart([]);
    setPromoCode('');
    setIsCheckoutOpen(false);
    setAppMode('success');
  };

  const filteredProducts = products.filter(p => 
    p.division === division && p.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Components
  return (
    <div className="min-h-screen bg-bg-soft font-sans selection:bg-primary/10">
      {/* HEADER */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-neutral-100 px-4 py-3 md:px-8">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-8">
            <div 
              className="cursor-pointer group flex items-center gap-2"
              onClick={() => setAppMode('customer')}
            >
              <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-primary/30 group-hover:scale-110 transition-transform">
                <Package className="w-6 h-6" />
              </div>
              <h1 className="text-xl font-black tracking-tight text-neutral-900 hidden sm:block">
                Thousand Tables
              </h1>
            </div>
          </div>

          <div className="flex-1 max-w-xl hidden md:block">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-5 h-5 group-focus-within:text-primary transition-colors" />
              <input 
                type="text" 
                placeholder="Cari paket catering premium..." 
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-neutral-100 border-none rounded-2xl py-3 pl-12 pr-4 text-sm focus:ring-2 focus:ring-primary/20 transition-all outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => setAppMode('admin-login')}
              className="p-2.5 text-neutral-500 hover:text-primary transition-colors rounded-xl hover:bg-neutral-50 cursor-pointer"
            >
              <User className="w-6 h-6" />
            </button>
            <div className="relative">
              <button 
                onClick={() => setIsCheckoutOpen(true)}
                className="bg-neutral-900 text-white p-2.5 md:px-5 md:py-2.5 rounded-2xl flex items-center gap-2 hover:bg-neutral-800 transition-all shadow-lg shadow-black/10 active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-5 h-5" />
                <span className="text-sm font-bold hidden sm:inline">Pesanan</span>
                {cart.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-primary text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full font-bold border-2 border-white animate-bounce">
                    {cart.reduce((a, b) => a + b.quantity, 0)}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        
        {/* MOBILE SEARCH */}
        <div className="mt-3 md:hidden">
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="Cari catering..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-neutral-100 border-none rounded-xl py-2.5 pl-10 pr-4 text-xs focus:ring-1 focus:ring-primary/20 outline-none"
            />
          </div>
        </div>
      </header>

      {appMode === 'customer' && (
        <main className="pb-24">
          {/* HERO SLIDER */}
          <section className="px-4 md:px-8 pt-6 pb-12">
            <div className="max-w-7xl mx-auto relative group">
              <div className="relative h-[350px] md:h-[520px] rounded-[48px] overflow-hidden shadow-2xl shadow-neutral-200">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentBanner}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 1 }}
                    className="absolute inset-0"
                  >
                    <img 
                      src={BANNERS[currentBanner].image} 
                      className="w-full h-full object-cover" 
                      alt="Banner" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/40 to-transparent flex items-center p-8 md:p-20">
                      <div className="max-w-xl">
                        <motion.h2 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.2 }}
                          className="text-white text-4xl md:text-7xl font-black mb-4 leading-[1.1]"
                        >
                          {BANNERS[currentBanner].title}
                        </motion.h2>
                        <motion.p 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.4 }}
                          className="text-white/80 text-lg md:text-xl font-medium mb-8"
                        >
                          {BANNERS[currentBanner].subtitle}
                        </motion.p>
                        <motion.button 
                          initial={{ y: 20, opacity: 0 }}
                          animate={{ y: 0, opacity: 1 }}
                          transition={{ delay: 0.6 }}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className="bg-primary text-white px-8 py-4 rounded-2xl font-bold flex items-center gap-2 shadow-xl shadow-primary/30 cursor-pointer"
                        >
                          Lihat Paket <ChevronRight className="w-5 h-5" />
                        </motion.button>
                      </div>
                    </div>
                  </motion.div>
                </AnimatePresence>
                
                {/* Dots */}
                <div className="absolute bottom-10 right-10 flex gap-2">
                  {BANNERS.map((_, idx) => (
                    <button 
                      key={idx}
                      onClick={() => setCurrentBanner(idx)}
                      className={`h-2 transition-all duration-300 rounded-full cursor-pointer ${idx === currentBanner ? 'w-8 bg-primary' : 'w-2 bg-white/40'}`}
                    />
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* CATEGORY CHIPS */}
          <section className="sticky top-[73px] md:top-[81px] z-40 bg-bg-soft/80 backdrop-blur-md py-4">
            <div className="max-w-7xl mx-auto px-4 md:px-8">
              <div className="flex gap-3 overflow-x-auto no-scrollbar pb-2">
                {[
                  { id: 'corporate', label: 'Corporate', icon: '🏢' },
                  { id: 'social', label: 'Event & Social', icon: '🎉' },
                  { id: 'daily', label: 'Daily Catering', icon: '🏠' },
                  { id: 'cake', label: 'Cakes & Bakery', icon: '🍰' },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setDivision(cat.id as any)}
                    className={`flex-shrink-0 flex items-center gap-2 px-6 py-3 rounded-2xl text-sm font-bold transition-all cursor-pointer ${
                      division === cat.id 
                        ? 'bg-primary text-white shadow-lg shadow-primary/25 scale-105' 
                        : 'bg-white text-neutral-500 hover:bg-neutral-50 border border-neutral-100 shadow-sm'
                    }`}
                  >
                    <span>{cat.icon}</span>
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* PRODUCT GRID */}
          <section className="px-4 md:px-8 py-10">
            <div className="max-w-7xl mx-auto">
              <div className="flex justify-between items-end mb-10">
                <div>
                  <h2 className="text-3xl font-black text-neutral-900 mb-2 capitalize leading-tight">
                    Premium <span className="text-primary tracking-tighter">{division}</span> Packages
                  </h2>
                  <div className="h-1 w-20 bg-primary rounded-full"></div>
                </div>
                <div className="hidden sm:flex items-center gap-2 text-neutral-400 text-sm font-bold uppercase tracking-widest bg-white px-4 py-2 rounded-xl border border-neutral-100">
                  <Info className="w-4 h-4 text-primary" />
                  Pemesanan min. H-1
                </div>
              </div>

              {filteredProducts.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
                  {filteredProducts.map(product => (
                    <ProductCard key={product.id} product={product} onAdd={addToCart} />
                  ))}
                </div>
              ) : (
                <div className="py-20 text-center">
                  <div className="bg-white p-12 rounded-[40px] shadow-sm max-w-lg mx-auto border border-neutral-100">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <Search className="w-10 h-10 text-neutral-300" />
                    </div>
                    <h3 className="text-xl font-bold text-neutral-800 mb-2">Produk tidak ditemukan</h3>
                    <p className="text-neutral-500">Coba kata kunci lain atau pilih kategori yang berbeda.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </main>
      )}

      {/* FOOTER */}
      <footer className="bg-neutral-900 text-white pt-20 pb-10 px-4 md:px-8">
        <div className="max-w-max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-12 mb-20">
          <div className="col-span-1 md:col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <Package className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black italic tracking-tighter">Thousand Tables</h2>
            </div>
            <p className="text-neutral-400 text-sm leading-relaxed mb-6">
              Penyedia layanan catering premium untuk kebutuhan korporat dan acara spesial Anda. Kualitas bintang lima dengan pelayanan ramah.
            </p>
            <div className="flex gap-4">
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                📸
              </div>
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                🐦
              </div>
              <div className="w-10 h-10 bg-neutral-800 rounded-full flex items-center justify-center hover:bg-primary transition-colors cursor-pointer">
                💬
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Menu & Kategori</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="hover:text-primary transition-colors cursor-pointer">Corporate Lunch</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Wedding & Events</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Snack Box Premium</li>
              <li className="hover:text-primary transition-colors cursor-pointer">Custom Cakes</li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Kontak Kami</h4>
            <ul className="space-y-4 text-sm text-neutral-400">
              <li className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-primary" />
                +62 811 1000 352
              </li>
              <li className="flex items-center gap-3">
                <MapPin className="w-4 h-4 text-primary" />
                STC Senayan, Jakarta Pusat
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-4 h-4 text-primary" />
                Setiap Hari: 09:00 - 21:00
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-white mb-6 uppercase tracking-widest text-[10px]">Pembayaran</h4>
            <div className="bg-neutral-800/50 p-6 rounded-3xl border border-neutral-800">
               <p className="text-[10px] font-black text-neutral-500 mb-2 uppercase tracking-widest">Bank Transfer Manual</p>
               <p className="text-xl font-black text-white mb-1 tracking-tight">BCA 1234567890</p>
               <p className="text-xs font-bold text-primary">a.n. PT Thousand Tables</p>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto pt-10 border-t border-neutral-800 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <p>© 2026 PT. Thousand Tables Selaras Makmur. All rights reserved.</p>
          <div className="flex gap-6 uppercase font-bold tracking-widest">
            <span className="hover:text-white transition-colors cursor-pointer">Privacy Policy</span>
            <span className="hover:text-white transition-colors cursor-pointer">Terms of Service</span>
          </div>
        </div>
      </footer>

      {/* CHECKOUT BOTTOM SHEET */}
      <AnimatePresence>
        {isCheckoutOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCheckoutOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60]"
            />
            <motion.div 
              initial={{ y: "100%" }}
              animate={{ y: 0 }}
              exit={{ y: "100%" }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="fixed bottom-0 left-0 right-0 bg-white z-[70] rounded-t-[48px] max-h-[95vh] overflow-hidden flex flex-col shadow-[0_-20px_60px_rgba(0,0,0,0.4)]"
            >
              <div className="p-8 pb-4 flex items-center justify-between border-b border-neutral-50">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-900">
                    <ShoppingCart className="w-5 h-5" />
                  </div>
                  <h2 className="text-2xl font-black text-neutral-900">Pemesanan Anda</h2>
                </div>
                <button 
                  onClick={() => setIsCheckoutOpen(false)}
                  className="bg-neutral-100 p-2.5 rounded-full hover:bg-neutral-200 transition-colors cursor-pointer"
                >
                  <X className="w-6 h-6 text-neutral-600" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-8 py-6 no-scrollbar">
                {cart.length === 0 ? (
                  <div className="text-center py-24">
                    <div className="w-20 h-20 bg-neutral-50 rounded-full flex items-center justify-center mx-auto mb-6">
                      <ShoppingCart className="w-10 h-10 text-neutral-200" />
                    </div>
                    <p className="text-neutral-400 font-bold">Keranjang Anda kosong</p>
                  </div>
                ) : (
                  <div className="space-y-10">
                    {/* Items */}
                    <div className="space-y-4">
                      <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em] mb-4">ITEM TERPILIH</h4>
                      {cart.map(item => (
                        <div key={item.id} className="flex gap-4 items-center bg-white p-2 pr-4 rounded-3xl border border-neutral-50 hover:border-neutral-200 transition-colors">
                          <img src={item.image} className="w-20 h-20 rounded-2xl object-cover shrink-0" alt="" />
                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-neutral-800 truncate">{item.name}</h4>
                            <p className="text-xs text-primary font-bold">Rp {item.price.toLocaleString('id-ID')}</p>
                          </div>
                          <div className="flex items-center gap-3 bg-neutral-100 rounded-2xl px-3 py-1.5 border border-neutral-200/50">
                            <button onClick={() => updateQuantity(item.id, -1)} className="p-1 hover:text-primary transition-colors cursor-pointer"><Minus className="w-4 h-4" /></button>
                            <span className="font-black w-6 text-center text-sm">{item.quantity}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="p-1 hover:text-primary transition-colors cursor-pointer"><Plus className="w-4 h-4" /></button>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Form */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 pt-10 border-t border-neutral-100 font-medium">
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">INFORMASI KONTAK</h4>
                        <div>
                          <label className="text-xs font-black text-neutral-900 uppercase tracking-widest block mb-2">Nama Lengkap</label>
                          <input 
                            type="text" 
                            className="w-full bg-neutral-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-bold placeholder:text-neutral-400/50"
                            value={customerName}
                            onChange={(e) => setCustomerName(e.target.value)}
                            placeholder="John Doe"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-black text-neutral-900 uppercase tracking-widest block mb-2">WhatsApp / Telepon</label>
                          <input 
                            type="tel" 
                            className="w-full bg-neutral-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-bold placeholder:text-neutral-400/50"
                            value={customerPhone}
                            onChange={(e) => setCustomerPhone(e.target.value)}
                            placeholder="0811..."
                          />
                        </div>
                      </div>
                      <div className="space-y-6">
                        <h4 className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">DETAIL PENGIRIMAN</h4>
                        <div>
                          <label className="text-xs font-black text-neutral-900 uppercase tracking-widest block mb-2">Alamat Lengkap</label>
                          <textarea 
                            rows={4}
                            className="w-full bg-neutral-100 rounded-2xl p-4 outline-none focus:ring-4 focus:ring-primary/5 border border-transparent focus:border-primary/20 transition-all font-bold placeholder:text-neutral-400/50 resize-none"
                            value={customerAddress}
                            onChange={(e) => setCustomerAddress(e.target.value)}
                            placeholder="Sebutkan gedung, lantai, ruangan jika corporate..."
                          />
                        </div>
                      </div>
                    </div>

                    {/* Promo */}
                    <div className="pt-4">
                      <div className="relative group">
                        <Gift className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-400 group-focus-within:text-primary transition-colors" />
                        <input 
                          type="text" 
                          placeholder="KODE PROMO: SELAMAT10 / PROMO20" 
                          className="w-full bg-neutral-50 border-2 border-dashed border-neutral-200 rounded-3xl py-5 pl-12 pr-4 text-sm font-black uppercase transition-all focus:border-primary/50 focus:bg-primary/5 outline-none"
                          value={promoCode}
                          onChange={(e) => setPromoCode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Bottom Sticky Action */}
              <div className="p-8 md:p-12 bg-neutral-900 text-white rounded-t-[48px] shadow-[0_-10px_60px_rgba(0,0,0,0.3)]">
                <div className="max-w-4xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                  <div className="flex flex-col md:flex-row items-center gap-8">
                    <div>
                      <p className="text-neutral-500 text-[10px] font-black uppercase tracking-[0.2em] mb-2">ESTIMASI TOTAL</p>
                      <div className="flex items-baseline gap-3">
                         <h3 className="text-4xl md:text-5xl font-black tracking-tighter text-white">Rp {total.toLocaleString('id-ID')}</h3>
                         {promoDiscount > 0 && (
                           <div className="flex flex-col">
                             <span className="text-neutral-500 line-through text-xs italic">Rp {subtotal.toLocaleString('id-ID')}</span>
                             <span className="text-primary text-sm font-black">-{promoDiscount}% OFF</span>
                           </div>
                         )}
                      </div>
                    </div>
                    <div className="h-12 w-px bg-white/10 hidden md:block"></div>
                    <div className="flex items-center gap-4 bg-white/5 p-4 rounded-3xl border border-white/5">
                      <div className="w-10 h-10 bg-primary/20 text-primary rounded-full flex items-center justify-center">
                        <MapPin className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold text-neutral-400 uppercase">Metode bayar</p>
                        <p className="text-sm font-black italic">Transfer BCA Manual</p>
                      </div>
                    </div>
                  </div>
                  
                  <button 
                    onClick={checkout}
                    disabled={!cart.length || !customerName || !customerPhone || !customerAddress}
                    className="w-full md:w-auto min-w-[280px] bg-primary hover:bg-primary-dark disabled:bg-neutral-800 disabled:text-neutral-700 py-6 px-10 rounded-3xl font-black text-xl flex items-center justify-center gap-3 transition-all shadow-2xl shadow-primary/40 active:scale-95 cursor-pointer whitespace-nowrap"
                  >
                    PESAN SEKARANG VIA WHATSAPP <ArrowRight className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ADMIN LOGIN */}
      {appMode === 'admin-login' && (
        <div className="fixed inset-0 bg-white z-[100] flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <button 
              onClick={() => setAppMode('customer')}
              className="mb-8 p-3 rounded-2xl bg-neutral-100 hover:bg-neutral-200 transition-colors cursor-pointer"
            >
              <X className="w-6 h-6 text-neutral-600" />
            </button>
            <div className="bg-white p-12 rounded-[48px] border border-neutral-100 shadow-2xl shadow-neutral-200/50">
              <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mb-10">
                <LayoutDashboard className="w-10 h-10 text-primary" />
              </div>
              <h2 className="text-4xl font-black text-neutral-900 mb-2 leading-tight">Admin<br /><span className="text-primary truncate">Thousand Tables</span></h2>
              <p className="text-neutral-500 mb-12 font-medium">Monitoring & Management Dashboard</p>
              
              <div className="space-y-6">
                <div className="space-y-4">
                  <input 
                    type="email" 
                    placeholder="Email Staff" 
                    className="w-full bg-neutral-100 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold border border-transparent focus:border-primary/20 transition-all placeholder:text-neutral-400" 
                  />
                  <input 
                    type="password" 
                    placeholder="Password" 
                    className="w-full bg-neutral-100 p-5 rounded-2xl outline-none focus:ring-4 focus:ring-primary/5 font-bold border border-transparent focus:border-primary/20 transition-all placeholder:text-neutral-400" 
                  />
                </div>
                <button 
                  onClick={() => {
                    setAdminUser({ name: 'Admin Master', role: 'owner' });
                    setAppMode('admin');
                  }}
                  className="w-full bg-neutral-900 text-white py-6 rounded-2xl font-black text-lg transition-all shadow-xl shadow-neutral-900/10 active:scale-95 cursor-pointer"
                >
                  MASUK DASHBOARD
                </button>
                <div className="flex items-center justify-center gap-2 pt-4">
                   <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                   <p className="text-[10px] text-neutral-400 font-black uppercase tracking-widest">System Secure & Online</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SUCCESS MODE */}
      {appMode === 'success' && (
        <div className="fixed inset-0 bg-neutral-50 z-[200] flex items-center justify-center p-4">
           <div className="absolute top-10 left-10 hidden lg:block">
              <div className="flex items-center gap-2">
                <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg">
                  <Package className="w-6 h-6" />
                </div>
                <h1 className="text-xl font-black italic">Thousand Tables</h1>
              </div>
           </div>
          <motion.div 
             initial={{ scale: 0.9, opacity: 0 }}
             animate={{ scale: 1, opacity: 1 }}
             className="max-w-2xl w-full text-center bg-white p-12 md:p-20 rounded-[64px] shadow-2xl shadow-neutral-200/50 border border-neutral-100"
          >
            <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-10">
              <CheckCircle2 className="w-12 h-12 text-green-500" />
            </div>
            <h2 className="text-4xl md:text-7xl font-black text-neutral-900 mb-6 tracking-tighter">Order Berhasil!</h2>
            <p className="text-neutral-500 text-xl mb-12 max-w-md mx-auto font-medium">
              Pesanan kami terima. Mohon konfirmasi via WhatsApp untuk validasi pembayaran manual Anda.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <button 
                onClick={() => {
                  const latestOrder = orders[0];
                  const msg = encodeURIComponent(`Halo Thousand Tables, saya ingin konfirmasi pesanan dengan Ref ID: ${latestOrder?.refId} atas nama ${latestOrder?.customer.name}. Saya akan kirim bukti transfer BCA.`);
                  window.open(`https://wa.me/628111000352?text=${msg}`);
                  setAppMode('customer');
                }}
                className="flex-1 bg-primary text-white py-6 rounded-3xl font-black text-xl shadow-2xl shadow-primary/30 active:scale-95 transition-all cursor-pointer"
              >
                WHATSAPP KONFIRMASI
              </button>
              <button 
                onClick={() => setAppMode('customer')}
                className="flex-1 bg-neutral-100 text-neutral-600 py-6 rounded-3xl font-black text-xl hover:bg-neutral-200 transition-all active:scale-95 cursor-pointer"
              >
                KEMBALI KE MENU
              </button>
            </div>
            <div className="mt-12 flex items-center justify-center gap-4 text-xs font-black uppercase text-neutral-300 tracking-widest">
               <span>ID: {orders[0]?.refId}</span>
               <span>•</span>
               <span>PT THOUSAND TABLES</span>
            </div>
          </motion.div>
        </div>
      )}

      {/* ADMIN DASHBOARD - SIMPLIFIED MODERN VERSION */}
      {(appMode === 'admin' || appMode === 'admin-orders') && (
        <div className="fixed inset-0 bg-neutral-50 z-[110] flex overflow-hidden">
          {/* Sidebar */}
          <aside className="w-80 bg-white border-r border-neutral-100 flex flex-col p-8 hidden lg:flex shadow-sm">
             <div className="flex items-center gap-3 mb-16">
               <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white">
                 <Package className="w-6 h-6" />
               </div>
               <h1 className="text-xl font-black italic tracking-tight uppercase">Dashboard</h1>
             </div>
             
             <nav className="space-y-3 flex-1">
               <div 
                 onClick={() => setAppMode('admin')}
                 className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all font-black text-sm uppercase tracking-widest ${appMode === 'admin' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
               >
                 <LayoutDashboard className="w-5 h-5" /> Dashboard
               </div>
               <div 
                 onClick={() => setAppMode('admin-orders')}
                 className={`flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all font-black text-sm uppercase tracking-widest ${appMode === 'admin-orders' ? 'bg-primary text-white shadow-xl shadow-primary/20' : 'text-neutral-400 hover:text-neutral-900 hover:bg-neutral-50'}`}
               >
                 <ClipboardList className="w-5 h-5" /> Pesanan
               </div>
               <div className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all font-black text-sm uppercase tracking-widest text-neutral-300 hover:text-neutral-900 hover:bg-neutral-50">
                 <Package className="w-5 h-5" /> Produk
               </div>
               <div className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all font-black text-sm uppercase tracking-widest text-neutral-300 hover:text-neutral-900 hover:bg-neutral-50">
                 <Gift className="w-5 h-5" /> Promosi
               </div>
               <div className="flex items-center gap-4 p-5 rounded-2xl cursor-pointer transition-all font-black text-sm uppercase tracking-widest text-neutral-300 hover:text-neutral-900 hover:bg-neutral-50">
                 <Settings className="w-5 h-5" /> Setelan
               </div>
             </nav>

             <div className="mt-auto">
               <div className="bg-neutral-50 p-6 rounded-[32px] mb-8">
                 <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 bg-neutral-200 rounded-full flex items-center justify-center">
                       <User className="w-5 h-5 text-neutral-500" />
                    </div>
                    <div>
                       <p className="text-xs font-black text-neutral-900">{adminUser?.name}</p>
                       <p className="text-[10px] font-bold text-neutral-400 uppercase">{adminUser?.role}</p>
                    </div>
                 </div>
                 <button 
                  onClick={() => {setAdminUser(null); setAppMode('customer');}}
                  className="w-full bg-white border border-neutral-200 text-neutral-900 py-4 rounded-xl text-xs font-black uppercase tracking-widest hover:bg-neutral-100 transition-colors cursor-pointer"
                >
                  Logout
                </button>
               </div>
             </div>
          </aside>

          {/* Main Content */}
          <main className="flex-1 overflow-y-auto p-6 md:p-12 lg:p-16">
            <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-16">
              <div>
                <div className="flex items-center gap-2 mb-2">
                   <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                   <p className="text-[10px] font-black text-neutral-400 uppercase tracking-[0.2em]">Management Console</p>
                </div>
                <h2 className="text-4xl md:text-5xl font-black text-neutral-900 tracking-tighter">Ringkasan Operasional</h2>
              </div>
              <div className="flex items-center gap-4">
                 <button className="bg-white p-4 rounded-2xl shadow-sm border border-neutral-100 hover:bg-neutral-50 lg:hidden">
                    <Menu className="w-6 h-6 text-neutral-900" />
                 </button>
                 <div className="bg-white px-6 py-4 rounded-[24px] shadow-sm border border-neutral-100 flex items-center gap-3">
                   <Clock className="w-5 h-5 text-primary" />
                   <span className="text-sm font-black text-neutral-900">{new Date().toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span>
                 </div>
              </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-10 mb-16">
                <div className="bg-white p-10 rounded-[40px] border border-neutral-100 shadow-sm relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-bl-[100px] transition-all group-hover:scale-150"></div>
                  <p className="text-[10px] font-black text-neutral-400 uppercase tracking-widest mb-4">Total Penjualan</p>
                  <h3 className="text-4xl font-black text-neutral-900 italic tracking-tighter">Rp {orders.reduce((a, b) => a + b.total, 0).toLocaleString('id-ID')}</h3>
                </div>
                <div className="bg-primary p-10 rounded-[40px] shadow-2xl shadow-primary/20 relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/10 rounded-bl-[100px] transition-all group-hover:scale-150"></div>
                  <p className="text-[10px] font-black text-white/60 uppercase tracking-widest mb-4">Order Masuk</p>
                  <h3 className="text-5xl font-black text-white italic tracking-tighter">{orders.length}</h3>
                </div>
                <div className="bg-neutral-900 p-10 rounded-[40px] shadow-xl relative overflow-hidden group">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 rounded-bl-[100px] transition-all group-hover:scale-150"></div>
                  <p className="text-[10px] font-black text-neutral-500 uppercase tracking-widest mb-4">Paket Aktif</p>
                  <h3 className="text-4xl font-black text-white italic tracking-tighter">{products.length}</h3>
                </div>
            </div>

            <div className="bg-white rounded-[48px] border border-neutral-100 shadow-sm overflow-hidden mb-20">
               <div className="p-10 border-b border-neutral-50 flex flex-col lg:flex-row justify-between items-center gap-8">
                  <div className="flex items-center gap-4">
                     <div className="w-12 h-12 bg-neutral-900 rounded-2xl flex items-center justify-center text-white">
                        <ClipboardList className="w-6 h-6" />
                     </div>
                     <h3 className="font-black text-3xl text-neutral-900 tracking-tighter">Live Order Stream</h3>
                  </div>
                  <div className="flex bg-neutral-100 p-2 rounded-2xl gap-2">
                    <button className="px-6 py-3 rounded-xl bg-white shadow-md text-xs font-black uppercase tracking-widest text-neutral-900">Semua</button>
                    <button className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors">Pending</button>
                    <button className="px-6 py-3 rounded-xl text-xs font-black uppercase tracking-widest text-neutral-400 hover:text-neutral-600 transition-colors">Confirm</button>
                  </div>
               </div>
               
               <div className="p-4 overflow-x-auto no-scrollbar">
                 <table className="w-full text-left">
                   <thead>
                     <tr className="bg-neutral-50 text-neutral-400 text-[10px] font-black uppercase tracking-[0.2em]">
                       <th className="px-8 py-6 rounded-l-3xl">Reference ID</th>
                       <th className="px-8 py-6">Customer Details</th>
                       <th className="px-8 py-6">Total Bio</th>
                       <th className="px-8 py-6">Status</th>
                       <th className="px-8 py-6 rounded-r-3xl">Management</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-neutral-50">
                     {orders.length === 0 ? (
                       <tr>
                         <td colSpan={5} className="px-8 py-32 text-center">
                            <div className="bg-neutral-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                               <Package className="w-10 h-10 text-neutral-200" />
                            </div>
                            <p className="text-neutral-400 font-bold uppercase tracking-widest text-xs">Belum ada pesanan aktif hari ini</p>
                         </td>
                       </tr>
                     ) : (
                       orders.map(order => (
                         <tr key={order.id} className="group hover:bg-neutral-50 transition-all">
                            <td className="px-8 py-10">
                              <span className="font-black text-neutral-900 text-lg tracking-tight group-hover:text-primary transition-colors">{order.refId}</span>
                              <div className="flex items-center gap-2 mt-2">
                                <Clock className="w-3 h-3 text-neutral-300" />
                                <p className="text-[10px] text-neutral-400 font-bold uppercase">{order.timestamp}</p>
                              </div>
                            </td>
                            <td className="px-8 py-10">
                              <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-neutral-100 rounded-full flex items-center justify-center text-neutral-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                                   <User className="w-5 h-5" />
                                </div>
                                <div>
                                  <p className="font-black text-neutral-800 tracking-tight">{order.customer.name}</p>
                                  <p className="text-xs text-neutral-400 font-bold">{order.customer.phone}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-8 py-10">
                              <p className="font-black text-neutral-900 text-lg tracking-tighter">Rp {order.total.toLocaleString('id-ID')}</p>
                              <p className="text-[10px] text-neutral-400 font-bold uppercase">{order.items.length} Package Categories</p>
                            </td>
                            <td className="px-8 py-10">
                              <span className={`px-4 py-2 rounded-full text-[10px] font-black uppercase tracking-widest border ${order.paymentStatus === 'unpaid' ? 'bg-yellow-50 text-yellow-600 border-yellow-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
                                {order.paymentStatus}
                              </span>
                            </td>
                            <td className="px-8 py-10">
                               <div className="flex items-center gap-2">
                                 <button className="bg-neutral-900 text-white w-10 h-10 rounded-xl flex items-center justify-center hover:bg-primary transition-all active:scale-95 cursor-pointer">
                                   <Info className="w-5 h-5" />
                                 </button>
                                 <button className="bg-white border border-neutral-200 text-neutral-900 w-10 h-10 rounded-xl flex items-center justify-center hover:bg-neutral-100 transition-all active:scale-95 cursor-pointer">
                                   <Phone className="w-5 h-5" />
                                 </button>
                               </div>
                            </td>
                         </tr>
                       ))
                     )}
                   </tbody>
                 </table>
               </div>
            </div>
          </main>
        </div>
      )}
    </div>
  );
}

