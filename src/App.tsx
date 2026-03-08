import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Download, CheckCircle2, Upload, Database, 
  Lock, User as UserIcon, Settings2, Save, RotateCcw, Grid3X3, Search, 
  Move, FolderOpen, Key, Eye, EyeOff, LogOut, ArrowRight, ChevronsRight,
  LogIn, Trash2, Edit3, Scale, X, Smartphone, Mail, FileText
} from 'lucide-react';
import { cn } from './lib/utils';

import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

// --- TYPES ---
interface Component {
  id: string; name: string; brand: string; price: number; weight: number;
  description: string; imageUrl: string; cardImageUrl: string;
  zIndex: number; stepTitle?: string; logic: string;
}

interface Step { id: string; title: string; options: Component[]; }

interface OffsetData { s: number; x: number; y: number; }

interface SavedBuild {
  id: string; name: string; date: string; components: Component[];
  totalPrice: number; totalWeight: number;
}

// --- GLOBAL CONSTANTS ---
const INITIAL_STEPS: Step[] = [ { id: 'frame', title: 'Frame', options: [] }, { id: 'wheelset', title: 'Wheelset', options: [] }, { id: 'tyres', title: 'Tyres', options: [] }, { id: 'cockpit', title: 'Cockpit', options: [] }, { id: 'tape', title: 'Tape', options: [] }, { id: 'saddle', title: 'Saddle', options: [] }, { id: 'shifters', title: 'Shifters', options: [] }, { id: 'crankset', title: 'Crankset', options: [] }, { id: 'derailleurs', title: 'Derailleurs', options: [] }, { id: 'cassette', title: 'Cassette', options: [] }, { id: 'discs', title: 'Discs', options: [] } ];

// --- HELPER COMPONENTS (PREVENTS ReferenceError) ---

const OptionCard = ({ component, isSelected, onClick }: { component: Component, isSelected: boolean, onClick: () => void }) => (
  <motion.button layout onClick={(e) => { e.preventDefault(); onClick(); }} className={cn("relative flex flex-col p-2 lg:p-3 rounded-xl lg:rounded-2xl border text-left transition-all group w-full shrink-0", isSelected ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900")}>
    <div className="aspect-square w-full rounded-lg lg:rounded-xl bg-black/40 mb-2 lg:mb-3 overflow-hidden relative">
      <img src={component.cardImageUrl} alt={component.name} className="w-full h-full object-contain p-1 lg:p-2 group-hover:scale-110 transition duration-500" />
      {isSelected && <div className="absolute top-1 lg:top-2 right-1 lg:right-2 bg-red-600 p-1 lg:p-1.5 rounded-full shadow-lg z-10"><CheckCircle2 size={10} className="text-white" /></div>}
    </div>
    <div className="flex-1 flex flex-col justify-between overflow-hidden text-white">
      <div>
        <h3 className="text-[6.5px] lg:text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 uppercase">{component.name}</h3>
        <p className="text-[6px] lg:text-[9px] text-zinc-500 uppercase font-black">{component.brand}</p>
      </div>
      <div className="flex justify-between items-end mt-1 lg:mt-2">
        <p className="font-mono text-[10px] lg:text-sm text-red-600 tracking-tighter">€{component.price.toLocaleString()}</p>
        <p className="text-[9px] lg:text-sm text-zinc-600 font-mono italic">{component.weight}g</p>
      </div>
    </div>
  </motion.button>
);

const Visualizer = ({ selectedComponents, offsets, showGrid, gridSize, isZoomed, zoomScale }: any) => (
  <div id="bike-visualizer" className="relative w-full h-full bg-zinc-950 rounded-[1.5rem] lg:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center cursor-crosshair">
    {showGrid && <div className="absolute inset-0 z-[60] pointer-events-none opacity-[0.2]" style={{ backgroundImage: `linear-gradient(to right, rgba(255,255,255,0.5) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.5) 1px, transparent 1px)`, backgroundSize: `${gridSize}px ${gridSize}px` }} />}
    <motion.div drag={isZoomed} dragMomentum={false} dragConstraints={{ left: -2500, right: 2500, top: -2500, bottom: 2500 }} animate={{ scale: isZoomed ? (zoomScale || 5) : 1, x: isZoomed ? undefined : 0, y: isZoomed ? undefined : 0 }} transition={{ type: 'spring', damping: 25, stiffness: 120 }} className="relative w-full h-full flex items-center justify-center">
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

// --- LUXE AUTH MODAL ---
const AuthModal = ({ isOpen, onClose, onLogin }: any) => {
  const [step, setStep] = useState('email'); 
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);
  if (!isOpen) return null;
  const handleNext = () => {
    if (step === 'email' && email.includes('@')) setStep('otp');
    else if (step === 'otp') onLogin({ email, name: email.split('@')[0] });
  };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl text-white font-sans">
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><X size={16}/></button>
        <div className="text-center mb-10">
          <h2 className="text-lg font-black uppercase italic tracking-widest mb-1">Identification</h2>
          <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.3em]">{step === 'email' ? 'Access your adicto garage' : `Sent to ${email}`}</p>
        </div>
        {step === 'email' ? (
          <div className="space-y-6">
            <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-red-600/50 transition-all font-mono text-[11px]" />
            <div className="grid grid-cols-2 gap-2 text-white">
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all text-[8px] font-black uppercase tracking-tighter"><Smartphone size={12}/> Apple ID</button>
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all text-[8px] font-black uppercase tracking-tighter"><Mail size={12}/> Google</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-3 mb-10 text-black">
            {otp.map((digit, i) => (
              <input key={i} type="text" maxLength={1} value={digit} onChange={e => {
                const newOtp = [...otp]; newOtp[i] = e.target.value; setOtp(newOtp);
                if (e.target.nextSibling && e.target.value) (e.target.nextSibling as HTMLElement).focus();
              }} className="w-10 h-14 bg-black border border-white/5 rounded-xl text-center text-sm font-mono font-bold text-red-600 outline-none focus:border-red-600 shadow-inner" />
            ))}
          </div>
        )}
        <button onClick={handleNext} className="w-full bg-red-600 py-4 rounded-xl font-black uppercase text-white mt-4 text-[10px] tracking-[0.2em] italic hover:bg-red-700 transition-all">Continue</button>
      </motion.div>
    </div>
  );
};

