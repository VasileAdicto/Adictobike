import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, CheckCircle2, Upload, Database, Lock, User, Settings2, Save, RotateCcw, Grid3X3, Search, Move, FolderOpen, Key, Eye, EyeOff, LogOut } from 'lucide-react';
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

// --- ADMIN LOGIN COMPONENT ---
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
    } else {
      setError("Invalid credentials");
    }
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
        <div className="flex items-center gap-2 mt-4 px-2">
          <input type="checkbox" id="remember" checked={rememberMe} onChange={() => setRememberMe(!rememberMe)} className="accent-red-600 h-4 w-4 rounded border-white/10 bg-black" />
          <label htmlFor="remember" className="text-zinc-500 text-[10px] uppercase font-bold cursor-pointer select-none text-white">Remember Me</label>
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
  const [token, setToken] = useState(localStorage.getItem('adicto_github_token') || ''); 
  const [showToken, setShowToken] = useState(false);
  const REPO = "VasileAdicto/Adictobike";
  const BRANCH = "main";

  const saveToGithub = async (path: string, content: string, isJson = false) => {
    if (!token) { setStatus("❌ Token Required"); return false; }
    setStatus("Saving...");
    try {
      let sha = "";
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, { headers: { Authorization: `token ${token}` } });
      if (getRes.ok) { const data = await getRes.json(); sha = data.sha; }
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        method: "PUT",
        headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Admin update: ${path}`, content: isJson ? btoa(unescape(encodeURIComponent(content))) : content, sha: sha || undefined, branch: BRANCH }),
      });
      if (res.ok) { setStatus("✅ Success!"); localStorage.setItem('adicto_github_token', token); setTimeout(() => setStatus(''), 3000); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>, isFolder: boolean) => {
    const files = e.target.files;
    if (files) {
      const fileArray = Array.from(files);
      for (const file of fileArray) {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = async () => {
          const content = (reader.result as string).split(',')[1];
          const fileName = isFolder ? (file as any).webkitRelativePath : file.name;
          const path = selectedCat === 'excel' ? "public/data.xlsx" : `public/parts/${selectedCat}/${fileName}`;
          await saveToGithub(path, content);
        };
      }
      e.target.value = "";
    }
  };

  return (
    <div className="z-[100] sticky top-0 shadow-2xl font-sans text-white">
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-zinc-900 border-b border-white/5 p-2 flex gap-3 items-center justify-center backdrop-blur-md">
        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg border border-white/10 focus-within:border-red-600 transition-all">
          <Key size={10} className={token ? "text-red-600" : "text-zinc-500"} />
          <input type={showToken ? "text" : "password"} placeholder="TOKEN" value={token} onChange={(e) => setToken(e.target.value)} className="bg-transparent text-[9px] w-20 outline-none font-mono uppercase text-white" />
          <button onClick={() => setShowToken(!showToken)} className="text-zinc-500 hover:text-white">{showToken ? <EyeOff size={10} /> : <Eye size={10} />}</button>
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
        <button onClick={() => saveToGithub("public/offsets.json", JSON.stringify(offsets), true)} className="bg-red-600 text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-red-700 flex items-center gap-1 italic"><Save size={10}/> Offsets</button>
        <button onClick={onLogout} className="text-zinc-500 hover:text-red-600 p-1"><LogOut size={12} /></button>
        {status && <span className="text-[8px] font-mono uppercase text-red-600 ml-1">{status}</span>}
      </motion.div>
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
      {isZoomed && <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-red-600 text-white px-4 py-1 rounded-full text-[8px] font-black uppercase flex items-center gap-2 z-[70] shadow-2xl"><Move size={10}/> {zoomScale}X - Drag to Move</div>}
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

  // REF ДЛЯ ГОРИЗОНТАЛЬНОГО СКРОЛУ РОЗДІЛІВ
  const stepsNavRef = useRef<HTMLDivElement>(null);

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

  // ЦЕЙ ЕФЕКТ ПЕРЕМІЩУЄ АКТИВНИЙ РОЗДІЛ ВЛІВО
  useEffect(() => {
    if (stepsNavRef.current) {
      const activeBtn = stepsNavRef.current.children[currentStepIndex] as HTMLElement;
      if (activeBtn) {
        stepsNavRef.current.scrollTo({
          left: activeBtn.offsetLeft - 20,
          behavior: 'smooth'
        });
      }
    }
  }, [currentStepIndex]);

  const activeLogic = useMemo(() => {
    if (currentStepIndex === 0) return null;
    const prevStepId = steps[currentStepIndex - 1]?.id;
    const selectedId = selections[prevStepId];
    if (!selectedId) return null;
    const prevComp = steps[currentStepIndex - 1].options.find(o => o.id === selectedId);
    return prevComp?.logic?.trim() || null;
  }, [selections, currentStepIndex, steps]);

  const filteredOptions = useMemo(() => {
    const currentStep = steps[currentStepIndex] || steps[0];
    return currentStep.options.filter(opt => {
      if (!activeLogic) return true;
      if (!opt.logic || opt.logic.trim() === "") return true;
      return opt.logic.trim() === activeLogic;
    });
  }, [steps[currentStepIndex], activeLogic]);

  const selectedComponents = useMemo(() => steps.map(s => {
    const opt = s.options.find(o => o.id === selections[s.id]);
    return opt ? { ...opt, stepTitle: s.title } : null;
  }).filter((c): c is Component => !!c), [selections, steps]);

  const activeComponentForTuning = useMemo(() => steps[currentStepIndex]?.options.find(o => o.id === selections[steps[currentStepIndex]?.id]), [steps, currentStepIndex, selections]);

  if (isAdminMode && !isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-28 lg:pb-24 overflow-x-hidden">
      <style>{`
        /* СКРОЛБАР ЗАВЖДИ АКТИВНИЙ ТА ЧЕРВОНИЙ */
        .custom-scroll-container::-webkit-scrollbar, 
        .steps-scroll-container::-webkit-scrollbar { 
          width: 4px; 
          height: 4px; 
          display: block !important;
        }
        .custom-scroll-container::-webkit-scrollbar-track,
        .steps-scroll-container::-webkit-scrollbar-track { 
          background: rgba(255, 255, 255, 0.05); 
          border-radius: 10px; 
        }
        .custom-scroll-container::-webkit-scrollbar-thumb,
        .steps-scroll-container::-webkit-scrollbar-thumb { 
          background: #ef4444; 
          border-radius: 10px; 
        }
        .custom-scroll-container, .steps-scroll-container { 
          scrollbar-width: thin; 
          scrollbar-color: #ef4444 rgba(255, 255, 255, 0.05); 
        }
      `}</style>

      {isLoggedIn ? (
        <AdminPanel categories={INITIAL_STEPS.map(s => s.title)} offsets={offsets} setOffsets={setOffsets} activeComponent={activeComponentForTuning} showGrid={showGrid} setShowGrid={setShowGrid} gridSize={gridSize} setGridSize={setGridSize} isZoomed={isZoomed} setIsZoomed={setIsZoomed} zoomScale={zoomScale} setZoomScale={setZoomScale} onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <nav className="border-b border-white/5 px-4 lg:px-8 py-2 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50"><div className="flex items-center gap-4 pl-2"><img src="/design/Logo.png" alt="Logo" className="h-4 lg:h-6 w-auto object-contain" /></div><div className="text-zinc-400 font-mono text-[7px] pr-2 opacity-70 uppercase tracking-widest italic">Build by Vasile & AI</div></nav>
      )}

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 pt-2 lg:pt-3">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 lg:h-[550px] items-stretch">
          <div className="lg:col-span-9 flex flex-col gap-2 order-1">
            
            {/* КОНТЕЙНЕР РОЗДІЛІВ З АВТО-СКРОЛОМ */}
            <div 
              ref={stepsNavRef}
              className="flex overflow-x-auto no-scrollbar steps-scroll-container gap-x-6 gap-y-2 pb-2"
            >
              {steps.map((step, idx) => (
                <button key={step.id} onClick={() => setCurrentStepIndex(idx)} className={cn("transition-all duration-300 text-[10px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap", idx === currentStepIndex ? "text-red-600 border-red-600 drop-shadow-[0_0_9px_rgba(255,0,0,0.3)]" : "text-white opacity-20 border-transparent hover:opacity-100")}>{step.title}</button>
              ))}
            </div>

            <div className="h-[280px] md:h-[400px] lg:flex-1 relative"><Visualizer selectedComponents={selectedComponents} offsets={offsets} showGrid={showGrid} gridSize={gridSize} isZoomed={isZoomed} zoomScale={zoomScale} /></div>
          </div>
          <div className="lg:col-span-3 flex flex-col bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-4 lg:p-6 relative overflow-hidden order-2 shadow-2xl">
            <div className="flex-1 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden custom-scroll-container pb-2 lg:pb-0" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex flex-row lg:flex-col gap-3 min-w-full text-zinc-300">
                  <AnimatePresence mode="popLayout">
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="w-[31%] min-w-[31%] lg:w-full lg:min-w-0 shrink-0">
                        <OptionCard component={option} isSelected={selections[steps[currentStepIndex].id] === option.id} onClick={() => setSelections(prev => ({...prev, [steps[currentStepIndex].id]: option.id}))} />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-40">
        <div className="max-w-[1500px] mx-auto px-4 lg:px-6 py-6 grid grid-cols-12 gap-2 items-center">
          <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="col-span-3 lg:col-span-2 flex items-center gap-1 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic"><ChevronLeft size={20} /> Back</button>
          <div className="col-span-6 lg:col-span-7 flex justify-center lg:justify-end items-center gap-4 lg:gap-10">
            <div className="text-center lg:text-right text-zinc-300"><p className="text-[7px] text-zinc-600 uppercase font-black mb-0.5 italic">Weight</p><p className="font-mono text-xs">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p></div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center lg:text-right text-zinc-300"><p className="text-[7px] text-zinc-600 uppercase font-black mb-0.5 italic">Price</p><p className="font-mono text-xs text-red-600">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p></div>
          </div>
          <div className="col-span-3 flex justify-end">
            <button onClick={() => {
                if (filteredOptions.length > 0 && !selections[steps[currentStepIndex].id]) { setError("Select!"); return; }
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
              }} className="bg-red-600 hover:bg-red-700 text-white h-[32px] px-6 rounded-lg font-black uppercase text-[10px] italic flex items-center gap-2 active:scale-95 shadow-lg shadow-red-600/20">{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryView({ selections, onReset }: any) {
  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);
  
  const getBase64Image = async (url: string): Promise<string> => {
    try { const res = await fetch(url); const blob = await res.blob();
      return new Promise((resolve, reject) => { const reader = new FileReader(); reader.onloadend = () => resolve(reader.result as string); reader.onerror = reject; reader.readAsDataURL(blob); });
    } catch (e) { return ""; }
  };

  const handleExport = async () => {
    const doc = new jsPDF(); const pageWidth = doc.internal.pageSize.getWidth(); const pageHeight = doc.internal.pageSize.getHeight();
    const cleanText = (text: string) => text ? String(text).replace(/[^\x00-\x7F]/g, "").toUpperCase() : "";

    try {
      const logoBase64 = await getBase64Image("/design/Logo.png");
      if (logoBase64) doc.addImage(logoBase64, 'PNG', (pageWidth / 2) - 15, 8, 10, 10);
    } catch (e) {}

    try {
      const sortedByZ = [...selections].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      for (const comp of sortedByZ) {
        if (comp.imageUrl) {
          const imgBase64 = await getBase64Image(comp.imageUrl);
          if (imgBase64) doc.addImage(imgBase64, 'PNG', 15, 20, 180, 110, undefined, 'FAST');
        }
      }
    } catch (e) {}

    autoTable(doc, { 
      startY: 135, head: [['SECTION', 'COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
      body: selections.map((c: any) => [cleanText(c.stepTitle || ""), cleanText(c.name), cleanText(c.brand), `${c.weight} g`, `${c.price.toLocaleString()} €`]),
      styles: { font: "helvetica", fontSize: 6, cellPadding: 2 }, headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25 } }, foot: [['TOTAL', '', '', `${totalWeight} g`, `${totalPrice.toLocaleString()} €`]],
      footStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 8, fontStyle: 'bold' }, theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(6); doc.setTextColor(100);
    const disclaimer = "NOTICE: THE WEIGHT AND PRICE INDICATED ARE PRELIMINARY AND SUBJECT TO MINOR CHANGES BASED ON COMPONENT AVAILABILITY. ADICTO.BIKE RESERVES THE RIGHT TO MODIFY SPECIFICATIONS WITHOUT PRIOR NOTICE.";
    doc.text(doc.splitTextToSize(disclaimer, pageWidth - 30), 15, finalY);

    doc.setFontSize(7); doc.setTextColor(20);
    doc.text("WWW.ADICTO.BIKE  |  @ADICTO.BIKE", pageWidth / 2, pageHeight - 15, { align: 'center' });
    
    try {
      const qrBase64 = await getBase64Image("/design/qr-code.png");
      if (qrBase64) doc.addImage(qrBase64, 'PNG', pageWidth - 50, pageHeight - 50, 35, 35);
    } catch (e) {}

    doc.save(`ADICTO_BUILD.pdf`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
      <CheckCircle2 size={32} className="text-red-600 mb-4" />
      <h2 className="text-[27px] font-black italic uppercase tracking-tighter mb-4 leading-none text-white">Configuration <br/> <span className="text-red-600">Complete</span></h2>
      <div className="flex justify-center gap-10 my-8 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
        <div><p className="text-zinc-500 text-[9px] uppercase font-bold italic">Price</p><p className="text-[18px] font-mono text-red-600">€{totalPrice.toLocaleString()}</p></div>
        <div className="w-px bg-white/10" />
        <div><p className="text-zinc-500 text-[9px] uppercase font-bold italic">Weight</p><p className="text-[18px] font-mono text-white">{totalWeight}g</p></div>
      </div>
      <div className="flex gap-4 justify-center">
        <button onClick={handleExport} className="px-8 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] italic shadow-lg shadow-red-600/20 flex items-center gap-2"><Download size={16} /> Export PDF</button>
        <button onClick={onReset} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] italic hover:bg-white/5 transition-all text-white">Start Over</button>
      </div>
    </div>
  );
}
