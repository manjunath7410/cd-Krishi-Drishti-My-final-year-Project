import React from 'react';
import { Home, Store, User, Map } from 'lucide-react';
import { motion } from 'framer-motion';
import { Screen } from '../types';

interface BottomNavProps {
  currentScreen: Screen;
  onNavigate: (screen: Screen) => void;
  isExpandedView?: boolean;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentScreen, onNavigate, isExpandedView = false }) => {
  const tabs = [
    { screen: 'home' as Screen, icon: Home, label: 'Home' },
    { screen: 'market' as Screen, icon: Store, label: 'Mandi' },
    { screen: 'map' as Screen, icon: Map, label: 'Field' },
    { screen: 'profile' as Screen, icon: User, label: 'Profile' },
  ];

  return (
    <nav
      aria-label="Bottom Navigation"
      className={`fixed md:sticky bottom-0 left-0 right-0 w-full z-40 transition-all ${
        isExpandedView ? 'max-w-6xl mx-auto' : 'max-w-md mx-auto'
      }`}
      style={{ fontFamily: 'Inter, system-ui, sans-serif' }}
    >
      <div
        className="w-full flex items-center justify-around px-3 py-2 bg-white border-t border-gray-100 shadow-[0_-4px_16px_rgba(0,0,0,0.03)]"
        style={{
          paddingBottom: 'max(0.75rem, env(safe-area-inset-bottom))',
        }}
      >
        {tabs.map(({ screen, icon: Icon, label }) => {
          const active = currentScreen === screen;
          return (
            <button
              key={screen}
              onClick={() => onNavigate(screen)}
              className="relative flex flex-col items-center justify-center min-h-[48px] min-w-[64px] py-1 px-3 rounded-2xl transition-all select-none"
            >
              {active && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-[#E8FBF3] rounded-2xl -z-10"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div className="relative">
                <Icon
                  size={20}
                  strokeWidth={active ? 2.5 : 1.8}
                  style={{ color: active ? '#00BB78' : '#8C9691' }}
                />
              </div>
              <span
                className={`text-[11px] font-bold mt-1 tracking-tight ${
                  active ? 'text-[#001A11]' : 'text-[#8C9691]'
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default BottomNav;
