import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, ChevronsRight, Download, CheckCircle2, Upload, Database, Lock, User, Settings2, Save, RotateCcw, Grid3X3, Search, Move, FolderOpen, Key, Eye, EyeOff, LogOut, LogIn } from 'lucide-react';
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

// --- ADMIN LOGIN ---
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (localStorage.getItem('adicto_auth') === 'true') onLogin();
  }, [onLogin]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "hello@adicto.bike" && pass === "Scalpel2012!") {
      if (rememberMe) localStorage.setItem('adicto_auth', 'true');
      onLogin();
    } else { setError("Invalid credentials"); }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-red-600 font-sans">
      <motion.form initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} onSubmit={handleLogin} className="bg-zinc-900/50 p-10 rounded-[2.5rem] border border-white/5 w-full max-w-md backdrop-blur-xl shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-600/20"><Lock size={24} /></div>
          <h2 className="text-xl font-black uppercase tracking-widest italic text-center text-white">Adicto Admin</h2>
        </div>
        <div className="space-y-4 text-black">
          <input type="email" placeholder="Email" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono" value={email} onChange={(e) => setEmail(e.target.value)} />
          <div className="relative">
            <input type={showPass ? "text" : "password"} placeholder="Password" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono" value={pass} onChange={(e) => setPass(e.target.value)} />
            <button type="button" onClick={() => setShowPass(!showPass)} className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase">{showPass ? "Hide" : "Show"}</button>
          </div>
        </div>
        <div className="flex items-center gap-2 mt-4 px-2 text-white">
          <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="accent-red-600 h-4 w-4 rounded border-white/10 bg-black" />
          <label htmlFor="remember" className="text-zinc-500 text-[10px] uppercase font-bold cursor-pointer select-none">Remember Me</label>
        </div>
        {error && <p className="text-red-600 text-[10px] text-center mt-4 uppercase font-black italic tracking-widest">{error}</p>}
        <button className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-white mt-8 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/20 text-sm italic">Access Dashboard</button>
      </motion.form>
    </div>
  );
};

