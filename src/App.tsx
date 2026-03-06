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
  imageUrl: string;      // Фото для велосипеда
  cardImageUrl: string;  // Нове фото для картки в меню
  zIndex: number;
}

interface Step {
  id: string;
  title: string;
  options: Component[];
}

// --- INITIAL DATA (Повністю відповідає твоєму Excel) ---
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
      onClick={onClick}
      className={cn(
        "relative flex flex-col p-3 rounded-2xl border text-left transition-all group w-full",
        isSelected 
        ? "border-red-600 bg-red-600/5 ring-1 ring-red-600/20 shadow-[0_0_20px_rgba(255,0,0,0.1)]" 
        : "border-white/5 bg-zinc-900/50 hover:border-white/20 hover:bg-zinc-900"
      )}
    >
      {/* Контейнер для фото */}
      <div className="aspect-square w-full rounded-xl bg-black/40 mb-3 overflow-hidden relative">
        <img 
          src={component.cardImageUrl} 
          alt={component.name} 
          className="w-full h-full object-contain p-2 group-hover:scale-110 transition duration-500" 
        />
        {isSelected && (
          <div className="absolute top-2 right-2 bg-red-600 p-1.5 rounded-full shadow-lg z-10">
            <CheckCircle2 size={12} className="text-white" />
          </div>
        )}
      </div>

      {/* Текстовий блок: Назва, Бренд, Ціна, Вага */}
      <div className="flex-1 flex flex-col justify-between overflow-hidden">
        <div>
          <h3 className="text-[11px] font-bold leading-tight tracking-tighter line-clamp-2 text-zinc-300 uppercase">
            {component.name}
          </h3>
          <p className="text-[9px] text-zinc-500 uppercase font-black">
            {component.brand}
          </p>
        </div>
        
        <div className="flex justify-between items-end mt-2">
          <p className="font-black text-sm text-red-600">
            €{component.price.toLocaleString()}
          </p>
          <p className="text-sm text-zinc-600 font-mono italic">
            {component.weight}g
          </p>
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

  // --- АВТОЗАВАНТАЖЕННЯ EXCEL ---
  useEffect(() => {
    const autoLoadExcel = async () => {
      try {
        const response = await fetch('/data.xlsx');
        if (!response.ok) throw new Error("Файл не знайдено");
        
        const arrayBuffer = await response.arrayBuffer();
        const XLSX = await import('xlsx');
        const workbook = XLSX.read(arrayBuffer);
        
        const newSteps = INITIAL_STEPS.map(step => {
          // Шукаємо вкладку, ігноруючи регістр букв
          const sheetName = Object.keys(workbook.Sheets).find(
            name => name.toUpperCase().trim() === step.title.toUpperCase().trim()
          );
          
          const sheet = sheetName ? workbook.Sheets[sheetName] : null;

          if (sheet) {
            const data = XLSX.utils.sheet_to_json(sheet);
            return {
              ...step,
              options: data.map((row: any, idx: number) => {
                // Знаходимо назви колонок незалежно від регістру
                // Усередині data.map((row: any, idx: number) => { ... })
const rowKeys = Object.keys(row);
const findKey = (name: string) => rowKeys.find(k => k.toLowerCase().trim() === name.toLowerCase());

const imageKey = findKey('imageurl') || findKey('image');
const cardImageKey = findKey('cardimg') || findKey('cardimage'); // Шукаємо Cardimg
const zKey = findKey('zindex');

return {
  id: `${step.id}-${idx}`,
  name: row.Name || row.NAME || 'Unknown',
  brand: row.Brand || row.BRAND || '',
  price: Number(row.Price || row.PRICE) || 0,
  weight: Number(row.Weight || row.WEIGHT) || 0,
  imageUrl: imageKey ? row[imageKey] : "",
  // Якщо Cardimg порожній, використовуємо звичайний imageUrl як заміну
  cardImageUrl: cardImageKey ? row[cardImageKey] : (imageKey ? row[imageKey] : ""),
  zIndex: zKey ? Number(row[zKey]) : 10
};
              })
            };
          }
          return step;
        });
        setSteps(newSteps);
      } catch (err) {
        console.error("Помилка автозавантаження:", err);
      }
    };
    autoLoadExcel();
  }, []);

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

  if (isFinished) return <SummaryView selections={selectedComponents} onReset={() => window.location.reload()} />;

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-red-600 pb-24">
      {/* Navbar */}
      <nav className="border-b border-white/5 px-8 py-4 flex justify-between items-center bg-black/80 backdrop-blur-2xl sticky top-0 z-50">
        <div className="flex items-center gap-4 pl-2">
          {/* Твій новий логотип */}
          <img 
            src="/design/Logo.png" 
            alt="Adictobike Logo" 
            className="h-6 w-auto object-contain" 
          />
          
          {/* Розділювач та підпис */}
          <div className="hidden sm:flex flex-col border-l border-white/10 pl-4 gap-0.4 w-[85px]"> 
  {/* gap-0 робить відстань мінімальною */}
  <div className="flex justify-between w-full leading-none">
    {"ADICTO.BIKE".split("").map((char, i) => (
      <span key={i} className="text-[9px] font-black italic uppercase text-white">
        {char}
      </span>
    ))}
  </div>
  <span className="text-[8px] uppercase tracking-[0.06em] text-zinc-500 font-bold block w-full text-center leading-none">
    {/* Прибрано mt-1 для щільності */}
    Configurator
  </span>
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
          <div className="text-zinc-400 font-mono text-[9px] pr-2 opacity-60 uppercase tracking-widest">Build by Vasile</div>
        </div>
      </nav>

      <main className="max-w-[1500px] mx-auto px-6 pt-10">
        <div className="grid grid-cols-12 gap-10 h-[500px] items-stretch">
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

          <div className="col-span-9 flex flex-col gap-6">
  {/* Додано flex-wrap для переносу та зменшено gap */}
  <div className="flex flex-wrap justify-start items-center px-4 gap-x-4 gap-y-2">
    {steps.map((step, idx) => (
      <button
        key={step.id}
        onClick={() => jumpToStep(idx)}
        className={cn(
          // Зменшено шрифт до 8px (text-[8px]) та прибрано зайві відступи
          "transition-all duration-300 text-[9px] font-black italic uppercase tracking-widest pb-1 border-b-2 whitespace-nowrap",
          idx === currentStepIndex 
            ? "text-red-600 border-red-600 drop-shadow-[0_0_9px_rgba(255,0,0,0.3)]" 
            : "text-white opacity-20 border-transparent hover:opacity-100"
        )}
      >
        {step.title}
      </button>
    ))}
  </div>
  {/* Тут далі йде твій Visualizer */}
  <div className="flex-1">
    <Visualizer selectedComponents={selectedComponents} />
  </div>