// --- USER DASHBOARD (GARAGE) ---
const UserDashboard = ({ builds, onEdit, onDelete, onClose, onLogout, onPDF }: any) => {
  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 selection:bg-red-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-16 text-white">
            <div className="leading-tight">
              <h2 className="text-xs font-black uppercase tracking-widest">My Adicto</h2>
              <h1 className="text-xs font-black uppercase tracking-widest text-red-600 leading-none mt-1">Garage</h1>
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={onLogout} className="text-zinc-500 hover:text-red-600 transition-colors uppercase text-[9px] font-black flex items-center gap-2">Logout <LogOut size={14}/></button>
              <button onClick={onClose} className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition-colors"><X size={18}/></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((b: SavedBuild) => (
              <div key={b.id} className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all group relative">
                <div className="flex justify-between items-start mb-4 text-zinc-500 font-bold uppercase text-[8px] tracking-tighter italic">
                   <span>Bike ID: {b.id.slice(-4)}</span>
                   <span>{b.date}</span>
                </div>
                <button onClick={() => onEdit(b)} className="text-lg font-black uppercase italic mb-1 hover:text-red-600 transition-colors text-left block leading-tight text-white">
                  {b.name.replace(/adicto_/gi, '')}
                </button>
                <div className="mb-6">
                  <p className="text-[7px] text-zinc-600 uppercase font-black mb-1 italic tracking-widest">Configuration:</p>
                  <p className="text-[8px] text-zinc-500 uppercase leading-tight line-clamp-3 italic font-medium">
                    {b.components.map(c => `${c.brand}`).join(' • ')}
                  </p>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-auto">
                  <div><p className="text-[7px] font-black uppercase text-zinc-600 tracking-tighter">Price</p><p className="font-mono text-xs text-red-600 font-bold">€{b.totalPrice.toLocaleString()}</p></div>
                  <div className="flex gap-4">
                    <button onClick={() => onPDF(b)} className="text-zinc-600 hover:text-white transition-colors"><FileText size={14}/></button>
                    <button onClick={() => onDelete(b.id)} className="text-zinc-600 hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="p-10 border-t border-white/5 text-center bg-black text-zinc-600">
        <p className="text-[8px] font-bold uppercase tracking-[0.3em] mb-2 text-zinc-700">Powered by Adicto.Bike All Right Reserved</p>
        <p className="text-[8px] font-bold uppercase tracking-[0.1em]">Please contact us if you have any questions or bugs (баг) — hello@adicto.bike</p>
      </div>
    </div>
  );
};