// --- ADMIN PANEL COMPONENT ---
const AdminPanel = ({ categories, offsets, setOffsets, activeComponent, showGrid, setShowGrid, gridSize, setGridSize, isZoomed, setIsZoomed, zoomScale, setZoomScale, onLogout }: any) => {
  const [selectedCat, setSelectedCat] = useState('excel');
  const [status, setStatus] = useState('');
  const [showToken, setShowToken] = useState(false);
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
    setOffsets((prev: any) => ({ ...prev, [activeComponent.id]: { ...(prev[activeComponent.id] || { s: 1, x: 0, y: 0 }), [key]: val } }));
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFolder: boolean) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    setStatus(`⏳ Loading 0/${fileArray.length}...`);

    for (let i = 0; i < fileArray.length; i++) {
      const file = fileArray[i];
      setStatus(`⏳ Sending ${i + 1}/${fileArray.length}...`);
      const contentBase64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve((reader.result as string).split(',')[1]);
      });
      const fileName = isFolder ? file.webkitRelativePath : file.name;
      const path = selectedCat === 'excel' ? "public/data.xlsx" : `public/parts/${selectedCat}/${fileName}`;
      const success = await saveToGithub(path, contentBase64);
      if (!success) { setStatus(`❌ Error at ${file.name}`); return; }
    }

    setStatus("✅ Success!");
    setTimeout(() => setStatus(''), 3000); // ОЧИЩЕННЯ СТАТУСУ ЧЕРЕЗ 3 СЕКУНДИ
    e.target.value = ""; 
  };

  const handleSaveOffsets = async () => {
    setStatus("Saving...");
    const success = await saveToGithub("public/offsets.json", JSON.stringify(offsets), true);
    if (success) {
      setStatus("✅ Saved!");
      setTimeout(() => setStatus(''), 3000); // ОЧИЩЕННЯ СТАТУСУ ЧЕРЕЗ 3 СЕКУНДИ
    } else {
      setStatus("❌ Error");
      setTimeout(() => setStatus(''), 3000);
    }
  };

  return (
    <div className="z-[100] sticky top-0 shadow-2xl font-sans text-white">
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-zinc-900 border-b border-white/5 p-2 flex gap-3 items-center justify-center backdrop-blur-md">
        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg border border-white/10 focus-within:border-red-600 transition-all">
          <Key size={10} className={token ? "text-red-600" : "text-zinc-500"} />
          <input type={showToken ? "text" : "password"} placeholder="TOKEN" value={token} onChange={(e) => setToken(e.target.value)} className="bg-transparent text-[9px] w-20 outline-none font-mono uppercase text-white" />
          <button onClick={() => setShowToken(!showToken)} className="text-zinc-600 hover:text-white">{showToken ? <EyeOff size={10} /> : <Eye size={10} />}</button>
        </div>
        <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="bg-black border border-white/10 text-[9px] px-2 py-1 rounded uppercase font-bold outline-none focus:border-red-600 transition-all text-white">
          <option value="excel">📁 EXCEL</option>
          {categories?.map((cat: string) => <option key={cat} value={cat}>🖼️ {cat.toUpperCase()}</option>)}
        </select>
        <div className="flex gap-1">
          <label className="cursor-pointer bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase hover:bg-zinc-700 flex items-center gap-1 italic"><Upload size={10}/> Files<input type="file" className="hidden" multiple onChange={(e) => handleUpload(e, false)} /></label>
          <label className="cursor-pointer bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase hover:bg-zinc-700 flex items-center gap-1 italic"><FolderOpen size={10}/> Folder<input type="file" className="hidden" webkitdirectory="" onChange={(e: any) => handleUpload(e, true)} /></label>
        </div>
        <div className="h-4 w-px bg-white/10 mx-1" />
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button onClick={() => setShowGrid(!showGrid)} className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase transition-all", showGrid ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400")}><Grid3X3 size={10}/></button>
          {showGrid && (
            <div className="flex items-center gap-2 px-1 border-r border-white/5 mr-1 animate-in fade-in slide-in-from-left-2">
              <span className="text-[7px] text-zinc-500 font-bold uppercase whitespace-nowrap">Grid: {gridSize}px</span>
              <input type="range" min="10" max="100" step="1" value={gridSize} onChange={(e) => setGridSize(parseInt(e.target.value))} className="w-16 h-1 bg-zinc-700 appearance-none accent-red-600" />
            </div>
          )}
        </div>
        <div className="flex items-center gap-2 bg-black/40 p-1 rounded-lg border border-white/5">
          <button onClick={() => setIsZoomed(!isZoomed)} className={cn("px-2 py-1 rounded text-[9px] font-bold uppercase transition-all flex items-center gap-2", isZoomed ? "bg-red-600 text-white" : "bg-zinc-800 text-zinc-400")}><Search size={10}/> {isZoomed ? `${zoomScale}X` : 'Magnify'}</button>
          {isZoomed && (
            <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-left-2">
              <span className="text-[7px] text-zinc-500 font-bold uppercase text-white">Scale</span>
              <input type="range" min="2" max="10" step="0.1" value={zoomScale} onChange={(e) => setZoomScale(parseFloat(e.target.value))} className="w-20 h-1 bg-zinc-700 appearance-none accent-red-600" />
            </div>
          )}
        </div>
        <button onClick={onLogout} className="text-zinc-500 hover:text-red-600 transition-colors p-1" title="Logout"><LogOut size={12} /></button>
        {status && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-[8px] font-mono uppercase text-red-600 ml-1">{status}</motion.span>}
      </motion.div>
      {activeComponent && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-black/80 border-b border-white/5 p-2 flex justify-between items-center px-6 backdrop-blur-xl gap-10">
          <div className="flex flex-col gap-1 flex-1">
            {[ { key: 's', label: 'Size', min: 0.8, max: 1.2, step: 0.001, reset: 1 }, { key: 'x', label: 'Pos X', min: -40, max: 40, step: 1, reset: 0 }, { key: 'y', label: 'Pos Y', min: -40, max: 40, step: 1, reset: 0 } ].map((item) => (
              <div key={item.key} className="flex items-center gap-3">
                <span className="text-[8px] text-zinc-500 font-black w-8 uppercase">{item.label}</span>
                <input type="range" min={item.min} max={item.max} step={item.step} value={offsets[activeComponent.id]?.[item.key as keyof OffsetData] ?? item.reset} onChange={e => updateTune(item.key as keyof OffsetData, parseFloat(e.target.value))} className="flex-1 h-1 bg-zinc-800 rounded-lg appearance-none accent-red-600 cursor-pointer" />
                <input type="number" step={item.step} value={offsets[activeComponent.id]?.[item.key as keyof OffsetData] ?? item.reset} onChange={e => updateTune(item.key as keyof OffsetData, parseFloat(e.target.value))} className="bg-transparent text-white text-[9px] w-10 text-right font-mono border-b border-white/5 focus:border-red-600 outline-none" />
                <button onClick={() => updateTune(item.key as keyof OffsetData, item.reset)} className="text-zinc-600 hover:text-red-600 transition-colors"><RotateCcw size={10}/></button>
              </div>
            ))}
          </div>
          <div className="flex flex-col items-end gap-1 shrink-0 text-white">
            <div className="text-[9px] font-black text-red-600 italic uppercase tracking-widest leading-none mb-1">{activeComponent.name}</div>
            <button onClick={handleSaveOffsets} className="bg-red-600 text-white px-5 py-2 rounded-lg text-[10px] font-black uppercase hover:bg-red-700 transition-all flex items-center gap-2 italic shadow-lg shadow-red-600/20"><Save size={12}/> Save Offsets</button>
          </div>
        </motion.div>
      )}
    </div>
  );
};

