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

// --- CONSTANTS ---
const INITIAL_STEPS: Step[] = [ { id: 'frame', title: 'Frame', options: [] }, { id: 'wheelset', title: 'Wheelset', options: [] }, { id: 'tyres', title: 'Tyres', options: [] }, { id: 'cockpit', title: 'Cockpit', options: [] }, { id: 'tape', title: 'Tape', options: [] }, { id: 'saddle', title: 'Saddle', options: [] }, { id: 'shifters', title: 'Shifters', options: [] }, { id: 'crankset', title: 'Crankset', options: [] }, { id: 'derailleurs', title: 'Derailleurs', options: [] }, { id: 'cassette', title: 'Cassette', options: [] }, { id: 'discs', title: 'Discs', options: [] } ];

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
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/60 backdrop-blur-xl font-sans">
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl">
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><X size={16}/></button>
        <div className="text-center mb-10">
          <h2 className="text-lg font-black uppercase italic text-white tracking-widest mb-1">Identification</h2>
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
          <div className="flex justify-center gap-3 mb-10">
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

// --- USER GARAGE ---
const UserDashboard = ({ builds, onEdit, onDelete, onClose, onLogout, onPDF }: any) => {
  const [selected, setSelected] = useState<string[]>([]);
  const buildsToCompare = builds.filter((b: any) => selected.includes(b.id));

  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 selection:bg-red-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-16">
            <div className="leading-tight">
              <h2 className="text-sm font-black uppercase tracking-widest text-white">My Adicto</h2>
              <h1 className="text-sm font-black uppercase tracking-widest text-red-600">Garage</h1>
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={onLogout} className="text-zinc-500 hover:text-red-600 transition-colors uppercase text-[9px] font-black flex items-center gap-2">Logout <LogOut size={14}/></button>
              <button onClick={onClose} className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition-colors"><X size={18}/></button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((b: SavedBuild) => (
              <div key={b.id} className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all relative group">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div onClick={() => setSelected(s => s.includes(b.id) ? s.filter(x => x !== b.id) : [...s, b.id])} className={cn("w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all", selected.includes(b.id) ? "bg-red-600 border-red-600" : "border-white/20")} />
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Choose to compare</span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">{b.date}</span>
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
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-red-600/20"><Lock size={24} className="text-white"/></div>
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
    setTimeout(() => setStatus(''), 3000);
    e.target.value = ""; 
  };

  const handleSaveOffsets = async () => {
    setStatus("Saving...");
    const success = await saveToGithub("public/offsets.json", JSON.stringify(offsets), true);
    if (success) { setStatus("✅ Saved!"); setTimeout(() => setStatus(''), 3000); }
    else { setStatus("❌ Error"); setTimeout(() => setStatus(''), 3000); }
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
            <div className="flex items-center gap-2 px-1 animate-in fade-in slide-in-from-left-2 text-white">
              <span className="text-[7px] text-zinc-500 font-bold uppercase">Scale</span>
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

// --- MAIN CONFIGURATOR ---

export default function BikeConfigurator() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, OffsetData>>({});
  const [showGrid, setShowGrid] = useState(false);
  const [gridSize, setGridSize] = useState(20);
  const [zoomScale, setZoomScale] = useState(5);
  const [isZoomed, setIsZoomed] = useState(false);
  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);

  const [user, setUser] = useState<any>(JSON.parse(localStorage.getItem('adicto_user') || 'null'));
  const [savedBuilds, setSavedBuilds] = useState<SavedBuild[]>(JSON.parse(localStorage.getItem('adicto_saved_builds') || '[]'));
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isDashboardOpen, setIsDashboardOpen] = useState(false);

  const stepsNavRef = useRef<HTMLDivElement>(null);
  const currentStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    const path = window.location.pathname; 
    if (path === '/admin') setIsAdminMode(true);
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
      if (activeBtn) stepsNavRef.current.scrollTo({ left: activeBtn.offsetLeft - 20, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const activeLogic = useMemo(() => {
    if (currentStepIndex === 0) return null;
    const prevStep = steps[currentStepIndex - 1];
    return prevStep.options.find(o => o.id === selections[prevStep.id])?.logic || null;
  }, [selections, currentStepIndex, steps]);

  const filteredOptions = useMemo(() => 
    currentStep.options.filter(opt => !activeLogic || !opt.logic || opt.logic === activeLogic)
  , [currentStep, activeLogic]);

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
    window.location.reload();
  };

  if (isAdminMode && !isAdminLoggedIn) return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
  
  if (isDashboardOpen) return <UserDashboard builds={savedBuilds} onClose={() => setIsDashboardOpen(false)} onLogout={handleLogout} onDelete={(id: string) => { const upd = savedBuilds.filter(x => x.id !== id); setSavedBuilds(upd); localStorage.setItem('adicto_saved_builds', JSON.stringify(upd)); }} onEdit={handleEditFromGarage} onPDF={(b: any) => {
    const doc = new jsPDF(); doc.text(`ADICTO CONFIGURATION: ${b.name}`, 10, 10);
    autoTable(doc, { startY: 20, head: [['Section', 'Brand', 'Weight', 'Price']], body: b.components.map((c:any) => [c.stepTitle, c.brand, `${c.weight}g`, `€${c.price}`]) });
    doc.save(`${b.name}.pdf`);
  }} />;

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} user={user} onLogin={() => setIsAuthModalOpen(true)} onDashboard={() => setIsDashboardOpen(true)} onSaveBuild={() => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const newB = { id: Date.now().toString(), name: `${selectedComponents[0]?.brand || 'Machine'} Build`, date: new Date().toLocaleDateString(), components: selectedComponents, totalPrice: selectedComponents.reduce((acc,c)=>acc+c.price,0), totalWeight: selectedComponents.reduce((acc,c)=>acc+c.weight,0) };
    const upd = [...savedBuilds, newB]; setSavedBuilds(upd); localStorage.setItem('adicto_saved_builds', JSON.stringify(upd)); alert("Saved!");
  }} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-24 overflow-x-hidden">
      <style>{`
        .custom-scroll-container::-webkit-scrollbar, .steps-scroll-container::-webkit-scrollbar { height: 4px; display: block !important; }
        .custom-scroll-container::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
        @keyframes bounce-x { 0%, 100% { transform: translateX(0); } 50% { transform: translateX(5px); } }
        .animate-bounce-x { animation: bounce-x 1s infinite; }
      `}</style>
      
      {isAdminLoggedIn && <AdminPanel categories={INITIAL_STEPS.map(s => s.title)} offsets={offsets} setOffsets={setOffsets} activeComponent={activeComponentForTuning} showGrid={showGrid} setShowGrid={setShowGrid} gridSize={gridSize} setGridSize={setGridSize} isZoomed={isZoomed} setIsZoomed={setIsZoomed} zoomScale={zoomScale} setZoomScale={setZoomScale} onLogout={() => setIsAdminLoggedIn(false)} />}
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(u: any) => { setUser(u); localStorage.setItem('adicto_user', JSON.stringify(u)); setIsAuthModalOpen(false); }} />

      <nav className="border-b border-white/5 px-4 lg:px-8 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50 text-white">
        <div className="flex items-center gap-3">
          <img src="/design/Logo.png" alt="Logo" className="h-4 lg:h-5 w-auto" />
          <div className="text-zinc-600 font-mono text-[6px] uppercase tracking-widest italic border-l border-white/10 pl-3">Build by Vasile & AI</div>
        </div>
        {user ? (
          <button onClick={() => setIsDashboardOpen(true)} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 transition-all hover:bg-white/10">
            <UserIcon size={12} className="text-red-600"/> <span className="text-[9px] font-black uppercase italic">{user.name}</span>
          </button>
        ) : <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest"><LogIn size={12}/> Login</button>}
      </nav>

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 pt-2">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-1 lg:h-[550px]">
          <div className="lg:col-span-9 flex flex-col gap-1">
            <div ref={stepsNavRef} className="flex overflow-x-auto no-scrollbar gap-x-6 pb-1 border-b border-white/5">
              {steps.map((step, idx) => (
                <button key={step.id} onClick={() => setCurrentStepIndex(idx)} className={cn("transition-all text-[9px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap", idx === currentStepIndex ? "text-red-600 border-red-600" : "text-white opacity-20 border-transparent hover:opacity-100")}>{step.title}</button>
              ))}
            </div>
            <div className="h-[250px] md:h-[400px] lg:flex-1 relative"><Visualizer selectedComponents={selectedComponents} offsets={offsets} showGrid={showGrid} gridSize={gridSize} isZoomed={isZoomed} zoomScale={zoomScale} /></div>
          </div>
          <div className="lg:col-span-3 flex flex-col bg-zinc-900/40 rounded-[2rem] border border-white/5 p-4 relative order-2 overflow-hidden shadow-2xl">
            <div className="flex-1 overflow-x-auto lg:overflow-y-auto custom-scroll-container pb-2">
                <div className="flex flex-row lg:flex-col gap-3 min-w-full">
                    {filteredOptions.map((option) => (
                      <div key={option.id} className="w-[35%] min-w-[35%] lg:w-full shrink-0">
                        <OptionCard component={option} isSelected={selections[currentStep.id] === option.id} onClick={() => setSelections(prev => ({...prev, [currentStep.id]: option.id}))} />
                      </div>
                    ))}
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

      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-3xl border-t border-white/5 z-50 py-4 px-6 text-white shadow-2xl">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic flex items-center gap-1 w-20 text-left"><ChevronLeft size={18} /> <span className="hidden sm:inline">Back</span></button>
          <div className="flex gap-6 items-center justify-center flex-1">
            <div className="text-center"><p className="text-[6px] text-zinc-600 uppercase font-black italic tracking-tighter">Weight</p><p className="font-mono text-xs">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p></div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center"><p className="text-[6px] text-zinc-600 uppercase font-black italic tracking-tighter">Price</p><p className="font-mono text-xs text-red-600 font-bold">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p></div>
          </div>
          <div className="w-20 flex justify-end">
            <button onClick={() => currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true)} className="bg-red-600 text-white p-2.5 rounded-xl font-black active:scale-95 shadow-lg shadow-red-600/30"><ChevronRight size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- SUMMARY VIEW ---
