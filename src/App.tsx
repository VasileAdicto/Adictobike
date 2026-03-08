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

// --- HELPER COMPONENTS ---

const OptionCard = ({ component, isSelected, onClick }: { component: Component, isSelected: boolean, onClick: () => void }) => (
  <motion.button layout onClick={(e) => { e.preventDefault(); onClick(); }} className={cn("relative flex flex-col p-2 lg:p-3 rounded-xl lg:rounded-2xl border text-left transition-all group w-full shrink-0", isSelected ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900")}>
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

const Visualizer = ({ selectedComponents, offsets }: any) => (
  <div className="relative w-full h-full flex items-center justify-center overflow-hidden">
    <AnimatePresence mode="popLayout">
      {selectedComponents.map((comp: any) => {
        const tune = offsets[comp.id] || { s: 1, x: 0, y: 0 };
        return <motion.img key={comp.id} src={comp.imageUrl} initial={{ opacity: 0 }} animate={{ opacity: 1, scale: tune.s, x: tune.x, y: tune.y }} exit={{ opacity: 0 }} className="absolute inset-0 w-full h-full object-contain pointer-events-none" style={{ zIndex: comp.zIndex }} />;
      })}
    </AnimatePresence>
  </div>
);

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
      <motion.div initial={{ scale: 0.98, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] max-w-sm w-full relative shadow-2xl text-white">
        <button onClick={onClose} className="absolute top-8 right-8 text-zinc-600 hover:text-white transition-colors"><X size={16}/></button>
        <div className="text-center mb-10">
          <h2 className="text-lg font-black uppercase italic tracking-widest mb-1">Identification</h2>
          <p className="text-zinc-500 text-[9px] uppercase font-bold tracking-[0.3em]">{step === 'email' ? 'Access your adicto garage' : `Sent to ${email}`}</p>
        </div>
        {step === 'email' ? (
          <div className="space-y-6">
            <input type="email" placeholder="EMAIL ADDRESS" value={email} onChange={e => setEmail(e.target.value)} className="w-full bg-black/50 border border-white/5 p-4 rounded-xl text-white outline-none focus:border-red-600/50 transition-all font-mono text-[11px]" />
            <div className="grid grid-cols-2 gap-2">
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all text-[8px] font-black text-zinc-400 uppercase tracking-tighter"><Smartphone size={12}/> Apple ID</button>
              <button className="flex items-center justify-center gap-2 bg-white/5 hover:bg-white/10 py-3 rounded-xl transition-all text-[8px] font-black text-zinc-400 uppercase tracking-tighter"><Mail size={12}/> Google</button>
            </div>
          </div>
        ) : (
          <div className="flex justify-center gap-3 mb-10 text-black">
            {otp.map((digit, i) => (
              <input key={i} type="text" maxLength={1} value={digit} onChange={e => {
                const newOtp = [...otp]; newOtp[i] = e.target.value; setOtp(newOtp);
                if (e.target.nextSibling && e.target.value) (e.target.nextSibling as HTMLElement).focus();
              }} className="w-10 h-14 bg-black border border-white/5 rounded-xl text-center text-sm font-mono font-bold text-red-600 outline-none focus:border-red-600 transition-colors shadow-inner" />
            ))}
          </div>
        )}
        <button onClick={handleNext} className="w-full bg-red-600 py-4 rounded-xl font-black uppercase text-white mt-4 text-[10px] tracking-[0.2em] italic transition-all hover:bg-red-700">Continue</button>
      </motion.div>
    </div>
  );
};

// --- ADMIN LOGIN ---
const AdminLogin = ({ onLogin }: { onLogin: () => void }) => {
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (email === "hello@adicto.bike" && pass === "Scalpel2012!") onLogin();
    else setError("Invalid credentials");
  };
  return (
    <div className="min-h-screen bg-black flex items-center justify-center p-6 selection:bg-red-600 font-sans">
      <form onSubmit={handleLogin} className="bg-zinc-900 border border-white/5 p-10 rounded-[2.5rem] w-full max-w-md shadow-2xl">
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 bg-red-600 rounded-2xl flex items-center justify-center mb-4"><Lock size={24} className="text-white"/></div>
          <h2 className="text-xl font-black uppercase italic text-center text-white">Adicto Admin</h2>
        </div>
        <div className="space-y-4">
          <input type="email" placeholder="Email" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono" value={email} onChange={(e) => setEmail(e.target.value)} />
          <input type="password" placeholder="Password" className="w-full bg-black border border-white/10 p-4 rounded-2xl text-white outline-none focus:border-red-600 transition-all text-sm font-mono" value={pass} onChange={(e) => setPass(e.target.value)} />
        </div>
        {error && <p className="text-red-600 text-[10px] text-center mt-4 uppercase font-black italic">{error}</p>}
        <button className="w-full bg-red-600 py-4 rounded-2xl font-black uppercase text-white mt-8 hover:bg-red-700 transition-all italic tracking-widest">Access Dashboard</button>
      </form>
    </div>
  );
};

// --- ADMIN PANEL ---
const AdminPanel = ({ categories, offsets, setOffsets, onLogout }: any) => {
  const [selectedCat, setSelectedCat] = useState('excel');
  const [status, setStatus] = useState('');
  const [token, setToken] = useState(localStorage.getItem('adicto_github_token') || ''); 
  const REPO = "VasileAdicto/Adictobike";

  const saveToGithub = async (path: string, content: string, isJson = false) => {
    if (!token) { setStatus("❌ Token Required"); return false; }
    try {
      let sha = "";
      const getRes = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, { headers: { Authorization: `token ${token}` } });
      if (getRes.ok) { const data = await getRes.json(); sha = data.sha; }
      const res = await fetch(`https://api.github.com/repos/${REPO}/contents/${path}`, {
        method: "PUT",
        headers: { Authorization: `token ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ message: `Admin update: ${path}`, content: isJson ? btoa(unescape(encodeURIComponent(content))) : content, sha: sha || undefined, branch: "main" }),
      });
      if (res.ok) { setStatus("✅ Success!"); localStorage.setItem('adicto_github_token', token); setTimeout(() => setStatus(''), 3000); return true; }
      return false;
    } catch (err) { return false; }
  };

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files; if (!files) return;
    const fileArray = Array.from(files);
    for (const file of fileArray) {
        const reader = new FileReader(); reader.readAsDataURL(file);
        const result = await new Promise((res) => { reader.onload = () => res(reader.result); });
        const path = selectedCat === 'excel' ? "public/data.xlsx" : `public/parts/${selectedCat}/${file.name}`;
        await saveToGithub(path, (result as string).split(',')[1]);
    }
    setStatus("✅ Done");
    e.target.value = "";
  };

  return (
    <div className="z-[100] sticky top-0 bg-zinc-900 border-b border-white/5 p-2 flex gap-3 items-center justify-center backdrop-blur-md font-sans text-white">
      <div className="flex items-center gap-2 bg-black/40 px-2 py-1 rounded-lg border border-white/10 focus-within:border-red-600 transition-all">
        <Key size={10} className="text-red-600" />
        <input type="password" placeholder="TOKEN" value={token} onChange={(e) => setToken(e.target.value)} className="bg-transparent text-[9px] w-20 outline-none font-mono uppercase" />
      </div>
      <select value={selectedCat} onChange={(e) => setSelectedCat(e.target.value)} className="bg-black border border-white/10 text-[9px] px-2 py-1 rounded uppercase font-bold text-white outline-none focus:border-red-600">
        <option value="excel">📁 EXCEL</option>
        {categories?.map((cat: string) => <option key={cat} value={cat}>🖼️ {cat.toUpperCase()}</option>)}
      </select>
      <div className="flex gap-1">
        <label className="cursor-pointer bg-zinc-800 text-zinc-300 px-2 py-1 rounded text-[9px] font-bold uppercase hover:bg-zinc-700 flex items-center gap-1 italic"><Upload size={10}/> Files<input type="file" className="hidden" multiple onChange={handleUpload} /></label>
      </div>
      <button onClick={() => saveToGithub("public/offsets.json", JSON.stringify(offsets), true)} className="bg-red-600 text-white px-3 py-1 rounded text-[9px] font-bold uppercase hover:bg-red-700 flex items-center gap-1 italic tracking-widest"><Save size={10}/> Offsets</button>
      <button onClick={onLogout} className="text-zinc-500 hover:text-red-600 p-1 transition-colors"><LogOut size={14}/></button>
      {status && <span className="text-[8px] font-mono uppercase text-red-600 ml-1">{status}</span>}
    </div>
  );
};

// --- USER DASHBOARD (GARAGE) ---
const UserDashboard = ({ builds, onEdit, onDelete, onClose, onLogout, onPDF }: any) => {
  const [selected, setSelected] = useState<string[]>([]);
  return (
    <div className="fixed inset-0 z-[150] bg-black text-white flex flex-col font-sans overflow-hidden">
      <div className="flex-1 overflow-y-auto p-6 lg:p-12 selection:bg-red-600">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-start mb-16">
            <div>
              <h2 className="text-sm font-black uppercase tracking-widest text-white">My Adicto</h2>
              <h1 className="text-sm font-black uppercase tracking-widest text-red-600 leading-none mt-1">Garage</h1>
            </div>
            <div className="flex gap-4 items-center">
              <button onClick={onLogout} className="text-zinc-500 hover:text-red-600 transition-colors uppercase text-[9px] font-black flex items-center gap-2">Logout <LogOut size={14}/></button>
              <button onClick={onClose} className="bg-zinc-900 p-2 rounded-full hover:bg-zinc-800 transition-colors"><X size={18}/></button>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {builds.map((b: SavedBuild) => (
              <div key={b.id} className="bg-zinc-900/50 border border-white/5 rounded-[2rem] p-6 hover:border-white/10 transition-all group relative">
                <div className="flex justify-between items-start mb-4">
                  <div className="flex items-center gap-2">
                    <div onClick={() => setSelected(s => s.includes(b.id) ? s.filter(x => x !== b.id) : [...s, b.id])} className={cn("w-4 h-4 rounded-full border flex items-center justify-center cursor-pointer transition-all", selected.includes(b.id) ? "bg-red-600 border-red-600" : "border-white/20")} />
                    <span className="text-[8px] font-bold text-zinc-600 uppercase tracking-tighter">Choose to compare</span>
                  </div>
                  <span className="text-[8px] font-mono text-zinc-600 uppercase tracking-tighter">{b.date}</span>
                </div>
                <button onClick={() => onEdit(b)} className="text-lg font-black uppercase italic mb-1 hover:text-red-600 transition-colors text-left block leading-tight">
                  {b.name.replace(/adicto_/gi, '')}
                </button>
                <div className="mb-6">
                  <p className="text-[7px] text-zinc-600 uppercase font-black mb-1 italic tracking-widest">Configuration:</p>
                  <p className="text-[8px] text-zinc-500 uppercase leading-tight line-clamp-3 italic font-medium">{b.components.map(c => c.brand).join(' • ')}</p>
                </div>
                <div className="flex justify-between items-end border-t border-white/5 pt-4 mt-auto">
                  <div><p className="text-[7px] font-black uppercase text-zinc-600 tracking-tighter">Price</p><p className="font-mono text-xs text-red-600 font-bold">€{b.totalPrice.toLocaleString()}</p></div>
                  <div className="flex gap-4 items-center">
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
        <p className="text-[8px] font-bold uppercase tracking-[0.3em] mb-2">Powered by Adicto.Bike All Right Reserved</p>
        <p className="text-[8px] font-bold uppercase tracking-[0.1em]">Please contact us if you have any questions or bugs (баг) — hello@adicto.bike</p>
      </div>
    </div>
  );
};

// --- MAIN CONFIGURATOR ---

export default function BikeConfigurator() {
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [isAdminLoggedIn, setIsAdminLoggedIn] = useState(false);
  const [offsets, setOffsets] = useState<Record<string, OffsetData>>({});
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
    const loadData = async () => {
        try {
          const res = await fetch('/data.xlsx'); if (!res.ok) return;
          const XLSX = await import('xlsx');
          const buffer = await res.arrayBuffer();
          const wb = XLSX.read(buffer);
          const newSteps = INITIAL_STEPS.map(step => {
            const sheet = wb.Sheets[Object.keys(wb.Sheets).find(n => n.toUpperCase().trim() === step.title.toUpperCase().trim()) || ""];
            if (sheet) {
              const data = XLSX.utils.sheet_to_json(sheet);
              return { ...step, options: data.map((row: any, idx: number) => ({
                id: `${step.id}-${idx}`, name: row.Name || 'Unknown', brand: row.Brand || '', price: Number(row.Price) || 0, weight: Number(row.Weight) || 0, imageUrl: row.imageurl || row.Image || "", cardImageUrl: row.cardimg || row.CardImage || row.imageurl || "", zIndex: Number(row.zindex) || 10, logic: String(row.logic || "").trim()
              }))};
            } return step;
          }); setSteps(newSteps);
        } catch (e) {}
    }; loadData();
  }, []);

  useEffect(() => {
    if (stepsNavRef.current) {
      const activeBtn = stepsNavRef.current.children[currentStepIndex] as HTMLElement;
      if (activeBtn) stepsNavRef.current.scrollTo({ left: activeBtn.offsetLeft - 20, behavior: 'smooth' });
    }
  }, [currentStepIndex]);

  const filteredOptions = useMemo(() => {
    const activeLogic = currentStepIndex > 0 ? (steps[currentStepIndex-1].options.find(o => o.id === selections[steps[currentStepIndex-1].id])?.logic || null) : null;
    return currentStep.options.filter(opt => !activeLogic || !opt.logic || opt.logic === activeLogic);
  }, [currentStep, currentStepIndex, selections, steps]);

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

  if (isAdminMode && !isAdminLoggedIn) return <AdminLogin onLogin={() => setIsAdminLoggedIn(true)} />;
  if (isDashboardOpen) return <UserDashboard builds={savedBuilds} onClose={() => setIsDashboardOpen(false)} onLogout={() => { setUser(null); localStorage.removeItem('adicto_user'); setIsDashboardOpen(false); }} onDelete={(id: string) => { const upd = savedBuilds.filter(x => x.id !== id); setSavedBuilds(upd); localStorage.setItem('adicto_saved_builds', JSON.stringify(upd)); }} onEdit={handleEditFromGarage} onPDF={(b: any) => {
    const doc = new jsPDF(); autoTable(doc, { head: [['Section', 'Brand', 'Weight', 'Price']], body: b.components.map((c:any) => [c.stepTitle, c.brand, `${c.weight}g`, `€${c.price}`]) });
    doc.save(`${b.name}.pdf`);
  }} />;

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} user={user} onLogin={() => setIsAuthModalOpen(true)} onDashboard={() => setIsDashboardOpen(true)} onSaveBuild={() => {
    if (!user) { setIsAuthModalOpen(true); return; }
    const newB = { id: Date.now().toString(), name: `${selectedComponents[0]?.brand || 'Bike'} Build`, date: new Date().toLocaleDateString(), components: selectedComponents, totalPrice: selectedComponents.reduce((acc,c)=>acc+c.price,0), totalWeight: selectedComponents.reduce((acc,c)=>acc+c.weight,0) };
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
      
      {isAdminLoggedIn && <AdminPanel categories={INITIAL_STEPS.map(s => s.title)} offsets={offsets} setOffsets={setOffsets} onLogout={() => setIsAdminLoggedIn(false)} />}
      
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setIsAuthModalOpen(false)} onLogin={(u: any) => { setUser(u); localStorage.setItem('adicto_user', JSON.stringify(u)); setIsAuthModalOpen(false); }} />

      <nav className="border-b border-white/5 px-4 lg:px-8 py-3 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-3">
          <img src="/design/Logo.png" alt="Logo" className="h-4 lg:h-5 w-auto" />
          <div className="text-zinc-600 font-mono text-[6px] uppercase tracking-widest italic border-l border-white/10 pl-3">Build by Vasile & AI</div>
        </div>
        {user ? (
          <button onClick={() => setIsDashboardOpen(true)} className="flex items-center gap-2 bg-white/5 px-3 py-1.5 rounded-full border border-white/5 transition-all hover:bg-white/10">
            <UserIcon size={12} className="text-red-600"/> <span className="text-[9px] font-black uppercase italic">{user.name}</span>
          </button>
        ) : (
          <button onClick={() => setIsAuthModalOpen(true)} className="flex items-center gap-2 bg-red-600 px-4 py-1.5 rounded-full text-[9px] font-black uppercase italic tracking-widest"><LogIn size={12}/> Login</button>
        )}
      </nav>

      <main className="max-w-[1500px] mx-auto px-4 lg:px-6 pt-2">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-1 lg:h-[550px]">
          <div className="lg:col-span-9 flex flex-col gap-1">
            <div ref={stepsNavRef} className="flex overflow-x-auto no-scrollbar gap-x-6 pb-1 border-b border-white/5">
              {steps.map((step, idx) => (
                <button key={step.id} onClick={() => setCurrentStepIndex(idx)} className={cn("transition-all text-[9px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap", idx === currentStepIndex ? "text-red-600 border-red-600" : "text-white opacity-20 border-transparent")}>{step.title}</button>
              ))}
            </div>
            <div className="h-[250px] md:h-[400px] lg:flex-1 relative"><Visualizer selectedComponents={selectedComponents} offsets={offsets} /></div>
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

      <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-3xl border-t border-white/5 z-50 py-4 px-6 text-white">
        <div className="max-w-[1500px] mx-auto flex items-center justify-between">
          <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="text-zinc-500 hover:text-white transition-all font-black uppercase text-[10px] italic flex items-center gap-1 w-20">
            <ChevronLeft size={18} /> <span className="hidden sm:inline">Back</span>
          </button>
          
          <div className="flex gap-6 items-center justify-center flex-1">
            <div className="text-center"><p className="text-[6px] text-zinc-600 uppercase font-black italic tracking-tighter">Weight</p><p className="font-mono text-xs">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p></div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-center"><p className="text-[6px] text-zinc-600 uppercase font-black italic tracking-tighter">Price</p><p className="font-mono text-xs text-red-600 font-bold">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p></div>
          </div>

          <div className="w-20 flex justify-end">
            <button onClick={() => {
                if (filteredOptions.length > 0 && !selections[currentStep.id]) return;
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
            }} className="bg-red-600 text-white p-2.5 rounded-xl font-black active:scale-95 transition-all shadow-lg shadow-red-600/20">
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

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
        } return p + 20;
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
        ) : <button onClick={onLogin} className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10 text-[9px] font-black uppercase italic"><LogIn size={12}/> Login</button>}
      </div>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <img src="/design/Logo.png" alt="Logo" className="w-10 h-10 mx-auto mb-10 object-contain" />
        <h2 className="text-[26px] font-black uppercase italic tracking-tighter mb-4 leading-none">your bike is <br/> <span className="text-red-600 uppercase">Ready</span></h2>
        
        <div className="flex justify-center gap-10 my-10 bg-zinc-900/40 p-6 rounded-[2.5rem] border border-white/5 shadow-2xl">
          <div><p className="text-zinc-600 text-[8px] uppercase font-black italic mb-1">Price</p><p className="text-lg font-mono text-red-600 tracking-tighter font-black italic">€{totalP.toLocaleString()}</p></div>
          <div className="w-px bg-white/5" />
          <div><p className="text-zinc-600 text-[8px] uppercase font-black italic mb-1">Weight</p><p className="text-lg font-mono text-white/80 tracking-tighter font-black italic">{totalW}g</p></div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button onClick={doPDF} disabled={isExp} style={{ background: isExp ? `linear-gradient(to right, #ef4444 ${prog}%, #18181b ${prog}%)` : '' }} className={cn("px-8 py-4 rounded-xl font-black uppercase text-[10px] italic transition-all flex items-center justify-center gap-2 relative overflow-hidden", isExp ? "border border-red-600/30" : "bg-red-600 hover:bg-red-700")}>
            <Download size={14} /> {isExp ? `Exporting ${prog}%` : 'Export PDF'}
          </button>
          <button onClick={onSaveBuild} className="px-8 py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] italic flex items-center justify-center gap-2 hover:bg-zinc-200 transition-all"><Save size={14} /> Save Build</button>
          <button onClick={onReset} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] italic text-zinc-500 hover:text-white transition-all">Start Over</button>
        </div>
      </motion.div>
    </div>
  );
}
