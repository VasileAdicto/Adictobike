import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ChevronLeft, ChevronRight, Download, CheckCircle2, Upload, Database, 
  Lock, User as UserIcon, Settings2, Save, RotateCcw, Grid3X3, Search, 
  Move, FolderOpen, Key, Eye, EyeOff, LogOut, ArrowRight, ChevronsRight,
  LogIn, Trash2, Edit3, Scale, X, Smartphone, Mail
} from 'lucide-react';
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

interface OffsetData { s: number; x: number; y: number; }

interface SavedBuild {
  id: string;
  name: string;
  date: string;
  components: Component[];
  totalPrice: number;
  totalWeight: number;
}

// --- LUXURY AUTH MODAL COMPONENT ---
const AuthModal = ({ isOpen, onClose, onLogin }: any) => {
  const [step, setStep] = useState('email'); // email, otp
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState(['', '', '', '']);

  if (!isOpen) return null;

  const handleNext = () => {
    if (step === 'email' && email.includes('@')) setStep('otp');
    else if (step === 'otp') onLogin({ email, name: email.split('@')[0] });
  };

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.98, opacity: 0 }} 
        animate={{ scale: 1, opacity: 1 }} 
        className="bg-zinc-900/90 border border-white/5 p-10 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl"
      >
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors">
          <X size={16}/>
        </button>
        
        <div className="text-center mb-10">
          <h2 className="text-lg font-black uppercase italic text-white tracking-widest mb-1">
            {step === 'email' ? 'Identification' : 'Verification'}
          </h2>
          <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.3em]">
            {step === 'email' ? 'Access your adicto garage' : `Sent to ${email}`}
          </p>
        </div>

        {step === 'email' ? (
          <div className="space-y-6">
            <div className="relative">
              <input 
                type="email" 
                placeholder="EMAIL ADDRESS" 
                value={email} 
                onChange={e => setEmail(e.target.value)} 
                className="w-full bg-black/50 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-red-600/50 transition-all font-mono text-[11px] placeholder:text-zinc-700" 
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all text-[8px] font-black text-zinc-400 hover:text-white uppercase tracking-tighter">
                <Smartphone size={12}/> Apple ID
              </button>
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all text-[8px] font-black text-zinc-400 hover:text-white uppercase tracking-tighter">
                <Mail size={12}/> Google
              </button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-3 mb-10">
            {otp.map((digit, i) => (
              <input 
                key={i} 
                type="text" 
                maxLength={1} 
                value={digit} 
                onChange={e => {
                  const newOtp = [...otp]; 
                  newOtp[i] = e.target.value; 
                  setOtp(newOtp);
                  if (e.target.nextSibling && e.target.value) (e.target.nextSibling as HTMLElement).focus();
                }} 
                className="w-10 h-14 bg-black border border-white/5 rounded-xl text-center text-sm font-mono font-bold text-red-600 outline-none focus:border-red-600 transition-colors shadow-inner" 
              />
            ))}
          </div>
        )}

        <button 
          onClick={handleNext} 
          className="w-full bg-red-600 py-4 rounded-xl font-black uppercase text-white mt-4 hover:bg-red-700 active:scale-95 transition-all italic tracking-[0.2em] text-[10px] shadow-lg shadow-red-600/10"
        >
          {step === 'email' ? 'Request Code' : 'Confirm Access'}
        </button>
      </motion.div>
    </div>
  );
};

