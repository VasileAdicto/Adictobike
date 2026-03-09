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
  <motion.button 
    layout 
    onClick={(e) => { e.preventDefault(); onClick(); }} 
    className={cn(
      "relative flex flex-col p-1.5 lg:p-3 rounded-xl lg:rounded-2xl border text-left transition-all group w-full shrink-0", 
      isSelected ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20" : "border-white/5 bg-zinc-900/50 hover:border-white/20"
    )}
  >
    <div className="aspect-square w-full rounded-lg bg-black/40 mb-1 lg:mb-3 overflow-hidden relative">
      <img src={component.cardImageUrl} alt={component.name} className="w-full h-full object-contain p-1" />
      {isSelected && <div className="absolute top-0.5 right-0.5 bg-red-600 p-0.5 rounded-full shadow-lg z-10"><CheckCircle2 size={8} className="text-white" /></div>}
    </div>
    <div className="flex-1 flex flex-col justify-between overflow-hidden">
      <div>
        <h3 className="text-[7px] lg:text-[11px] font-bold leading-none line-clamp-1 text-zinc-300 uppercase">{component.name}</h3>
        <p className="text-[6px] lg:text-[9px] text-zinc-500 uppercase font-black truncate">{component.brand}</p>
      </div>
      <div className="flex justify-between items-center mt-1">
        <p className="font-mono text-[8px] lg:text-sm text-red-600 tracking-tighter">€{component.price}</p>
        <p className="text-[7px] lg:text-sm text-zinc-600 font-mono italic">{component.weight}g</p>
      </div>
    </div>
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

  return (
    <div className="h-screen bg-black text-white font-sans selection:bg-red-600 overflow-hidden flex flex-col">
      {/* АВТОРИЗАЦІЯ */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onLogin={(u: any) => { 
          setUser(u); 
          localStorage.setItem('adicto_user', JSON.stringify(u)); 
          setIsAuthModalOpen(false); 
        }} 
      />

      {/* ФІНАЛЬНИЙ ЕКРАН (OVERLAY) */}
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
        /* Надтонкий скролбар для ПК (2px) */
        .custom-scroll-container::-webkit-scrollbar { 
          width: 2px !important; 
          height: 2px !important; 
          display: block !important;
        }
        .custom-scroll-container::-webkit-scrollbar-track { 
          background: transparent !important; 
        }
        .custom-scroll-container::-webkit-scrollbar-thumb { 
          background: #ef4444 !important; 
          border-radius: 10px; 
        }

        /* Налаштування для мобайла */
        @media (max-width: 1024px) {
          .custom-scroll-container {
            overflow-x: auto !important;
            -webkit-overflow-scrolling: touch;
            padding-bottom: 12px !important; /* Місце для скролбару */
          }
          .custom-scroll-container::-webkit-scrollbar { 
            height: 3px !important; /* Трішки товстіший для пальця */
            display: block !important;
          }
        }

        @keyframes slideHint { 
          0%, 100% { transform: translateX(0); opacity: 0.3; } 
          50% { transform: translateX(10px); opacity: 1; } 
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

      {/* ОСНОВНИЙ КОНТЕНТ */}
      <main className="flex-1 max-w-[1500px] mx-auto px-2 lg:px-6 pt-1 w-full overflow-hidden flex flex-col">
        {/* pb-[70px] на мобайлі резервує місце під футер, щоб картки були в 5px від нього */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-1.5 lg:gap-10 h-full items-stretch pb-[75px] lg:pb-32">
          
          {/* ЛІВА ЧАСТИНА: ВІЗУАЛІЗАТОР (Збільшено висоту до 320px) */}
          <div className="lg:col-span-9 flex flex-col gap-1 order-1 h-[320px] md:h-[400px] lg:h-full shrink-0">
            <div ref={stepsNavRef} className="flex overflow-x-auto no-scrollbar gap-x-4 pb-1 shrink-0">
              {steps.map((step, idx) => (
                <button 
                  key={step.id} 
                  onClick={() => setCurrentStepIndex(idx)} 
                  className={cn(
                    "transition-all text-[9px] font-black uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap", 
                    idx === currentStepIndex ? "text-red-600 border-red-600" : "text-white opacity-20 border-transparent"
                  )}
                >
                  {step.title}
                </button>
              ))}
            </div>
            <div className="flex-1 relative min-h-0">
              <Visualizer selectedComponents={selectedComponents} offsets={offsets} showGrid={showGrid} gridSize={gridSize} isZoomed={isZoomed} zoomScale={zoomScale} />
            </div>
          </div>

          {/* ПРАВА ЧАСТИНА: КАРТКИ ТОВАРІВ */}
          <div className="lg:col-span-3 flex flex-col bg-zinc-900/40 rounded-[1.5rem] lg:rounded-[2.5rem] border border-white/5 p-2 lg:p-6 relative order-2 shadow-2xl min-h-0">
            <div className="overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden custom-scroll-container">
              
              {/* Контейнер для карток */}
              <div className="flex flex-row lg:flex-col gap-2 min-w-full">
                <AnimatePresence mode="popLayout">
                  {filteredOptions.map((option) => (
                    <div key={option.id} className="w-[32%] min-w-[32%] lg:w-full lg:min-w-0 shrink-0">
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


              {/* НАПИС SCROLL - ТЕПЕР ОДРАЗУ ПІД КАРТКАМИ */}
              {filteredOptions.length > 3 && (
                <div className="lg:hidden flex items-center justify-center gap-1.5 py-2 text-zinc-500/60 transition-opacity">
                  <span className="text-[7px] font-black uppercase tracking-widest italic">Scroll to more</span>
                  <ChevronsRight size={10} className="animate-slide-hint" />
                </div>
              )}
            </div>
          </div>
    </main>

          {/* --- FOOTER --- */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-40 shrink-0">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-4 lg:py-6 grid grid-cols-12 gap-2 items-center">
          <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="col-span-3 lg:col-span-2 flex items-center gap-1 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic">
            <ChevronLeft size={16} /> Back
          </button>
          <div className="col-span-6 lg:col-span-7 flex justify-center lg:justify-end items-center gap-4 lg:gap-10">
            <div className="text-center lg:text-right text-zinc-300">
              <p className="text-[7px] text-zinc-600 uppercase font-black mb-0.5 italic">Weight</p>
              <p className="font-mono text-[10px] lg:text-xs">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center lg:text-right text-zinc-300">
              <p className="text-[7px] text-zinc-600 uppercase font-black mb-0.5 italic">Price</p>
              <p className="font-mono text-[10px] lg:text-xs text-red-600">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="col-span-3 flex justify-end">
            <button onClick={() => {
                if (filteredOptions.length > 0 && !selections[currentStep.id]) { setError("Select!"); return; }
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
              }} className="bg-red-600 hover:bg-red-700 text-white h-[32px] px-4 lg:px-6 rounded-lg font-black uppercase text-[10px] italic flex items-center gap-2 active:scale-95 shadow-lg shadow-red-600/20">
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} />
            </button>
          </div>
        </div>
      </div>

      <GaragePanel isOpen={isGarageOpen} onClose={() => setIsGarageOpen(false)} builds={savedBuilds} user={user} onLogout={handleLogout} onSelectBuild={handleLoadBuild} onDeleteBuild={(id: string) => { const newB = savedBuilds.filter(b => b.id !== id); setSavedBuilds(newB); localStorage.setItem('adicto_saved_builds', JSON.stringify(newB)); }} />
    </div>
  );
} //


const GaragePanel = ({ isOpen, onClose, builds, user, onLogout, onSelectBuild, onDeleteBuild }: any) => {
  const [exportingId, setExportingId] = useState<string | null>(null);
  const [progress, setProgress] = useState(0);

  if (!isOpen) return null;

  const handleDownloadPDF = async (build: any) => {
  setExportingId(build.id);
  setProgress(0);
  const interval = setInterval(() => setProgress(p => p >= 95 ? 95 : p + 5), 150);

  // Передаємо компоненти зі збереженої збірки
  await generateAdictoPDF(build.components);

  clearInterval(interval);
  setProgress(100);
  setTimeout(() => { setExportingId(null); setProgress(0); }, 1000);
};

  return (
    <motion.div initial={{ x: '100%' }} animate={{ x: 0 }} exit={{ x: '100%' }} className="fixed inset-0 z-[999] bg-black/98 backdrop-blur-3xl flex flex-col font-sans text-white">
      {/* HEADER */}
      <div className="p-4 lg:p-6 border-b border-white/5 flex justify-between items-start relative">
        <div className="flex gap-4">
          <div className="w-10 h-10 lg:w-12 lg:h-12 bg-zinc-900 border border-white/10 rounded-full flex items-center justify-center font-black italic text-red-600 text-[12px] lg:text-[14px] shadow-xl">
            {user?.name?.[0].toUpperCase()}
          </div>
          <div className="flex flex-col">
            <h2 className="text-[9px] lg:text-[10px] font-black uppercase italic text-white leading-none">MY ADICTO</h2>
            <h2 className="text-[9px] lg:text-[10px] font-black uppercase italic text-red-600 mt-1 leading-none">GARAGE</h2>
            <button onClick={onLogout} className="mt-2 text-zinc-600 hover:text-white text-[7px] font-bold uppercase flex items-center gap-1"><LogOut size={10}/> Logout</button>
          </div>
        </div>

        {/* DESKTOP: Compare в центрі */}
        <div className="hidden lg:flex absolute left-1/2 -translate-x-1/2 top-1/2 -translate-y-1/2 items-center gap-4">
          <button className="bg-red-600 px-6 py-2 rounded-full font-black uppercase italic text-[10px] tracking-widest shadow-lg shadow-red-600/20">Compare</button>
          <span className="text-[10px] font-black uppercase italic text-zinc-500 tracking-widest">Choose to compare</span>
        </div>

        <div className="flex flex-col gap-2 items-end">
          <button onClick={onClose} className="text-white uppercase text-[9px] font-black italic flex items-center gap-2 bg-white/10 px-5 py-2.5 rounded-full border border-white/10">MAIN PAGE <ChevronRight size={14} /></button>
          <button className="lg:hidden bg-red-600 px-4 py-1.5 rounded-full text-white text-[9px] font-black italic">Compare</button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-4 lg:p-10 custom-scroll-container">
        <div className="space-y-4 max-w-5xl mx-auto">
          {builds.map((build: any) => (
            <div key={build.id} className="bg-zinc-900/30 border border-white/5 rounded-[1.5rem] p-4 lg:p-6 hover:bg-zinc-900/50 transition-all relative">
              {/* Дата вгорі */}
              <div className="absolute top-2 lg:top-3 right-6 text-[7px] lg:text-[8px] font-mono text-zinc-600 uppercase tracking-widest">{build.date}</div>
              
              <div className="flex flex-col lg:flex-row lg:items-center gap-4 mt-4 lg:mt-0">
                <div className="flex items-center gap-3 lg:gap-5 flex-1 min-w-0">
                  {/* Кружечок зліва */}
                  <label className="relative flex items-center justify-center cursor-pointer shrink-0">
                    <input type="checkbox" className="peer sr-only" />
                    <div className="w-2 h-2 lg:w-2 lg:h-2 rounded-full border-2 border-white peer-checked:border-red-600 peer-checked:bg-red-600/20 flex items-center justify-center transition-all">
                      <div className="w-2 h-2 lg:w-2.5 lg:h-2.5 rounded-full bg-red-600 scale-0 peer-checked:scale-100 transition-transform" />
                    </div>
                  </label>
                  <button onClick={() => onSelectBuild(build)} className="text-[12px] lg:text-[14px] font-black uppercase italic text-white hover:text-red-600 truncate text-left pr-1">{build.name}</button>
                </div>

                {/* Опис деталей (Мобайл + Десктоп) */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-1 lg:flex-[2] lg:border-l border-white/5 lg:pl-6">
                  {build.components?.slice(0, 8).map((c: any, i: number) => (
                    <div key={i} className="text-[7px] lg:text-[8px] uppercase text-zinc-500 truncate flex items-center">
                      <span className="w-1 h-1 bg-red-600/50 rounded-full mr-2 shrink-0" />
                      <span className="truncate">{c.name}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between lg:justify-end gap-3 mt-2 lg:mt-0 border-t lg:border-none border-white/5 pt-3 lg:pt-0">
                  <div className="lg:hidden flex items-center gap-2"><span className="text-[7px] font-black uppercase italic text-zinc-600">Choose to compare</span></div>
                  <div className="flex gap-2">
                    <button onClick={() => handleDownloadPDF(build)} disabled={exportingId !== null} className="relative bg-white/5 text-white px-3 py-1.5 rounded-lg text-[8px] font-black uppercase italic overflow-hidden flex items-center gap-1">
                      {exportingId === build.id && <motion.div className="absolute left-0 top-0 bottom-0 bg-red-600/40" initial={{ width: 0 }} animate={{ width: `${progress}%` }} />}
                      <span className="relative z-10 flex items-center gap-1"><Download size={10} className="text-red-600"/> {exportingId === build.id ? `${progress}%` : 'PDF'}</span>
                    </button>
                    <button onClick={() => onDeleteBuild(build.id)} className="bg-red-600/10 text-red-600 px-3 py-1.5 rounded-lg text-[8px] font-black uppercase italic">Delete</button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="px-6 py-4 border-t border-white/5 bg-black text-center"><p className="text-[7px] font-black uppercase italic text-zinc-600 tracking-widest leading-none opacity-50">Powered by Adicto.Bike | 2026</p></div>
    </motion.div>
  );
};

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

// --- SUMMARY VIEW (ФІНАЛЬНА СТОРІНКА) ---
function SummaryView({ selections, onReset, setSavedBuilds, user, onOpenGarage, onOpenAuth }: any) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);

  const totalPrice = selections.reduce((acc: number, c: any) => acc + (c.price || 0), 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + (c.weight || 0), 0);

  const handleExport = async () => {
  setIsExporting(true);
  setProgress(0);
  const interval = setInterval(() => setProgress(prev => (prev >= 95 ? 95 : prev + 5)), 150);

  // Викликаємо нову універсальну функцію
  await generateAdictoPDF(selections);

  clearInterval(interval);
  setProgress(100);
  setTimeout(() => { setIsExporting(false); setProgress(0); }, 1000);
};

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 flex flex-col">
      <nav className="border-b border-white/5 px-4 lg:px-6 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50 w-full">
        <div className="flex items-center gap-3">
          <img src="/design/Logo.png" alt="Logo" className="h-5 lg:h-6 w-auto object-contain" />
          <div className="text-zinc-600 font-mono text-[8px] lg:text-[9px] uppercase tracking-widest italic border-l border-white/10 pl-3 mt-0.5">Build by Vasile & AI</div>
        </div>
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

      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-[20px] lg:text-[22px] font-black italic uppercase tracking-tighter mb-6 leading-[1.1]">
          Your bike is <br/> <span className="text-red-600 uppercase">Ready</span>
        </h2>

        <div className="flex justify-center gap-10 my-8 bg-zinc-900/40 p-6 rounded-[2rem] border border-white/5 shadow-2xl backdrop-blur-md">
          <div><p className="text-zinc-600 text-[7px] uppercase font-black mb-1 italic tracking-widest">Price</p><p className="text-[14px] font-mono text-red-600 font-black tracking-tighter italic">€{totalPrice.toLocaleString()}</p></div>
          <div><p className="text-zinc-600 text-[7px] uppercase font-black mb-1 italic tracking-widest">Weight</p><p className="text-[14px] font-mono text-white/80 font-black tracking-tighter italic">{totalWeight}g</p></div>
        </div>

        <div className="flex flex-col gap-4 w-full max-w-[280px]">
          <button onClick={handleExport} disabled={isExporting} className="relative h-14 bg-zinc-900 border border-white/10 rounded-2xl font-black uppercase text-[10px] italic overflow-hidden transition-all active:scale-95 group shadow-xl">
            {isExporting && <motion.div className="absolute left-0 top-0 bottom-0 bg-red-600/80 z-0" animate={{ width: `${progress}%` }} transition={{ ease: "linear" }} />}
            <span className="relative z-10 flex items-center justify-center gap-2 text-white">
              {isExporting ? `SAVING ${progress}%` : <><Download size={14} /> EXPORT PDF</>}
            </span>
          </button>

          <button onClick={() => {
            const newBuild = {
  id: Math.random().toString(36).substr(2, 9),
  name: selections.find((c: any) => c.stepTitle === 'Frame')?.name || 'Custom Build',
  date: new Date().toLocaleDateString('uk-UA'),
  totalPrice: totalPrice,
  // ТУТ ВАЖЛИВО: зберігаємо imageUrl та zIndex для PDF
  components: selections.map((c: any) => ({ 
    stepTitle: c.stepTitle, 
    brand: c.brand, 
    name: c.name,
    price: c.price,
    weight: c.weight,
    imageUrl: c.imageUrl, // Потрібно для фото в PDF
    zIndex: c.zIndex      // Потрібно для правильних шарів
  }))
};
            const current = JSON.parse(localStorage.getItem('adicto_saved_builds') || '[]');
            localStorage.setItem('adicto_saved_builds', JSON.stringify([...current, newBuild]));
            setSavedBuilds([...current, newBuild]);
            alert("Build saved to your Garage!");
          }} className="h-14 border border-red-600/30 text-red-600 rounded-2xl font-black uppercase text-[10px] italic hover:bg-red-600/10 transition-all active:scale-95 shadow-lg shadow-red-600/5">
            Save to Garage
          </button>

          <button onClick={onReset} className="px-8 py-4 bg-transparent border border-white/10 text-white rounded-2xl font-black uppercase text-[10px] italic hover:bg-white/5 hover:border-white/20 transition-all active:scale-95 shadow-xl">
            Build another one
          </button>
        </div>
      </div>
    </div>
  );
}

// УНІВЕРСАЛЬНИЙ ГЕНЕРАТОР PDF З ФОТО ТА ЛОГО
const generateAdictoPDF = async (components: any[]) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  
  const totalPrice = components.reduce((acc, c) => acc + (c.price || 0), 0);
  const totalWeight = components.reduce((acc, c) => acc + (c.weight || 0), 0);
  const buildName = components.find((c: any) => c.stepTitle === 'Frame')?.name || 'CUSTOM BUILD';

  const cleanText = (text: string) => text ? String(text).replace(/[^\x00-\x7F]/g, "").toUpperCase() : "";

  // Функція для отримання зображення
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

  // 1. Додаємо Логотип
  try {
    const logoBase64 = await getBase64Image("/design/Logo.png");
    if (logoBase64) doc.addImage(logoBase64, 'PNG', (pageWidth / 2) - 15, 8, 10, 10);
  } catch (e) {}

  // 2. Рендеримо Байк (Накладання шарів)
try {
  // Сортуємо, щоб рама була знизу, а кермо зверху
  const sortedByZ = [...components].sort((a, b) => (Number(a.zIndex) || 0) - (Number(b.zIndex) || 0));
  
  for (const comp of sortedByZ) {
    if (comp.imageUrl) {
      const imgBase64 = await getBase64Image(comp.imageUrl);
      if (imgBase64) {
        // Малюємо шар за шаром
        doc.addImage(imgBase64, 'PNG', 15, 20, 180, 110, undefined, 'FAST');
      }
    }
  }
} catch (e) {
  console.error("PDF Image Error:", e);
}

  // 3. Таблиця специфікацій
  autoTable(doc, { 
    startY: 135,
    head: [['SECTION', 'COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
    body: components.map((c: any) => [
      cleanText(c.stepTitle || ""), 
      cleanText(c.name), 
      cleanText(c.brand), 
      `${c.weight} g`, 
      `${c.price?.toLocaleString()} €`
    ]),
    styles: { font: "helvetica", fontSize: 6, cellPadding: 2 },
    headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
    foot: [['TOTAL', '', '', `${totalWeight} g`, `${totalPrice?.toLocaleString()} €`]],
    footStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' },
    theme: 'grid'
  });

  // 4. Дисклеймер
  const finalY = (doc as any).lastAutoTable.finalY + 10;
  doc.setFontSize(6); doc.setTextColor(100);
  const disclaimer = "NOTICE: THE WEIGHT AND PRICE INDICATED ARE PRELIMINARY AND SUBJECT TO MINOR CHANGES BASED ON COMPONENT AVAILABILITY. ADICTO.BIKE RESERVES THE RIGHT TO MODIFY SPECIFICATIONS WITHOUT PRIOR NOTICE.";
  doc.text(doc.splitTextToSize(disclaimer, pageWidth - 30), 15, finalY);

  // 5. Футер з QR-кодом
  doc.setFontSize(7); doc.setTextColor(20);
  doc.text("WWW.ADICTO.BIKE  |  @ADICTO.BIKE", pageWidth / 2, pageHeight - 15, { align: 'center' });
  
  try {
    const qrBase64 = await getBase64Image("/design/qr-code.png");
    if (qrBase64) doc.addImage(qrBase64, 'PNG', pageWidth - 45, pageHeight - 45, 30, 30);
  } catch (e) {}

  doc.save(`ADICTO_${buildName.replace(/\s+/g, '_')}.pdf`);
};
