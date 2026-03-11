import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsRight, Download, CheckCircle2, Upload, Lock, User, Save, RotateCcw, Grid3X3, Search, Move, FolderOpen, Key, Eye, EyeOff, LogOut, LogIn, Share2, Send } from 'lucide-react';
import { cn } from './lib/utils';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TYPES ---
interface Component {
  id: string;
  name: string;
  brand: string;
  price: number;
  weight: number;
  description: string;
  imageUrl: string;
  cardImageUrl: string;
  zIndex: number;
  stepTitle?: string;
  logic: string;
}

interface Step {
  id: string;
  title: string;
  options: Component[];
}

interface OffsetData {
  s: number;
  x: number;
  y: number;
}


// --- SHARE MENU ---
const ShareMenu = ({ buildName = 'My Dream Bike', message = "Look at this! Its my dream!" }: { buildName?: string, message?: string }) => {
  const [open, setOpen] = useState(false);
  const shareText = encodeURIComponent(message + (buildName ? ` — ${buildName}` : '') + ' | adicto.bike');
  const url = encodeURIComponent('https://adictobike.vercel.app');

  const channels = [
    {
      label: 'Instagram',
      icon: '📸',
      color: 'bg-gradient-to-br from-purple-600 to-pink-500',
      action: () => {
        navigator.clipboard.writeText(decodeURIComponent(shareText));
        window.open('https://www.instagram.com/', '_blank');
      }
    },
    {
      label: 'WhatsApp',
      icon: '💬',
      color: 'bg-green-600',
      action: () => window.open(`https://wa.me/?text=${shareText}%20${url}`, '_blank')
    },
    {
      label: 'Telegram',
      icon: '✈️',
      color: 'bg-sky-500',
      action: () => window.open(`https://t.me/share/url?url=${url}&text=${shareText}`, '_blank')
    },
    {
      label: 'Email',
      icon: '✉️',
      color: 'bg-zinc-600',
      action: () => window.open(`mailto:?subject=${encodeURIComponent('Check this bike!')}&body=${shareText}%20${url}`, '_blank')
    },
    {
      label: 'Copy Link',
      icon: '🔗',
      color: 'bg-zinc-800',
      action: () => {
        navigator.clipboard.writeText(`${message} ${buildName ? '— ' + buildName + ' ' : ''}| ${decodeURIComponent(url)}`);
        setOpen(false);
      }
    },
  ];

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="h-11 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/8 text-white rounded-lg font-black uppercase text-[9px] tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-2 w-full"
      >
        <Share2 size={14} className="text-zinc-400" /> Share
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.95 }}
            transition={{ duration: 0.15 }}
            className="absolute bottom-16 left-1/2 -translate-x-1/2 bg-zinc-900 border border-white/10 rounded-2xl p-3 flex gap-2 shadow-2xl z-50 w-max"
          >
            {channels.map((ch) => (
              <button
                key={ch.label}
                onClick={() => { ch.action(); setOpen(false); }}
                className={`${ch.color} flex flex-col items-center gap-1 px-3 py-2.5 rounded-xl transition-all active:scale-95 hover:opacity-90 min-w-[52px]`}
              >
                <span className="text-[16px] leading-none">{ch.icon}</span>
                <span className="text-[7px] font-black uppercase text-white tracking-widest leading-none">{ch.label}</span>
              </button>
            ))}
            <button onClick={() => setOpen(false)} className="absolute -top-2 -right-2 w-5 h-5 bg-zinc-700 rounded-full text-white text-[9px] flex items-center justify-center font-black hover:bg-red-600 transition-colors">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- ADMIN LOGIN ---
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // stable callback to avoid infinite loop in useEffect
  const stableOnLogin = useCallback(onLogin, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (localStorage.getItem('adicto_auth') === 'true') stableOnLogin();
  }, [stableOnLogin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "hello@adicto.bike" && pass === "Scalpel2012!") {
      if (rememberMe) localStorage.setItem('adicto_auth', 'true');
      onLogin();
    } else {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 font-sans">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} className="bg-zinc-900/50 p-10 rounded-[2.5rem] border border-white/5 w-full max-w-md backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-600/20"><Lock size={24} /></div>
          <h2 className="text-xl font-black uppercase tracking-widest italic text-center text-white">Adicto Admin</h2>
        </div>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder="Password" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono" value={pass} onChange={(e) => setPass(e.target.value)} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 text-[10px] font-bold uppercase">{showPass ? "Hide" : "Show"}</button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 px-2 text-white">
          <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="accent-red-600 h-4 w-4 rounded border-white/10 bg-black" />
          <label htmlFor="remember" className="text-zinc-500 text-[10px] uppercase font-bold cursor-pointer select-none">Remember Me</label>
        </div>
        {error && <p className="text-red-600 text-[10px] text-center mt-4 uppercase font-black tracking-widest">{error}</p>}
        <button className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-white mt-8 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/20 text-sm italic">Access Dashboard</button>
      </motion.form>
    </div>
  );
};

