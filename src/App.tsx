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
  image: string; 
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
  { id: 'tires', title: 'Tires', options: [] },
  { id: 'discs', title: 'Discs', options: [] },
  { id: 'crankset', title: 'Crankset', options: [] },
  { id: 'derailleurs', title: 'Derailleurs', options: [] },
  { id: 'cassette', title: 'Cassette', options: [] },
  { id: 'shifters', title: 'Shifters', options: [] },
  { id: 'cockpit', title: 'Cockpit', options: [] },
  { id: 'saddle', title: 'Saddle', options: [] }
];

// --- COMPONENTS ---

const Visualizer = ({ selectedComponents }: { selectedComponents: Component[] }) => {
  return (
    <div className="relative w-full h-full bg-zinc-950 rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center">
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <AnimatePresence mode="wait">
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
            style={{ zIndex: comp.zIndex }}
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
      onClick={onClick}
      className={cn(
        "relative flex flex-col p-3 rounded-2xl border text-left transition-all group w-full",
        isSelected 
        ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" 
        : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900"
      )}
    >
      <div className="aspect-square w-full rounded-xl bg-black/40 mb-3 overflow-hidden relative">
        <img src={component.imageUrl} alt={component.name} className="w-full h-full object-contain p-2 group-hover:scale-110 transition duration-500" />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full shadow-lg">
            <CheckCircle2 size={12} className="text-white" />
          </div>
        )}
      </div>
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
           <h3 className="text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 text-zinc-300 uppercase">{component.name}</h3>
           <p className="text-[9px] text-zinc-500 uppercase font-black">{component.brand}</p>
        </div>
        <p className="font-black text-sm text-red-600 mt-1">€{component.price.toLocaleString()}</p>
      </div>
    </motion.button>
  );
};