// --- USER DASHBOARD ---
const UserDashboard = ({ builds, onEdit, onDelete, onClose }: any) => {
  const [selectedForCompare, setSelectedForCompare] = useState<string[]>([]);
  const [view, setView] = useState('list'); // list, compare

  const toggleCompare = (id: string) => {
    setSelectedForCompare(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : prev.length < 5 ? [...prev, id] : prev
    );
  };

  const compareBuilds = builds.filter((b: any) => selectedForCompare.includes(b.id));

  return (
    <div className="min-h-screen bg-black text-white p-6 lg:p-12 font-sans overflow-y-auto selection:bg-red-600">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black italic uppercase tracking-tighter">My Garage</h1>
            <p className="text-zinc-500 font-bold uppercase text-[10px] tracking-[0.3em]">Stored Configurations</p>
          </div>
          <div className="flex gap-4">
            {selectedForCompare.length > 1 && (
              <button onClick={() => setView(view === 'compare' ? 'list' : 'compare')} className="bg-white text-black px-6 py-2 rounded-full font-black uppercase text-[10px] italic flex items-center gap-2">
                <Scale size={14}/> {view === 'compare' ? 'Back to List' : `Compare (${selectedForCompare.length})`}
              </button>
            )}
            <button onClick={onClose} className="bg-zinc-800 p-2 rounded-full hover:bg-zinc-700"><X size={20}/></button>
          </div>
        </div>

        {view === 'list' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((build: SavedBuild) => (
              <div key={build.id} className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 hover:border-red-600/30 transition-all group">
                <div className="flex justify-between items-start mb-4">
                  <div onClick={() => toggleCompare(build.id)} className={cn("w-6 h-6 rounded-full border-2 flex items-center justify-center cursor-pointer transition-all", selectedForCompare.includes(build.id) ? "bg-red-600 border-red-600" : "border-white/10")}>
                    {selectedForCompare.includes(build.id) && <CheckCircle2 size={14}/>}
                  </div>
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                    <button onClick={() => onEdit(build)} className="p-2 bg-zinc-800 rounded-lg hover:text-red-600 transition-colors"><Edit3 size={14}/></button>
                    <button onClick={() => onDelete(build.id)} className="p-2 bg-zinc-800 rounded-lg hover:text-red-600 transition-colors"><Trash2 size={14}/></button>
                  </div>
                </div>
                <h3 className="text-xl font-black uppercase italic mb-1">{build.name}</h3>
                <p className="text-[10px] text-zinc-500 mb-6 uppercase font-bold tracking-widest">{build.date}</p>
                <div className="flex justify-between items-end border-t border-white/5 pt-4">
                  <div><p className="text-[8px] text-zinc-600 uppercase font-black">Price</p><p className="font-mono text-red-600">€{build.totalPrice.toLocaleString()}</p></div>
                  <div className="text-right"><p className="text-[8px] text-zinc-600 uppercase font-black">Weight</p><p className="font-mono">{build.totalWeight}g</p></div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="overflow-x-auto bg-zinc-900/30 rounded-[2rem] border border-white/5 custom-scroll-container">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-white/5">
                  <th className="p-6 text-[10px] font-black text-zinc-600 uppercase">Feature</th>
                  {compareBuilds.map((b: any) => <th key={b.id} className="p-6 text-xl font-black italic uppercase text-red-600">{b.name}</th>)}
                </tr>
              </thead>
              <tbody>
                <tr className="border-b border-white/5">
                  <td className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Total Price</td>
                  {compareBuilds.map((b: any) => <td key={b.id} className="p-6 font-mono text-sm">€{b.totalPrice.toLocaleString()}</td>)}
                </tr>
                <tr className="border-b border-white/5">
                  <td className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">Total Weight</td>
                  {compareBuilds.map((b: any) => <td key={b.id} className="p-6 font-mono text-sm text-red-500">{b.totalWeight}g</td>)}
                </tr>
                {INITIAL_STEPS.map(step => (
                  <tr key={step.id} className="border-b border-white/5">
                    <td className="p-6 text-[10px] font-black uppercase text-zinc-400 tracking-widest">{step.title}</td>
                    {compareBuilds.map((b: any) => {
                      const comp = b.components.find((c: any) => c.stepTitle === step.title);
                      return <td key={b.id} className="p-6 text-[10px] uppercase font-bold text-zinc-300 tracking-tighter">{comp?.name || '-'}</td>
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
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
    if (!files) return;
    const fileArray = Array.from(files);
    setStatus(`⏳ 0/${fileArray.length}`);
    for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        const reader = new FileReader();
        reader.readAsDataURL(file);
        const result = await new Promise((resolve) => { reader.onload = () => resolve(reader.result); });
        const content = (result as string).split(',')[1];
        const fileName = isFolder ? (file as any).webkitRelativePath : file.name;
        const path = selectedCat === 'excel' ? "public/data.xlsx" : `public/parts/${selectedCat}/${fileName}`;
        await saveToGithub(path, content);
        setStatus(`⏳ ${i+1}/${fileArray.length}`);
    }
    setStatus("✅ Done");
    setTimeout(() => setStatus(''), 3000);
    e.target.value = "";
  };

  return (
    <div className="z-[100] sticky top-0 shadow-2xl font-sans text-white">
      <motion.div initial={{ y: -50 }} animate={{ y: 0 }} className="bg-zinc-900 border-b border-white/5 p-2 flex gap-3 items-center justify-center backdrop-blur-md">
        <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg border border-white/10 focus-within:border-red-600 transition-all">
          <Key size={10} className={token ? "text-red-600" : "text-zinc-500"} />
          <input type={showToken ? "text" : "password"} placeholder="TOKEN" value={token} onChange={(e) => setToken(e.target.value)} className="bg-transparent text-[9px] w-20 outline-none font-mono uppercase text-white" />
          <button onClick={() => setShowToken(!showToken)}>{showToken ? <EyeOff size={10}/> : <Eye size={10}/>}</button>
        </div>
        <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="bg-black border border-white/10 text-[9px] px-2 py-1 rounded uppercase font-bold outline-none focus:border-red-600 transition-all text-white">
          <option value="excel">📁 EXCEL</option>
          {categories?.map((cat: string) => <option key={cat} value={cat}>🖼️ {cat.toUpperCase()}</option>)}
        </select>
        <div className="flex gap-1">
          <label className="cursor-pointer bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase hover:bg-zinc-700 flex items-center gap-1 italic"><Upload size={10}/> Files<input type="file" className="hidden" multiple onChange={(e) => handleUpload(e, false)} /></label>
          <label className="cursor-pointer bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase hover:bg-zinc-700 flex items-center gap-1 italic"><FolderOpen size={10}/> Folder<input type="file" className="hidden" webkitdirectory="" onChange={(e: any) => handleUpload(e, true)} /></label>
        </div>
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
    <div className="flex-1 flex flex-col justify-between overflow-hidden"><div><h3 className="text-[6.5px] lg:text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 text-zinc-300 uppercase">{component.name}</h3><p className="text-[6px] lg:text-[9px] text-zinc-500 uppercase font-black">{component.brand}</p></div><div className="flex justify-between items-end mt-1 lg:mt-2"><p className="font-mono text-[10px] lg:text-sm text-red-600 tracking-tighter">€{component.price.toLocaleString()}</p><p className="text-[9px] lg:text-sm text-zinc-600 font-mono italic">{component.weight}g</p></div></div>
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

  // AUTH & DASHBOARD STATES
  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('adicto_user') || 'null'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(JSON.parse(localStorage.getItem('adicto_saved_builds') || '[]'));

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
            return { ...step, options: data.map((row: any, idx: number) => {
              const findKey = (name: string) => Object.keys(row).find(k => k.toLowerCase().trim() === name.toLowerCase());
              return { id: `${step.id}-${idx}`, name: row.Name || 'Unknown', brand: row.Brand || '', price: Number(row.Price || row.PRICE) || 0, weight: Number(row.Weight || row.WEIGHT) || 0, imageUrl: row[findKey('imageurl') || 'image'] || "", cardImageUrl: row[findKey('cardimg') || 'cardimage'] || row[findKey('imageurl') || 'image'] || "", zIndex: Number(row[findKey('zindex')]) || 10, logic: String(row[findKey('logic')] || "").trim() };
            })};
          } return step;
        }); setSteps(newSteps);
      } catch (err) {}
    }; autoLoadExcel();
  }, []);

  useEffect(() => {
    if (stepsNavRef.current) {
      const activeBtn = stepsNavRef.current.children[currentStepIndex] as HTMLElement;
      if (activeBtn) {
        stepsNavRef.current.scrollTo({ left: activeBtn.offsetLeft - 20, behavior: 'smooth' });
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
    if (!currentStep) return [];
    return currentStep.options.filter(opt => {
      if (!activeLogic) return true;
      if (!opt.logic || opt.logic.trim() === "") return true;
      return opt.logic.trim() === activeLogic;
    });
  }, [currentStep, activeLogic]);

  const selectedComponents = useMemo(() => steps.map(s => {
    const opt = s.options.find(o => o.id === selections[s.id]);
    return opt ? { ...opt, stepTitle: s.title } : null;
  }).filter((c): c is Component => !!c), [selections, steps]);

  const totalPrice = selectedComponents.reduce((acc, c) => acc + c.price, 0);
  const totalWeight = selectedComponents.reduce((acc, c) => acc + c.weight, 0);

  const handleSaveBuild = () => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const newBuild: SavedBuild = {
      id: Math.random().toString(36).substr(2, 9),
      name: `ADICTO ${selectedComponents[0]?.brand || 'BUILD'}`,
      date: new Date().toLocaleDateString(),
      components: selectedComponents,
      totalPrice,
      totalWeight
    };
    const updated = [...savedBuilds, newBuild];
    setSavedBuilds(updated);
    localStorage.setItem('adicto_saved_builds', JSON.stringify(updated));
    alert("Build Saved to Garage!");
  };

  const activeComponentForTuning = useMemo(() => currentStep?.options.find(o => o.id === selections[currentStep?.id]), [currentStep, selections]);

  if (isAdminMode && !isLoggedIn) return <AdminLogin onLogin={() => setIsLoggedIn(true)} />;
  if (isDashboardOpen) return <UserDashboard builds={savedBuilds} onClose={() => setIsDashboardOpen(false)} onDelete={(id: string) => {
    const updated = savedBuilds.filter(b => b.id !== id);
    setSavedBuilds(updated); localStorage.setItem('adicto_saved_builds', JSON.stringify(updated));
  }} onEdit={(build: SavedBuild) => {
    const newSelections: any = {};
    build.components.forEach(c => {
      const step = steps.find(s => s.title === c.stepTitle);
      if (step) newSelections[step.id] = c.id;
    });
    setSelections(newSelections);
    setIsDashboardOpen(false);
    setIsFinished(false);
  }} />;

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} user={user} onSaveBuild={handleSaveBuild} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-28 lg:pb-24 overflow-x-hidden">
      <style>{`
        .custom-scroll-container::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scroll-container::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
        @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        .animate-bounce-x { animation: bounce-x 1s infinite; }
      `}</style>

      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(u: any) => { setUser(u); localStorage.setItem('adicto_user', JSON.stringify(u)); setIsAuthModalOpen(false); }} />

      <nav className="border-b border-white/5 px-4 lg:px-8 py-4 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-6">
          <img src="/design/Logo.png" alt="Logo" className="h-6 w-auto" />
          <div className="text-zinc-500 font-mono text-[7px] uppercase tracking-[0.2em] italic mt-1 border-l border-white/10 pl-6 hidden md:block">Build by Vasile & AI</div>
        </div>
        <div className="flex items-center gap-4">
          {user ? (
            <button onClick={() => setIsDashboardOpen(true)} className="flex items-center gap-2 bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full transition-all border border-white/5">
              <UserIcon size={16} className="text-red-600"/>
              <span className="text-[10px] font-black uppercase italic">{user.name}</span>
            </button>
          ) : (
            <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 bg-red-600 px-5 py-2 rounded-full hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
              <LogIn size={16}/>
              <span className="text-[10px] font-black uppercase italic text-white">Login</span>
            </button>
          )}
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 pt-6">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:h-[600px] items-stretch">
          <div className="lg:col-span-9 flex flex-col gap-6 order-1">
            <div ref={stepsNavRef} className="flex overflow-x-auto no-scrollbar gap-x-8 gap-y-2 pb-4 border-b border-white/5">
              {steps.map((step, idx) => (
                <button key={step.id} onClick={() => setCurrentStepIndex(idx)} className={cn("transition-all duration-300 text-[10px] font-black italic uppercase tracking-widest pb-2 border-b-2 whitespace-nowrap", idx === currentStepIndex ? "text-red-600 border-red-600" : "text-white opacity-20 border-transparent hover:opacity-100")}>{step.title}</button>
              ))}
            </div>
            <div className="h-[300px] md:h-[450px] lg:flex-1 relative"><Visualizer selectedComponents={selectedComponents} offsets={offsets} showGrid={showGrid} gridSize={gridSize} isZoomed={isZoomed} zoomScale={zoomScale} /></div>
          </div>
          <div className="lg:col-span-3 flex flex-col bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-6 relative overflow-hidden order-2 shadow-2xl">
            <div className="flex-1 overflow-x-auto lg:overflow-y-auto lg:overflow-x-hidden custom-scroll-container">
                <div className="flex flex-row lg:flex-col gap-4 min-w-full">
                  <AnimatePresence mode="popLayout">
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="w-[31%] min-w-[31%] lg:w-full lg:min-w-0 shrink-0">
                        <OptionCard component={option} isSelected={selections[currentStep.id] === option.id} onClick={() => setSelections(prev => ({...prev, [currentStep.id]: option.id}))} />
                      </div>
                    ))}
                  </AnimatePresence>
                </div>
            </div>
          </div>
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-3xl border-t border-white/5 z-50 py-6 text-white">
        <div className="max-w-[1500px] mx-auto px-6 grid grid-cols-12 gap-2 items-center">
          <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="col-span-3 lg:col-span-2 flex items-center gap-2 text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic"><ChevronLeft size={20} /> Back</button>
          
          <div className="col-span-6 lg:col-span-8 flex justify-center items-center gap-6">
            <div className="text-center"><p className="text-[8px] text-zinc-600 uppercase font-black italic">Weight</p><p className="font-mono text-sm">{totalWeight}g</p></div>
            <div className="h-8 w-px bg-white/10" />
            <div className="text-center"><p className="text-[8px] text-zinc-600 uppercase font-black italic">Price</p><p className="font-mono text-sm text-red-600">€{totalPrice.toLocaleString()}</p></div>
          </div>

          <div className="col-span-3 lg:col-span-2 flex justify-end">
            <button onClick={() => {
                if (filteredOptions.length > 0 && !selections[currentStep.id]) return;
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
              }} className="bg-red-600 hover:bg-red-700 text-white h-[44px] px-8 rounded-2xl font-black uppercase text-[10px] italic flex items-center gap-2 active:scale-95 shadow-lg shadow-red-600/20">{currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryView({ selections, onReset, user, onSaveBuild }: any) {
  const [exportProgress, setExportProgress] = useState(0);
  const [isExporting, setIsExporting] = useState(false);
  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);
  
  const handleExport = async () => {
    setIsExporting(true); setExportProgress(10);
    const doc = new jsPDF(); 
    const pageWidth = doc.internal.pageSize.getWidth();
    setExportProgress(40);
    
    autoTable(doc, { 
      startY: 135, head: [['SECTION', 'COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
      body: selections.map((c: any) => [c.stepTitle, c.name, c.brand, `${c.weight} g`, `${c.price} €`]),
      theme: 'grid'
    });
    setExportProgress(80);
    
    setTimeout(() => {
      doc.save(`ADICTO_BUILD.pdf`);
      setExportProgress(100);
      setTimeout(() => { setIsExporting(false); setExportProgress(0); }, 500);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <img src="/design/Logo.png" alt="Logo" className="w-12 h-12 mx-auto mb-8 object-contain" />
        <h2 className="text-4xl font-black italic uppercase tracking-tighter mb-4 leading-none">Your Machine is <br/> <span className="text-red-600">Ready</span></h2>
        
        <div className="flex justify-center gap-12 my-12 bg-zinc-900/50 p-8 rounded-[3rem] border border-white/5">
          <div><p className="text-zinc-600 text-[10px] uppercase font-bold italic mb-2">Build Price</p><p className="text-2xl font-mono text-red-600">€{totalPrice.toLocaleString()}</p></div>
          <div className="w-px bg-white/10" />
          <div><p className="text-zinc-600 text-[10px] uppercase font-bold italic mb-2">Build Weight</p><p className="text-2xl font-mono">{totalWeight}g</p></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <button 
            onClick={handleExport} 
            disabled={isExporting}
            style={{
              background: isExporting 
                ? `linear-gradient(to right, #ef4444 ${exportProgress}%, #18181b ${exportProgress}%)` 
                : ''
            }}
            className={cn(
              "px-10 py-5 rounded-[1.5rem] font-black uppercase text-[11px] italic transition-all flex items-center justify-center gap-3 relative overflow-hidden text-white",
              isExporting ? "border border-white/10" : "bg-red-600 hover:bg-red-700"
            )}
          >
            <Download size={18} /> {isExporting ? `Exporting ${exportProgress}%` : 'Export PDF'}
          </button>

          <button onClick={onSaveBuild} className="px-10 py-5 bg-white text-black rounded-[1.5rem] font-black uppercase text-[11px] italic hover:bg-zinc-200 transition-all flex items-center justify-center gap-3">
            <Save size={18} /> Save Build
          </button>
          
          <button onClick={onReset} className="px-10 py-5 border border-white/10 rounded-[1.5rem] font-black uppercase text-[11px] italic hover:bg-white/5 transition-all">Start Over</button>
        </div>
      </motion.div>
    </div>
  );
}