// --- MAIN BIKE CONFIGURATOR ---

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

  // User Client States
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('adicto_user') || 'null'));
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(JSON.parse(localStorage.getItem('adicto_saved_builds') || '[]'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const stepsNavRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[currentStepIndex] || steps[0];

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
            return { ...step, options: data.map((row: any, idx: number) => ({
              id: `${step.id}-${idx}`, name: row.Name || 'Unknown', brand: row.Brand || '', price: Number(row.Price || row.PRICE) || 0, weight: Number(row.Weight || row.WEIGHT) || 0, imageUrl: row['imageurl'] || row['image'] || row['Image'] || "", cardImageUrl: row['cardimg'] || row['cardimage'] || row['imageurl'] || "", zIndex: Number(row['zindex']) || 10, logic: String(row['logic'] || "").trim()
            }))};
          } return step;
        }); setSteps(newSteps);
      } catch (err) {}
    }; autoLoadExcel();
  }, []);

  useEffect(() => {
    if (stepsNavRef.current) {
      const activeBtn = stepsNavRef.current.children[currentStepIndex] as HTMLElement;
      if (activeBtn) stepsNavRef.current.scrollTo({ left: activeBtn.offsetLeft - 20, behavior: 'smooth' });
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
    if (!currentStep) return [];
    return currentStep.options.filter(opt => !activeLogic || !opt.logic || opt.logic.trim() === "" || opt.logic.trim() === activeLogic);
  }, [currentStep, activeLogic]);

  const selectedComponents = useMemo(() => steps.map(s => {
    const opt = s.options.find(o => o.id === selections[s.id]);
    return opt ? { ...opt, stepTitle: s.title } : null;
  }).filter((c): c is Component => !!c), [selections, steps]);

  const handleEditFromGarage = (b: SavedBuild) => {
    const newS: any = {};
    let missing = false;
    b.components.forEach(c => {
      const step = steps.find(s => s.title === c.stepTitle);
      const option = step?.options.find(o => o.name === c.name);
      if (option) newS[step!.id] = option.id; else missing = true;
    });
    if (missing) alert("Sorry, some components are no longer available. You need to restart the build process.");
    setSelections(newS); setIsDashboardOpen(false); setIsFinished(false); setCurrentStepIndex(0);
  };

  const handleLogout = () => {
    localStorage.removeItem('adicto_user');
    setUser(null);
    setIsDashboardOpen(false);
  };

  if (isAdminMode && !isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  
  if (isDashboardOpen) return <UserDashboard builds={savedBuilds} onClose={() => setIsDashboardOpen(false)} onLogout={handleLogout} onDelete={(id: string) => { const upd = savedBuilds.filter(x => x.id !== id); setSavedBuilds(upd); localStorage.setItem('adicto_saved_builds', JSON.stringify(upd)); }} onEdit={handleEditFromGarage} onPDF={(b: any) => {
    const doc = new jsPDF(); doc.text(`ADICTO CONFIGURATION: ${b.name}`, 10, 10);
    autoTable(doc, { startY: 20, head: [['Section', 'Brand', 'Weight', 'Price']], body: b.components.map((c:any) => [c.stepTitle, c.brand, `${c.weight}g`, `€${c.price}`]) });
    doc.save(`${b.name}.pdf`);
  }} />;

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} user={user} onLogin={() => setIsAuthModalOpen(true)} onDashboard={() => setIsDashboardOpen(true)} onSaveBuild={() => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const newBuild = { id: Date.now().toString(), name: `${selectedComponents[0]?.brand || 'Bike'} Configuration`, date: new Date().toLocaleDateString(), components: selectedComponents, totalPrice: selectedComponents.reduce((acc,c)=>acc+c.price,0), totalWeight: selectedComponents.reduce((acc,c)=>acc+c.weight,0) };
    const updated = [...savedBuilds, newBuild]; setSavedBuilds(updated); localStorage.setItem('adicto_saved_builds', JSON.stringify(updated)); alert("Saved!");
  }} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-28 lg:pb-24 overflow-x-hidden">
      <style>{`
        .custom-scroll-container::-webkit-scrollbar, .steps-scroll-container::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll-container::-webkit-scrollbar-track, .steps-scroll-container::-webkit-scrollbar-track { background: rgba(255, 255, 255, 0.05); border-radius: 10px; }
        .custom-scroll-container::-webkit-scrollbar-thumb, .steps-scroll-container::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
        .custom-scroll-container, .steps-scroll-container { scrollbar-width: thin; scrollbar-color: #ef4444 rgba(255, 255, 255, 0.05); }
        @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        .animate-bounce-x { animation: bounce-x 1s infinite; }
      `}</style>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(u: any) => { setUser(u); localStorage.setItem('adicto_user', JSON.stringify(u)); setIsAuthModalOpen(false); }} />

      {isLoggedIn ? (
        <AdminPanel categories={INITIAL_STEPS.map(s => s.title)} offsets={offsets} setOffsets={setOffsets} activeComponent={currentStep?.options.find(o => o.id === selections[currentStep?.id])} showGrid={showGrid} setShowGrid={setShowGrid} gridSize={gridSize} setGridSize={setGridSize} isZoomed={isZoomed} setIsZoomed={setIsZoomed} zoomScale={zoomScale} setZoomScale={setZoomScale} onLogout={() => setIsLoggedIn(false)} />
      ) : (
        <nav className="border-b border-white/5 px-4 lg:px-8 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
          <div className="flex items-center gap-3">
            <img src="/design/Logo.png" alt="Logo" className="h-5 lg:h-6 w-auto object-contain" />
            <div className="text-zinc-600 font-mono text-[6px] lg:text-[7px] uppercase tracking-widest italic border-l border-white/10 pl-3">Build by Vasile & AI</div>
          </div>
          <div className="flex gap-4">
            {user ? (
              <button onClick={() => setIsDashboardOpen(true)} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 text-white hover:bg-white/10 transition-all">
                <UserIcon size={12} className="text-red-600"/> <span className="text-[9px] font-black uppercase italic">{user.name}</span>
              </button>
            ) : <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest text-white shadow-lg shadow-red-600/20 transition-all active:scale-95"><LogIn size={12}/> Login</button>}
          </div>
        </nav>
      )}

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 pt-2 lg:pt-3">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-1 lg:h-[550px] items-stretch">
          <div className="lg:col-span-9 flex flex-col gap-1 order-1">
            <div ref={stepsNavRef} className="flex overflow-x-auto no-scrollbar steps-scroll-container gap-x-6 gap-y-2 pb-2">
              {steps.map((step, idx) => (
                <button key={step.id} onClick={() => setCurrentStepIndex(idx)} className={cn("transition-all duration-300 text-[10px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap", idx === currentStepIndex ? "text-red-600 border-red-600 drop-shadow-[0_0_9px_rgba(255,0,0,0.3)]" : "text-white opacity-20 border-transparent hover:opacity-100")}>{step.title}</button>
              ))}
            </div>
            <div className="h-[250px] md:h-[400px] lg:flex-1 relative"><Visualizer selectedComponents={selectedComponents} offsets={offsets} showGrid={showGrid} gridSize={gridSize} isZoomed={isZoomed} zoomScale={zoomScale} /></div>
          </div>
          <div className="lg:col-span-3 flex flex-col bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-4 lg:p-6 relative overflow-hidden order-2 shadow-2xl">
            <div className="flex-1 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden custom-scroll-container pb-2 lg:pb-0" style={{ display: 'flex', flexDirection: 'column' }}>
                <div className="flex flex-row lg:flex-col gap-3 min-w-full">
                  <AnimatePresence mode="popLayout">
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="w-[31%] min-w-[31%] lg:w-full lg:min-w-0 shrink-0">
                        <OptionCard component={option} isSelected={selections[currentStep.id] === option.id} onClick={() => setSelections(prev => ({...prev, [currentStep.id]: option.id}))} />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
            </div>
            {filteredOptions.length > 3 && (
              <div className="lg:hidden mt-2 flex items-center justify-center gap-1.5 text-zinc-600 opacity-60">
                <span className="text-[7px] font-black uppercase italic tracking-widest">Scroll for more</span>
                <ChevronsRight size={8} className="animate-bounce-x" />
              </div>
            )}
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-3xl border-t border-white/5 z-40 py-4 px-6">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between text-white">
          <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic w-20 text-left flex items-center gap-1"><ChevronLeft size={18} /> Back</button>
          
          <div className="flex gap-6 items-center justify-center flex-1">
            <div className="text-center"><p className="text-[6px] text-zinc-600 uppercase font-black italic tracking-tighter">Weight</p><p className="font-mono text-xs">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p></div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center"><p className="text-[6px] text-zinc-600 uppercase font-black italic tracking-tighter">Price</p><p className="font-mono text-xs text-red-600 font-bold">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p></div>
          </div>

          <div className="w-20 flex justify-end">
            <button onClick={() => {
                if (filteredOptions.length > 0 && !selections[currentStep.id]) return;
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
            }} className="bg-red-600 text-white p-2.5 rounded-xl font-black active:scale-95 shadow-lg shadow-red-600/30 transition-all hover:bg-red-700">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- FINAL SCREEN ---
function SummaryView({ selections, onReset, user, onSaveBuild, onLogin, onDashboard }: any) {
  const [isExporting, setIsExporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);

  const handleExport = async () => {
    setIsExporting(true); setProgress(0);
    const interval = setInterval(() => {
      setProgress(p => {
        if (p >= 100) { 
            clearInterval(interval); 
            const doc = new jsPDF();
            autoTable(doc, { 
              startY: 135, head: [['SECTION', 'BRAND', 'WEIGHT', 'PRICE']],
              body: selections.map((c: any) => [c.stepTitle, c.brand, `${c.weight}g`, `€${c.price}`]),
              theme: 'grid'
            });
            doc.save('ADICTO_BIKE.pdf');
            setTimeout(() => { setIsExporting(false); setProgress(0); }, 500);
            return 100;
        } return p + 10;
      });
    }, 100);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans overflow-y-auto">
       <div className="absolute top-8 right-8 flex items-center gap-4">
        {user ? (
          <button onClick={onDashboard} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase italic transition-all hover:bg-white/10">
            <UserIcon size={12} className="text-red-600"/> Garage
          </button>
        ) : <button onClick={onLogin} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase italic transition-all hover:bg-white/10"><LogIn size={12}/> Login</button>}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <img src="/design/Logo.png" alt="Logo" className="w-10 h-10 mx-auto mb-10 object-contain" />
        <h2 className="text-[26px] font-black uppercase italic tracking-tighter mb-4 leading-none text-white/90">your bike is <br/> <span className="text-red-600 uppercase">Ready</span></h2>
        
        <div className="flex justify-center gap-10 my-10 bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div><p className="text-zinc-600 text-[8px] uppercase font-black italic mb-1 text-zinc-500 tracking-widest uppercase">Price</p><p className="text-xl font-mono text-red-600 tracking-tighter font-black italic">€{totalPrice.toLocaleString()}</p></div>
          <div className="w-px bg-white/5" />
          <div><p className="text-zinc-600 text-[8px] uppercase font-black italic mb-1 text-zinc-500 tracking-widest uppercase">Weight</p><p className="text-xl font-mono text-white/80 tracking-tighter font-black italic">{totalWeight}g</p></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={handleExport} disabled={isExporting} style={{ background: isExporting ? `linear-gradient(to right, #ef4444 ${progress}%, #18181b ${progress}%)` : '' }} className={cn("px-8 py-4 rounded-xl font-black uppercase text-[10px] italic transition-all flex items-center justify-center gap-2 relative overflow-hidden shadow-lg shadow-red-600/10", isExporting ? "border border-red-600/30 text-white" : "bg-red-600 hover:bg-red-700 active:scale-95")}>
            <Download size={14} /> {isExporting ? `Exporting ${progress}%` : 'Export PDF'}
          </button>
          <button onClick={onSaveBuild} className="px-8 py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] italic flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"><Save size={14} /> Save Build</button>
          <button onClick={onReset} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] italic text-zinc-500 hover:text-white transition-all active:scale-95">Start Over</button>
        </div>
      </motion.div>
    </div>
  );
}
