import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Screen, UserProfile, Language } from '../types';
import { languages } from '../translations';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MapPin,
  Bell,
  Thermometer,
  Droplets,
  Wind,
  CloudRain,
  Leaf,
  Sun,
  Plus,
  ChevronRight,
  Search,
  Crosshair,
  Navigation,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PhoneCall,
  Camera,
  Activity,
  Layers,
  Store,
  ShieldCheck,
  Award,
  Radio,
  Grid3x3,
  Calendar,
  Sparkles,
  Zap,
  Volume2,
  VolumeX,
  ArrowRight,
} from 'lucide-react';
import { weatherService, getPinpointLocation, plotService } from '../src/services/api';
import MandiPricePredictor from '../components/MandiPricePredictor';

type StatusType = 'Healthy' | 'Attention' | 'Risk' | 'Critical';

interface AdvisoryCardProps {
  status: StatusType;
  title: string;
  what: string;
  why: string;
  whatToDo: string;
  sourceTimestamp?: string;
  onActionClick?: () => void;
  actionLabel?: string;
}

const AdvisoryCard: React.FC<AdvisoryCardProps> = ({
  status,
  title,
  what,
  why,
  whatToDo,
  sourceTimestamp = "Today's Farm Advisory • KVK & IMD Model",
  onActionClick,
  actionLabel = 'View Plan',
}) => {
  const [isSpeaking, setIsSpeaking] = useState(false);

  const handleSpeak = () => {
    if (!window.speechSynthesis) return;
    if (isSpeaking) {
      window.speechSynthesis.cancel();
      setIsSpeaking(false);
      return;
    }
    const textToRead = `${title}. What: ${what}. Why: ${why}. Recommended Action: ${whatToDo}`;
    const utterance = new SpeechSynthesisUtterance(textToRead);
    utterance.rate = 0.95;
    utterance.onend = () => setIsSpeaking(false);
    utterance.onerror = () => setIsSpeaking(false);
    window.speechSynthesis.speak(utterance);
    setIsSpeaking(true);
  };

  const statusStyles = {
    Healthy: 'bg-[#E8FBF3] text-[#007A48] border-[#B3F0D2]',
    Attention: 'bg-[#FFF9E6] text-[#996B00] border-[#FCE39E]',
    Risk: 'bg-[#FFF2E8] text-[#C05600] border-[#FDD3B7]',
    Critical: 'bg-[#FDE8E8] text-red-700 border-red-200',
  }[status] || 'bg-[#E8FBF3] text-[#007A48] border-[#B3F0D2]';

  return (
    <div className="bg-white border border-[#E3EBE6] rounded-2xl p-5 shadow-[0_2px_10px_rgba(16,35,29,0.04)] relative overflow-hidden">
      <div className="flex items-center justify-between gap-3 mb-3">
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${statusStyles}`}>
            {status}
          </span>
          <span className="text-[11px] font-medium text-[#68756F]">{sourceTimestamp}</span>
        </div>
        <button
          onClick={handleSpeak}
          aria-label={isSpeaking ? 'Stop speech' : 'Read advisory aloud'}
          className="p-2 rounded-xl text-[#10231D] hover:bg-[#F7FAF8] active:bg-[#E3EBE6] transition-colors shrink-0"
          title="Listen in speech"
        >
          {isSpeaking ? (
            <VolumeX size={18} className="text-red-500" />
          ) : (
            <Volume2 size={18} className="text-[#68756F]" />
          )}
        </button>
      </div>

      <h3 className="text-base sm:text-lg font-bold text-[#10231D] mb-3 leading-snug">
        {title}
      </h3>

      <div className="space-y-2.5 text-xs sm:text-sm">
        <div className="flex items-start gap-2.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E3EBE6]">
          <span className="text-[10px] uppercase font-bold text-[#003D2B] bg-[#E8FBF3] px-1.5 py-0.5 rounded shrink-0 mt-0.5">
            What
          </span>
          <p className="text-[#10231D] font-medium leading-relaxed">{what}</p>
        </div>

        <div className="flex items-start gap-2.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E3EBE6]">
          <span className="text-[10px] uppercase font-bold text-[#68756F] bg-white px-1.5 py-0.5 rounded shrink-0 mt-0.5 border border-[#E3EBE6]">
            Why
          </span>
          <p className="text-[#68756F] font-medium leading-relaxed">{why}</p>
        </div>

        <div className="flex items-start gap-2.5 bg-[#F7FAF8] p-2.5 rounded-xl border border-[#E3EBE6]">
          <span className="text-[10px] uppercase font-bold text-[#007A48] bg-[#E8FBF3] px-1.5 py-0.5 rounded shrink-0 mt-0.5">
            Action
          </span>
          <p className="text-[#007A48] font-bold leading-relaxed">{whatToDo}</p>
        </div>
      </div>

      {onActionClick && (
        <button
          onClick={onActionClick}
          className="mt-4 w-full py-2.5 px-4 bg-[#00BB78] hover:bg-[#00a86b] text-white rounded-xl text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
        >
          <span>{actionLabel}</span>
          <ArrowRight size={14} />
        </button>
      )}
    </div>
  );
};

interface DashboardScreenProps {
  navigateTo: (screen: Screen, data?: any) => void;
  user: UserProfile | null;
  t: any;
  onLangChange: (lang: Language) => void;
  currentLang: Language;
  weather: any;
  locationName: string;
  userCoords?: { lat: number; lng: number } | null;
  gpsAccuracy?: number | null;
  isLiveTracking?: boolean;
  onToggleLiveTracking?: () => void;
  onUpdateLocation?: (coords: { lat: number; lng: number; accuracy?: number; name?: string }, persist?: boolean) => void;
  onOpenSearch?: () => void;
}

type ServiceCategory = 'all' | 'crop' | 'market' | 'govt' | 'sustainability' | 'utilities';

const DashboardScreen: React.FC<DashboardScreenProps> = ({
  navigateTo,
  user,
  t,
  onLangChange,
  currentLang,
  weather,
  locationName,
  userCoords,
  gpsAccuracy,
  isLiveTracking,
  onToggleLiveTracking,
  onUpdateLocation,
  onOpenSearch,
}) => {
  const [showLangMenu, setShowLangMenu] = useState(false);
  const [userPlots, setUserPlots] = useState<any[]>([]);
  const [isLoadingPlots, setIsLoadingPlots] = useState(true);
  const [plotLocationNames, setPlotLocationNames] = useState<{ [key: number]: string }>({});
  const [activeCategory, setActiveCategory] = useState<ServiceCategory>('all');
  const hasFetched = useRef(false);

  // ── Location picker state ──
  const [showLocationPicker, setShowLocationPicker] = useState(false);
  const [locationTab, setLocationTab] = useState<'gps' | 'search' | 'manual'>('gps');
  const [isAcquiringGps, setIsAcquiringGps] = useState(false);
  const [gpsMessage, setGpsMessage] = useState<{ text: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [manualLat, setManualLat] = useState('');
  const [manualLng, setManualLng] = useState('');
  const [cityQuery, setCityQuery] = useState('');
  const [cityResults, setCityResults] = useState<any[]>([]);
  const [citySearching, setCitySearching] = useState(false);
  const citySearchTimer = useRef<any>(null);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;

    const locationFallback = locationName;

    const fetchPlots = async () => {
      try {
        const data = await plotService.getPlots();
        const safePlots = Array.isArray(data) ? data : [];
        setUserPlots(safePlots);

        const locationMap: { [key: number]: string } = {};
        for (const plot of safePlots) {
          if (!plot) continue;
          const nameMatch = plot.name?.match(/\(([^)]+)\)/);
          if (nameMatch && nameMatch[1]) {
            locationMap[plot.id] = nameMatch[1];
          } else {
            locationMap[plot.id] = locationFallback.split(',')[0] || 'Farm Plot';
          }
        }
        setPlotLocationNames(locationMap);
      } catch (error) {
        console.error('Failed to fetch user plots:', error);
        setUserPlots([]);
      } finally {
        setIsLoadingPlots(false);
      }
    };
    fetchPlots();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // ── Real-time GPS pinpoint acquisition ──
  const handleAcquireRealGps = async () => {
    setIsAcquiringGps(true);
    setGpsMessage({ text: 'Connecting to GPS satellites & sensors...', type: 'info' });
    try {
      const pinpoint = await getPinpointLocation({ enableHighAccuracy: true, timeout: 12000 });
      if (onUpdateLocation) {
        onUpdateLocation(
          {
            lat: pinpoint.lat,
            lng: pinpoint.lng,
            accuracy: pinpoint.accuracy,
          },
          true
        );
      } else {
        localStorage.setItem('kd_saved_location', JSON.stringify(pinpoint));
        sessionStorage.removeItem('kd_last_location');
      }
      setGpsMessage({
        text: `GPS locked: ±${pinpoint.accuracy || 5}m accuracy!`,
        type: 'success',
      });
      setTimeout(() => {
        setShowLocationPicker(false);
        setGpsMessage(null);
      }, 1400);
    } catch (err: any) {
      setGpsMessage({
        text: err?.message || 'Could not access device GPS. Please enable location permission.',
        type: 'error',
      });
    } finally {
      setIsAcquiringGps(false);
    }
  };

  const handleCitySearch = (q: string) => {
    setCityQuery(q);
    clearTimeout(citySearchTimer.current);
    if (!q.trim()) {
      setCityResults([]);
      return;
    }
    citySearchTimer.current = setTimeout(async () => {
      setCitySearching(true);
      try {
        const results = await weatherService.searchCity(q);
        setCityResults(results || []);
      } catch {
        setCityResults([]);
      } finally {
        setCitySearching(false);
      }
    }, 400);
  };

  const handlePickCity = (city: any) => {
    const loc = { lat: city.latitude, lng: city.longitude, name: `${city.name}, ${city.country}` };
    localStorage.setItem('kd_saved_location', JSON.stringify(loc));
    sessionStorage.removeItem('kd_last_location');
    if (onUpdateLocation) {
      onUpdateLocation(loc, true);
    }
    setShowLocationPicker(false);
    setCityQuery('');
    setCityResults([]);
  };

  const handleManualCoordsSubmit = () => {
    const lat = parseFloat(manualLat);
    const lng = parseFloat(manualLng);
    if (isNaN(lat) || isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
      setGpsMessage({ text: 'Please enter valid coordinates (-90 to 90 lat, -180 to 180 lng)', type: 'error' });
      return;
    }
    const loc = { lat, lng, name: `Farm (${lat.toFixed(4)}°, ${lng.toFixed(4)}°)` };
    localStorage.setItem('kd_saved_location', JSON.stringify(loc));
    sessionStorage.removeItem('kd_last_location');
    if (onUpdateLocation) {
      onUpdateLocation(loc, true);
    }
    setShowLocationPicker(false);
    setManualLat('');
    setManualLng('');
  };

  // Weather telemetry
  const temp = weather?.current?.temperature_2m !== undefined ? Math.round(weather.current.temperature_2m) : 28;
  const humidity = weather?.current?.relative_humidity_2m ?? 68;
  const precip = weather?.current?.precipitation ?? 0;
  const wind = weather?.current?.wind_speed_10m ?? 8;
  const soilTemp = weather?.current?.soil_temperature_0cm !== undefined ? Math.round(weather.current.soil_temperature_0cm) : 24;

  // Compute Today's Farm Advisory (WHAT, WHY, WHAT TO DO)
  const todayAdvisory = useMemo(() => {
    if (precip > 5 || humidity > 85) {
      return {
        status: 'Risk' as StatusType,
        title: 'High Fungal & Rust Spore Infection Risk',
        what: 'Elevated relative humidity and moist leaf surface accelerates Anthracnose & Blight germination.',
        why: `Current atmospheric humidity is ${humidity}% with ${precip}mm rain in local grid.`,
        whatToDo: 'Withhold urea top-dressing. Prepare preventive spray of Mancozeb (2g/L) or Trichoderma viride within 48 hours.',
        actionLabel: 'Scan Leaves with AI Doctor',
        actionScreen: 'vision' as Screen,
      };
    } else if (temp > 35) {
      return {
        status: 'Attention' as StatusType,
        title: 'High Evapotranspiration & Canopy Heat Stress',
        what: 'Accelerated soil moisture evaporation leading to midday leaf droop.',
        why: `Ambient temperature (${temp}°C) exceeds optimum vegetative threshold.`,
        whatToDo: 'Schedule micro-drip or furrow irrigation in late evening (post 5 PM). Check moisture at 15cm root depth.',
        actionLabel: 'Open Smart Irrigation',
        actionScreen: 'smart-irrigation' as Screen,
      };
    } else if (wind > 20) {
      return {
        status: 'Attention' as StatusType,
        title: 'High Wind Velocity - Postpone Foliar Spraying',
        what: 'Wind speeds will cause significant chemical drift and reduced leaf retention.',
        why: `Current gusts of ${wind} km/h exceed safe spraying limit (10 km/h).`,
        whatToDo: 'Postpone chemical pesticide spraying until morning calm. Secure nursery shade netting.',
        actionLabel: 'Check Wind & Radar',
        actionScreen: 'forecast' as Screen,
      };
    } else {
      return {
        status: 'Healthy' as StatusType,
        title: 'Favorable Crop Growing Conditions',
        what: 'Stable atmospheric and soil temperature supporting steady root development and photosynthesis.',
        why: `Optimal ambient temperature (${temp}°C) and ${humidity}% humidity across the region.`,
        whatToDo: 'Maintain regular fertigation schedule. Conduct routine morning scouting for sucking pest nymph emergence.',
        actionLabel: 'View Field Satellite Health',
        actionScreen: 'field-monitor' as Screen,
      };
    }
  }, [temp, humidity, precip, wind]);

  // Defined Categorized Services
  const services = useMemo(() => {
    return [
      // A. Crop & Field
      {
        id: 'vision',
        category: 'crop',
        title: 'Crop Health Doctor',
        subtitle: 'Scan leaf with camera for pest & fungal diagnosis',
        screen: 'vision' as Screen,
        icon: <Camera size={18} className="text-[#00B86B]" />,
        badge: 'AI Vision',
        highlight: true,
      },
      {
        id: 'map',
        category: 'crop',
        title: 'Farm Boundaries & Map',
        subtitle: 'Satellite boundary mapping & GPS field walk',
        screen: 'map' as Screen,
        icon: <Layers size={18} className="text-[#00B86B]" />,
        badge: 'GPS',
      },
      {
        id: 'field-monitor',
        category: 'crop',
        title: 'Satellite NDVI Health',
        subtitle: 'Vegetation biomass and moisture index',
        screen: 'field-monitor' as Screen,
        icon: <Activity size={18} className="text-[#00B86B]" />,
        badge: 'Sentinel-2',
      },
      {
        id: 'smart-irrigation',
        category: 'crop',
        title: 'Smart Irrigation',
        subtitle: 'Water requirement & soil moisture schedule',
        screen: 'smart-irrigation' as Screen,
        icon: <Droplets size={18} className="text-[#00B86B]" />,
      },
      // B. Market & Money
      {
        id: 'market',
        category: 'market',
        title: 'Mandi Live & Forecast',
        subtitle: 'APMC market arrivals, wholesale rates & 14-day trends',
        screen: 'market' as Screen,
        icon: <Store size={18} className="text-[#E6A000]" />,
        badge: 'APMC Live',
        highlight: true,
      },
      // C. Government & Protection
      {
        id: 'insurance',
        category: 'govt',
        title: 'PM Fasal Bima Insurance',
        subtitle: 'Crop damage protection, claim tracking & certificates',
        screen: 'insurance' as Screen,
        icon: <ShieldCheck size={18} className="text-[#3978D4]" />,
        badge: 'Govt Portal',
      },
      {
        id: 'scheme-setu',
        category: 'govt',
        title: 'Govt Schemes & Subsidies',
        subtitle: 'Scheme Setu: eligibility checker for direct bank transfer',
        screen: 'scheme-setu' as Screen,
        icon: <Award size={18} className="text-[#3978D4]" />,
      },
      // D. Sustainability
      {
        id: 'carbon-vault',
        category: 'sustainability',
        title: 'Carbon Vault & Credits',
        subtitle: 'Earn revenue for regenerative & low-tillage farming',
        screen: 'carbon-vault' as Screen,
        icon: <Leaf size={18} className="text-[#007A48]" />,
        badge: 'Eco Credits',
      },
      {
        id: 'traceability',
        category: 'sustainability',
        title: 'Harvest Traceability QR',
        subtitle: 'Generate crop origin certificates for buyers',
        screen: 'traceability' as Screen,
        icon: <Radio size={18} className="text-[#007A48]" />,
      },
      // E. Utilities
      {
        id: 'forecast',
        category: 'utilities',
        title: '7-Day Weather Radar',
        subtitle: 'Precipitation, wind speeds & soil temperature',
        screen: 'forecast' as Screen,
        icon: <Sun size={18} className="text-[#68756F]" />,
      },
      {
        id: 'digital-twin',
        category: 'utilities',
        title: 'Digital Farm Twin',
        subtitle: '2D plot layout with sensor data layers',
        screen: 'digital-twin' as Screen,
        icon: <Grid3x3 size={18} className="text-[#68756F]" />,
      },
    ];
  }, []);

  const filteredServices = useMemo(() => {
    if (activeCategory === 'all') return services;
    return services.filter((s) => s.category === activeCategory);
  }, [services, activeCategory]);

  return (
    <div className="bg-white min-h-full pb-24 text-[#10231D]" style={{ fontFamily: 'Plus Jakarta Sans, sans-serif' }}>
      {/* ── 1. TOP BAR (Farmer Greeting + Pinpoint Location + Lang) ── */}
      <header className="px-5 pt-10 pb-3 bg-white border-b border-[#E3EBE6]">
        <div className="flex items-center justify-between gap-3">
          <div>
            <h1 className="text-xl font-extrabold text-[#10231D] tracking-tight">
              Namaste, <span className="text-[#003D2B]">{user?.name?.split(' ')[0] || 'Farmer'}</span>
            </h1>
            {/* Pinpoint Location Tap */}
            <button
              onClick={() => setShowLocationPicker(true)}
              className="inline-flex items-center gap-1.5 mt-1 text-xs font-semibold text-[#003D2B] hover:text-[#00B86B] transition-colors"
            >
              <MapPin size={13} className="text-[#00B86B] shrink-0" />
              <span className="truncate max-w-[200px]">{locationName}</span>
              <span className="text-[10px] text-[#68756F]">▼</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            {/* Language Selector */}
            <div className="relative">
              <button
                onClick={() => setShowLangMenu(!showLangMenu)}
                className="min-h-[40px] px-3 rounded-xl bg-[#F7FAF8] border border-[#E3EBE6] text-xs font-bold text-[#10231D] flex items-center gap-1 hover:bg-[#EBF1EE] transition-colors"
              >
                <span>{currentLang.toUpperCase()}</span>
              </button>

              <AnimatePresence>
                {showLangMenu && (
                  <>
                    <div
                      className="fixed inset-0 z-[60]"
                      onClick={() => setShowLangMenu(false)}
                    />
                    <motion.div
                      initial={{ opacity: 0, y: 5 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 5 }}
                      className="absolute right-0 mt-1 bg-white rounded-xl shadow-lg border border-[#E3EBE6] p-1.5 z-[70] w-40"
                    >
                      {languages.map((lang: any) => (
                        <button
                          key={lang.code}
                          onClick={() => {
                            onLangChange(lang.code as Language);
                            setShowLangMenu(false);
                          }}
                          className={`w-full text-left px-3 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                            currentLang === lang.code
                              ? 'bg-[#E8FBF3] text-[#003D2B]'
                              : 'text-[#10231D] hover:bg-[#F7FAF8]'
                          }`}
                        >
                          <span>{lang.label}</span>
                          <span className="text-[10px] text-[#68756F]">{lang.native}</span>
                        </button>
                      ))}
                    </motion.div>
                  </>
                )}
              </AnimatePresence>
            </div>

            {/* Helpline Emergency Call */}
            <a
              href="tel:18001801551"
              aria-label="Kisan Helpline 1800-180-1551"
              className="w-10 h-10 rounded-xl bg-[#FDE8E8] text-[#D64545] border border-[#F8B4B4] flex items-center justify-center hover:bg-[#FCD2D2] transition-colors shrink-0"
              title="Kisan Call Center: 1800-180-1551"
            >
              <PhoneCall size={16} />
            </a>
          </div>
        </div>
      </header>

      {/* ── 2. SEARCH BAR ── */}
      <div className="px-5 pt-3 pb-2">
        <button
          onClick={() => onOpenSearch && onOpenSearch()}
          className="w-full min-h-[44px] flex items-center justify-between px-3.5 bg-[#F7FAF8] hover:bg-[#EBF1EE] border border-[#E3EBE6] rounded-xl text-left transition-colors"
        >
          <div className="flex items-center gap-2.5">
            <Search size={16} className="text-[#00B86B]" />
            <span className="text-xs font-medium text-[#68756F]">
              Search tools, mandi rates, disease symptoms...
            </span>
          </div>
          <span className="text-[10px] font-bold text-[#003D2B] bg-white border border-[#E3EBE6] px-1.5 py-0.5 rounded">
            ⌘K
          </span>
        </button>
      </div>

      {/* ── 3. COMPACT WEATHER & ESSENTIAL DATA STRIP ── */}
      <div className="px-5 pt-1 pb-3">
        <div className="bg-[#F7FAF8] border border-[#E3EBE6] rounded-2xl p-3.5">
          <div className="flex items-center justify-between mb-2.5">
            <div className="flex items-center gap-2">
              <Sun size={24} className="text-[#E6A000]" />
              <div>
                <span className="text-2xl font-black text-[#10231D] leading-none">
                  {temp}°C
                </span>
                <span className="text-xs text-[#68756F] font-semibold ml-2">
                  {weather?.current?.weather_code ? 'Partly Cloudy' : 'Clear Sky'}
                </span>
              </div>
            </div>
            <button
              onClick={() => navigateTo('forecast')}
              className="text-xs font-bold text-[#00B86B] hover:text-[#003D2B]"
            >
              7-Day Forecast →
            </button>
          </div>

          {/* 4 Essential Metrics Grid: Soil / Humidity / Wind / Precipitation */}
          <div className="grid grid-cols-4 gap-2 pt-2 border-t border-[#E3EBE6] text-center">
            <div className="bg-white rounded-xl p-2 border border-[#E3EBE6]">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#68756F] uppercase">
                <Thermometer size={11} className="text-[#E6A000]" />
                <span>Soil</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#10231D] mt-0.5">
                {soilTemp}°C
              </div>
            </div>

            <div className="bg-white rounded-xl p-2 border border-[#E3EBE6]">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#68756F] uppercase">
                <Droplets size={11} className="text-[#3978D4]" />
                <span>Humidity</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#10231D] mt-0.5">
                {humidity}%
              </div>
            </div>

            <div className="bg-white rounded-xl p-2 border border-[#E3EBE6]">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#68756F] uppercase">
                <Wind size={11} className="text-[#68756F]" />
                <span>Wind</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#10231D] mt-0.5">
                {wind} km/h
              </div>
            </div>

            <div className="bg-white rounded-xl p-2 border border-[#E3EBE6]">
              <div className="flex items-center justify-center gap-1 text-[10px] font-bold text-[#68756F] uppercase">
                <CloudRain size={11} className="text-[#3978D4]" />
                <span>Rain</span>
              </div>
              <div className="text-xs sm:text-sm font-bold text-[#10231D] mt-0.5">
                {precip} mm
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── 4. PRIMARY "TODAY'S FARM ADVISORY" CARD (WHAT, WHY, WHAT TO DO) ── */}
      <section className="px-5 mb-5" aria-label="Today's Farm Advisory">
        <AdvisoryCard
          status={todayAdvisory.status}
          title={todayAdvisory.title}
          what={todayAdvisory.what}
          why={todayAdvisory.why}
          whatToDo={todayAdvisory.whatToDo}
          actionLabel={todayAdvisory.actionLabel}
          onActionClick={() => navigateTo(todayAdvisory.actionScreen)}
          sourceTimestamp="Today's Farm Advisory • KVK & IMD Model"
        />
      </section>

      {/* ── 5. SERVICES & TOOLS (Grouped into 5 Categories) ── */}
      <section className="px-5 mb-6" aria-label="Farm Services">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[#10231D]">Farm Services &amp; Tools</h2>
            <p className="text-xs text-[#68756F]">Categorized by farm priority</p>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pb-2 mb-3">
          {[
            { id: 'all', label: 'All Services' },
            { id: 'crop', label: 'A. Crop & Field' },
            { id: 'market', label: 'B. Market & Money' },
            { id: 'govt', label: 'C. Govt & Protection' },
            { id: 'sustainability', label: 'D. Sustainability' },
            { id: 'utilities', label: 'E. Utilities' },
          ].map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id as ServiceCategory)}
              className={`min-h-[38px] px-3 rounded-xl text-xs font-bold whitespace-nowrap transition-all border ${
                activeCategory === cat.id
                  ? 'bg-[#003D2B] text-white border-[#003D2B] shadow-sm'
                  : 'bg-[#F7FAF8] text-[#10231D] border-[#E3EBE6] hover:bg-[#EBF1EE]'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Category Cards Grid (avoiding identical cards) */}
        <div className="space-y-2.5">
          {filteredServices.map((service) => {
            const isCropScan = service.id === 'vision';
            return (
              <button
                key={service.id}
                onClick={() => navigateTo(service.screen)}
                className={`w-full min-h-[56px] flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all active:scale-[0.99] ${
                  isCropScan
                    ? 'bg-[#E8FBF3] border-[#00B86B]/40 hover:bg-[#D4F7E7]'
                    : 'bg-white border-[#E3EBE6] hover:bg-[#F7FAF8]'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border ${
                      isCropScan
                        ? 'bg-white border-[#B3F0D2] text-[#00B86B]'
                        : 'bg-[#F7FAF8] border-[#E3EBE6]'
                    }`}
                  >
                    {service.icon}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-[#10231D] truncate">
                        {service.title}
                      </h3>
                      {service.badge && (
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-[#F7FAF8] border border-[#E3EBE6] text-[#68756F] shrink-0">
                          {service.badge}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-[#68756F] truncate mt-0.5">
                      {service.subtitle}
                    </p>
                  </div>
                </div>
                <ChevronRight size={16} className="text-[#68756F] shrink-0 ml-2" />
              </button>
            );
          })}
        </div>
      </section>

      {/* ── 6. MANDI PRICE PREDICTOR SECTION ── */}
      <section className="px-5 mb-6" aria-label="Mandi Forecast">
        <MandiPricePredictor />
      </section>

      {/* ── 7. MY FIELDS OVERVIEW ── */}
      <section className="px-5 mb-6" aria-label="My Farm Fields">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-base font-bold text-[#10231D]">My Fields</h2>
            <p className="text-xs text-[#68756F]">Registered land and crops</p>
          </div>
          <button
            onClick={() => navigateTo('landmark')}
            className="min-h-[40px] px-3 rounded-xl bg-[#E8FBF3] border border-[#B3F0D2] text-xs font-bold text-[#003D2B] flex items-center gap-1 hover:bg-[#D4F7E7] transition-colors"
          >
            <Plus size={14} />
            <span>Add Field</span>
          </button>
        </div>

        {isLoadingPlots ? (
          <div className="p-6 bg-[#F7FAF8] border border-[#E3EBE6] rounded-2xl text-center text-xs text-[#68756F] flex items-center justify-center gap-2">
            <RefreshCw size={14} className="animate-spin text-[#00B86B]" />
            <span>Loading registered fields...</span>
          </div>
        ) : userPlots.length === 0 ? (
          <div className="p-6 bg-[#F7FAF8] border-2 border-dashed border-[#E3EBE6] rounded-2xl text-center">
            <MapPin size={24} className="mx-auto text-[#68756F] mb-2" />
            <h3 className="text-sm font-bold text-[#10231D]">No fields registered yet</h3>
            <p className="text-xs text-[#68756F] mt-1 mb-3">
              Locate your farm boundary to track vegetation health and soil moisture.
            </p>
            <button
              onClick={() => navigateTo('map')}
              className="px-4 py-2 bg-[#00BB78] hover:bg-[#00a86b] text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Locate My Farm Boundary
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {userPlots.map((plot) => {
              const score = plot.health_score ?? 0.85;
              const isHealthy = score >= 0.8;
              const isAttention = score >= 0.6;
              const badgeClass = isHealthy
                ? 'bg-[#E8FBF3] text-[#007A48] border-[#B3F0D2]'
                : isAttention
                ? 'bg-[#FFF9E6] text-[#996B00] border-[#FCE39E]'
                : 'bg-[#FFF2E8] text-[#C05600] border-[#FDD3B7]';
              const badgeLabel = isHealthy ? 'Healthy' : isAttention ? 'Attention' : 'Risk';

              return (
                <div
                  key={plot.id}
                  className="bg-white border border-[#E3EBE6] rounded-2xl p-4 shadow-[0_1px_3px_rgba(16,35,29,0.04)]"
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h3 className="text-sm font-bold text-[#10231D]">{plot.name}</h3>
                      <p className="text-xs text-[#68756F] mt-0.5">
                        {plotLocationNames[plot.id] || 'Farm Plot'} • {plot.area || 2.5} Hectares
                      </p>
                    </div>
                    <span className={`px-2.5 py-0.5 rounded-lg text-xs font-bold border ${badgeClass}`}>
                      {badgeLabel}
                    </span>
                  </div>

                {/* Quick Field Action Buttons */}
                <div className="grid grid-cols-3 gap-2 pt-3 border-t border-[#E3EBE6] mt-3">
                  <button
                    onClick={() => navigateTo('map')}
                    className="min-h-[38px] px-2 rounded-xl bg-[#F7FAF8] border border-[#E3EBE6] text-xs font-bold text-[#10231D] hover:bg-[#EBF1EE] transition-colors"
                  >
                    View Map
                  </button>
                  <button
                    onClick={() => navigateTo('field-monitor', { plotId: plot.id })}
                    className="min-h-[38px] px-2 rounded-xl bg-[#F7FAF8] border border-[#E3EBE6] text-xs font-bold text-[#10231D] hover:bg-[#EBF1EE] transition-colors"
                  >
                    NDVI Health
                  </button>
                  <button
                    onClick={() => navigateTo('smart-irrigation')}
                    className="min-h-[38px] px-2 rounded-xl bg-[#F7FAF8] border border-[#E3EBE6] text-xs font-bold text-[#10231D] hover:bg-[#EBF1EE] transition-colors"
                  >
                    Irrigation
                  </button>
                </div>
              </div>
            );
          })}
          </div>
        )}
      </section>

      {/* ── 8. LOCATION PICKER MODAL (Preserved completely) ── */}
      <AnimatePresence>
        {showLocationPicker && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 z-[200]"
              onClick={() => {
                setShowLocationPicker(false);
                setCityQuery('');
                setCityResults([]);
              }}
            />
            <motion.div
              initial={{ opacity: 0, y: 60 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 60 }}
              className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-white rounded-t-3xl z-[201] p-5 border-t border-[#E3EBE6] shadow-xl"
              style={{ maxHeight: '82vh' }}
            >
              <div className="w-10 h-1 bg-[#E3EBE6] rounded-full mx-auto mb-4" />

              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#E8FBF3] border border-[#B3F0D2] flex items-center justify-center text-[#00B86B]">
                    <Crosshair size={18} />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-[#10231D]">Farm Location</h3>
                    <p className="text-xs text-[#68756F]">GPS pinpoint &amp; weather region</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowLocationPicker(false)}
                  className="w-8 h-8 rounded-full bg-[#F7FAF8] border border-[#E3EBE6] flex items-center justify-center text-[#68756F] font-bold text-xs"
                >
                  ✕
                </button>
              </div>

              {/* Tabs */}
              <div className="flex items-center p-1 bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl mb-4 gap-1">
                <button
                  onClick={() => setLocationTab('gps')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    locationTab === 'gps'
                      ? 'bg-white text-[#003D2B] shadow-sm border border-[#E3EBE6]'
                      : 'text-[#68756F]'
                  }`}
                >
                  Real GPS
                </button>
                <button
                  onClick={() => setLocationTab('search')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    locationTab === 'search'
                      ? 'bg-white text-[#003D2B] shadow-sm border border-[#E3EBE6]'
                      : 'text-[#68756F]'
                  }`}
                >
                  Search Village
                </button>
                <button
                  onClick={() => setLocationTab('manual')}
                  className={`flex-1 py-2 text-xs font-bold rounded-lg transition-all ${
                    locationTab === 'manual'
                      ? 'bg-white text-[#003D2B] shadow-sm border border-[#E3EBE6]'
                      : 'text-[#68756F]'
                  }`}
                >
                  Coordinates
                </button>
              </div>

              {gpsMessage && (
                <div
                  className={`p-3 rounded-xl mb-3 text-xs flex items-center gap-2 border ${
                    gpsMessage.type === 'success'
                      ? 'bg-[#E8FBF3] text-[#007A48] border-[#B3F0D2]'
                      : gpsMessage.type === 'error'
                      ? 'bg-[#FDE8E8] text-[#D64545] border-[#F8B4B4]'
                      : 'bg-[#EBF3FB] text-[#3978D4] border-[#BFD8F5]'
                  }`}
                >
                  {gpsMessage.type === 'success' ? (
                    <CheckCircle2 size={16} className="shrink-0" />
                  ) : gpsMessage.type === 'error' ? (
                    <AlertCircle size={16} className="shrink-0" />
                  ) : (
                    <RefreshCw size={16} className="animate-spin shrink-0" />
                  )}
                  <span>{gpsMessage.text}</span>
                </div>
              )}

              {locationTab === 'gps' && (
                <div className="space-y-3">
                  <div className="p-3.5 bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl">
                    <span className="text-[10px] font-bold uppercase text-[#68756F] tracking-wider">
                      Active Pinpoint Location
                    </span>
                    <h4 className="text-base font-bold text-[#10231D] mt-0.5">{locationName}</h4>
                    {userCoords && (
                      <p className="text-xs font-mono text-[#68756F] mt-1">
                        {userCoords.lat.toFixed(5)}°N, {userCoords.lng.toFixed(5)}°E
                      </p>
                    )}
                  </div>

                  <button
                    disabled={isAcquiringGps}
                    onClick={handleAcquireRealGps}
                    className="w-full py-3 px-4 rounded-xl bg-[#00BB78] hover:bg-[#00a86b] disabled:opacity-50 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-sm transition-all active:scale-[0.99]"
                  >
                    {isAcquiringGps ? <RefreshCw size={16} className="animate-spin" /> : <Navigation size={16} />}
                    <span>{isAcquiringGps ? 'Locking Real GPS...' : 'Detect Device GPS Location'}</span>
                  </button>
                </div>
              )}

              {locationTab === 'search' && (
                <div>
                  <div className="relative mb-3">
                    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#68756F]" />
                    <input
                      autoFocus
                      type="text"
                      value={cityQuery}
                      onChange={(e) => handleCitySearch(e.target.value)}
                      placeholder="e.g. Athani, Belagavi, Baramati, Pune..."
                      className="w-full pl-9 pr-4 py-2.5 bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl text-sm font-medium focus:outline-none focus:border-[#00B86B]"
                    />
                  </div>

                  <div className="overflow-y-auto max-h-[35vh] space-y-1">
                    {cityResults.map((city, i) => (
                      <button
                        key={i}
                        onClick={() => handlePickCity(city)}
                        className="w-full flex items-center justify-between p-2.5 rounded-xl hover:bg-[#F7FAF8] text-left transition-colors border border-transparent hover:border-[#E3EBE6]"
                      >
                        <div>
                          <p className="text-sm font-bold text-[#10231D]">{city.name}</p>
                          <p className="text-xs text-[#68756F]">{city.country}</p>
                        </div>
                        <ChevronRight size={14} className="text-[#68756F]" />
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {locationTab === 'manual' && (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[11px] font-bold text-[#68756F] uppercase">Latitude</label>
                      <input
                        type="number"
                        step="any"
                        value={manualLat}
                        onChange={(e) => setManualLat(e.target.value)}
                        placeholder="15.8497"
                        className="w-full mt-1 p-2.5 bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl text-sm font-mono"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-bold text-[#68756F] uppercase">Longitude</label>
                      <input
                        type="number"
                        step="any"
                        value={manualLng}
                        onChange={(e) => setManualLng(e.target.value)}
                        placeholder="74.4977"
                        className="w-full mt-1 p-2.5 bg-[#F7FAF8] border border-[#E3EBE6] rounded-xl text-sm font-mono"
                      />
                    </div>
                  </div>

                  <button
                    disabled={!manualLat || !manualLng}
                    onClick={handleManualCoordsSubmit}
                    className="w-full py-2.5 px-4 rounded-xl bg-[#00BB78] hover:bg-[#00a86b] disabled:opacity-50 text-white font-bold text-sm transition-all active:scale-[0.99] shadow-sm"
                  >
                    Apply Coordinates
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

export default DashboardScreen;