function SummaryView({ selections, onReset, user, onSaveBuild, onLogin, onDashboard }: any) {
  const [isExp, setIsExp] = useState(false);
  const [prog, setProg] = useState(0);
  const totalP = selections.reduce((a:any,c:any)=>a+c.price,0);
  const totalW = selections.reduce((a:any,c:any)=>a+c.weight,0);

  const doPDF = async () => {
    setIsExp(true); setProg(0);
    const itv = setInterval(() => {
      setProg(p => {
        if (p >= 100) { 
          clearInterval(itv); 
          const doc = new jsPDF();
          autoTable(doc, { 
            startY: 135, head: [['SECTION', 'BRAND', 'WEIGHT', 'PRICE']],
            body: selections.map((c: any) => [c.stepTitle, c.brand, `${c.weight}g`, `€${c.price}`]),
            theme: 'grid'
          });
          doc.save('ADICTO_BIKE.pdf');
          setTimeout(() => { setIsExp(false); setProg(0); }, 500);
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
        <h2 className="text-[26px] font-black uppercase italic tracking-tighter mb-4 leading-none">your bike is <br/> <span className="text-red-600 uppercase">Ready</span></h2>
        <div className="flex justify-center gap-10 my-10 bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div><p className="text-zinc-600 text-[8px] uppercase font-black italic mb-1 text-zinc-500 tracking-widest">Price</p><p className="text-lg font-mono text-red-600 tracking-tighter font-black italic">€{totalP.toLocaleString()}</p></div>
          <div className="w-px bg-white/5" />
          <div><p className="text-zinc-600 text-[8px] uppercase font-black italic mb-1 text-zinc-500 tracking-widest">Weight</p><p className="text-lg font-mono text-white/80 tracking-tighter font-black italic">{totalW}g</p></div>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={doPDF} disabled={isExp} style={{ background: isExp ? `linear-gradient(to right, #ef4444 ${prog}%, #18181b ${prog}%)` : '' }} className={cn("px-8 py-4 rounded-xl font-black uppercase text-[10px] italic transition-all flex items-center justify-center gap-2 relative overflow-hidden shadow-lg shadow-red-600/10", isExp ? "border border-red-600/30" : "bg-red-600 hover:bg-red-700 active:scale-95")}>
            <Download size={14} /> {isExp ? `Exporting ${prog}%` : 'Export PDF'}
          </button>
          <button onClick={onSaveBuild} className="px-8 py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] italic flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all active:scale-95 shadow-lg shadow-white/5"><Save size={14} /> Save Build</button>
          <button onClick={onReset} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] italic text-zinc-500 hover:text-white transition-all active:scale-95">Start Over</button>
        </div>
      </motion.div>
    </div>
  );
}
