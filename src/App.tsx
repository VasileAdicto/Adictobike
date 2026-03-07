import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Bike, Download, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from './lib/utils';
import { ExcelImporter } from './components/ExcelImporter';

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
}

interface Step {
  id: string;
  title: string;
  options: Component[];
}

// --- INITIAL DATA ---
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
  { id: 'discs', title: 'Discs', options: [] }
];

// --- COMPONENTS ---

const Visualizer = ({ selectedComponents }: { selectedComponents: Component[] }) => {
  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center">
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <AnimatePresence mode="popLayout">
        {selectedComponents.map((comp) => (
          <motion.img
            key={comp.id}
            src={comp.imageUrl || (comp as any).image || (comp as any).ImageURL}
            alt={comp.name}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="absolute inset-0 w-full h-full object-contain"
            style={{ zIndex: Number(comp.zIndex) }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
};

const OptionCard = ({ component, isSelected, onClick }: { component: Component, isSelected: boolean, onClick: () => void }) => {
  return (
    <motion.button
      layout
      onClick={(e) => { e.preventDefault(); onClick(); }}
      className={cn(
        "relative flex flex-col p-3 rounded-2xl border text-left transition-all group w-full",
        isSelected 
        ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" 
        : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900"
      )}
    >
      <div className="aspect-square w-full rounded-xl bg-black/40 mb-3 overflow-hidden relative">
        <img src={component.cardImageUrl} alt={component.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition duration-500" />
        {/* Галочка справа */}
        {isSelected && (
          <div className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full shadow-lg z-10">
            <CheckCircle2 size={12} className="text-white" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h3 className="text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 text-zinc-300 uppercase">{component.name}</h3>
          <p className="text-[9px] text-zinc-500 uppercase font-black">{component.brand}</p>
        </div>
        <div className="flex justify-between items-end mt-2">
          <p className="font-black text-sm text-red-600">€{component.price.toLocaleString()}</p>
          <p className="text-sm text-zinc-600 font-mono italic">{component.weight}g</p>
        </div>
      </div>
    </motion.button>
  );
};

export default function BikeConfigurator() {
  const isAdmin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('admin') === 'true';

  const [steps, setSteps] = useState<Step[]>(INITIAL_STEPS);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex] || steps[0];
  const listRef = useRef<HTMLDivElement>(null);

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
                const rowKeys = Object.keys(row);
                const findKey = (name: string) => rowKeys.find(k => k.toLowerCase().trim() === name.toLowerCase());
                const imageKey = findKey('imageurl') || findKey('image');
                const cardImageKey = findKey('cardimg') || findKey('cardimage');
                const zKey = findKey('zindex');
                return {
                  id: `${step.id}-${idx}`,
                  name: row.Name || row.NAME || 'Unknown',
                  brand: row.Brand || row.BRAND || '',
                  price: Number(row.Price || row.PRICE) || 0,
                  weight: Number(row.Weight || row.WEIGHT) || 0,
                  imageUrl: imageKey ? row[imageKey] : "",
                  cardImageUrl: cardImageKey ? row[cardImageKey] : (imageKey ? row[imageKey] : ""),
                  zIndex: zKey ? Number(row[zKey]) : 10
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
    return steps.map(step => step.options.find(opt => opt.id === selections[step.id])).filter((c): c is Component => !!c);
  }, [selections, steps]);

  const jumpToStep = (index: number) => {
    if (index === 0 || !!selections[steps[index - 1]?.id] || index < currentStepIndex) {
      setCurrentStepIndex(index);
      setError(null);
    }
  };

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-24">
      <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4 pl-2">
          <img src="/design/Logo.png" alt="Logo" className="h-6 w-auto object-contain" />
          <div className="hidden sm:flex flex-col border-l border-white/10 pl-4 gap-0.4 w-[85px]">
            <div className="flex justify-between w-full leading-none">
              {"ADICTO.BIKE".split("").map((char, i) => <span key={i} className="text-[9px] font-black italic uppercase text-white">{char}</span>)}
            </div>
            <span className="text-[8px] uppercase tracking-[0.06em] text-zinc-500 font-bold block w-full text-center leading-none">Configurator</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {isAdmin && <ExcelImporter onDataLoaded={(newSteps) => { setSteps(newSteps); setSelections({}); setCurrentStepIndex(0); }} />}
          <div className="text-zinc-400 font-mono text-[9px] pr-2 opacity-60 uppercase tracking-widest">Build by Vasile</div>
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-6 pt-10">
        <div className="grid grid-cols-12 gap-10 h-[550px] items-stretch">
          
          {/* LEFT: VISUALIZER */}
          <div className="col-span-9 flex flex-col gap-6 order-1">
            <div className="flex flex-wrap justify-start items-center px-4 gap-x-6 gap-y-2">
              {steps.map((step, idx) => (
                <button 
                  key={step.id} 
                  onClick={() => jumpToStep(idx)} 
                  className={cn(
                    "transition-all duration-300 text-[10px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap",
                    idx === currentStepIndex ? "text-red-600 border-red-600 drop-shadow-[0_0_9px_rgba(255,0,0,0.3)]" : "text-white opacity-20 border-transparent hover:opacity-100"
                  )}
                >
                  {step.title}
                </button>
              ))}
            </div>
            <div className="flex-1">
              <Visualizer selectedComponents={selectedComponents} />
            </div>
          </div>

          {/* RIGHT: OPTIONS */}
          <div className="col-span-3 flex flex-col h-full bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-6 relative overflow-hidden order-2">
            <div ref={listRef} className="flex-1 space-y-2 velocraft-scrollbar overflow-y-auto pr-1">
              {error && <div className="mb-4 text-red-500 bg-red-600/10 p-2 rounded-lg text-[9px] font-bold uppercase">{error}</div>}
              <AnimatePresence mode="popLayout">
                {currentStep.options.map((option) => (
                  <OptionCard 
                    key={option.id} 
                    component={option} 
                    isSelected={selections[currentStep.id] === option.id} 
                    onClick={() => { setSelections(prev => ({...prev, [currentStep.id]: option.id})); setError(null); }} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>
        </div>
      </main>

      {/* FOOTER CONTROLS */}
<div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-40 font-sans">
  <div className="max-w-[1500px] mx-auto px-6 py-6 flex items-center">
    
    {/* 1. Кнопка Back (крайній лівий край) */}
    <button 
      onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} 
      className="flex items-center gap-3 text-zinc-500 hover:text-white disabled:opacity-10 transition-all font-black uppercase text-[10px] tracking-widest"
    >
      <ChevronLeft size={20} /> Back
    </button>
    
    {/* 2. Порожній простір, який штовхає все інше вправо */}
    <div className="flex-1" />

    {/* 3. Блок Weight та Price (тепер вони під правим кутом візуалізатора) */}
    <div className="flex gap-10 items-center pr-10 border-r border-white/10 mr-10">
      <div className="text-right">
        <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Weight</p>
        <p className="font-mono text-sm tracking-tighter">
          {selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g
        </p>
      </div>
      
      <div className="h-8 w-px bg-white/10" />
      
      <div className="text-right">
        <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Price</p>
        <p className="font-mono text-sm text-red-600 tracking-tighter">
          €{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}
        </p>
      </div>
    </div>

    {/* 4. Кнопка Next Step (крайній правий край всього макету) */}
    <button 
      onClick={() => {
        if (currentStep.options.length > 0 && !selections[currentStep.id]) {
          setError("Select a component");
          return;
        }
        currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
      }}
      className="bg-red-600 hover:bg-red-700 text-white px-8 py-2 rounded-lg font-black uppercase text-[11px] tracking-widest flex items-center gap-3 shadow-lg shadow-red-600/20 active:scale-95 transition-all"
    >
      {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next Step'} <ChevronRight size={18} />
    </button>

  </div>
</div>
  );
}
      
function SummaryView({ selections, onReset }: any) {
  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);

  const handleExport = () => {
    const doc = new jsPDF();
    const cleanText = (text: string) => text ? String(text).replace(/[^\x00-\x7F]/g, "").toUpperCase() : "";
    doc.setFont("helvetica", "bold");
    doc.setFontSize(24); doc.setTextColor(220, 38, 38);
    doc.text("ADICTO.BIKE", 14, 25);
    doc.setFontSize(10); doc.setTextColor(100);
    doc.text(`DATE: ${new Date().toLocaleDateString('en-US').toUpperCase()}`, 14, 32);
    doc.text("OFFICIAL BUILD SPECIFICATION", 14, 37);

    const tableData = selections.map((c: any) => [cleanText(c.name), cleanText(c.brand), `${c.weight}G`, `EUR ${c.price.toLocaleString()}`]);
    autoTable(doc, {
      startY: 45,
      head: [['COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
      body: tableData,
      styles: { font: "helvetica", fontSize: 9 },
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
      foot: [['TOTAL SPECIFICATION', '', `${totalWeight}G`, `EUR ${totalPrice.toLocaleString()}`]],
      footStyles: { fillColor: [220, 38, 38], textColor: [255, 255, 255] },
      theme: 'grid'
    });

    const footerY = doc.internal.pageSize.getHeight() - 45;
    doc.text("WWW.ADICTO.BIKE", 14, footerY + 17);
    doc.text("INSTAGRAM: @ADICTO.BIKE", 14, footerY + 23);
    doc.text("EMAIL: HELLO@ADICTO.BIKE", 14, footerY + 29);
    try { doc.addImage("/design/qr-code.png", "PNG", doc.internal.pageSize.getWidth() - 45, footerY + 5, 30, 30); } catch (e) {}
    doc.save(`ADICTO_BUILD.pdf`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center font-sans">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <CheckCircle2 size={60} className="text-red-600 mx-auto mb-6" />
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none">Configuration <br/> <span className="text-red-600">Complete</span></h2>
        <div className="flex justify-center gap-10 my-8 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Total Price</p>
            <p className="text-3xl font-mono text-red-600">€{totalPrice.toLocaleString()}</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest">Total Weight</p>
            <p className="text-3xl font-mono">{totalWeight}g</p>
          </div>
        </div>
        <div className="flex gap-4 justify-center">
          <button onClick={handleExport} className="px-8 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all flex items-center gap-2">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={onReset} className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">Start Over</button>
        </div>
      </motion.div>
    </div>
  );
}
