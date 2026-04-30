'use client';
import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { TrendingUp, BarChart2, Shield, Menu, X } from 'lucide-react';
import AuthModal from './AuthModal';
import { useScreenerStore } from '@/lib/store/screenerStore';

export default function FloatingNavbar() {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { isAuthModalOpen, setAuthModalOpen, user, logout } = useScreenerStore();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navItems = [
    { name: 'Markets', icon: <TrendingUp size={18} /> },
    { name: 'Analytics', icon: <BarChart2 size={18} /> },
    { name: 'Security', icon: <Shield size={18} /> },
  ];

  return (
    <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-[100] transition-all duration-500 ${scrolled ? 'w-[92%] max-w-4xl' : 'w-[96%] max-w-5xl'}`}>
      <div className={`glass-card flex items-center justify-between px-3 sm:px-6 py-2 sm:py-3 rounded-full border border-primary/20 transition-all duration-500 shadow-2xl ${scrolled ? 'bg-dark/90 backdrop-blur-2xl' : 'bg-transparent'}`}>
        <div className="flex items-center gap-1 sm:gap-3 shrink-0 cursor-pointer" onClick={() => window.location.href = '/'}>
          <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-primary via-accent to-white rounded-xl flex items-center justify-center text-dark font-bold text-lg sm:text-xl shadow-lg transform rotate-3">S</div>
          <span className="font-display font-bold text-sm sm:text-xl tracking-tight hidden xs:block whitespace-nowrap text-white">
            STOCK SCREENER <span className="text-primary">PRO</span>
          </span>
        </div>

        <div className="hidden lg:flex items-center gap-6 xl:gap-10">
          {navItems.map((item) => (
            <button key={item.name} className="flex items-center gap-2 text-white/60 hover:text-primary transition-all font-mono text-xs uppercase tracking-widest font-bold group">
              <span className="group-hover:scale-110 transition-transform">{item.icon}</span>
              {item.name}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 sm:gap-4 ml-2">
          {user ? (
            <div className="flex items-center gap-3">
              <div className="hidden md:flex flex-col items-end mr-2">
                <span className="text-xs font-bold text-white leading-none">{user.name}</span>
                <span className="text-[10px] text-primary font-mono uppercase tracking-tighter">Pro Member</span>
              </div>
              <button 
                onClick={logout}
                className="px-4 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-[10px] font-bold text-white uppercase tracking-widest transition-all active:scale-95"
              >
                Log Out
              </button>
              <div className="w-8 h-8 bg-gradient-to-tr from-primary to-accent rounded-full border border-white/20 flex items-center justify-center text-dark font-bold text-xs">
                {user.name.charAt(0)}
              </div>
            </div>
          ) : (
            <>
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="hidden sm:block px-5 py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-full text-xs font-bold text-white transition-all whitespace-nowrap active:scale-95"
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthModalOpen(true)}
                className="px-5 py-2 bg-primary text-dark font-bold rounded-full text-xs hover:bg-accent hover:shadow-lg hover:shadow-primary/30 transition-all transform hover:scale-105 active:scale-95 whitespace-nowrap shadow-xl"
              >
                Get Pro
              </button>
            </>
          )}
          <button className="lg:hidden text-white p-2 hover:bg-white/5 rounded-full transition-colors" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />

      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="md:hidden absolute top-full left-0 right-0 mt-4 glass-card p-6 rounded-2xl border border-primary/20 bg-dark/95 backdrop-blur-2xl"
          >
            <div className="flex flex-col gap-6">
              {navItems.map((item) => (
                <button key={item.name} className="flex items-center gap-4 text-white/80 font-mono text-lg">
                  {item.icon}
                  {item.name}
                </button>
              ))}
              <hr className="border-white/10" />
              <button className="w-full py-3 bg-white/5 rounded-xl text-white font-semibold">Sign In</button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}