// --- VISUALIZER ---
const Visualizer = ({ selectedComponents, offsets, showGrid, gridSize, isZoomed, zoomScale }: any) => {
  return (
    <div id="bike-visualizer" className="relative w-full h-full bg-zinc-950 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-crosshair">
      {showGrid && (
        <div className="absolute inset-0 z-[60] pointer-events-none opacity-[0.2]" 
             style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: `${gridSize}px ${gridSize}px` }} />
      )}
      <motion.div drag={isZoomed} dragMomentum={false} dragConstraints={{ left: -2500, right: 2500, top: -2500, bottom: 2500 }}
        animate={{ scale: isZoomed ? (zoomScale || 5) : 1, x: isZoomed ? undefined : 0, y: isZoomed ? undefined : 0 }}
        transition={{ type: 'spring', damping: 25, stiffness: 120 }} className="relative w-full h-full flex items-center justify-center">
        <AnimatePresence mode="popLayout">
          {selectedComponents?.map((comp: any) => {
            const tune = (offsets && offsets[comp.id]) || { s: 1, x: 0, y: 0 };
            return <motion.img key={comp.id} src={comp.imageUrl} crossOrigin="anonymous" loading="eager" alt={comp.name} initial={{ opacity: 0 }} animate={{ opacity: 1, scale: tune.s, x: tune.x, y: tune.y }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ zIndex: Number(comp.zIndex) }} />;
          })}
        </AnimatePresence>
      </motion.div>
      {isZoomed && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-2 z-[70] shadow-2xl"><Move size={10}/> {zoomScale.toFixed(1)}X - Drag to Move</div>}
    </div>
  );
};

