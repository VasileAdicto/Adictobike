import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, CheckCircle2, Upload, Database, Lock, User, Settings2, Save } from 'lucide-react';
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
  s: number; // scale
  x: number; // offsetX
  y: number; // offsetY
}

//// --- ADMIN LOGIN COMPONENT ---
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [error, setError] = useState('');

  // Перевірка при завантаженні
  useEffect(() => {
    if (localStorage.getItem('adicto_auth') === 'true') onLogin();
  }, []);

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
      <motion.form 
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        onSubmit={handleLogin} 
        className="bg-zinc-900/50 p-10 rounded-[2.5rem] border border-white/5 w-full max-w-md backdrop-blur-xl shadow-2xl"
      >
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-600/20">
            <Lock className="text-white" size={24} />
          </div>
          <h2 className="text-xl font-black uppercase tracking-widest text-white italic">Adicto Admin</h2>
        </div>

        <div className="space-y-4">
          <input 
            type="email" placeholder="Email"
            className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono"
            value={email} onChange={(e) => setEmail(e.target.value)}
          />
          <div className="relative">
            <input 
              type={showPass ? "text" : "password"} placeholder="Password"
              className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono"
              value={pass} onChange={(e) => setPass(e.target.value)}
            />
            <button 
              type="button" onClick={() => setShowPass(!showPass)}
              className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-white transition-colors text-[10px] font-bold uppercase"
            >
              {showPass ? "Hide" : "Show"}
            </button>
          </div>
        </div>

        <div className="flex items-center gap-2 mt-4 px-2">
          <input 
            type="checkbox" id="remember" checked={rememberMe} 
            onChange={() => setRememberMe(!rememberMe)}
            className="accent-red-600 h-4 w-4"
          />
          <label htmlFor="remember" className="text-zinc-500 text-[10px] uppercase font-bold cursor-pointer select-none">Remember Me</label>
        </div>

        {error && <p className="text-red-600 text-[10px] text-center mt-4 uppercase font-black italic tracking-widest">{error}</p>}
        
        <button className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase tracking-widest text-white mt-8 hover:bg-red-700 active:scale-95 transition-all shadow-lg shadow-red-600/20 text-sm italic">
          Access Dashboard
        </button>
      </motion.form>
    </div>
  );
};

