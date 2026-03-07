import React, { useState, useMemo, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Download, CheckCircle2 } from 'lucide-react';
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
  stepTitle?: string; // Потрібно для PDF
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
    <div id="bike-visualizer" className="relative w-full h-full bg-zinc-950 rounded-[1.5rem] md:rounded-[2.5rem] overflow-hidden border border-white/5 shadow-[0_0_100px_rgba(0,0,0,0.5)] flex items-center justify-center">
      <div className="absolute inset-0 opacity-5 pointer-events-none" 
           style={{ backgroundImage: 'radial-gradient(circle, #fff 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      <AnimatePresence mode="popLayout">
        {selectedComponents.map((comp) => (
          <motion.img
            key={comp.id}
            src={comp.imageUrl}
            crossOrigin="anonymous" 
            loading="eager"
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
        "relative flex flex-col p-2 md:p-3 rounded-xl md:rounded-2xl border text-left transition-all group w-full",
        isSelected 
        ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" 
        : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900"
      )}
    >
      <div className="aspect-square w-full rounded-lg md:rounded-xl bg-black/40 mb-2 md:mb-3 overflow-hidden relative">
        <img src={component.cardImageUrl} alt={component.name} className="w-full h-full object-contain p-1 md:p-2 group-hover:scale-110 transition duration-500" />
        {isSelected && (
          <div className="absolute top-1 md:top-2 right-1 md:right-2 bg-red-600 p-1 md:p-1.5 rounded-full shadow-lg z-10">
            <CheckCircle2 size={10} className="text-white md:hidden" />
            <CheckCircle2 size={12} className="text-white hidden md:block" />
          </div>
        )}
      </div>

      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h3 className="text-[9px] md:text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 text-zinc-300 uppercase">{component.name}</h3>
          <p className="text-[7px] md:text-[9px] text-zinc-500 uppercase font-black">{component.brand}</p>
        </div>
        <div className="flex justify-between items-end mt-1 md:mt-2">
          <p className="font-mono text-xs md:text-sm text-red-600 tracking-tighter">
            €{component.price.toLocaleString()}
          </p>
          <p className="text-[10px] md:text-sm text-zinc-600 font-mono italic">{component.weight}g</p>
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
                return {
                  id: `${step.id}-${idx}`,
                  name: row.Name || row.NAME || 'Unknown',
                  brand: row.Brand || row.BRAND || '',
                  price: Number(row.Price || row.PRICE) || 0,
                  weight: Number(row.Weight || row.WEIGHT) || 0,
                  imageUrl: row[findKey('imageurl') || 'image'] || "",
                  cardImageUrl: row[findKey('cardimg') || 'cardimage'] || row[findKey('imageurl') || 'image'] || "",
                  zIndex: Number(row[findKey('zindex')]) || 10
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

  const jumpToStep = (index: number) => {
    if (index === 0 || !!selections[steps[index - 1]?.id] || index < currentStepIndex) {
      setCurrentStepIndex(index);
      setError(null);
    }
  };

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-32 lg:pb-24">
      <nav className="border-b border-white/5 px-4 md:px-8 py-3 md:py-4 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-2 md:gap-4">
          <img src="/design/Logo.png" alt="Logo" className="h-5 md:h-6 w-auto object-contain" />
          <div className="flex flex-col border-l border-white/10 pl-3 md:pl-4 gap-0.4 w-[70px] md:w-[85px]">
            <div className="flex justify-between w-full leading-none">
              {"ADICTO".split("").map((char, i) => <span key={i} className="text-[7px] md:text-[9px] font-black italic uppercase text-white">{char}</span>)}
            </div>
            <span className="text-[6px] md:text-[8px] uppercase tracking-widest text-zinc-500 font-bold block text-center">Config</span>
          </div>
        </div>
        <div className="flex items-center gap-6">
          {isAdmin && <ExcelImporter onDataLoaded={(newSteps) => { setSteps(newSteps); setSelections({}); setCurrentStepIndex(0); }} />}
          <div className="text-zinc-400 font-mono text-[8px] md:text-[9px] pr-2 opacity-60 uppercase tracking-widest hidden sm:block">Build by Vasile</div>
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-4 md:px-6 pt-4 md:pt-10">
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-6 lg:gap-10 items-stretch">
          
          <div className="lg:col-span-9 flex flex-col gap-4 md:gap-6 order-1">
            <div className="flex overflow-x-auto lg:overflow-visible no-scrollbar justify-start items-center px-2 gap-4 md:gap-6 pb-2">
              {steps.map((step, idx) => (
                <button key={step.id} onClick={() => jumpToStep(idx)} className={cn("transition-all duration-300 text-[9px] md:text-[10px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap shrink-0", idx === currentStepIndex ? "text-red-600 border-red-600 drop-shadow-[0_0_9px_rgba(255,0,0,0.3)]" : "text-white opacity-20 border-transparent hover:opacity-100")}>
                  {step.title}
                </button>
              ))}
            </div>
            <div className="aspect-[4/3] md:aspect-video lg:h-[550px]">
              <Visualizer selectedComponents={selectedComponents} />
            </div>
          </div>

          <div className="lg:col-span-3 flex flex-col h-[400px] lg:h-auto bg-zinc-900/40 rounded-[1.5rem] md:rounded-[2.5rem] border border-white/5 p-4 md:p-6 relative overflow-hidden order-2">
            <div ref={listRef} className="flex-1 space-y-2 velocraft-scrollbar overflow-y-auto pr-1">
                {error && <div className="mb-4 text-red-500 bg-red-600/10 p-2 rounded-lg text-[9px] font-bold uppercase">{error}</div>}
                <div className="grid grid-cols-2 lg:grid-cols-1 gap-2 md:gap-3">
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
        </div>
      </main>

      <div className="fixed bottom-0 left-0 right-0 bg-black/80 backdrop-blur-2xl border-t border-white/5 z-40">
        <div className="max-w-[1500px] mx-auto px-4 md:px-6 py-4 md:py-6 flex justify-between items-center">
          <button onClick={() => currentStepIndex > 0 && setCurrentStepIndex(currentStepIndex - 1)} className="flex items-center gap-1 md:gap-3 text-zinc-500 hover:text-white transition-all font-black uppercase text-[9px] md:text-[10px] tracking-widest">
            <ChevronLeft size={18} /> <span className="hidden xs:inline">Back</span>
          </button>

          <div className="flex gap-4 md:gap-10 items-center">
            <div className="text-right">
              <p className="text-[7px] md:text-[8px] text-zinc-600 uppercase font-black">Weight</p>
              <p className="font-mono text-xs md:text-sm tracking-tighter">{selectedComponents.reduce((acc, c) => acc + c.weight, 0)}g</p>
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="text-right">
              <p className="text-[7px] md:text-[8px] text-zinc-600 uppercase font-black">Price</p>
              <p className="font-mono text-xs md:text-sm text-red-600 tracking-tighter">€{selectedComponents.reduce((acc, c) => acc + c.price, 0).toLocaleString()}</p>
            </div>
            <button 
              onClick={() => {
                if (currentStep.options.length > 0 && !selections[currentStep.id]) { setError("Select!"); return; }
                currentStepIndex < steps.length - 1 ? setCurrentStepIndex(currentStepIndex + 1) : setIsFinished(true);
              }}
              className="bg-red-600 hover:bg-red-700 text-white h-[32px] px-4 md:px-[22px] rounded-lg font-black uppercase text-[9px] md:text-[10px] tracking-widest flex items-center gap-2 md:gap-3 transition-all active:scale-95"
            >
              {currentStepIndex === steps.length - 1 ? 'Finish' : 'Next'} <ChevronRight size={14} />
            </button>
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
    try {
      const res = await fetch(url);
      const blob = await res.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(blob);
      });
    } catch (e) {
      return "";
    }
  };

  const handleExport = async () => {
    const doc = new jsPDF(); 
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const cleanText = (text: string) => text ? String(text).replace(/[^\x00-\x7F]/g, "").toUpperCase() : "";

    try {
      const logoBase64 = await getBase64Image("/design/Logo.png");
      if (logoBase64) {
          doc.saveGraphicsState();
          doc.setGState(new (doc as any).GState({ opacity: 0.8 }));
          doc.addImage(logoBase64, 'PNG', (pageWidth / 2) - 15, 8, 10, 10); 
          doc.restoreGraphicsState();
      }
    } catch (e) {}

    try {
      const sortedByZ = [...selections].sort((a, b) => (a.zIndex || 0) - (b.zIndex || 0));
      for (const comp of sortedByZ) {
        if (comp.imageUrl) {
          const imgBase64 = await getBase64Image(comp.imageUrl);
          if (imgBase64) {
            doc.addImage(imgBase64, 'PNG', 15, 22, 180, 105, undefined, 'FAST');
          }
        }
      }
    } catch (e) {}

    autoTable(doc, {
      startY: 140, 
      head: [['SECTION', 'COMPONENT', 'BRAND', 'WEIGHT', 'PRICE']],
      body: selections.map((c: any) => [
        cleanText(c.stepTitle || ""), 
        cleanText(c.name), 
        cleanText(c.brand), 
        `${c.weight} g`, 
        `${c.price.toLocaleString()} €`
      ]),
      styles: { font: "helvetica", fontSize: 5.8, cellPadding: 2 },
      headStyles: { fillColor: [20, 20, 20], textColor: [255, 255, 255] },
      columnStyles: { 0: { fontStyle: 'bold', cellWidth: 25 } },
      foot: [['TOTAL SPECIFICATION', '', '', `${totalWeight} g`, `${totalPrice.toLocaleString()} €`]],
      footStyles: { 
        fillColor: [220, 38, 38], 
        textColor: [255, 255, 255], 
        fontSize: 9,  
        fontStyle: 'bold',
        cellPadding: 3 
      },
      didParseCell: (data) => {
        if (data.section === 'foot' && data.column.index === 0) {
            data.cell.styles.cellWidth = 'wrap'; 
        }
      },
      theme: 'grid'
    });

    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(5.6); 
    doc.setTextColor(140);
    const disclaimer = "NOTICE: THE WEIGHT AND PRICE INDICATED ARE PRELIMINARY AND SUBJECT TO MINOR CHANGES BASED ON COMPONENT AVAILABILITY AND TECHNICAL ASSEMBLY SPECIFICATIONS. ADICTO.BIKE RESERVES THE RIGHT TO MODIFY SPECIFICATIONS WITHOUT PRIOR NOTICE.";
    doc.text(doc.splitTextToSize(disclaimer, pageWidth - 28), 14, finalY);

    const footerY = pageHeight - 20;
    doc.setFontSize(6.3); 
    doc.setTextColor(100);
    doc.text("WWW.ADICTO.BIKE  |  @ADICTO.BIKE", pageWidth / 2, footerY, { align: 'center' });

    try { doc.addImage("/design/qr-code.png", "PNG", pageWidth - 50, pageHeight - 50, 35, 35); } catch (e) {}

    doc.save(`ADICTO_BUILD.pdf`);
  };

  return (
    <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center p-6 text-center">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl w-full">
        <CheckCircle2 size={32} className="text-red-600 mx-auto mb-4" /> 
        <h2 className="text-[22px] md:text-[27px] font-black italic uppercase mb-4 leading-tight">
          Configuration <br/> <span className="text-red-600">Complete</span>
        </h2>

        <div className="flex justify-center gap-6 md:gap-10 my-6 md:my-8 bg-zinc-900/50 p-6 rounded-3xl border border-white/5">
          <div>
            <p className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Total Price</p>
            <p className="text-[22px] md:text-[27px] font-mono text-red-600">€{totalPrice.toLocaleString()}</p>
          </div>
          <div className="w-px bg-white/10" />
          <div>
            <p className="text-zinc-500 text-[8px] md:text-[10px] uppercase font-bold tracking-widest">Total Weight</p>
            <p className="text-[22px] md:text-[27px] font-mono">{totalWeight}g</p>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center">
          <button onClick={handleExport} className="w-full sm:w-auto px-8 py-4 bg-red-600 text-white rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-red-700 transition-all flex items-center justify-center gap-2">
            <Download size={16} /> Export PDF
          </button>
          <button onClick={onReset} className="w-full sm:w-auto px-8 py-4 border border-white/10 rounded-xl font-black uppercase text-[10px] tracking-widest hover:bg-white/5 transition-all">
            Start Over
          </button>
        </div>
      </motion.div>
    </div>
  );
}