// --- OPTION CARD ---
const OptionCard = ({ component, isSelected, onClick }: { component: Component, isSelected: boolean, onClick: () => void }) => (
  <motion.button layout onClick={(e) => { e.preventDefault(); onClick(); }} className={cn("relative flex flex-col p-2 lg:p-3 rounded-xl lg:rounded-2xl border text-left transition-all group w-full shrink-0", isSelected ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900")}>
    <div className="aspect-square w-full rounded-lg lg:rounded-xl bg-black/40 mb-2 lg:mb-3 overflow-hidden relative"><img src={component.cardImageUrl} alt={component.name} className="w-full h-full object-contain p-1 lg:p-2 group-hover:scale-110 transition duration-500" />{isSelected && <div className="absolute top-1 lg:top-2 right-1 lg:right-2 bg-red-600 p-1 lg:p-1.5 rounded-full shadow-lg z-10"><CheckCircle2 size={10} className="text-white" /></div>}</div>
    <div className="flex-1 flex flex-col justify-between overflow-hidden"><div><h3 className="text-[6.5px] lg:text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 text-zinc-300 uppercase text-zinc-300">{component.name}</h3><p className="text-[6px] lg:text-[9px] text-zinc-500 uppercase font-black">{component.brand}</p></div><div className="flex justify-between items-end mt-1 lg:mt-2"><p className="font-mono text-[10px] lg:text-sm text-red-600 tracking-tighter">€{component.price.toLocaleString()}</p><p className="text-[9px] lg:text-sm text-zinc-600 font-mono italic">{component.weight}g</p></div></div>
  </motion.button>
);

// --- MAIN CONFIGURATOR ---
const INITIAL_STEPS: Step[] = [ { id: 'frame', title: 'Frame', options: [] }, { id: 'wheelset', title: 'Wheelset', options: [] }, { id: 'tyres', title: 'Tyres', options: [] }, { id: 'cockpit', title: 'Cockpit', options: [] }, { id: 'tape', title: 'Tape', options: [] }, { id: 'saddle', title: 'Saddle', options: [] }, { id: 'shifters', title: 'Shifters', options: [] }, { id: 'crankset', title: 'Crankset', options: [] }, { id: 'derailleurs', title: 'Derailleurs', options: [] }, { id: 'cassette', title: 'Cassette', options: [] }, { id: 'discs', title: 'Discs', options: [] } ];

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
  const [error, setError] = useState<string | null>(null);
  const stepsNavRef = useRef<HTMLDivElement>(null);

  // AUTH & GARAGE STATES
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('adicto_user') || 'null'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isGarageOpen, setIsGarageOpen] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<any[]>(JSON.parse(localStorage.getItem('adicto_saved_builds') || '[]'));

  const currentStep = steps[currentStepIndex] || steps[0];

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

    // Проходимо по кожному компоненту зі збереженої збірки
    build.components.forEach((savedComp: any) => {
      // Шукаємо відповідний крок у поточній базі Excel
      const step = steps.find(s => s.title.toUpperCase() === savedComp.stepTitle.toUpperCase());
      const exists = step?.options.find(o => o.name === savedComp.name);
      
      if (exists) {
        newSelections[step!.id] = exists.id;
      } else {
        missingSome = true;
      }
    });

    if (missingSome) {
      alert("Вибач, деякі компоненти вже недоступні, потрібно заново пройти процес зборки (Some components are no longer available in the database).");
    }

    // Оновлюємо вибір, закриваємо гараж і повертаємо користувача до конфігуратора
    setSelections(newSelections);
    setIsGarageOpen(false);
    setIsFinished(false);
  };
  
  useEffect(() => {
    if (stepsNavRef.current) {
      const activeBtn = stepsNavRef.current.children[currentStepIndex] as HTMLElement;
      if (activeBtn) {
        stepsNavRef.current.scrollTo({
          left: activeBtn.offsetLeft - 20, 
          behavior: 'smooth',
        });
      }
    }
  },[currentStepIndex]);

  useEffect(() => {
    const path = window.location.pathname; 
    const urlParams = new URLSearchParams(window.location.search);
    if (path === '/admin' || urlParams.get('admin') === 'true') setIsAdminMode(true);
    fetch('/offsets.json').then(r => r.ok ? r.json() : {}).then(data => setOffsets(data)).catch(() => {});
    
    const autoLoadExcel = async () => {
      try {
        const response = await fetch('/data.xlsx'); if (!response.ok) return;
        const arrayBuffer = await response.arrayBuffer(); const XLSX = await import('xlsx'); const workbook = XLSX.read(arrayBuffer);
        const newSteps = INITIAL_STEPS.map(step => {
          const sheetName = Object.keys(workbook.Sheets).find(name => name.toUpperCase().trim() === step.title.toUpperCase().trim());
          const sheet = sheetName ? workbook.Sheets[sheetName] : null;
          if (sheet) {
            const data = XLSX.utils.sheet_to_json(sheet);
            return { ...step, options: data.map((row: any, idx: number) => {
              const findKey = (name: string) => Object.keys(row).find(k => k.toLowerCase().trim() === name.toLowerCase());
              return { id: `${step.id}-${idx}`, name: row.Name || 'Unknown', brand: row.Brand || '', price: Number(row.Price || row.PRICE) || 0, weight: Number(row.Weight || row.WEIGHT) || 0, imageUrl: row[findKey('imageurl') || 'image'] || "", cardImageUrl: row[findKey('cardimg') || 'cardimage'] || row[findKey('imageurl') || 'image'] || "", zIndex: Number(row[findKey('zindex')]) || 10, logic: String(row[findKey('logic')] || "").trim() };
            })};
          } return step;
        }); setSteps(newSteps);
      } catch (err) {}
    }; autoLoadExcel();
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

  const activeComponentForTuning = useMemo(() => currentStep?.options.find(o => o.id === selections[currentStep?.id]), [currentStep, selections]);

  if (isAdminMode && !isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  if (isFinished) return (
    <SummaryView 
      selections={selectedComponents} 
      onReset={() => window.location.reload()} 
      setSavedBuilds={setSavedBuilds}
      user={user} 
      onOpenGarage={() => setIsGarageOpen(true)}
      onOpenAuth={() => setIsAuthModalOpen(true)}
    />
  );

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-28 lg:pb-24 overflow-x-hidden">
     <AuthModal 
      isOpen={isAuthModalOpen} 
      onClose={() => setIsAuthModalOpen(false)} 
      onLogin={(u: any) => { 
        setUser(u); 
        localStorage.setItem('adicto_user', JSON.stringify(u)); 
        setIsAuthModalOpen(false); 
      }} 
    />
      <style>{`
  /* Тонкий червоний скролбар */
  .custom-scroll-container::-webkit-scrollbar { 
    width: 3px; 
    height: 3px; 
  }
  .custom-scroll-container::-webkit-scrollbar-track { 
    background: rgba(255, 255, 255, 0.02); 
    border-radius: 10px; 
  }
  .custom-scroll-container::-webkit-scrollbar-thumb { 
    background: #ef4444; 
    border-radius: 10px; 
  }
  
  /* ВІДСТУП: Щоб скролбар був трішки правіше від карток товарів */
  .custom-scroll-container { 
    padding-right: 6px; 
    scrollbar-width: thin; 
    scrollbar-color: #ef4444 transparent; 
  }

  .no-scrollbar::-webkit-scrollbar { display: none; }
  .no-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }

  /* АНІМАЦІЯ: для напису Scroll >> */
  @keyframes slideHint { 
    0%, 100% { transform: translateX(0); } 
    50% { transform: translateX(5px); opacity: 1; } 
  }
  .animate-slide-hint { animation: slideHint 1.5s infinite; }
`}</style>

      {isLoggedIn ? (
        <AdminPanel categories={INITIAL_STEPS.map(s => s.title)} offsets={offsets} setOffsets={setOffsets} activeComponent={activeComponentForTuning} showGrid={showGrid} setShowGrid={setShowGrid} gridSize={gridSize} setGridSize={setGridSize} isZoomed={isZoomed} setIsZoomed={setIsZoomed} zoomScale={zoomScale} setZoomScale={setZoomScale} onLogout={handleLogout} />
      ) : (
        <nav className="border-b border-white/5 px-4 lg:px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
  {/* ГРУПА ЗЛІВА: ЛОГО + НАПИС */}
  <div className="flex items-center gap-3">
    <img src="/design/Logo.png" alt="Logo" className="h-5 lg:h-6 w-auto object-contain" />
    <div className="text-zinc-600 font-mono text-[8px] lg:text-[9px] uppercase tracking-widest italic border-l border-white/10 pl-3 mt-0.5">
      Build by Vasile & AI
    </div>
  </div>

  {/* ПРАВА ЧАСТИНА: КНОПКА LOGIN */}
<div className="flex items-center gap-4">
  {user ? (
    <button 
      onClick={() => setIsGarageOpen(true)}
      className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:border-red-600/50 transition-all group active:scale-95"
    >
      <User size={12} className="text-red-600 group-hover:scale-110 transition-transform"/> 
      <span className="text-[9px] font-black uppercase italic text-white tracking-widest">Garage: {user.name}</span>
    </button>
  ) : (
    <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest text-white">
      <LogIn size={12}/> Login
    </button>
  )}
</div>
</nav>
      )}

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 pt-2 lg:pt-3">
  <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 lg:h-[550px] items-stretch">
    
    {/* ЛІВА ЧАСТИНА: ВІЗУАЛІЗАТОР */}
    <div className="lg:col-span-9 flex flex-col gap-2 order-1">
      <div ref={stepsNavRef} className="flex overflow-x-auto no-scrollbar steps-scroll-container gap-x-6 gap-y-2 pb-2 scroll-smooth">
        {steps.map((step, idx) => (
          <button 
            key={step.id} 
            onClick={() => setCurrentStepIndex(idx)} 
            className={cn("transition-all duration-300 text-[10px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap", idx === currentStepIndex ? "text-red-600 border-red-600 drop-shadow-[0_0_9px_rgba(255,0,0,0.3)]" : "text-white opacity-20 border-transparent hover:opacity-100")}
          >
            {step.title}
          </button>
        ))}
      </div>
      <div className="h-[280px] md:h-[400px] lg:flex-1 relative">
        <Visualizer selectedComponents={selectedComponents} offsets={offsets} showGrid={showGrid} gridSize={gridSize} isZoomed={isZoomed} zoomScale={zoomScale} />
      </div>
    </div>

    {/* ПРАВА ЧАСТИНА: КАРТКИ ТОВАРІВ */}
    <div className="lg:col-span-3 flex flex-col bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-4 lg:p-6 relative overflow-hidden order-2 shadow-2xl">
      <div className="flex-1 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden custom-scroll-container pb-2 lg:pb-0" style={{ display: 'flex', flexDirection: 'column' }}>
        <div className="flex flex-row lg:flex-col gap-3 min-w-full">
          <AnimatePresence mode="popLayout">
            {filteredOptions.map((option) => (
              <div key={option.id} className="w-[31%] min-w-[31%] lg:w-full lg:min-w-0 shrink-0">
                <OptionCard 
                  component={option} 
                  isSelected={selections[currentStep.id] === option.id} 
                  onClick={() => setSelections(prev => ({...prev, [currentStep.id]: option.id}))} 
                />
              </div>
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* ПІДКАЗКА Scroll >> */}
      {filteredOptions.length > 3 && (
        <div className="lg:hidden mt-3 flex items-center justify-center gap-1 text-zinc-500 animate-slide-hint">
          <span className="text-[8px] font-black uppercase tracking-[0.2em] italic">Scroll</span>
          <ChevronsRight size={10} strokeWidth={3} />
        </div>
      )}
    </div> {/* КІНЕЦЬ ПРАВОЇ ПАНЕЛІ */}

  </div> {/* КІНЕЦЬ FLEX/GRID КОНТЕЙНЕРА */}
</main> {/* КІНЕЦЬ MAIN */}

      {/* --- FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-40">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-6 grid grid-cols-12 gap-2 items-center">
          
          {/* BACK BUTTON */}
          <button 
            type="button"
            onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} 
            className="col-span-3 lg:col-span-2 flex items-center gap-1 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic"
          >
            <ChevronLeft size={20} /> Back
          </button>

          {/* STATS (WEIGHT & PRICE) */}
          <div className="col-span-6 lg:col-span-7 flex justify-center lg:justify-end items-center gap-4 lg:gap-10">
            <div className="text-center lg:text-right text-zinc-300">
              <p className="text-[7px] text-zinc-600 uppercase font-black mb-0.5 italic">Weight</p>
              <p className="font-mono text-xs">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center lg:text-right text-zinc-300">
              <p className="text-[7px] text-zinc-600 uppercase font-black mb-0.5 italic">Price</p>
              <p className="font-mono text-xs text-red-600">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p>
            </div>
          </div>

          {/* NEXT / FINISH BUTTON */}
          <div className="col-span-3 flex justify-end items-center">
            <button 
              type="button"
              onClick={(e) => {
                e.preventDefault();
                if (filteredOptions.length > 0 && !selections[currentStep.id]) { 
                  setError("Select!"); 
                  return; 
                }
                setError(null);
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
              }} 
              className={cn(
                "flex items-center gap-2 font-black uppercase text-[10px] italic transition-all active:scale-95",
                "bg-transparent text-red-600 px-0 shadow-none border-none outline-none",
                "lg:bg-red-600 lg:text-white lg:h-[32px] lg:px-6 lg:rounded-lg lg:hover:bg-red-700 lg:shadow-lg lg:shadow-red-600/20"
              )}
            >
              <span>{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'}</span>
              <ChevronRight size={14} strokeWidth={3} className="shrink-0" />
            </button>
          </div>
        </div> {/* закриває внутрішній grid футера */}
      </div> {/* закриває fixed контейнер футера */}

      {/* ГАРАЖ ПАНЕЛЬ */}
      <GaragePanel 
        isOpen={isGarageOpen} 
        onClose={() => setIsGarageOpen(false)} 
        builds={savedBuilds} 
        user={user}
        onLogout={() => { 
          setUser(null); 
          localStorage.removeItem('adicto_user'); 
          setIsGarageOpen(false); 
        }}
        onSelectBuild={handleLoadBuild}
        onDeleteBuild={(id: string) => {
          const newBuilds = savedBuilds.filter(b => b.id !== id);
          setSavedBuilds(newBuilds);
          localStorage.setItem('adicto_saved_builds', JSON.stringify(newBuilds));
        }}
      />
    </div> 
  );
}
// --- CLIENT AUTH MODAL ---
const AuthModal = ({ isOpen, onClose, onLogin }: any) => {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'email' && email.includes('@')) {
      setStep('otp');
    } else if (step === 'otp') {
      // Імітація входу
      onLogin({ email, name: email.split('@')[0] });
    }
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-zinc-900 border border-white/5 p-8 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-6 right-6 text-zinc-600 hover:text-white"><LogOut size={16}/></button>
        
        <div className="text-center mb-8">
          <h2 className="text-lg font-black uppercase italic tracking-widest text-white mb-1">Garage Access</h2>
          <p className="text-zinc-500 text-[8px] uppercase font-bold tracking-[0.2em] italic">
            {step === 'email' ? 'Enter your email' : `Code sent to ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <input 
            type="email" 
            placeholder="EMAIL ADDRESS" 
            value={email} 
            onChange={e => setEmail(e.target.value)} 
            className="w-full bg-black/50 border border-white/5 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all font-mono text-[11px] mb-4" 
          />
        ) : (
          <div className="flex justify-center gap-3 mb-6">
            {otp.map((digit, i) => (
              <input 
                key={i} 
                type="text" 
                maxLength={1} 
                value={digit} 
                onChange={e => {
                  const newOtp = [...otp]; newOtp[i] = e.target.value; setOtp(newOtp);
                  if (e.target.nextSibling && e.target.value) (e.target.nextSibling as HTMLElement).focus();
                }} 
                className="w-10 h-12 bg-black border border-white/5 rounded-xl text-center text-red-600 font-bold outline-none focus:border-red-600 shadow-inner" 
              />
            ))}
          </div>
        )}

        <button 
          onClick={handleNext} 
          className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-white text-[10px] tracking-[0.2em] italic hover:bg-red-700 transition-all shadow-lg shadow-red-600/20"
        >
          {step === 'email' ? 'Continue' : 'Verify'}
        </button>
      </motion.div>
    </div>
  );
};

// --- GARAGE PANEL COMPONENT ---
const GaragePanel = ({ isOpen, onClose, builds, user, onLogout, onSelectBuild, onDeleteBuild }: any) => {
  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }}
      className="fixed inset-0 z-[300] bg-black/98 backdrop-blur-3xl flex flex-col font-sans text-white"
    >
      {/* HEADER */}
      <div className="p-6 border-b border-white/5 flex justify-between items-start">
        <div className="flex gap-4">
          <div className="w-12 h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center font-black italic text-red-600 text-[14px] shadow-xl">
            {user?.name?.[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="text-[10px] font-black uppercase italic leading-none tracking-[0.2em] text-white">MY ADICTO</h2>
            <h2 className="text-[10px] font-black uppercase italic leading-none tracking-[0.2em] text-red-600 mt-1">GARAGE</h2>
            <button onClick={onLogout} className="mt-3 flex items-center gap-1 text-zinc-600 hover:text-white transition-all text-[8px] font-bold uppercase tracking-tighter">
              <LogOut size={10}/> Logout from system
            </button>
          </div>
        </div>
        <button onClick={onClose} className="text-zinc-500 hover:text-white transition-all uppercase text-[9px] font-black italic flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full">
          Close <ChevronRight size={14} />
        </button>
      </div>

     {/* LIST OF BUILDS */}
<div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scroll-container">
  {builds.length === 0 ? (
    <div className="h-full flex flex-col items-center justify-center opacity-20">
      <Database size={30} className="mb-4" />
      <p className="text-[9px] font-black uppercase italic tracking-[0.3em]">Garage is empty</p>
    </div>
  ) : (
    <div className="space-y-4 max-w-5xl mx-auto">
      {builds.map((build: any) => (
        <div key={build.id} className="bg-zinc-900/30 border border-white/5 rounded-[1.5rem] p-5 hover:bg-zinc-900/50 transition-all group relative">
          
          {/* DATE: ПРАВИЙ ВЕРХНІЙ КУТ */}
          <div className="absolute top-5 right-6 text-[8px] font-mono text-zinc-600 uppercase tracking-widest">
            {build.date || '09/03/2026'}
          </div>

          <div className="flex flex-col lg:flex-row gap-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                {/* НАЗВА БАЙКУ: КЛІКАБЕЛЬНА */}
                <button 
                  onClick={() => onSelectBuild(build)} 
                  className="text-[16px] lg:text-[18px] font-black uppercase italic text-white hover:text-red-600 transition-colors text-left leading-none tracking-tighter"
                >
                  {build.name || 'Custom Build'}
                </button>
                
                {/* COMPARE CHECKBOX */}
                <div className="flex items-center gap-2 ml-4">
                  <input type="checkbox" className="w-3 h-3 accent-red-600 bg-black border-white/10 rounded cursor-pointer" />
                  <span className="text-[7px] text-zinc-500 font-bold uppercase tracking-tighter">Choose to compare</span>
                </div>
              </div>

              {/* CONFIGURATION: МАЛЕНЬКИЙ ШРИФТ */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 opacity-40">
                {build.components?.map((c: any, i: number) => (
                  <div key={i} className="text-[7px] uppercase text-zinc-400 truncate tracking-tight">
                    <span className="text-zinc-600 mr-1">{c.stepTitle}:</span> {c.brand} {c.name}
                  </div>
                ))}
              </div>
            </div>

            {/* ACTIONS: PDF ТА DELETE */}
            <div className="flex lg:flex-col justify-end gap-2 shrink-0">
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase italic transition-all group/pdf">
                <Download size={12} className="text-red-600 group-hover/pdf:scale-110 transition-transform"/> PDF
              </button>
              <button 
                onClick={() => onDeleteBuild(build.id)} 
                className="flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600 text-red-600 hover:text-white px-4 py-2 rounded-lg text-[8px] font-black uppercase italic transition-all"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  )}
</div>

     {/* FOOTER / МІНІ ПІДВАЛ КАБІНЕТУ */}
      <div className="p-8 border-t border-white/5 bg-black mt-auto">
        <div className="max-w-5xl mx-auto flex flex-col lg:flex-row justify-between items-center gap-6">
          
          {/* ЗЛІВА: БРЕНДИНГ */}
          <div className="text-left">
            <p className="text-[8px] font-black uppercase italic text-zinc-500 tracking-widest leading-none">
              Powered by Adicto.Bike
            </p>
            <p className="text-[7px] text-zinc-700 uppercase font-bold mt-2 tracking-tighter text-center lg:text-left">
              All Rights Reserved © 2026
            </p>
          </div>

          {/* СПРАВА: КОНТАКТИ ТА БАГИ */}
          <div className="text-center lg:text-right">
            <p className="text-[8px] text-zinc-500 uppercase font-bold italic tracking-tighter leading-none mb-2">
              Please contact us if you have any questions or bugs
            </p>
            <a 
              href="mailto:hello@adicto.bike" 
              className="text-[10px] font-black text-red-600 hover:text-white transition-all duration-300 italic tracking-widest border-b border-red-600/20 hover:border-white"
            >
              hello@adicto.bike
            </a>
          </div>
        </div>
      </div>
    </motion.div>
  );
};

function SummaryView({ selections, onReset, setSavedBuilds }: any) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);

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

  const handleExport = async () => {
    setIsExporting(true);
    setProgress(0);
    
    // Імітація прогресу для люксового ефекту
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 95) { clearInterval(interval); return 95; }
        return prev + 5;
      });
    }, 100);

    const doc = new jsPDF(); 
    const pageWidth = doc.internal.pageSize.getWidth(); 
    const pageHeight = doc.internal.pageSize.getHeight();
    const cleanText = (text: string) => text ? String(text).replace(/[^\x00-\x7F]/g, "").toUpperCase() : "";

    // 1. ЛОГОТИП У PDF (НАПІВПРОЗОРИЙ)
    try {
      const logoBase64 = await getBase64Image("/design/Logo.png");
      if (logoBase64) {
        // Встановлюємо прозорість 40% (opacity 0.3)
        doc.setGState(new (doc as any).GState({ opacity: 0.3 })); 
        doc.addImage(logoBase64, 'PNG', (pageWidth / 2) - 15, 8, 10, 10);
        // Скидаємо прозорість до 100% для решти контенту
        doc.setGState(new (doc as any).GState({ opacity: 1 })); 
      }
    } catch (e) {}

    // 2. ЗОБРАЖЕННЯ ВЕЛОСИПЕДА (ЯК У PROJECT1)
    try {
      const sortedByZ = [...selections].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      for (const comp of sortedByZ) {
        if (comp.imageUrl) {
          const imgBase64 = await getBase64Image(comp.imageUrl);
          if (imgBase64) doc.addImage(imgBase64, 'PNG', 15, 20, 180, 110, undefined, 'FAST');
        }
      }
    } catch (e) {}

    // 3. ТАБЛИЦЯ КОМПОНЕНТІВ
    autoTable(doc, { 
      startY: 135, head: [['SECTION', 'COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
      body: selections.map((c: any) => [cleanText(c.stepTitle || ""), cleanText(c.name), cleanText(c.brand), `${c.weight} g`, `${c.price.toLocaleString()} €`]),
      styles: { font: "helvetica", fontSize: 6, cellPadding: 2 }, headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25 } }, foot: [['TOTAL', '', '', `${totalWeight} g`, `${totalPrice.toLocaleString()} €`]],
      footStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' }, theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    
    // 4. ТЕКСТ ДИСКЛЕЙМЕРА (ЯК У PROJECT1)
    doc.setFontSize(6); doc.setTextColor(100);
    const disclaimer = "NOTICE: THE WEIGHT AND PRICE INDICATED ARE PRELIMINARY AND SUBJECT TO MINOR CHANGES BASED ON COMPONENT AVAILABILITY. ADICTO.BIKE RESERVES THE RIGHT TO MODIFY SPECIFICATIONS WITHOUT PRIOR NOTICE.";
    doc.text(doc.splitTextToSize(disclaimer, pageWidth - 30), 15, finalY);

    // 5. QR-КОД 35x35 MM ТА ФУТЕР
    try {
      const qrBase64 = await getBase64Image("/design/qr-code.png");
      if (qrBase64) doc.addImage(qrBase64, 'PNG', pageWidth - 50, pageHeight - 50, 35, 35);
    } catch (e) {}

    doc.setFontSize(7); doc.setTextColor(20);
    doc.text("WWW.ADICTO.BIKE  |  @ADICTO.BIKE", pageWidth / 2, pageHeight - 15, { align: 'center' });

    setTimeout(() => {
      clearInterval(interval);
      setProgress(100);
      setTimeout(() => {
        doc.save(`ADICTO_BUILD.pdf`);
        setIsExporting(false);
        setProgress(0);
      }, 400);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
      {/* UI: ЛОГОТИП ЗАМІСТЬ ЧЕКБОКСА */}
      <motion.img 
        initial={{ y: 10, opacity: 0 }} 
        animate={{ y: 0, opacity: 1 }} 
        src="/design/Logo.png" 
        className="h-8 mb-10 object-contain opacity-100" 
      />

      {/* UI: ЗМЕНШЕНИЙ ШРИФТ ЗАГОЛОВКА (на 25%) */}
      <h2 className="text-[20px] lg:text-[22px] font-black italic uppercase tracking-tighter mb-6 leading-[1.1] text-white">
        Your bike is <br/> <span className="text-red-600 uppercase">Ready</span>
      </h2>

      {/* UI: ЗМЕНШЕНІ ЦИФРИ ЦІНИ ТА ВАГИ */}
      <div className="flex justify-center gap-10 my-8 bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md">
        <div>
          <p className="text-zinc-600 text-[7px] uppercase font-black mb-1 italic tracking-widest">Price</p>
          <p className="text-[14px] font-mono text-red-600 font-black tracking-tighter italic">€{totalPrice.toLocaleString()}</p>
        </div>
        
        <div>
          <p className="text-zinc-600 text-[7px] uppercase font-black mb-1 italic tracking-widest">Weight</p>
          <p className="text-[14px] font-mono text-white/80 font-black tracking-tighter italic">{totalWeight}g</p>
        </div>
      </div>

      function SummaryView({ selections, onReset, user, onOpenGarage, onOpenAuth }: any) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);

  // ... (тут твої функції handleExport та getBase64Image залишаються без змін) ...

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 flex flex-col">
      
      {/* HEADER: Копіюємо стиль з головної сторінки */}
      <nav className="border-b border-white/5 px-4 lg:px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50 w-full">
        <div className="flex items-center gap-3">
          <img src="/design/Logo.png" alt="Logo" className="h-5 lg:h-6 w-auto object-contain" />
          <div className="text-zinc-600 font-mono text-[8px] lg:text-[9px] uppercase tracking-widest italic border-l border-white/10 pl-3 mt-0.5">
            Build by Vasile & AI
          </div>
        </div>

        <div className="flex items-center gap-4">
          {user ? (
            <button onClick={onOpenGarage} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 hover:border-red-600/50 transition-all group active:scale-95">
              <User size={12} className="text-red-600 group-hover:scale-110 transition-transform"/> 
              <span className="text-[9px] font-black uppercase italic text-white tracking-widest">Garage: {user.name}</span>
            </button>
          ) : (
            <button onClick={onOpenAuth} className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest text-white active:scale-95 transition-all">
              <LogIn size={12}/> Login
            </button>
          )}
        </div>
      </nav>

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <motion.img initial={{ y: 10, opacity: 0 }} animate={{ y: 0, opacity: 1 }} src="/design/Logo.png" className="h-8 mb-10 object-contain opacity-40" />
        
        <h2 className="text-[20px] lg:text-[22px] font-black italic uppercase tracking-tighter mb-6 leading-[1.1]">
          Your bike is <br/> <span className="text-red-600 uppercase">Ready</span>
        </h2>

        <div className="flex justify-center gap-10 my-8 bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md">
          <div>
            <p className="text-zinc-600 text-[7px] uppercase font-black mb-1 italic tracking-widest">Price</p>
            <p className="text-[14px] font-mono text-red-600 font-black tracking-tighter italic">€{totalPrice.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-zinc-600 text-[7px] uppercase font-black mb-1 italic tracking-widest">Weight</p>
            <p className="text-[14px] font-mono text-white/80 font-black tracking-tighter italic">{totalWeight}g</p>
          </div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-[280px]">
          <button onClick={handleExport} disabled={isExporting} className="relative h-14 bg-zinc-900 border border-white/10 rounded-2xl font-black uppercase text-[10px] italic overflow-hidden transition-all active:scale-95 group shadow-xl">
            <motion.div className="absolute left-0 top-0 bottom-0 bg-red-600/80 z-0" animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />
            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
              {isExporting ? `SAVING ${progress}%` : <><Download size={14} /> EXPORT PDF</>}
            </span>
          </button>

          <button onClick={() => { /* ... логіка збереження ... */ }} className="h-14 border border-red-600/30 text-red-600 rounded-2xl font-black uppercase text-[10px] italic hover:bg-red-600/10 transition-all active:scale-95">
            Save to Garage
          </button>

          <button onClick={onReset} className="px-8 py-4 bg-transparent border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] italic hover:bg-white/5 hover:border-white/20 transition-all active:scale-95">
            Build another one
          </button>
        </div>
      </div>
    </div>
  );
}
