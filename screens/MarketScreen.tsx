import React, { useState, useEffect, useMemo } from 'react';
import { Screen, Listing } from '../types';
import { marketService, getUserLocation } from '../src/services/api';
import { motion, AnimatePresence } from 'framer-motion';
import MandiPricePredictor from '../components/MandiPricePredictor';
import {
  Search,
  TrendingUp,
  MapPin,
  Plus,
  X,
  Camera,
  ShoppingCart,
  ArrowLeft,
  ChevronRight,
  Leaf,
  Store,
} from 'lucide-react';

interface MarketScreenProps {
  navigateTo: (screen: Screen, data?: any) => void;
  t: any;
}

const MarketScreen: React.FC<MarketScreenProps> = ({ navigateTo, t }) => {
  const [tab, setTab] = useState<'all' | 'grains' | 'fruits' | 'vegetables'>('all');
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [userProfile, setUserProfile] = useState<any>(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        const { userService } = await import('../src/services/api');
        const p = await userService.getProfile();
        setUserProfile(p);
      } catch (e) {}
    };
    loadUser();
    getUserLocation().then((loc) => setLocation(loc)).catch(() => {});
  }, []);

  const [newListing, setNewListing] = useState({
    crop: '',
    price: '',
    quantity: '',
    loc: '',
    category: 'Crop',
    description: '',
    isOrganic: false,
    image: '',
  });

  const VERIFIED_LAND_ACRES = userProfile?.land_size || 2.5;
  const ESTIMATED_MAX_QUOTA = VERIFIED_LAND_ACRES * 5000;
  const isOverQuota = parseInt(newListing.quantity) > ESTIMATED_MAX_QUOTA && newListing.isOrganic;

  const filteredListings = useMemo(() => {
    let result = listings;
    if (tab === 'grains') {
      result = result.filter((l) =>
        ['wheat', 'rice', 'corn', 'soybean', 'cotton'].some((c) => l.crop.toLowerCase().includes(c))
      );
    }
    if (tab === 'fruits') {
      result = result.filter((l) =>
        ['mango', 'apple', 'banana', 'grapes'].some((c) => l.crop.toLowerCase().includes(c))
      );
    }
    if (tab === 'vegetables') {
      result = result.filter((l) =>
        ['potato', 'onion', 'tomato', 'brinjal'].some((c) => l.crop.toLowerCase().includes(c))
      );
    }
    if (searchQuery) {
      result = result.filter((l) =>
        l.crop.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.loc?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    return result;
  }, [listings, tab, searchQuery]);

  useEffect(() => {
    fetchListings();
  }, [location]);

  const fetchListings = async () => {
    try {
      setLoading(true);
      const data = await marketService.getListings({ lat: location?.lat, lng: location?.lng });
      setListings(data);
    } catch (e) {
      console.error('Failed to load listings', e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddListing = async () => {
    if (!newListing.crop || !newListing.price || !newListing.quantity) return;
    if (isOverQuota) return;
    const entryData = {
      crop_name: newListing.crop,
      quantity: `${newListing.quantity}kg`,
      price: `₹${newListing.price}/${newListing.category === 'Crop' ? 'kg' : 'unit'}`,
      location: newListing.loc || 'My Farm',
      description: newListing.description || 'Fresh produce listed directly by farmer.',
      is_organic: newListing.isOrganic,
      image_url: newListing.image,
    };
    try {
      setLoading(true);
      const createdListing = await marketService.createListing(entryData);
      setListings((prev) => [createdListing, ...prev]);
      setShowAddForm(false);
      setNewListing({
        crop: '',
        price: '',
        quantity: '',
        loc: '',
        category: 'Crop',
        description: '',
        isOrganic: false,
        image: '',
      });
    } catch (e: any) {
      alert('Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  const TABS = [
    { key: 'all', label: 'All Crops' },
    { key: 'grains', label: 'Grains & Pulses' },
    { key: 'vegetables', label: 'Vegetables' },
    { key: 'fruits', label: 'Fruits' },
  ];

  return (
    <div
      className="bg-white min-h-full pb-24 text-[#10231D]"
      style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}
    >
      {/* ─── HEADER ─── */}
      <div className="px-5 pt-11 pb-4 flex items-center justify-between bg-white sticky top-0 z-30 border-b border-[#E3EBE6]">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigateTo('home')}
            className="w-9 h-9 flex items-center justify-center rounded-xl bg-[#F7FAF8] border border-[#E3EBE6] text-[#10231D] active:scale-95 transition-transform"
          >
            <ArrowLeft size={16} />
          </button>
          <div>
            <h1 className="text-lg font-extrabold text-[#10231D]">Mandi &amp; Marketplace</h1>
            <div className="flex items-center gap-1 mt-0.5">
              <MapPin size={11} className="text-[#00B86B]" />
              <span className="text-[11px] font-semibold text-[#68756F]">Wardha &amp; Nagpur APMC Hub</span>
            </div>
          </div>
        </div>
        <button
          onClick={() => setShowAddForm(true)}
          className="min-h-[40px] px-3.5 rounded-xl bg-[#003D2B] text-white text-xs font-bold flex items-center gap-1.5 shadow-sm active:scale-95 transition-transform hover:bg-[#002A1E]"
        >
          <Plus size={14} />
          <span>Sell Crop</span>
        </button>
      </div>

      {/* ─── SEARCH BAR ─── */}
      <div className="px-5 pt-4 pb-2">
        <div className="flex items-center gap-2.5 bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl px-3.5 py-2.5">
          <Search size={16} className="text-[#68756F] shrink-0" />
          <input
            type="text"
            placeholder="Search crop, mandi, buyer location..."
            className="flex-1 bg-transparent text-sm text-[#10231D] outline-none placeholder-[#68756F]"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* ─── 1. MANDI INTELLIGENCE (LIVE PRICE, MODEL FORECAST & MSP) ─── */}
      <div className="px-5 my-3">
        <MandiPricePredictor />
      </div>

      {/* ─── 2. CATEGORY TABS FOR DIRECT LISTINGS ─── */}
      <div className="px-5 mb-3">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-sm font-bold text-[#10231D]">Direct Farmer Listings</h2>
          <span className="text-xs text-[#68756F]">{filteredListings.length} verified lots</span>
        </div>
        <div className="flex gap-2 overflow-x-auto no-scrollbar">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key as any)}
              className={`min-h-[38px] px-3.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors border ${
                tab === t.key
                  ? 'bg-[#003D2B] text-white border-[#003D2B]'
                  : 'bg-[#F7FAF8] text-[#10231D] border-[#E3EBE6] hover:bg-[#EBF1EE]'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* ─── LISTINGS ─── */}
      <div className="px-5">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-[#F7FAF8] border border-[#E3EBE6] animate-pulse" />
            ))}
          </div>
        ) : filteredListings.length === 0 ? (
          <div className="py-12 flex flex-col items-center text-center bg-[#F7FAF8] border-2 border-dashed border-[#E3EBE6] rounded-2xl p-6">
            <div className="w-12 h-12 rounded-xl bg-[#E8FBF3] border border-[#B3F0D2] flex items-center justify-center mb-2 text-[#00B86B]">
              <Store size={22} />
            </div>
            <h3 className="text-sm font-bold text-[#10231D]">No crop listings in this filter</h3>
            <p className="text-xs text-[#68756F] mt-1 mb-3">
              List your harvested lot to receive offers directly from verified millers.
            </p>
            <button
              onClick={() => setShowAddForm(true)}
              className="min-h-[40px] px-4 rounded-xl bg-[#00B86B] text-white text-xs font-bold"
            >
              Create New Listing
            </button>
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredListings.map((item) => (
              <div
                key={item.id}
                role="button"
                tabIndex={0}
                onClick={() => navigateTo('market-detail', { listing: item })}
                className="w-full flex items-center gap-3.5 p-3.5 bg-white rounded-2xl text-left border border-[#E3EBE6] hover:bg-[#F7FAF8] transition-colors cursor-pointer shadow-[0_1px_3px_rgba(16,35,29,0.03)]"
              >
                <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-[#E3EBE6] bg-[#F7FAF8]">
                  <img
                    src={item.image || `https://images.unsplash.com/photo-1501430654243-c934cec2e1c0?w=200&q=80`}
                    alt={item.crop}
                    className="w-full h-full object-cover"
                  />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <h3 className="text-sm font-bold text-[#10231D] truncate">{item.crop}</h3>
                    {item.isOrganic && (
                      <span className="text-[9px] font-bold px-1.5 py-0.2 rounded bg-[#E8FBF3] text-[#007A48] border border-[#B3F0D2]">
                        Organic
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin size={10} className="text-[#68756F]" />
                    <span className="text-[11px] text-[#68756F] truncate">{item.loc}</span>
                  </div>
                  <p className="text-sm font-extrabold text-[#003D2B] mt-1">
                    {item.price.split('/')[0]}
                    <span className="text-xs font-medium text-[#68756F]">
                      /{item.price.split('/')[1] || 'kg'}
                    </span>
                  </p>
                </div>

                <div className="shrink-0 flex items-center gap-1">
                  <span className="text-xs font-bold text-[#007A48] px-2.5 py-1 rounded-lg bg-[#E8FBF3] border border-[#B3F0D2]">
                    Buy Lot
                  </span>
                  <ChevronRight size={14} className="text-[#68756F]" />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ─── SELL FORM MODAL ─── */}
      <AnimatePresence>
        {showAddForm && (
          <div className="fixed inset-0 z-[100] flex items-end justify-center bg-black/50">
            <motion.div
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="w-full max-w-md bg-white rounded-t-3xl shadow-2xl flex flex-col max-h-[92vh]"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-[#E3EBE6]">
                <h3 className="text-base font-bold text-[#10231D]">Post New Crop for Sale</h3>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-[#F7FAF8] border border-[#E3EBE6] text-[#68756F]"
                >
                  <X size={16} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
                {/* Photo upload */}
                <div className="relative h-32 rounded-2xl bg-[#F7FAF8] border border-dashed border-[#E3EBE6] overflow-hidden flex items-center justify-center">
                  {newListing.image ? (
                    <>
                      <img src={newListing.image} className="w-full h-full object-cover" />
                      <button
                        onClick={() => setNewListing({ ...newListing, image: '' })}
                        className="absolute top-2 right-2 w-7 h-7 bg-black/60 text-white rounded-full flex items-center justify-center"
                      >
                        <X size={13} />
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => document.getElementById('market-file-upload')?.click()}
                      className="flex flex-col items-center gap-1.5 text-[#68756F]"
                    >
                      <Camera size={22} className="text-[#00B86B]" />
                      <span className="text-xs font-bold text-[#10231D]">Add Photo of Harvest</span>
                    </button>
                  )}
                </div>
                <input
                  type="file"
                  id="market-file-upload"
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () =>
                        setNewListing({ ...newListing, image: reader.result as string });
                      reader.readAsDataURL(file);
                    }
                  }}
                />

                <div>
                  <label className="text-xs font-bold text-[#68756F] mb-1 block">Crop Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Sharbati Wheat"
                    className="w-full bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#10231D] outline-none focus:border-[#00B86B]"
                    value={newListing.crop}
                    onChange={(e) => setNewListing({ ...newListing, crop: e.target.value })}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs font-bold text-[#68756F] mb-1 block">Expected Price (₹)</label>
                    <input
                      type="number"
                      placeholder="e.g. 2600"
                      className="w-full bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#10231D] outline-none focus:border-[#00B86B]"
                      value={newListing.price}
                      onChange={(e) => setNewListing({ ...newListing, price: e.target.value })}
                    />
                  </div>
                  <div>
                    <label className="text-xs font-bold text-[#68756F] mb-1 block">Quantity (kg)</label>
                    <input
                      type="number"
                      placeholder="e.g. 1500"
                      className="w-full bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#10231D] outline-none focus:border-[#00B86B]"
                      value={newListing.quantity}
                      onChange={(e) => setNewListing({ ...newListing, quantity: e.target.value })}
                    />
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#68756F] mb-1 block">Village / APMC</label>
                  <input
                    type="text"
                    placeholder="e.g. Wardha APMC Yard"
                    className="w-full bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl px-3.5 py-2.5 text-sm font-semibold text-[#10231D] outline-none focus:border-[#00B86B]"
                    value={newListing.loc}
                    onChange={(e) => setNewListing({ ...newListing, loc: e.target.value })}
                  />
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl">
                  <div className="flex items-center gap-2">
                    <Leaf size={16} className="text-[#00B86B]" />
                    <span className="text-xs font-bold text-[#10231D]">Organic Certified</span>
                  </div>
                  <button
                    onClick={() => setNewListing({ ...newListing, isOrganic: !newListing.isOrganic })}
                    className={`w-10 h-6 rounded-full transition-colors relative ${
                      newListing.isOrganic ? 'bg-[#00B86B]' : 'bg-[#E3EBE6]'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${
                        newListing.isOrganic ? 'translate-x-4' : 'translate-x-0.5'
                      }`}
                    />
                  </button>
                </div>

                <button
                  onClick={handleAddListing}
                  disabled={!newListing.crop || !newListing.price}
                  className="w-full min-h-[48px] text-white font-bold rounded-xl text-sm bg-[#003D2B] hover:bg-[#002A1E] transition-all disabled:opacity-40"
                >
                  Post Crop Listing
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default MarketScreen;