// --- ADMIN PANEL COMPONENT ---
const AdminPanel = ({ categories, offsets, setOffsets, activeComponent, selectedFrameId, showGrid, setShowGrid, gridSize, setGridSize, isZoomed, setIsZoomed, zoomScale, setZoomScale, onLogout }: any) => {
  // offset key = "{frameId}__{compId}" — unique per frame
  const offsetKey = (compId: string) => selectedFrameId ? `${selectedFrameId}__${compId}` : `__${compId}`;
  const [selectedCat, setSelectedCat] = useState('excel');
  const [status, setStatus] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adicto_github_token') || '');
  const REPO = "VasileAdicto/Adictobike";
  const BRANCH = "main";

  const saveToGithub = async (path: string, content: string, isJson = false) => {
    if (!token) { setStatus("❌ Token Required"); return false; }
    try {
      let sha = "";
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, { headers: { Authorization: `token ${token}` } });
      if (getRes.ok) { const data = await getRes.json(); sha = data.sha; }
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        method: "PUT",
        headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Admin update: ${path}`, content: isJson ? btoa(unescape(encodeURIComponent(content))) : content, sha: sha || undefined, branch: BRANCH }),
      });
      if (res.ok) {
        localStorage.setItem('adicto_github_token', token);
        return true;
      }
      return false;
    } catch (err) { return false; }
  };

  const updateTune = (key: keyof OffsetData, val: number) => {
    if (!activeComponent) return;
    const k = offsetKey(activeComponent.id);
    setOffsets((prev: any) => ({ ...prev, [k]: { ...(prev[k] || { s: 1, x: 0, y: 0 }), [key]: val } }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFolder: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    if (!token) { setStatus("❌ Token Required"); return; }
    const fileArray = Array.from(files);
    setStatus(`⏳ 0/${fileArray.length}...`);
    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setStatus(`⏳ ${i + 1}/${fileArray.length} — ${file.name}`);
      const contentBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      const fileName = isFolder ? file.webkitRelativePath : file.name;
      const path = selectedCat === 'excel' ? "public/data.xlsx" : `public/parts/${selectedCat}/${fileName}`;
      const success = await saveToGithub(path, contentBase64);
      if (!success) { setStatus(`❌ Error: ${file.name}`); return; }
    }
    setStatus("✅ Done!");
    setTimeout(() => setStatus(''), 3000);
    e.target.value = "";
  };

  const handleSingleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !token) { setStatus("❌ No file or token"); return; }
    setStatus(`⏳ Uploading ${file.name}...`);
    const reader = new FileReader();
    reader.onload = async () => {
      const content = (reader.result as string).split(',')[1];
      const path = selectedCat === 'excel'
        ? "public/data.xlsx"
        : `public/parts/${selectedCat}/${file.name}`;
      const success = await saveToGithub(path, content);
      setStatus(success ? "✅ Uploaded!" : "❌ Upload failed");
      if (success) localStorage.setItem('adicto_github_token', token);
      setTimeout(() => setStatus(''), 3000);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  const handleSaveOffsets = async () => {
    setStatus("Saving...");
    const success = await saveToGithub("public/offsets.json", JSON.stringify(offsets), true);
    if (success) {
      setStatus("✅ Saved!");
      setTimeout(() => setStatus(''), 3000);
    } else {
      setStatus("❌ Error");
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="z-[100] sticky top-0 shadow-2xl font-sans text-white">
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-zinc-900 border-b border-white/5 p-2 flex gap-3 items-center justify-center backdrop-blur-md">
        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg border border-white/10">
          <Key size={10} className="text-red-600" />
          <input type="password" placeholder="TOKEN" value={token} onChange={(e) => setToken(e.target.value)} className="bg-transparent text-[9px] w-20 outline-none font-mono text-white" />
        </div>
        <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="bg-black border border-white/10 text-[9px] px-2 py-1 rounded uppercase font-bold outline-none focus:border-red-600 transition-all text-white">
          <option value="excel">📊 Excel (prices)</option>
          {categories?.map((cat: string) => <option key={cat} value={cat}>🖼️ {cat}</option>)}
        </select>
        <div className="flex gap-1">
          <label className="cursor-pointer bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1 italic transition-all">
            <Upload size={10} /> Upload
            <input type="file" className="hidden" onChange={handleSingleUpload} accept={selectedCat === 'excel' ? ".xlsx,.xls" : "image/*"} />
          </label>
          <label className="cursor-pointer bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase hover:bg-zinc-700 flex items-center gap-1 italic">
            <Upload size={10} /> Multi
            <input type="file" className="hidden" multiple onChange={(e) => handleUpload(e, false)} accept={selectedCat === 'excel' ? ".xlsx,.xls" : "image/*"} />
          </label>
          <label className="cursor-pointer bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase hover:bg-zinc-700 flex items-center gap-1 italic">
            <FolderOpen size={10} /> Folder
            <input type="file" className="hidden" {...{ webkitdirectory: "" } as any} onChange={(e: any) => handleUpload(e, true)} />
          </label>
        </div>
        {/* Grid button + inline slider */}
        <div className="flex items-center gap-1.5 bg-black/40 px-1.5 py-1 rounded-lg border border-white/5">
          <button onClick={() => setShowGrid(!showGrid)} className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1", showGrid ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400")}>
            <Grid3X3 size={10}/> Grid
          </button>
          {showGrid && (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <span className="text-[8px] font-mono text-red-400 w-6 text-right">{gridSize}</span>
              <input type="range" min="5" max="20" step="1" value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))} className="w-20 h-1 bg-zinc-700 appearance-none accent-red-600 cursor-pointer" />
              <span className="text-[7px] text-zinc-500 font-bold">px</span>
            </div>
          )}
        </div>
        {/* Zoom button + inline slider */}
        <div className="flex items-center gap-1.5 bg-black/40 px-1.5 py-1 rounded-lg border border-white/5">
          <button onClick={() => setIsZoomed(!isZoomed)} className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-1", isZoomed ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400")}>
            <Search size={10}/> {isZoomed ? `${zoomScale.toFixed(1)}X` : 'Zoom'}
          </button>
          {isZoomed && (
            <div className="flex items-center gap-2 pl-1 border-l border-white/10">
              <span className="text-[8px] font-mono text-red-400 w-8 text-right">{zoomScale.toFixed(1)}x</span>
              <input type="range" min="0" max="10" step="0.1" value={zoomScale} onChange={(e) => setZoomScale(parseFloat(e.target.value))} className="w-20 h-1 bg-zinc-700 appearance-none accent-red-600 cursor-pointer" />
              <span className="text-[7px] text-zinc-500 font-bold">10x</span>
            </div>
          )}
        </div>
        <button onClick={onLogout} className="text-zinc-500 hover:text-red-600 transition-colors p-1" title="Logout"><LogOut size={12} /></button>
        {status && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[8px] font-mono uppercase text-red-600 ml-1">{status}</motion.span>}
      </motion.div>
      {activeComponent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/80 border-b border-white/5 p-2 flex justify-between items-center px-6 backdrop-blur-xl gap-10">
          {/* Frame context indicator */}
          {selectedFrameId && (
            <div className="absolute top-1 left-6 flex items-center gap-1.5">
              <span className="text-[7px] font-black uppercase text-zinc-600 italic tracking-widest">Frame:</span>
              <span className="text-[7px] font-black uppercase text-red-600/70 italic tracking-widest">{selectedFrameId.split('-')[0]}-{selectedFrameId.split('-')[1]}</span>
            </div>
          )}
          <div className="flex flex-col gap-1 flex-1">
            {[{ key: 's', label: 'Size', min: 0.8, max: 1.2, step: 0.001, reset: 1 }, { key: 'x', label: 'Pos X', min: -40, max: 40, step: 1, reset: 0 }, { key: 'y', label: 'Pos Y', min: -40, max: 40, step: 1, reset: 0 }].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className="text-[8px] text-zinc-500 font-black w-8 uppercase">{item.label}</span>
                <input type="range" min={item.min} max={item.max} step={item.step} value={offsets[offsetKey(activeComponent.id)]?.[item.key as keyof OffsetData] ?? item.reset} onChange={e => updateTune(item.key as keyof OffsetData, parseFloat(e.target.value))} className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none accent-red-600 cursor-pointer" />
                <input type="number" step={item.step} value={offsets[offsetKey(activeComponent.id)]?.[item.key as keyof OffsetData] ?? item.reset} onChange={e => updateTune(item.key as keyof OffsetData, parseFloat(e.target.value))} className="bg-transparent text-white text-[9px] w-10 text-right font-mono border-b border-white/5 focus:border-red-600 outline-none" />
                <button onClick={() => updateTune(item.key as keyof OffsetData, item.reset)} className="text-zinc-600 hover:text-red-600 transition-colors"><RotateCcw size={10} /></button>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-white">
            <div className="text-[9px] font-black text-red-600 italic uppercase tracking-widest leading-none mb-1">{activeComponent.name}</div>
            <button onClick={handleSaveOffsets} className="bg-red-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-700 transition-all flex items-center gap-2 italic shadow-lg shadow-red-600/20"><Save size={12} /> Save Offsets</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};




// --- EMPTY VISUALIZER STATE: luxury layer-by-layer assembly ---
interface BikeLayer { imageUrl: string; zIndex: number; }

type IntroPhase = 'hidden' | 'assembling' | 'hold' | 'fadeout' | 'logo';

// ms gap BEFORE each layer index appears (index 0 = first gap before frame)
const LAYER_GAPS = [350, 460, 420, 390, 370, 240, 340, 360, 360, 360, 340];

const LOGO_CHARS = 'ADICTO.BIKE'.split('');
// Same stagger but slower — 120ms per char
const LOGO_CHAR_DELAY = 0.12;

const EmptyVisualizerState = ({ layers = [] }: { layers?: BikeLayer[] }) => {
  const [phase, setPhase]               = useState<IntroPhase>('hidden');
  const [visibleCount, setVisibleCount] = useState(0);

  const HOLD_MS    = 1500;
  const FADEOUT_MS = 900;

  useEffect(() => {
    if (layers.length === 0) return; // wait until images loaded
    const timers: ReturnType<typeof setTimeout>[] = [];

    // Start assembling on next frame — guarantees no flash before timers fire
    timers.push(setTimeout(() => setPhase('assembling'), 0));

    let elapsed = 0;
    layers.forEach((_, i) => {
      elapsed += LAYER_GAPS[i] ?? 380;
      const idx = i; // capture
      timers.push(setTimeout(() => setVisibleCount(idx + 1), elapsed));
    });

    const doneAt = elapsed + 80;
    timers.push(setTimeout(() => setPhase('hold'),    doneAt));
    timers.push(setTimeout(() => setPhase('fadeout'), doneAt + HOLD_MS));
    timers.push(setTimeout(() => {
      setPhase('logo');
      setVisibleCount(0);
    }, doneAt + HOLD_MS + FADEOUT_MS));

    return () => timers.forEach(clearTimeout);
  }, [layers.length]);

  const showBike = phase === 'assembling' || phase === 'hold' || phase === 'fadeout';

  // Only render layers that have been "unlocked" — avoids any invisible DOM elements
  const renderedLayers = showBike ? layers.slice(0, visibleCount) : [];

  return (
    <div className="absolute inset-0 flex items-center justify-center z-20 pointer-events-none">

      {/* ── BIKE LAYERS — only rendered once unlocked ── */}
      <AnimatePresence>
        {showBike && (
          <motion.div
            key="bike-stack"
            className="absolute inset-0"
            initial={{ opacity: 0 }}
            animate={{ opacity: phase === 'fadeout' ? 0 : 1 }}
            transition={{ duration: phase === 'fadeout' ? FADEOUT_MS / 1000 : 0.01 }}
          >
            <AnimatePresence>
              {renderedLayers.map((layer, i) => (
                <motion.img
                  key={layer.imageUrl + '-' + i}
                  src={layer.imageUrl}
                  alt=""
                  initial={{ opacity: 0, y: 14, scale: 0.97 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{ duration: 0.48, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute inset-0 w-full h-full object-contain"
                  style={{ zIndex: layer.zIndex }}
                />
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── LOGO FINALE ── */}
      <AnimatePresence>
        {phase === 'logo' && (
          <motion.div
            key="logo"
            className="absolute inset-0 flex flex-col items-center justify-center"
            initial={{ opacity: 1 }}
            animate={{ opacity: 1 }}
          >
            {/* ADICTO.BIKE — slide in char by char, same feel as bike parts */}
            <div className="flex items-end" style={{ paddingBottom: 8 }}>
              {LOGO_CHARS.map((char, i) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, y: 14, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  transition={{
                    delay: i * LOGO_CHAR_DELAY,
                    duration: 0.42,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="text-[30px] lg:text-[40px] font-black italic uppercase leading-none"
                  style={{ letterSpacing: '-0.02em', display: 'inline-block', color: char === '.' ? '#ef4444' : '#ffffff' }}
                >
                  {char}
                </motion.span>
              ))}
            </div>

            {/* Red underline — grows left→right after last char */}
            <motion.div
              initial={{ scaleX: 0 }}
              animate={{ scaleX: 1 }}
              transition={{
                delay: LOGO_CHARS.length * LOGO_CHAR_DELAY + 0.05,
                duration: 0.45,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="h-px w-36 bg-red-600 origin-left"
              style={{ marginTop: -2 }}
            />

            {/* Tagline — letter by letter, after underline */}
            {(() => {
              const tagline = "Let's start to build your dream";
              const tagDelay = LOGO_CHARS.length * LOGO_CHAR_DELAY + 0.6;
              return (
                <div className="flex mt-3" style={{ flexWrap: 'nowrap' }}>
                  {tagline.split('').map((ch, i) => (
                    <motion.span
                      key={i}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: tagDelay + i * 0.028, duration: 0.2 }}
                      className="text-[9px] lg:text-[10px] font-black uppercase italic text-white/25"
                      style={{ letterSpacing: '0.18em', whiteSpace: 'pre' }}
                    >
                      {ch}
                    </motion.span>
                  ))}
                </div>
              );
            })()}

            {/* Arrow + First step hint */}
            {(() => {
              const hintDelay = LOGO_CHARS.length * LOGO_CHAR_DELAY + 1.5;
              return (
                <motion.div
                  initial={{ opacity: 0, x: -6 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: hintDelay, duration: 0.45 }}
                  className="flex items-center gap-2 mt-5"
                >
                  <span className="text-[9px] lg:text-[10px] font-black uppercase italic tracking-widest text-zinc-500">
                    First step: choose the Frameset
                  </span>
                  <motion.span
                    animate={{ x: [0, 5, 0] }}
                    transition={{ duration: 1.1, repeat: Infinity, ease: 'easeInOut', delay: hintDelay }}
                    className="text-zinc-500"
                  >
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  </motion.span>
                </motion.div>
              );
            })()}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- VISUALIZER ---
const Visualizer = ({ selectedComponents, offsets, showGrid, gridSize, isZoomed, zoomScale, steps, selectedFrameId }: any) => {
  // Build offset key: "{frameId}__{compId}" — falls back to "__{compId}" if no frame
  const getOffset = (compId: string) => {
    const k = selectedFrameId ? `${selectedFrameId}__${compId}` : `__${compId}`;
    return offsets?.[k] || offsets?.[compId] || { s: 1, x: 0, y: 0 };
  };
  // Collect first imageUrl from each step as preview layers
  const previewLayers = useMemo(() => {
    if (!steps) return [];
    return steps
      .map((s: any) => s.options?.[0] ? { imageUrl: s.options[0].imageUrl, zIndex: s.options[0].zIndex ?? 10 } : null)
      .filter((x): x is { imageUrl: string; zIndex: number } => !!x && !!x.imageUrl);
  }, [steps]);
  return (
    <div id="bike-visualizer" className="relative w-full h-full bg-zinc-950 rounded-none lg:rounded-[2.5rem] overflow-hidden border-0 lg:border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-crosshair">
      {showGrid && (
        <div className="absolute inset-0 z-[60] pointer-events-none opacity-[0.2]"
          style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: `${gridSize}px ${gridSize}px` }} />
      )}
      {/* EMPTY STATE: Cyclist intro animation */}
      {(!selectedComponents || selectedComponents.length === 0) && (
        <EmptyVisualizerState layers={previewLayers} />
      )}
      <motion.div drag={isZoomed} dragMomentum={false} dragConstraints={{ left: -2500, right: 2500, top: -2500, bottom: 2500 }}
        animate={{ scale: isZoomed ? (zoomScale || 5) : 1, x: isZoomed ? undefined : 0, y: isZoomed ? undefined : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }} className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {selectedComponents?.map((comp: any) => {
            const tune = getOffset(comp.id);
            return <motion.img key={comp.id} src={comp.imageUrl} crossOrigin="anonymous" loading="eager" alt={comp.name} initial={{ opacity: 0 }} animate={{ opacity: 1, scale: tune.s, x: tune.x, y: tune.y }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full object-contain pointer-events-none" style={{ zIndex: Number(comp.zIndex) }} />;
          })}
        </AnimatePresence>
      </motion.div>
      {isZoomed && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-2 z-[70] shadow-2xl"><Move size={10} /> {zoomScale.toFixed(1)}X - Drag to Move</div>}
    </div>
  );
};

// --- OPTION CARD ---
const OptionCard = ({ component, isSelected, onClick }: { component: Component, isSelected: boolean, onClick: () => void }) => (
  <motion.button
    layout
    onClick={(e) => { e.preventDefault(); onClick(); }}
    className={cn(
      "relative flex flex-col p-1 lg:p-3 rounded-xl border text-left transition-all group w-full shrink-0",
      isSelected ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20" : "border-white/5 bg-zinc-900/50 hover:border-white/20"
    )}
  >
    <div className="aspect-square w-full rounded-md bg-black/40 mb-1 lg:mb-2 overflow-hidden relative">
      <img src={component.cardImageUrl} alt={component.name} className="w-full h-full object-contain p-1" />
      {isSelected && <div className="absolute top-0.5 right-0.5 bg-red-600 p-0.5 rounded-full shadow-lg z-10"><CheckCircle2 size={8} className="text-white" /></div>}
    </div>
    <div className="flex-1 flex flex-col justify-between overflow-hidden">
      <div>
        <h3 className="text-[7px] lg:text-[11px] font-bold leading-none line-clamp-1 text-zinc-300 uppercase">{component.name}</h3>
        <p className="text-[6px] lg:text-[8px] text-zinc-500 uppercase font-black truncate">{component.brand}</p>
      </div>
      <div className="flex justify-between items-center mt-0.5">
        <p className="font-mono text-[8px] lg:text-[12px] text-red-600 tracking-tighter">€{component.price}</p>
        <p className="text-[7px] lg:text-[11px] text-zinc-600 font-mono italic">{component.weight}g</p>
      </div>
    </div>
  </motion.button>
);

// --- SOUND ENGINE ---
// All sounds generated via Web Audio API — no external files needed
const useSounds = () => {
  const ctx = useRef<AudioContext | null>(null);

  const getCtx = () => {
    if (!ctx.current) ctx.current = new (window.AudioContext || (window as any).webkitAudioContext)();
    return ctx.current;
  };
  const mob = typeof window !== 'undefined' && window.innerWidth < 1024;
  const vol = (v: number) => mob ? Math.min(v * 2.2, 0.95) : v;

  // Soft mechanical click — selecting a card
  const playSelect = () => {
    try {
      const ac = getCtx();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(900, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(600, ac.currentTime + 0.06);
      g.gain.setValueAtTime(vol(0.04), ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.08);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + 0.08);
    } catch {}
  };

  // Soft swipe — next step
  const playNext = () => {
    try {
      const ac = getCtx();
      const dur = 0.18;
      const buf = ac.createBuffer(1, Math.floor(ac.sampleRate * dur), ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) {
        const t = i / d.length;
        // white noise shaped with smooth ramp up + fast fade out
        d[i] = (Math.random() * 2 - 1) * Math.pow(t < 0.15 ? t / 0.15 : 1 - (t - 0.15) / 0.85, 1.4);
      }
      const noise = ac.createBufferSource();
      noise.buffer = buf;
      // Highpass to keep it airy, not rumble
      const hp = ac.createBiquadFilter();
      hp.type = 'highpass';
      hp.frequency.value = 3200;
      // Lowpass ceiling so it stays soft
      const lp = ac.createBiquadFilter();
      lp.type = 'lowpass';
      lp.frequency.setValueAtTime(7000, ac.currentTime);
      lp.frequency.linearRampToValueAtTime(12000, ac.currentTime + dur);
      const g = ac.createGain();
      g.gain.setValueAtTime(vol(0.09), ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      noise.connect(hp); hp.connect(lp); lp.connect(g); g.connect(ac.destination);
      noise.start();
    } catch {}
  };

  // Soft whoosh back — prev step
  const playBack = () => {
    try {
      const ac = getCtx();
      const buf = ac.createBuffer(1, ac.sampleRate * 0.1, ac.sampleRate);
      const d = buf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (i / d.length) * 0.7;
      const src = ac.createBufferSource();
      src.buffer = buf;
      const f = ac.createBiquadFilter();
      f.type = 'bandpass';
      f.frequency.setValueAtTime(3000, ac.currentTime);
      f.frequency.exponentialRampToValueAtTime(800, ac.currentTime + 0.1);
      f.Q.value = 1;
      const g = ac.createGain();
      g.gain.setValueAtTime(vol(0.04), ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.1);
      src.connect(f); f.connect(g); g.connect(ac.destination);
      src.start();
    } catch {}
  };

  // Success chime — bike finished / saved
  const playSuccess = () => {
    try {
      const ac = getCtx();
      [0, 0.1, 0.2].forEach((t, i) => {
        const o = ac.createOscillator();
        const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine';
        const freqs = [523, 659, 784]; // C5 E5 G5
        o.frequency.value = freqs[i];
        g.gain.setValueAtTime(0, ac.currentTime + t);
        g.gain.linearRampToValueAtTime(vol(0.07), ac.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.4);
        o.start(ac.currentTime + t);
        o.stop(ac.currentTime + t + 0.4);
      });
    } catch {}
  };

  // Soft pop — save/garage open
  const playPop = () => {
    try {
      const ac = getCtx();
      const o = ac.createOscillator();
      const g = ac.createGain();
      o.connect(g); g.connect(ac.destination);
      o.type = 'sine';
      o.frequency.setValueAtTime(300, ac.currentTime);
      o.frequency.exponentialRampToValueAtTime(180, ac.currentTime + 0.1);
      g.gain.setValueAtTime(vol(0.07), ac.currentTime);
      g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.12);
      o.start(ac.currentTime);
      o.stop(ac.currentTime + 0.12);
    } catch {}
  };

  return { playSelect, playNext, playBack, playSuccess, playPop };
};

// --- MAIN CONFIGURATOR ---
const INITIAL_STEPS: Step[] = [
  { id: 'frame', title: 'Frame', options: [] },
  { id: 'wheelset', title: 'Wheelset', options: [] },
  { id: 'tyres', title: 'Tyres', options: [] },
  { id: 'cockpit', title: 'Cockpit', options: [] },
  { id: 'tape', title: 'Tape', options: [] },
  { id: 'saddle', title: 'Saddle', options: [] },
  { id: 'shifters', title: 'Shifters', options: [] },
  { id: 'crankset', title: 'Crankset', options: [] },
  { id: 'derailleurs', title: 'Derailleurs', options: [] },
  { id: 'cassette', title: 'Cassette', options: [] },
  { id: 'discs', title: 'Discs', options: [] },
];

export default function BikeConfigurator() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, OffsetData>>({});
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [zoomScale, setZoomScale] = useState(5);
  const [isZoomed, setIsZoomed] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const stepsNavRef = useRef<HTMLDivElement>(null);

  // AUTH & GARAGE STATES
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('adicto_user') || 'null'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<any[]>(JSON.parse(localStorage.getItem('adicto_saved_builds') || '[]'));

  const currentStep = steps[currentStepIndex] || steps[0];
  const { playSelect, playNext, playBack, playSuccess, playPop } = useSounds();

  const handleLogout = () => {
    localStorage.removeItem('adicto_auth');
    localStorage.removeItem('adicto_github_token');
    localStorage.removeItem('adicto_user');
    setUser(null);
    setIsLoggedIn(false);
    setIsGarageOpen(false);
    window.location.reload();
  };

  const handleLoadBuild = (build: any) => {
    let missingSome = false;
    const newSelections: Record<string, string> = {};

    build.components.forEach((savedComp: any) => {
      // FIX #5: guard against undefined stepTitle
      if (!savedComp.stepTitle) { missingSome = true; return; }
      const step = steps.find(s => s.title.toUpperCase() === savedComp.stepTitle.toUpperCase());
      const exists = step?.options.find(o => o.name === savedComp.name);
      if (exists) {
        newSelections[step!.id] = exists.id;
      } else {
        missingSome = true;
      }
    });

    if (missingSome) {
      alert("Some components are no longer available in the database. Please rebuild your configuration.");
    }

    setSelections(newSelections);
    setIsGarageOpen(false);
    setIsFinished(false);
  };

  useEffect(() => {
    if (stepsNavRef.current) {
      const activeBtn = stepsNavRef.current.children[currentStepIndex] as HTMLElement;
      if (activeBtn) {
        stepsNavRef.current.scrollTo({ left: activeBtn.offsetLeft - 20, behavior: 'smooth' });
      }
    }
  }, [currentStepIndex]);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    if (window.location.pathname === '/admin' || urlParams.get('admin') === 'true') setIsAdminMode(true);
    fetch('/offsets.json').then(r => r.ok ? r.json() : {}).then(data => setOffsets(data)).catch(() => {});

    const autoLoadExcel = async () => {
      try {
        const response = await fetch('/data.xlsx');
        if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(arrayBuffer);
        const newSteps = INITIAL_STEPS.map(step => {
          const sheetName = Object.keys(workbook.Sheets).find(name => name.toUpperCase().trim() === step.title.toUpperCase().trim());
          const sheet = sheetName ? workbook.Sheets[sheetName] : null;
          if (sheet) {
            const data = XLSX.utils.sheet_to_json(sheet);
            return {
              ...step, options: data.map((row: any, idx: number) => {
                const findKey = (name: string) => Object.keys(row).find(k => k.toLowerCase().trim() === name.toLowerCase());
                // FIX #8: safer image key fallback using empty string instead of literal 'image'
                const imageKey = findKey('imageurl');
                const cardKey = findKey('cardimg') || findKey('cardimage');
                return {
                  id: `${step.id}-${idx}`,
                  name: row.Name || 'Unknown',
                  brand: row.Brand || '',
                  price: Number(row.Price || row.PRICE) || 0,
                  weight: Number(row.Weight || row.WEIGHT) || 0,
                  imageUrl: (imageKey ? row[imageKey] : '') || '',
                  cardImageUrl: (cardKey ? row[cardKey] : '') || (imageKey ? row[imageKey] : '') || '',
                  zIndex: Number(row[findKey('zindex') || '']) || 10,
                  logic: String(row[findKey('logic') || ''] || "").trim(),
                };
              })
            };
          }
          return step;
        });
        setSteps(newSteps);
      } catch (err) { }
    };
    autoLoadExcel();
  }, []);

  const activeLogic = useMemo(() => {
    if (currentStepIndex === 0) return null;
    const prevStepId = steps[currentStepIndex - 1]?.id;
    const selectedId = selections[prevStepId];
    if (!selectedId) return null;
    const prevComp = steps[currentStepIndex - 1].options.find(o => o.id === selectedId);
    return prevComp?.logic?.trim() || null;
  }, [selections, currentStepIndex, steps]);

  const filteredOptions = useMemo(() => {
    if (!currentStep) return [];
    return currentStep.options.filter(option => {
      if (!activeLogic) return true;
      if (!option.logic || option.logic.trim() === "") return true;
      return option.logic.trim() === activeLogic;
    });
  }, [currentStep, activeLogic]);

  const selectedComponents = useMemo(() => steps.map(s => {
    const opt = s.options.find(o => o.id === selections[s.id]);
    return opt ? { ...opt, stepTitle: s.title } : null;
  }).filter((c): c is Component => !!c), [selections, steps]);

  const activeComponentForTuning = useMemo(() =>
    currentStep?.options.find(o => o.id === selections[currentStep?.id]),
    [currentStep, selections]
  );

  // Admin mode: show login screen if ?admin=true or /admin path
  if (isAdminMode && !isLoggedIn) {
    return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  }

  return (
    <div className="h-screen bg-black text-white font-sans selection:bg-red-600 overflow-hidden flex flex-col lg:overscroll-none lg:touch-none">
      {/* AUTH MODAL */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onLogin={(u: any) => {
          setUser(u);
          localStorage.setItem('adicto_user', JSON.stringify(u));
          setIsAuthModalOpen(false);
        }}
      />

      {/* FINAL SCREEN OVERLAY */}
      <AnimatePresence>
        {isFinished && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[150]"
          >
            <SummaryView
              selections={selectedComponents}
              onReset={() => window.location.reload()}
              setSavedBuilds={setSavedBuilds}
              user={user}
              onOpenGarage={() => setIsGarageOpen(true)}
              onOpenAuth={() => setIsAuthModalOpen(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        /* Mobile horizontal scroll */
        .mob-scroll { overflow-x: auto; overflow-y: hidden; -webkit-overflow-scrolling: touch; }
        .mob-scroll::-webkit-scrollbar { height: 2px; }
        .mob-scroll::-webkit-scrollbar-track { background: transparent; }
        .mob-scroll::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
        /* Desktop vertical scroll — CARDS */
        .desk-scroll { overflow-y: auto; overflow-x: hidden; }
        .desk-scroll::-webkit-scrollbar { width: 3px; }
        .desk-scroll::-webkit-scrollbar-track { background: transparent; }
        .desk-scroll::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
        .desk-scroll::-webkit-scrollbar-thumb:hover { background: #dc2626; }
        /* Garage panel scrollbar */
        .custom-scroll-container::-webkit-scrollbar { width: 2px; height: 2px; }
        .custom-scroll-container::-webkit-scrollbar-track { background: transparent; }
        .custom-scroll-container::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
        /* Allow pull-to-refresh on mobile only */
        @media (max-width: 1024px) {
          html { overscroll-behavior-y: auto; }
          body { overflow: hidden; height: 100%; }
        }
        @media (min-width: 1025px) {
          html, body { overscroll-behavior: none; overflow: hidden; height: 100%; }
        }
        @keyframes slideHint { 0%, 100% { transform: translateX(0); opacity: 0.3; } 50% { transform: translateX(10px); opacity: 1; } }
        .animate-slide-hint { animation: slideHint 1.5s infinite; }
      `}</style>

      {isLoggedIn ? (
        <AdminPanel
          categories={INITIAL_STEPS.map(s => s.title)}
          offsets={offsets}
          setOffsets={setOffsets}
          activeComponent={activeComponentForTuning}
          selectedFrameId={selections['frame'] || ''}
          showGrid={showGrid}
          setShowGrid={setShowGrid}
          gridSize={gridSize}
          setGridSize={setGridSize}
          isZoomed={isZoomed}
          setIsZoomed={setIsZoomed}
          zoomScale={zoomScale}
          setZoomScale={setZoomScale}
          onLogout={handleLogout}
        />
      ) : (
        <nav className="border-b border-white/5 px-4 lg:px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
          <button onClick={() => window.location.reload()} className="flex items-center gap-3 group active:scale-95 transition-transform" title="Back to start">
            <img src="/design/Logo.png" alt="Logo" className="h-5 lg:h-6 w-auto object-contain group-hover:opacity-70 transition-opacity" />
            <div className="text-zinc-600 font-mono text-[8px] lg:text-[9px] uppercase tracking-widest italic border-l border-white/10 pl-3 mt-0.5">
              Build by Vasile & AI
            </div>
          </button>
          <div className="flex items-center gap-4">
            {user ? (
              <button
                onClick={() => { playPop(); setIsGarageOpen(true); }}
                className="flex items-center gap-1.5 bg-white/5 px-2.5 py-1 lg:px-3 lg:py-1.5 rounded-full border border-white/5 hover:border-red-600/50 transition-all group active:scale-95"
              >
                <User size={12} className="text-red-600 group-hover:scale-110 transition-transform" />
                <span className="text-[9px] font-black uppercase italic text-white tracking-widest leading-none">Garage: {user.name}</span>
              </button>
            ) : (
              <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-1.5 bg-red-600 px-2.5 py-1 lg:px-4 lg:py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest text-white">
                <LogIn size={12} /> Login
              </button>
            )}
          </div>
        </nav>
      )}

      {/* MAIN CONTENT */}
      <main className="flex-1 max-w-[1500px] mx-auto px-0 lg:px-6 pt-3 lg:pt-1 w-full overflow-hidden flex flex-col">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-0 lg:gap-6 h-full items-stretch pb-[75px] lg:pb-24">

          {/* LEFT: VISUALIZER — on mobile fixed height with more bottom margin */}
          <div className="lg:col-span-9 flex flex-col gap-1 order-1 h-[350px] md:h-[350px] lg:h-full shrink-0 mb-3 lg:mb-0">
            <div ref={stepsNavRef} className="flex overflow-x-auto no-scrollbar gap-x-3 pb-3 lg:pb-1 mt-2 lg:mt-0 shrink-0 px-2 lg:px-0">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => { playSelect(); setCurrentStepIndex(idx); }}
                  className={cn(
                    "transition-all text-[9px] lg:text-[11px] font-black uppercase italic tracking-widest pb-1 border-b-2 whitespace-nowrap",
                    idx === currentStepIndex ? "text-red-600 border-red-600" : "text-white/70 border-transparent"
                  )}
                >
                  {step.title}
                </button>
              ))}
            </div>
            <div className="flex-1 relative min-h-0">
              <Visualizer selectedComponents={selectedComponents} offsets={offsets} showGrid={showGrid} gridSize={gridSize} isZoomed={isZoomed} zoomScale={zoomScale} steps={steps} selectedFrameId={selections['frame'] || ''} />
            </div>
          </div>

          {/* RIGHT: OPTION CARDS — on mobile fixed height, horizontal scroll only */}
          <div className="lg:col-span-3 flex flex-col order-2 shrink-0 lg:h-full min-h-0">
            <div className="flex flex-col pointer-events-auto relative h-full">
              {/* Mobile: fixed-height container, cards scroll horizontally, no vertical movement */}
              {/* Mobile: horizontal scroll; Desktop: vertical scroll with red scrollbar */}
              <div className="mob-scroll lg:hidden px-2 pb-1 h-[160px]">
                <div className="flex flex-row gap-2 h-full items-stretch">
                  <AnimatePresence mode="popLayout">
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="w-[calc(33.333%-6px)] min-w-[calc(33.333%-6px)] shrink-0 h-full">
                        <OptionCard component={option} isSelected={selections[currentStep.id] === option.id} onClick={() => { playSelect(); setSelections({ ...selections, [currentStep.id]: option.id }); }} />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
              <div className="hidden lg:block desk-scroll h-full pr-1">
                <div className="flex flex-col gap-2">
                  <AnimatePresence mode="popLayout">
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="w-full">
                        <OptionCard component={option} isSelected={selections[currentStep.id] === option.id} onClick={() => { playSelect(); setSelections({ ...selections, [currentStep.id]: option.id }); }} />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-40 shrink-0">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 lg:py-6 grid grid-cols-12 gap-2 items-center">
          <button onClick={() => { if (currentStepIndex > 0) { playBack(); setCurrentStepIndex(currentStepIndex - 1); } }} className="col-span-3 lg:col-span-2 flex items-center gap-1 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="col-span-6 lg:col-span-7 flex justify-center lg:justify-end items-center gap-4 lg:gap-10">
            <div className="text-center lg:text-right text-zinc-300">
              <p className="text-[8px] lg:text-[9px] text-zinc-500 uppercase font-black mb-0.5 italic">Weight</p>
              <p className="font-mono text-[12px] lg:text-sm font-black">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center lg:text-right text-zinc-300">
              <p className="text-[8px] lg:text-[9px] text-zinc-500 uppercase font-black mb-0.5 italic">Price</p>
              <p className="font-mono text-[12px] lg:text-sm font-black text-red-600">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="col-span-3 flex justify-end">
            <button
              onClick={() => {
                if (filteredOptions.length > 0 && !selections[currentStep.id]) return;
                if (currentStepIndex < steps.length - 1) { playNext(); setCurrentStepIndex(currentStepIndex + 1); }
                else { playSuccess(); setIsFinished(true); }
              }}
              className="bg-red-600 text-white h-[32px] px-4 lg:px-6 rounded-lg font-black uppercase text-[10px] italic flex items-center gap-2 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
            >
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <GaragePanel
        isOpen={isGarageOpen}
        onClose={() => setIsGarageOpen(false)}
        builds={savedBuilds}
        user={user}
        onLogout={handleLogout}
        onSelectBuild={handleLoadBuild}
        onDeleteBuild={(id: string) => {
          const newB = savedBuilds.filter(b => b.id !== id);
          setSavedBuilds(newB);
          localStorage.setItem('adicto_saved_builds', JSON.stringify(newB));
        }}
      />
    </div>
  );
}