// --- ADMIN PANEL COMPONENT ---
const AdminPanel = ({ categories, offsets, setOffsets, activeComponent }: any) => {
  const [selectedCat, setSelectedCat] = useState('excel');
  const [status, setStatus] = useState('');

  const GITHUB_TOKEN = "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"; 
  const REPO = "VasileAdicto/Adictobike";
  const BRANCH = "main";

  const saveToGithub = async (path: string, content: string, isJson = false) => {
    setStatus("Saving...");
    try {
      let sha = "";
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        headers: { Authorization: `token ${GITHUB_TOKEN}` }
      });
      if (getRes.ok) {
        const data = await getRes.json();
        sha = data.sha;
      }
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        method: "PUT",
        headers: { Authorization: `token ${GITHUB_TOKEN}`, "Content-Type": "application/json" },
        body: JSON.stringify({
          message: `Admin update: ${path}`,
          content: isJson ? btoa(unescape(encodeURIComponent(content))) : content,
          sha: sha || undefined,
          branch: BRANCH
        }),
      });
      if (res.ok) setStatus("✅ Success!");
      else setStatus("❌ Error");
    } catch (err) { setStatus("❌ Failed"); }
  };

  const updateTune = (key: keyof OffsetData, val: number) => {
    if (!activeComponent) return;
    setOffsets((prev: any) => ({
      ...prev,
      [activeComponent.id]: { ...(prev[activeComponent.id] || { s: 1, x: 0, y: 0 }), [key]: val }
    }));
  };

  return (
    <div className="z-[100] sticky top-0 shadow-2xl">
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-zinc-900 border-b border-red-600/50 p-3 flex flex-wrap gap-4 items-center justify-center backdrop-blur-md">
        <div className="flex items-center gap-2 text-[10px] font-black uppercase text-red-600 tracking-tighter italic"><Database size={12}/> GitHub Admin</div>
        <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="bg-black border border-white/10 text-[10px] p-1.5 rounded-lg uppercase font-bold text-white outline-none focus:border-red-600 transition-all">
          <option value="excel">📁 Database (data.xlsx)</option>
          {categories.map((cat: string) => <option key={cat} value={cat}>🖼️ Folder: {cat}</option>)}
        </select>
        <label className="cursor-pointer bg-white text-black px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-red-600 hover:text-white transition-all flex items-center gap-2 italic">
          <Upload size={12}/> Upload File
          <input type="file" className="hidden" onChange={(e) => {
             const file = e.target.files?.[0];
             if (file) {
                const reader = new FileReader();
                reader.readAsDataURL(file);
                reader.onload = () => saveToGithub(selectedCat === 'excel' ? "public/data.xlsx" : `public/parts/${selectedCat}/${file.name}`, (reader.result as string).split(',')[1]);
             }
          }} />
        </label>
        <button onClick={() => saveToGithub("public/offsets.json", JSON.stringify(offsets), true)} className="bg-zinc-800 text-white px-4 py-1.5 rounded-lg text-[10px] font-black uppercase hover:bg-zinc-700 transition-all flex items-center gap-2 italic border border-white/5"><Save size={12}/> Save Offsets</button>
        {status && <span className="text-[9px] font-mono uppercase text-zinc-400 animate-pulse">{status}</span>}
      </motion.div>

      {activeComponent && (
        <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="bg-black/95 border-b border-white/5 p-6 flex flex-col items-center gap-6 backdrop-blur-xl">
          <div className="flex items-center gap-2 text-[10px] font-bold text-zinc-500 italic uppercase"><Settings2 size={12}/> Tuning: <span className="text-white">{activeComponent.name}</span></div>
          
          <div className="flex flex-wrap justify-center gap-12 w-full max-w-4xl">
            {/* Scale Control */}
            <div className="flex flex-col gap-3 min-w-[250px]">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase text-zinc-500 font-black tracking-widest">Size (Scale)</label>
                <input 
                  type="number" step="0.01" value={offsets[activeComponent.id]?.s || 1}
                  onChange={e => updateTune('s', parseFloat(e.target.value))}
                  className="bg-zinc-800 text-white text-[10px] w-12 text-center p-1 rounded font-mono border border-white/5"
                />
              </div>
              <input type="range" min="0.8" max="1.2" step="0.001" value={offsets[activeComponent.id]?.s || 1} onChange={e => updateTune('s', parseFloat(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-red-600 cursor-pointer" />
            </div>

            {/* Pos X Control */}
            <div className="flex flex-col gap-3 min-w-[250px]">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase text-zinc-500 font-black tracking-widest">Position X (Horizontal)</label>
                <input 
                  type="number" value={offsets[activeComponent.id]?.x || 0}
                  onChange={e => updateTune('x', parseInt(e.target.value))}
                  className="bg-zinc-800 text-white text-[10px] w-12 text-center p-1 rounded font-mono border border-white/5"
                />
              </div>
              <input type="range" min="-40" max="40" step="1" value={offsets[activeComponent.id]?.x || 0} onChange={e => updateTune('x', parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-red-600 cursor-pointer" />
            </div>

            {/* Pos Y Control */}
            <div className="flex flex-col gap-3 min-w-[250px]">
              <div className="flex justify-between items-center">
                <label className="text-[9px] uppercase text-zinc-500 font-black tracking-widest">Position Y (Vertical)</label>
                <input 
                  type="number" value={offsets[activeComponent.id]?.y || 0}
                  onChange={e => updateTune('y', parseInt(e.target.value))}
                  className="bg-zinc-800 text-white text-[10px] w-12 text-center p-1 rounded font-mono border border-white/5"
                />
              </div>
              <input type="range" min="-40" max="40" step="1" value={offsets[activeComponent.id]?.y || 0} onChange={e => updateTune('y', parseInt(e.target.value))} className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none accent-red-600 cursor-pointer" />
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
};};

// --- VISUALIZER & OPTION CARD ---
const Visualizer = ({ selectedComponents, offsets }: { selectedComponents: Component[], offsets: Record<string, OffsetData> }) => (
  <div id="bike-visualizer" className="relative w-full h-full bg-zinc-950 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center">
    <div className="absolute inset-0 opacity-5 pointer-events-none" style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
    <AnimatePresence mode="popLayout">
      {selectedComponents.map((comp) => {
        const tune = offsets[comp.id] || { s: 1, x: 0, y: 0 };
        return (
          <motion.img
            key={comp.id} src={comp.imageUrl} crossOrigin="anonymous" loading="eager" alt={comp.name}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1, scale: tune.s, x: tune.x, y: tune.y }} 
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }} className="absolute inset-0 w-full h-full object-contain pointer-events-none"
            style={{ zIndex: Number(comp.zIndex) }}
          />
        );
      })}
    </AnimatePresence>
  </div>
);

const OptionCard = ({ component, isSelected, onClick }: { component: Component, isSelected: boolean, onClick: () => void }) => (
  <motion.button
    layout onClick={(e) => { e.preventDefault(); onClick(); }}
    className={cn("relative flex flex-col p-2 lg:p-3 rounded-xl lg:rounded-2xl border text-left transition-all group w-full shrink-0", 
    isSelected ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900")}
  >
    <div className="aspect-square w-full rounded-lg lg:rounded-xl bg-black/40 mb-2 lg:mb-3 overflow-hidden relative">
      <img src={component.cardImageUrl} alt={component.name} className="w-full h-full object-contain p-1 lg:p-2 group-hover:scale-110 transition duration-500" />
      {isSelected && <div className="absolute top-1 lg:top-2 right-1 lg:right-2 bg-red-600 p-1 lg:p-1.5 rounded-full shadow-lg z-10"><CheckCircle2 size={10} className="text-white" /></div>}
    </div>
    <div className="flex-1 flex flex-col justify-between overflow-hidden">
      <div>
        <h3 className="text-[6.5px] lg:text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 text-zinc-300 uppercase">{component.name}</h3>
        <p className="text-[6px] lg:text-[9px] text-zinc-500 uppercase font-black">{component.brand}</p>
      </div>
      <div className="flex justify-between items-end mt-1 lg:mt-2">
        <p className="font-mono text-[10px] lg:text-sm text-red-600 tracking-tighter">€{component.price.toLocaleString()}</p>
        <p className="text-[9px] lg:text-sm text-zinc-600 font-mono italic">{component.weight}g</p>
      </div>
    </div>
  </motion.button>
);

// --- MAIN CONFIGURATOR ---
const INITIAL_STEPS: Step[] = [
  { id: 'frame', title: 'Frame', options: [] }, { id: 'wheelset', title: 'Wheelset', options: [] },
  { id: 'tyres', title: 'Tyres', options: [] }, { id: 'cockpit', title: 'Cockpit', options: [] },
  { id: 'tape', title: 'Tape', options: [] }, { id: 'saddle', title: 'Saddle', options: [] },
  { id: 'shifters', title: 'Shifters', options: [] }, { id: 'crankset', title: 'Crankset', options: [] },
  { id: 'derailleurs', title: 'Derailleurs', options: [] }, { id: 'cassette', title: 'Cassette', options: [] },
  { id: 'discs', title: 'Discs', options: [] }
];

export default function BikeConfigurator() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, OffsetData>>({});
  
  useEffect(() => {
    const path = window.location.pathname; 
    const urlParams = new URLSearchParams(window.location.search);
    if (path === '/admin' || urlParams.get('admin') === 'true') {
      setIsAdminMode(true);
    }
    // Load offsets
    fetch('/offsets.json').then(r => r.json()).then(data => setOffsets(data)).catch(() => {});
  }, []);

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex] || steps[0];
  const listRef = useRef<HTMLDivElement>(null);
  const stepRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const activeLogic = useMemo(() => {
    if (currentStepIndex === 0) return null;
    const prevStepId = steps[currentStepIndex - 1].id;
    const selectedId = selections[prevStepId];
    if (!selectedId) return null;
    const prevComp = steps[currentStepIndex - 1].options.find(o => o.id === selectedId);
    return prevComp?.logic?.trim() || null;
  }, [selections, currentStepIndex, steps]);

  const filteredOptions = useMemo(() => {
    if (!currentStep) return [];
    return currentStep.options.filter(opt => {
      if (!activeLogic) return true;
      if (!opt.logic || opt.logic.trim() === "") return true;
      return opt.logic.trim() === activeLogic;
    });
  }, [currentStep, activeLogic]);

  useEffect(() => {
    stepRefs.current[currentStepIndex]?.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
  }, [currentStepIndex]);

  useEffect(() => {
    const autoLoadExcel = async () => {
      try {
        const response = await fetch('/data.xlsx');
        if (!response.ok) throw new Error("File not found");
        const arrayBuffer = await response.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(arrayBuffer);
        const newSteps = INITIAL_STEPS.map(step => {
          const sheetName = Object.keys(workbook.Sheets).find(name => name.toUpperCase().trim() === step.title.toUpperCase().trim());
          const sheet = sheetName ? workbook.Sheets[sheetName] : null;
          if (sheet) {
            const data = XLSX.utils.sheet_to_json(sheet);
            return {
              ...step,
              options: data.map((row: any, idx: number) => {
                const findKey = (name: string) => Object.keys(row).find(k => k.toLowerCase().trim() === name.toLowerCase());
                return {
                  id: `${step.id}-${idx}`,
                  name: row.Name || row.NAME || 'Unknown', brand: row.Brand || row.BRAND || '',
                  price: Number(row.Price || row.PRICE) || 0, weight: Number(row.Weight || row.WEIGHT) || 0,
                  imageUrl: row[findKey('imageurl') || 'image'] || "",
                  cardImageUrl: row[findKey('cardimg') || 'cardimage'] || row[findKey('imageurl') || 'image'] || "",
                  zIndex: Number(row[findKey('zindex')]) || 10, logic: String(row[findKey('logic')] || "").trim()
                };
              })
            };
          }
          return step;
        });
        setSteps(newSteps);
      } catch (err) { console.error(err); }
    };
    autoLoadExcel();
  }, []);

  const selectedComponents = useMemo(() => {
    return steps.map(step => {
        const opt = step.options.find(o => o.id === selections[step.id]);
        if (opt) return { ...opt, stepTitle: step.title };
        return null;
    }).filter((c): c is Component => !!c);
  }, [selections, steps]);

  const activeComponentForTuning = useMemo(() => {
    return currentStep.options.find(o => o.id === selections[currentStep.id]);
  }, [selections, currentStep]);

  if (isAdminMode && !isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-28 lg:pb-24 overflow-x-hidden">
      {isLoggedIn && <AdminPanel categories={INITIAL_STEPS.map(s => s.title)} offsets={offsets} setOffsets={setOffsets} activeComponent={activeComponentForTuning} />}
      
      <nav className="border-b border-white/5 px-4 lg:px-8 py-2 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4 pl-2">
          <img src="/design/Logo.png" alt="Logo" className="h-4 lg:h-6 w-auto object-contain" />
        </div>
        <div className="flex items-center gap-6"><div className="text-zinc-400 font-mono text-[7px] pr-2 opacity-70 uppercase tracking-widest italic">Build by Vasile & AI</div></div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 pt-2 lg:pt-3">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 lg:h-[550px] items-stretch">
          <div className="lg:col-span-9 flex flex-col gap-2 order-1">
            <div className="flex overflow-x-auto no-scrollbar lg:overflow-visible lg:flex-wrap justify-start items-center px-4 gap-x-6 gap-y-2 pb-2">
              {steps.map((step, idx) => (
                <button key={step.id} ref={el => stepRefs.current[idx] = el} onClick={() => { setCurrentStepIndex(idx); setError(null); }} 
                  className={cn("transition-all duration-300 text-[10px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap", 
                  idx === currentStepIndex ? "text-red-600 border-red-600 drop-shadow-[0_0_9px_rgba(255,0,0,0.3)]" : "text-white opacity-20 border-transparent hover:opacity-100")}
                >{step.title}</button>
              ))}
            </div>
            <div className="h-[280px] md:h-[400px] lg:flex-1"><Visualizer selectedComponents={selectedComponents} offsets={offsets} /></div>
          </div>
          <div className="lg:col-span-3 flex flex-col bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-4 lg:p-6 relative overflow-hidden order-2">
            <style>{`.custom-scroll-container::-webkit-scrollbar {height: 3px;}.custom-scroll-container::-webkit-scrollbar-track {background: rgba(255, 255, 255, 0.05);}.custom-scroll-container::-webkit-scrollbar-thumb {background: #ef4444;border-radius: 10px;}.custom-scroll-container {scrollbar-width: thin;scrollbar-color: #ef4444 rgba(255, 255, 255, 0.05);}`}</style>
            <div ref={listRef} className="flex-1 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden custom-scroll-container pb-2 lg:pb-0" style={{ display: 'flex', flexDirection: 'column' }}>
                {error && <div className="mb-4 text-red-500 bg-red-600/10 p-2 rounded-lg text-[9px] font-bold uppercase">{error}</div>}
                <div className="flex flex-row lg:flex-col gap-3 min-w-full">
                  <AnimatePresence mode="popLayout">
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="w-[31%] min-w-[31%] lg:w-full lg:min-w-0 shrink-0">
                        <OptionCard component={option} isSelected={selections[currentStep.id] === option.id} onClick={() => { setSelections(prev => ({...prev, [currentStep.id]: option.id})); setError(null); }} />
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
          <div className="col-span-3 lg:col-span-2">
            <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="flex items-center gap-1 lg:gap-3 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] tracking-widest italic">
              <ChevronLeft size={20} /> Back
            </button>
          </div>
          <div className="col-span-6 lg:col-span-7 flex justify-center lg:justify-end items-center gap-4 lg:gap-10">
            <div className="text-center lg:text-right">
              <p className="text-[7px] lg:text-[8px] text-zinc-600 uppercase font-black mb-0.5 italic">Weight</p>
              <p className="font-mono text-xs lg:text-sm tracking-tighter">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p>
            </div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center lg:text-right">
              <p className="text-[7px] lg:text-[8px] text-zinc-600 uppercase font-black mb-0.5 italic">Price</p>
              <p className="font-mono text-xs lg:text-sm text-red-600 tracking-tighter">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p>
            </div>
          </div>
          <div className="col-span-3 flex justify-end">
            <button onClick={() => {
                if (currentStep.options.length > 0 && !selections[currentStep.id]) { setError("Select!"); return; }
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
              }} className="bg-red-600 hover:bg-red-700 text-white h-[32px] px-3 lg:px-[22px] rounded-lg font-black uppercase text-[10px] tracking-widest flex items-center gap-1 lg:gap-3 transition-all active:scale-95 shadow-lg shadow-red-600/20 italic"
            >{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} /></button>
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
    try { const logoBase64 = await getBase64Image("/design/Logo.png");
      if (logoBase64) { doc.saveGraphicsState(); (doc as any).setGState(new (doc as any).GState({ opacity: 0.8 })); doc.addImage(logoBase64, 'PNG', (pageWidth / 2) - 15, 8, 10, 10); doc.restoreGraphicsState(); }
    } catch (e) {}
    try { const sortedByZ = [...selections].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      for (const comp of sortedByZ) { if (comp.imageUrl) { const imgBase64 = await getBase64Image(comp.imageUrl); if (imgBase64) doc.addImage(imgBase64, 'PNG', 15, 22, 180, 115, undefined, 'FAST'); } }
    } catch (e) {}
    autoTable(doc, { startY: 140, head: [['SECTION', 'COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
      body: selections.map((c: any) => [cleanText(c.stepTitle || ""), cleanText(c.name), cleanText(c.brand), `${c.weight} g`, `${c.price.toLocaleString()} €`]),
      styles: { font: "helvetica", fontSize: 5.8, cellPadding: 2 }, headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25 } }, foot: [['TOTAL', '', '', `${totalWeight} g`, `${totalPrice.toLocaleString()} €`]],
      footStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255], fontSize: 9, fontStyle: 'bold', cellPadding: 3 }, theme: 'grid'
    });
    const finalY = (doc as any).lastAutoTable.finalY + 10; doc.setFontSize(5.6); doc.setTextColor(140);
    doc.text(doc.splitTextToSize("NOTICE: THE WEIGHT AND PRICE INDICATED ARE PRELIMINARY AND SUBJECT TO MINOR CHANGES BASED ON COMPONENT AVAILABILITY. ADICTO.BIKE RESERVES THE RIGHT TO MODIFY SPECIFICATIONS WITHOUT PRIOR NOTICE.", pageWidth - 28), 14, finalY);
    doc.setFontSize(6.3); doc.setTextColor(100); doc.text("WWW.ADICTO.BIKE  |  @ADICTO.BIKE", pageWidth / 2, pageHeight - 20, { align: 'center' });
    doc.save(`ADICTO_BUILD.pdf`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <CheckCircle2 size={32} className="text-red-600 mx-auto mb-4" /> 
        <h2 className="text-[27px] font-black italic uppercase tracking-tighter mb-4 leading-none">Configuration <br/> <span className="text-red-600">Complete</span></h2>
        <div className="flex justify-center gap-10 my-8 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
          <div><p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest italic">Price</p><p className="text-[18px] font-mono text-red-600">€{totalPrice.toLocaleString()}</p></div>
          <div className="w-px bg-white/10" />
          <div><p className="text-zinc-500 text-[9px] uppercase font-bold tracking-widest italic">Weight</p><p className="text-[18px] font-mono">{totalWeight}g</p></div>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={handleExport} className="px-8 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all flex items-center gap-2 italic shadow-lg shadow-red-600/20"><Download size={16} /> Export PDF</button>
          <button onClick={onReset} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all italic">Start Over</button>
        </div>
      </motion.div>
    </div>
  );
}