export default function BikeConfigurator() {
  const isAdmin = typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('admin') === 'true';

  const [steps, setSteps] = useState<Step[]>(() => {
    const saved = localStorage.getItem('bike-config-data');
    return saved ? JSON.parse(saved) : INITIAL_STEPS;
  });
  
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [isFinished, setIsFinished] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const currentStep = steps[currentStepIndex] || steps[0];
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    localStorage.setItem('bike-config-data', JSON.stringify(steps));
  }, [steps]);

  const selectedComponents = useMemo(() => {
    return steps
      .map(step => step.options.find(opt => opt.id === selections[step.id]))
      .filter((c): c is Component => !!c);
  }, [selections, steps]);

  const jumpToStep = (index: number) => {
    if (index === 0 || !!selections[steps[index - 1]?.id] || index < currentStepIndex) {
      setCurrentStepIndex(index);
      setError(null);
    }
  };

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => { localStorage.removeItem('bike-config-data'); window.location.reload(); }} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-24">
      {/* Navbar */}
      <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-2">
          <div className="bg-red-600 p-1.5 rounded-lg text-white"><Bike size={18} /></div>
          <div className="flex flex-col">
            <span className="text-sm font-black italic tracking-tighter leading-none uppercase">ADICTO <span className="text-red-600 ml-2">PRO</span></span>
            <span className="text-[7px] uppercase tracking-[0.4em] text-zinc-500 font-bold">Configurator</span>
          </div>
        </div>
        
        <div className="flex items-center gap-6">
          {isAdmin && (
            <ExcelImporter onDataLoaded={(newSteps) => {
              setSteps(newSteps);
              setSelections({});
              setCurrentStepIndex(0);
            }} />
          )}
          <div className="text-zinc-600 font-mono text-xs opacity-50 uppercase tracking-widest">Build v1.0.4</div>
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-6 pt-10">
        
        <div className="grid grid-cols-12 gap-10 h-[500px] items-stretch">
          
          {/* Left Column: Fixed Sidebar */}
          <div className="col-span-3 flex flex-col h-full bg-zinc-900/40 rounded-[2.5rem] border border-white/5 p-6 relative overflow-hidden">
            <div ref={listRef} className="flex-1 space-y-2 velocraft-scrollbar overflow-y-auto pr-1">
              {error && <div className="mb-4 text-red-500 bg-red-600/10 p-2 rounded-lg text-[9px] font-bold uppercase">{error}</div>}
              <AnimatePresence mode="popLayout">
                {currentStep.options.map((option) => (
                  <OptionCard 
                    key={option.id} 
                    component={option} 
                    isSelected={selections[currentStep.id] === option.id} 
                    onClick={() => {setSelections({...selections, [currentStep.id]: option.id}); setError(null);}} 
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* Right Column: Navigation + Visualizer aligned */}
          <div className="col-span-9 flex flex-col gap-6">
            
            {/* Step Navigation Titles - Aligned with the preview box */}
            <div className="flex justify-between items-center px-4">
              {steps.map((step, idx) => (
                <button
                  key={step.id}
                  onClick={() => jumpToStep(idx)}
                  className={cn(
                    "transition-all duration-300 text-[10px] font-black italic uppercase tracking-widest pb-2 border-b-2",
                    idx === currentStepIndex 
                      ? "text-red-600 border-red-600 drop-shadow-[0_0_8px_rgba(255,0,0,0.3)]" 
                      : "text-white opacity-20 border-transparent hover:opacity-100"
                  )}
                >
                  {step.title}
                </button>
              ))}
            </div>

            {/* Large Visualizer Area */}
            <div className="flex-1">
              <Visualizer selectedComponents={selectedComponents} />
            </div>
          </div>
        </div>
      </main>

      {/* Persistent Bottom Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 px-12 py-6 flex justify-between items-center z-40">
        <button 
          onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} 
          className="flex items-center gap-3 text-zinc-500 hover:text-white disabled:opacity-10 transition-all font-black uppercase text-[10px] tracking-widest"
        >
          <ChevronLeft size={20} /> Back
        </button>
        
        <div className="flex gap-12 items-center">
          <div className="text-right">
            <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Weight</p>
            <p className="font-mono text-sm">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p>
          </div>
          <div className="h-8 w-px bg-white/10" />
          <div className="text-right">
            <p className="text-[8px] text-zinc-600 uppercase font-black mb-1">Price</p>
            <p className="font-mono text-sm text-red-600">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p>
          </div>
          
          <button 
            onClick={() => {
              if (currentStep.options.length > 0 && !selections[currentStep.id]) {
                setError("Select a component");
                return;
              }
              currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
            }}
            className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-black uppercase text-[11px] tracking-widest flex items-center gap-3 ml-6 shadow-lg shadow-red-600/20 active:scale-95"
          >
            {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next Step'} <ChevronRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}

// --- SUMMARY VIEW ---
function SummaryView({ selections, onReset }: any) {
  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);

  const handleExport = () => {
    const doc = new jsPDF();
    
    // Стильний заголовок
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Червоний Adicto
    doc.text("ADICTO PRO BIKES", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Configuration Date: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text("Official Technical Specification", 14, 33);

    // Дані для таблиці
    const tableData = selections.map((c: any) => [
      c.name,
      c.brand,
      `${c.weight}g`,
      `€${c.price.toLocaleString()}`
    ]);

    // Генерація таблиці
    autoTable(doc, {
      startY: 40,
      head: [['Component', 'Brand', 'Weight', 'Price']],
      body: tableData,
      foot: [['TOTAL SPECIFICATION', '', `${totalWeight}g`, `€${totalPrice.toLocaleString()}`]],
      headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold' },
      footStyles: { fillColor: [30, 30, 30], textColor: [255, 255, 255] },
      theme: 'striped'
    });

    // Підпис внизу
    const finalY = (doc as any).lastAutoTable.finalY || 150;
    doc.setFontSize(8);
    doc.setTextColor(150);
    doc.text("Thank you for choosing Adicto Pro. This is a generated specification for your custom build.", 14, finalY + 10);

    doc.save("Adicto-Pro-Build.pdf");
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-8 text-center">
      <div className="max-w-2xl w-full">
        <CheckCircle2 size={60} className="text-red-600 mx-auto mb-6" />
        <h2 className="text-5xl font-black italic uppercase tracking-tighter mb-4 leading-none">
          Configuration <br/> <span className="text-red-600">Complete</span>
        </h2>
        
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
          <button 
            onClick={handleExport}
            className="px-8 py-4 bg-white text-black rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-zinc-200 transition-all flex items-center gap-2"
          >
            <Download size={16} /> Export PDF
          </button>
          <button 
            onClick={onReset} 
            className="px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all"
          >
            Start Over
          </button>
        </div>
      </div>
    </div>
  );
}