</div>
        </div>
      </main>

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

function SummaryView({ selections, onReset }: any) {
  const totalPrice = selections.reduce((acc: number, c: any) => acc + c.price, 0);
  const totalWeight = selections.reduce((acc: number, c: any) => acc + c.weight, 0);

  const handleExport = () => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // 1. Заголовок
    doc.setFontSize(22);
    doc.setTextColor(220, 38, 38); // Червоний Adicto
    doc.text("ADICTO.BIKE", 14, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100);
    doc.text(`Configuration Date: ${new Date().toLocaleDateString()}`, 14, 28);
    doc.text("Custom Build Specification", 14, 33);

    // 2. Таблиця з компонентами
    const tableData = selections.map((c: any) => [
      c.name,
      c.brand,
      `${c.weight}g`,
      `€${c.price.toLocaleString()}`
    ]);

    autoTable(doc, {
      startY: 40,
      head: [['Component', 'Brand', 'Weight', 'Price']],
      body: tableData,
      foot: [['TOTAL SPECIFICATION', '', `${totalWeight}g`, `€${totalPrice.toLocaleString()}`]],
      headStyles: { fillColor: [220, 38, 38], fontStyle: 'bold' },
      footStyles: { fillColor: [240, 240, 240], textColor: [0, 0, 0], fontStyle: 'bold' },
      theme: 'striped'
    });

    // 3. Дисклеймер (Текст про вагу та ціну)
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    doc.setFontSize(8);
    doc.setTextColor(150);
    const disclaimer = "Зверніть увагу: вказані вага та ціна є попередніми та можуть несуттєво змінюватися залежно від наявності компонентів та технічних особливостей збірки. ADICTO.BIKE залишає за собою право вносити зміни у специфікацію без попереднього повідомлення.";
    const splitDisclaimer = doc.splitTextToSize(disclaimer, pageWidth - 28);
    doc.text(splitDisclaimer, 14, finalY);

    // 4. Контакти та QR-код у футері
    const footerY = pageHeight - 40;
    doc.setDrawColor(220, 38, 38);
    doc.line(14, footerY - 5, pageWidth - 14, footerY - 5); // Лінія-розділювач

    // Текст контактів
    doc.setFontSize(10);
    doc.setTextColor(0);
    doc.setFont("helvetica", "bold");
    doc.text("CONTACT US:", 14, footerY + 5);
    doc.setFont("helvetica", "normal");
    doc.text("Web: www.adicto.bike", 14, footerY + 12);
    doc.text("Instagram: @adicto.bike", 14, footerY + 19);
    doc.text("Email: hello@adicto.bike", 14, footerY + 26);

    // Додавання QR-коду (має бути в public/design/qr-code.png)
    try {
      doc.addImage("/design/qr-code.png", "PNG", pageWidth - 45, footerY, 30, 30);
    } catch (e) {
      console.warn("QR-код не знайдено за шляхом public/design/qr-code.png");
    }

    doc.save(`Adicto-Build-${new Date().getTime()}.pdf`);
  };
} //