// --- COMPARE VIEW ---
const CompareView = ({ builds, onBack }: { builds: any[], onBack: () => void }) => {
  const allCategories: string[] = Array.from(new Set(
    builds.flatMap((b: any) => (b.components || []).map((c: any) => c.stepTitle))
  )).filter(Boolean) as string[];

  const totals = builds.map((b: any) => ({
    id: b.id,
    name: b.name,
    price: b.components?.reduce((a: number, c: any) => a + (Number(c.price) || 0), 0) || 0,
    weight: b.components?.reduce((a: number, c: any) => a + (Number(c.weight) || 0), 0) || 0,
  }));

  const minPrice = Math.min(...totals.map(t => t.price));
  const minWeight = Math.min(...totals.map(t => t.weight));

  const getComp = (build: any, cat: string) =>
    build.components?.find((c: any) => c.stepTitle === cat);

  // Highlight: green if best, red if worst
  const highlight = (vals: number[], val: number, lower = true) => {
    const best = lower ? Math.min(...vals) : Math.max(...vals);
    const worst = lower ? Math.max(...vals) : Math.min(...vals);
    if (val === best) return 'text-green-400 font-black';
    if (val === worst && vals.length > 1) return 'text-red-400';
    return 'text-zinc-300';
  };

  const isMobile = typeof window !== "undefined" && window.innerWidth < 1024;
  const colWidth = isMobile ? Math.max(100, Math.floor(360 / builds.length)) : Math.max(160, Math.floor(800 / builds.length));

  return (
    <div className="fixed inset-0 z-[1100] bg-black text-white font-sans flex flex-col">
      {/* HEADER */}
      <div className="shrink-0 px-3 lg:px-8 py-2 lg:py-4 border-b border-white/5 bg-zinc-900/60 backdrop-blur-xl flex items-center justify-between gap-2">
        <div className="flex items-center gap-4">
          <button onClick={onBack} className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center transition-all active:scale-95">
            <ChevronLeft size={14} />
          </button>
          <div>
            <h2 className="text-[11px] lg:text-[15px] font-black uppercase italic tracking-widest text-red-600 leading-none">Compare</h2>
            <p className="text-[7px] text-zinc-500 uppercase font-bold mt-0.5 tracking-widest">{builds.length} builds</p>
          </div>
        </div>
        <button
          onClick={() => window.location.reload()}
          className="flex items-center gap-1.5 bg-red-600 hover:bg-red-700 px-3 lg:px-5 py-1.5 lg:py-2 rounded-full font-black uppercase italic text-[9px] lg:text-[10px] tracking-widest text-white transition-all active:scale-95 shadow-lg shadow-red-600/20"
        >
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none"><path d="M2 6a4 4 0 1 1 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 4V6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
          Start New Build
        </button>
      </div>

      {/* TABLE */}
      <div className="flex-1 overflow-auto custom-scroll-container">
        <table className="border-collapse" style={{ width: '100%', minWidth: `${180 + builds.length * colWidth}px` }}>
          <thead className="sticky top-0 z-20">
            <tr>
              <th className="sticky left-0 z-30 bg-zinc-950 border-b border-r border-white/10 p-1.5 lg:p-3 text-left w-20 lg:w-44">
                <span className="text-[8px] font-black uppercase text-zinc-600 tracking-widest">Component</span>
              </th>
              {builds.map((b: any, i: number) => {
                const t = totals[i];
                const isCheapest = t.price === minPrice;
                const isLightest = t.weight === minWeight;
                return (
                  <th key={b.id} className="bg-zinc-950 border-b border-l border-white/10 p-1.5 lg:p-3 text-center" style={{ minWidth: colWidth }}>
                    <div className="text-[9px] lg:text-[11px] font-black uppercase italic text-white truncate max-w-[90px] lg:max-w-[140px] mx-auto leading-tight">{b.name}</div>
                    <div className="hidden lg:block text-[8px] text-zinc-600 font-mono mt-0.5">{b.date}</div>
                    <div className="flex justify-center items-center gap-1 lg:gap-2 mt-1">
                      <span className={cn("text-[8px] lg:text-[10px] font-mono font-black", isCheapest ? "text-green-400" : "text-red-500")}>
                        €{t.price.toLocaleString()}
                      </span>
                      <span className="text-zinc-700">·</span>
                      <span className={cn("text-[8px] lg:text-[10px] font-mono", isLightest ? "text-green-400" : "text-zinc-400")}>
                        {t.weight}g
                      </span>
                    </div>
                    <div className="flex justify-center gap-1 mt-1">
                      {isCheapest && <span className="hidden lg:inline text-[7px] bg-green-600/20 text-green-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Cheapest</span>}
                      {isLightest && <span className="hidden lg:inline text-[7px] bg-blue-600/20 text-blue-400 px-1.5 py-0.5 rounded-full font-black uppercase tracking-widest">Lightest</span>}
                    </div>
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {/* Totals rows — scrollable, not sticky */}
            <tr className="bg-zinc-900/40 border-b border-white/10">
              <td className="sticky left-0 z-10 bg-zinc-900/80 border-r border-white/10 p-1.5 lg:p-3">
                <span className="text-[8px] font-black uppercase italic text-zinc-400">Total Weight</span>
              </td>
              {totals.map(t => (
                <td key={t.id} className="border-l border-white/10 p-1.5 lg:p-3 text-center">
                  <span className={cn("font-mono text-[10px] lg:text-[12px]", highlight(totals.map(x => x.weight), t.weight))}>{t.weight}g</span>
                </td>
              ))}
            </tr>
            <tr className="bg-zinc-900/40 border-b border-white/10">
              <td className="sticky left-0 z-10 bg-zinc-900/80 border-r border-white/10 p-1.5 lg:p-3">
                <span className="text-[8px] font-black uppercase italic text-zinc-400">Total Price</span>
              </td>
              {totals.map(t => (
                <td key={t.id} className="border-l border-white/10 p-1.5 lg:p-3 text-center">
                  <span className={cn("font-mono text-[10px] lg:text-[12px]", highlight(totals.map(x => x.price), t.price))}>€{t.price.toLocaleString()}</span>
                </td>
              ))}
            </tr>
            {allCategories.map((cat, rowIdx) => {
              const comps = builds.map(b => getComp(b, cat));
              const prices = comps.map(c => c ? Number(c.price) || 0 : 0).filter(v => v > 0);
              const weights = comps.map(c => c ? Number(c.weight) || 0 : 0).filter(v => v > 0);
              return (
                <tr key={cat} className={cn("border-b border-white/5 transition-colors", rowIdx % 2 === 0 ? "bg-transparent" : "bg-white/[0.015]", "hover:bg-white/[0.04]")}>
                  <td className="sticky left-0 z-10 bg-zinc-950 border-r border-white/10 p-1.5 lg:p-3">
                    <span className="text-[7px] lg:text-[8px] font-black uppercase text-zinc-500 tracking-widest">{cat}</span>
                  </td>
                  {builds.map((b: any, i: number) => {
                    const comp = comps[i];
                    const priceClass = prices.length > 1 ? highlight(prices, comp ? Number(comp.price) || 0 : 0) : 'text-zinc-300';
                    return (
                      <td key={b.id} className="border-l border-white/5 p-1.5 lg:p-3 text-center align-top">
                        {comp ? (
                          <div className="flex flex-col items-center gap-0.5">
                            <span className="text-[7px] lg:text-[9px] font-black text-white uppercase leading-tight tracking-wide max-w-[80px] lg:max-w-[130px] truncate">{comp.brand}</span>
                            <span className="text-[7px] lg:text-[8px] text-zinc-500 leading-tight max-w-[80px] lg:max-w-[130px] line-clamp-2 text-center">{comp.name}</span>
                            <div className="flex items-center gap-1 mt-0.5">
                              <span className={cn("font-mono text-[7px] lg:text-[9px]", priceClass)}>€{comp.price}</span>
                              <span className="text-zinc-700 text-[7px]">·</span>
                              <span className="font-mono text-[7px] lg:text-[9px] text-zinc-500">{comp.weight}g</span>
                            </div>
                          </div>
                        ) : (
                          <span className="text-zinc-800 text-[11px]">—</span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="shrink-0 px-6 py-3 border-t border-white/5 bg-zinc-950 flex items-center justify-between">
        <p className="text-[7px] font-black uppercase italic text-zinc-700 tracking-widest">🟢 Green = best · 🔴 Red = most expensive</p>
        <button onClick={onBack} className="text-[8px] font-black uppercase italic text-zinc-500 hover:text-white transition-colors flex items-center gap-1">
          <ChevronLeft size={10} /> Back to Garage
        </button>
      </div>
    </div>
  );
};


// --- GARAGE SHARE BUTTON ---
const GarageShareBtn = ({ buildName }: { buildName: string }) => {
  const [open, setOpen] = useState(false);
  const msg = encodeURIComponent(`Look at this! Its my dream! — ${buildName} | adicto.bike`);
  const url = encodeURIComponent('https://adictobike.vercel.app');

  const items = [
    { label: 'WA', icon: '💬', action: () => window.open(`https://wa.me/?text=${msg}%20${url}`, '_blank') },
    { label: 'TG', icon: '✈️', action: () => window.open(`https://t.me/share/url?url=${url}&text=${msg}`, '_blank') },
    { label: 'IG', icon: '📸', action: () => { navigator.clipboard.writeText(decodeURIComponent(msg)); window.open('https://www.instagram.com/', '_blank'); } },
    { label: 'Mail', icon: '✉️', action: () => window.open(`mailto:?subject=${encodeURIComponent('Check this bike!')}&body=${msg}%20${url}`, '_blank') },
  ];
  return (
    <div className="relative">
      <button onClick={() => setOpen(o => !o)} className="bg-white/5 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase italic flex items-center gap-1 hover:bg-white/10 transition-all active:scale-95">
        <Share2 size={10} className="text-zinc-400" /> Share
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 6 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 6 }}
            className="absolute bottom-9 right-0 bg-zinc-900 border border-white/10 rounded-xl p-2 flex gap-1.5 shadow-2xl z-[9999]"
          >
            {items.map(it => (
              <button key={it.label} onClick={() => { it.action(); setOpen(false); }}
                className="flex flex-col items-center gap-0.5 bg-white/5 px-2 py-1.5 rounded-lg hover:bg-white/10 transition-all active:scale-90 min-w-[36px]">
                <span className="text-[13px]">{it.icon}</span>
                <span className="text-[6px] font-black uppercase text-zinc-400">{it.label}</span>
              </button>
            ))}
            <button onClick={() => setOpen(false)} className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-zinc-700 rounded-full text-white text-[8px] flex items-center justify-center font-black hover:bg-red-600">✕</button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- GARAGE PANEL ---
// FIX #2 & #3: Merged into a single component definition with handleDownloadPDF inside
const GaragePanel = ({ isOpen, onClose, builds, user, onLogout, onSelectBuild, onDeleteBuild }: any) => {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);
  const [compareIds, setCompareIds] = useState<string[]>([]);
  const [isComparing, setIsComparing] = useState(false);

  const toggleCompare = (id: string) => {
    setCompareIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  // FIX #3: handleDownloadPDF is now correctly inside GaragePanel where state setters live
  const handleDownloadPDF = async (build: any) => {
    setExportingId(build.id);
    setProgress(0);
    const interval = setInterval(() => setProgress(p => p >= 95 ? 95 : p + 5), 150);
    await generateAdictoPDF(build.components);
    clearInterval(interval);
    setProgress(100);
    setTimeout(() => { setExportingId(null); setProgress(0); }, 1000);
  };

  if (!isOpen) return null;

  const selectedBuilds = builds.filter((b: any) => compareIds.includes(b.id));

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[999] bg-black/98 backdrop-blur-3xl flex flex-col font-sans text-white">
      {/* COMPARE VIEW */}
      {isComparing && compareIds.length >= 2 && (
        <CompareView builds={selectedBuilds} onBack={() => setIsComparing(false)} />
      )}
      {!(isComparing && compareIds.length >= 2) && <>
      {/* HEADER */}
      <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-start relative">
        <div className="flex gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center font-black italic text-red-600 text-[12px] lg:text-[14px] shadow-xl">
            {user?.name?.[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="text-[9px] lg:text-[10px] font-black uppercase italic text-white leading-none">MY ADICTO</h2>
            <h2 className="text-[9px] lg:text-[10px] font-black uppercase italic text-red-600 mt-1 leading-none">GARAGE</h2>
            <button onClick={onLogout} className="mt-2 text-zinc-600 hover:text-white text-[7px] font-bold uppercase flex items-center gap-1"><LogOut size={10} /> Logout</button>
          </div>
        </div>

        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-3">
          {compareIds.length >= 2 ? (
            <button onClick={() => setIsComparing(true)} className="bg-red-600 px-6 py-2 rounded-full font-black uppercase italic text-[10px] tracking-widest shadow-lg shadow-red-600/20 hover:bg-red-700 transition-all active:scale-95">
              Compare {compareIds.length} Builds
            </button>
          ) : (
            <button disabled className="bg-zinc-800 px-6 py-2 rounded-full font-black uppercase italic text-[10px] tracking-widest text-zinc-500 cursor-default">
              Compare
            </button>
          )}
          <span className="text-[9px] font-black uppercase italic text-zinc-600 tracking-widest">
            {compareIds.length === 0 ? 'Select builds to compare' : compareIds.length === 1 ? 'Select 1 more...' : `${compareIds.length}/5 selected`}
          </span>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <button onClick={onClose} className="text-white uppercase text-[9px] font-black italic flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/10">MAIN PAGE <ChevronRight size={14} /></button>
          {compareIds.length >= 2 ? (
            <button onClick={() => setIsComparing(true)} className="lg:hidden bg-red-600 px-4 py-1.5 rounded-full text-white text-[9px] font-black italic active:scale-95">Compare ({compareIds.length})</button>
          ) : (
            <button disabled className="lg:hidden bg-zinc-800 px-4 py-1.5 rounded-full text-zinc-500 text-[9px] font-black italic">Compare</button>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scroll-container">
        <div className="space-y-4 max-w-5xl mx-auto">
          {builds.map((build: any) => (
            <div key={build.id} className="bg-zinc-900/30 border border-white/5 rounded-[1.5rem] p-4 lg:p-6 hover:bg-zinc-900/50 transition-all relative">
              <div className="absolute top-2 lg:top-3 right-6 text-[8px] lg:text-[10px] font-mono text-zinc-500 uppercase tracking-widest">{build.date}</div>
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-4 lg:mt-0">
                <div className="flex items-center gap-3 lg:gap-5 flex-1 min-w-0">
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); e.preventDefault(); toggleCompare(build.id); }}
                    className={cn(
                      "w-5 h-5 lg:w-6 lg:h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-all duration-150 active:scale-90",
                      compareIds.includes(build.id) ? "border-red-600 bg-red-600 shadow-lg shadow-red-600/30" : "border-white/20 bg-white/5 hover:border-red-600/50"
                    )}
                  >
                    {compareIds.includes(build.id) && <CheckCircle2 size={12} className="text-white" />}
                  </button>
                  <button onClick={() => onSelectBuild(build)} className="text-[12px] lg:text-[14px] font-black uppercase italic text-white hover:text-red-600 truncate text-left pr-1">{build.name}</button>
                </div>

                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 lg:flex-[2] lg:border-l border-white/5 lg:pl-6">
                  {build.components?.slice(0, 8).map((c: any, i: number) => (
                    <div key={i} className="text-[8px] lg:text-[9px] uppercase text-zinc-400 truncate flex items-center">
                      <span className="w-1 h-1 bg-red-600/50 rounded-full mr-2 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 mt-2 lg:mt-0 border-t lg:border-none border-white/5 pt-3 lg:pt-0">
                  <div className="lg:hidden flex items-center gap-2"><span className="text-[7px] font-black uppercase italic text-zinc-600">Choose to compare</span></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadPDF(build)} disabled={exportingId !== null} className="relative bg-white/5 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase italic overflow-hidden flex items-center gap-1">
                      {exportingId === build.id && (
                        <motion.div className="absolute left-0 top-0 bottom-0 bg-red-600/40" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />
                      )}
                      <span className="relative z-10 flex items-center gap-1">
                        <Download size={10} className="text-red-600" />
                        {exportingId === build.id ? `${progress}%` : 'PDF'}
                      </span>
                    </button>
                    <GarageShareBtn buildName={build.name} />
                    <button onClick={() => onDeleteBuild(build.id)} className="bg-red-600/10 text-red-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase italic">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 py-3 border-t border-white/5 bg-black flex items-center justify-center gap-6">
        {/* WhatsApp business */}
        <a
          href="https://wa.me/34674262622"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-1.5 text-zinc-600 hover:text-green-400 transition-colors group"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="shrink-0">
            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/>
            <path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.115 1.529 5.845L0 24l6.335-1.508A11.933 11.933 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.368l-.359-.214-3.722.886.938-3.623-.234-.372A9.818 9.818 0 1 1 12 21.818z"/>
          </svg>
          <span className="text-[7px] font-black uppercase italic tracking-widest">+34 674 262 622</span>
        </a>
        {/* Powered by */}
        <p className="text-[7px] font-black uppercase italic text-red-600/50 tracking-widest leading-none">Powered by Adicto.Bike | 2026</p>
        {/* Email */}
        <a
          href="mailto:hello@adicto.bike"
          className="flex items-center gap-1.5 text-zinc-600 hover:text-red-400 transition-colors group"
        >
          <span className="text-[7px] font-black uppercase italic tracking-widest">hello@adicto.bike</span>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="shrink-0">
            <rect x="2" y="4" width="20" height="16" rx="2"/>
            <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/>
          </svg>
        </a>
      </div>
      </>}
    </motion.div>
  );
};

// --- AUTH MODAL ---
const AuthModal = ({ isOpen, onClose, onLogin }: any) => {
  const [email, setEmail] = useState('');
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl">
        <h2 className="text-white font-black uppercase italic tracking-widest text-center mb-6">Garage Access</h2>
        <input type="email" placeholder="EMAIL" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black border border-white/10 p-4 rounded-xl text-white mb-4 outline-none focus:border-red-600 font-mono text-xs text-center" />
        <button onClick={() => onLogin({ email, name: email.split('@')[0] })} className="w-full bg-red-600 py-4 rounded-xl text-white font-black uppercase italic text-xs">Access Garage</button>
        <button onClick={onClose} className="w-full text-zinc-500 text-[10px] mt-4 uppercase font-black">Close</button>
      </motion.div>
    </div>
  );
};


// --- SUMMARY VISUALIZER ---
// Renders the completed bike from selected components (read-only, no offsets needed)
const SummaryVisualizer = ({ selections }: { selections: any[] }) => {
  const sorted = [...selections].sort((a, b) => (Number(a.zIndex) || 0) - (Number(b.zIndex) || 0));
  return (
    <div className="absolute inset-0 flex items-center justify-center overflow-hidden">
      {/* Subtle radial glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_50%_55%,rgba(239,68,68,0.06),transparent)] pointer-events-none" />
      {sorted.map((comp, i) => (
        comp.imageUrl ? (
          <motion.img
            key={comp.id || i}
            src={comp.imageUrl}
            alt={comp.name}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.04, duration: 0.4, ease: 'easeOut' }}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ zIndex: Number(comp.zIndex) || 10 }}
            draggable={false}
          />
        ) : null
      ))}
    </div>
  );
};

// --- SUMMARY VIEW ---
function SummaryView({ selections, onReset, setSavedBuilds, user, onOpenGarage, onOpenAuth }: any) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalPrice = selections.reduce((acc: number, c: any) => acc + (c.price || 0), 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + (c.weight || 0), 0);

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    const interval = setInterval(() => setProgress(prev => (prev >= 95 ? 95 : prev + 5)), 150);
    await generateAdictoPDF(selections);
    clearInterval(interval);
    setProgress(100);
    setTimeout(() => { setIsExporting(false); setProgress(0); }, 1000);
  };

  const handleSaveBuild = () => {
    const newBuild = {
      id: Math.random().toString(36).substr(2, 9),
      name: (() => {
        const frameName = selections.find((c: any) => c.stepTitle === 'Frame')?.name || '';
        const shifterName = selections.find((c: any) => c.stepTitle === 'Shifters')?.name || '';
        const parts = [frameName, shifterName].filter(Boolean);
        return parts.length > 0 ? parts.join(' + ') : 'Custom Build';
      })(),
      date: new Date().toLocaleDateString('uk-UA'),
      totalPrice,
      components: selections.map((c: any) => ({
        stepTitle: c.stepTitle,
        brand: c.brand,
        name: c.name,
        price: c.price,
        weight: c.weight,
        imageUrl: c.imageUrl,
        zIndex: c.zIndex,
      })),
    };
    const current = JSON.parse(localStorage.getItem('adicto_saved_builds') || '[]');
    // Auto-rename duplicate names: append " 2", " 3", etc.
    let finalName = newBuild.name;
    const existingNames = current.map((b: any) => b.name);
    if (existingNames.includes(finalName)) {
      let counter = 2;
      while (existingNames.includes(`${finalName} ${counter}`)) counter++;
      finalName = `${finalName} ${counter}`;
    }
    newBuild.name = finalName;
    const updated = [...current, newBuild];
    localStorage.setItem('adicto_saved_builds', JSON.stringify(updated));
    setSavedBuilds(updated);
    // play success sound
    try {
      const ac = new (window.AudioContext || (window as any).webkitAudioContext)();
      [0, 0.12, 0.24].forEach((t, i) => {
        const o = ac.createOscillator(); const g = ac.createGain();
        o.connect(g); g.connect(ac.destination);
        o.type = 'sine'; o.frequency.value = [523, 659, 784][i];
        g.gain.setValueAtTime(0, ac.currentTime + t);
        g.gain.linearRampToValueAtTime(vol(0.07), ac.currentTime + t + 0.02);
        g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + t + 0.4);
        o.start(ac.currentTime + t); o.stop(ac.currentTime + t + 0.4);
      });
    } catch {}
    alert(`Build "${finalName}" saved to your Garage!`);
  };

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 flex flex-col">
      <nav className="border-b border-white/5 px-4 lg:px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50 w-full">
        <button onClick={onReset} className="flex items-center gap-3 group active:scale-95 transition-transform" title="Back to start">
          <img src="/design/Logo.png" alt="Logo" className="h-5 lg:h-6 w-auto object-contain group-hover:opacity-70 transition-opacity" />
          <div className="text-zinc-600 font-mono text-[8px] lg:text-[9px] uppercase tracking-widest italic border-l border-white/10 pl-3 mt-0.5">Build by Vasile & AI</div>
        </button>
        <div className="flex items-center gap-4">
          {user ? (
            <button onClick={onOpenGarage} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-[9px] font-black uppercase italic text-white tracking-widest active:scale-95">
              Garage: {user.name}
            </button>
          ) : (
            <button onClick={onOpenAuth} className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest text-white active:scale-95">Login</button>
          )}
        </div>
      </nav>

      {/* MAIN LAYOUT — bike left/center, buttons right */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden min-h-0">

        {/* LEFT: Bike Visualizer */}
        <div className="flex-1 relative flex flex-col min-h-0">
          {/* Bike canvas */}
          <div className="relative flex-1 min-h-0">
            <SummaryVisualizer selections={selections} />
          </div>

          {/* Components list — bottom overlay */}
          <div className="shrink-0 px-4 lg:px-8 pb-3 pt-2">
            <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
              {selections.map((c: any, i: number) => (
                <div key={i} className="shrink-0 bg-zinc-900/70 border border-white/5 rounded-xl px-3 py-2 flex flex-col gap-0.5 min-w-[90px] backdrop-blur-sm">
                  <span className="text-[6px] font-black uppercase italic text-zinc-600 tracking-widest leading-none">{c.stepTitle}</span>
                  <span className="text-[7px] font-black text-white uppercase leading-tight truncate max-w-[80px]">{c.brand}</span>
                  <span className="text-[7px] text-zinc-400 leading-tight truncate max-w-[80px]">{c.name}</span>
                  <div className="flex items-center gap-1 mt-0.5">
                    <span className="text-[7px] font-mono text-red-500">€{c.price}</span>
                    <span className="text-zinc-700 text-[6px]">·</span>
                    <span className="text-[7px] font-mono text-zinc-500">{c.weight}g</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT PANEL: actions — same column as cards in configurator */}
        <div className="w-full lg:w-[280px] shrink-0 flex flex-col border-t lg:border-t-0 lg:border-l border-white/5 bg-zinc-950/60 backdrop-blur-xl">
          <div className="flex-1 flex flex-col justify-center p-5 lg:p-6 gap-5">

            {/* Title */}
            <div>
              <p className="text-[8px] font-black uppercase italic tracking-widest text-zinc-600 leading-none mb-1">Your build</p>
              <h2 className="text-[18px] lg:text-[20px] font-black italic uppercase tracking-tighter leading-tight">
                Your bike is <span className="text-red-600">Ready</span>
              </h2>
            </div>

            {/* Stats */}
            <div className="flex gap-3">
              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-3">
                <p className="text-zinc-600 text-[7px] uppercase font-black italic tracking-widest leading-none mb-1">Price</p>
                <p className="text-[16px] font-mono text-red-600 font-black tracking-tighter italic leading-none">€{totalPrice.toLocaleString()}</p>
              </div>
              <div className="flex-1 bg-black/40 border border-white/5 rounded-2xl p-3">
                <p className="text-zinc-600 text-[7px] uppercase font-black italic tracking-widest leading-none mb-1">Weight</p>
                <p className="text-[16px] font-mono text-white/80 font-black tracking-tighter italic leading-none">{totalWeight}g</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col gap-2.5">
              <button onClick={handleSaveBuild} className="h-11 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/8 text-white rounded-lg font-black uppercase text-[9px] tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-2">
                <Save size=12 /> Save to Garage
              </button>

              <button onClick={handleExport} disabled={isExporting} className="relative h-11 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/8 text-white rounded-lg font-black uppercase text-[9px] tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-2 overflow-hidden">
                {isExporting && <motion.div className="absolute left-0 top-0 bottom-0 bg-red-600/80 z-0" animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />}
                <span className="relative z-10 flex items-center justify-center gap-2 text-white">
                  {isExporting ? `SAVING ${progress}%` : <><Download size={13} /> Export PDF</>}
                </span>
              </button>

              <ShareMenu buildName={selections.find((c: any) => c.stepTitle === 'Frame')?.name} message="Look at this! Its my dream!" />

              <button onClick={onReset} className="h-11 bg-zinc-800/80 hover:bg-zinc-700/80 border border-white/8 text-white rounded-lg font-black uppercase text-[9px] tracking-widest transition-all active:scale-[0.97] flex items-center justify-center gap-2 text-zinc-400 hover:text-white">
                <svg width="13" height="13" viewBox="0 0 12 12" fill="none"><path d="M2 6a4 4 0 1 1 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/><path d="M2 4V6h2" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg>
                Build Another One
              </button>
            </div>

          </div>

          {/* Footer */}
          <div className="px-5 py-3 border-t border-white/5 flex items-center justify-center gap-4">
            <a href="https://wa.me/34674262622" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-zinc-600 hover:text-green-400 transition-colors">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.124.558 4.115 1.529 5.845L0 24l6.335-1.508A11.933 11.933 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.368l-.359-.214-3.722.886.938-3.623-.234-.372A9.818 9.818 0 1 1 12 21.818z"/></svg>
              <span className="text-[6px] font-black uppercase italic tracking-widest">+34 674 262 622</span>
            </a>
            <p className="text-[6px] font-black uppercase italic text-red-600/50 tracking-widest">Adicto.Bike | 2026</p>
            <a href="mailto:hello@adicto.bike" className="flex items-center gap-1 text-zinc-600 hover:text-red-400 transition-colors">
              <span className="text-[6px] font-black uppercase italic tracking-widest">hello@adicto.bike</span>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7"/></svg>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- UNIVERSAL PDF GENERATOR ---
const generateAdictoPDF = async (components: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();

  const totalPrice = components.reduce((acc, c) => acc + (c.price || 0), 0);
  const totalWeight = components.reduce((acc, c) => acc + (c.weight || 0), 0);
  const buildName = components.find((c: any) => c.stepTitle === 'Frame')?.name || 'CUSTOM BUILD';

  const cleanText = (text: string) => text ? String(text).replace(/[^\x00-\x7F]/g, "").toUpperCase() : "";

  const getBase64Image = async (url: string): Promise<string> => {
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) { return ""; }
  };

  // 1. Logo
  try {
    const logoBase64 = await getBase64Image("/design/Logo.png");
    if (logoBase64) doc.addImage(logoBase64, 'PNG', (pageWidth / 2) - 15, 8, 10, 10);
  } catch (e) { }

  // 2. Layered bike render
  try {
    const sortedByZ = [...components].sort((a, b) => (Number(a.zIndex) || 0) - (Number(b.zIndex) || 0));
    for (const comp of sortedByZ) {
      if (comp.imageUrl) {
        const imgBase64 = await getBase64Image(comp.imageUrl);
        if (imgBase64) {
          doc.addImage(imgBase64, 'PNG', 15, 20, 180, 110, undefined, 'FAST');
        }
      }
    }
  } catch (e) {
    console.error("PDF Image Error:", e);
  }

  // 3. Specs table
  autoTable(doc, {
    startY: 135,
    head: [['SECTION', 'COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
    body: components.map((c: any) => [
      cleanText(c.stepTitle || ""),
      cleanText(c.name),
      cleanText(c.brand),
      `${c.weight} g`,
      `${c.price?.toLocaleString()} €`,
    ]),
    styles: { font: "helvetica", fontSize: 6, cellPadding: 2 },
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
    foot: [['TOTAL', '', '', `${totalWeight} g`, `${totalPrice?.toLocaleString()} €`]],
    footStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    theme: 'grid',
  });

  // 4. Disclaimer
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(6);
  doc.setTextColor(100);
  const disclaimer = "NOTICE: THE WEIGHT AND PRICE INDICATED ARE PRELIMINARY AND SUBJECT TO MINOR CHANGES BASED ON COMPONENT AVAILABILITY. ADICTO.BIKE RESERVES THE RIGHT TO MODIFY SPECIFICATIONS WITHOUT PRIOR NOTICE.";
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - 30), 15, finalY);

  // 5. Footer + QR
  doc.setFontSize(7);
  doc.setTextColor(20);
  doc.text("WWW.ADICTO.BIKE  |  @ADICTO.BIKE", pageWidth / 2, pageHeight - 15, { align: 'center' });
  try {
    const qrBase64 = await getBase64Image("/design/qr-code.png");
    if (qrBase64) doc.addImage(qrBase64, 'PNG', pageWidth - 45, pageHeight - 45, 30, 30);
  } catch (e) { }

  doc.save(`ADICTO_${buildName.replace(/\s+/g, '_')}.pdf`);
};
