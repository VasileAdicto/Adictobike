import React from 'react';
import { Step, Component, BikeConfig } from '../types';
import { jsPDF } from 'jspdf';
import html2canvas from 'html2canvas';
import { Download, Send, ArrowLeft } from 'lucide-react';

interface SummaryViewProps {
  steps: Step[];
  selections: Record<string, string>;
  onBack: () => void;
}

export const SummaryView: React.FC<SummaryViewProps> = ({ steps, selections, onBack }) => {
  const selectedComponents = steps
    .map(step => step.options.find(opt => opt.id === selections[step.id]))
    .filter((c): c is Component => !!c);

  const totalPrice = selectedComponents.reduce((acc, c) => acc + c.price, 0);
  const totalWeight = selectedComponents.reduce((acc, c) => acc + c.weight, 0);

  const exportPDF = async () => {
    const element = document.getElementById('summary-content');
    if (!element) return;

    const canvas = await html2canvas(element, {
      scale: 2,
      backgroundColor: '#000000',
    });
    
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    pdf.save('velocraft-bike-spec.pdf');
  };

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors mb-8 font-mono text-sm uppercase tracking-widest"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Configurator
      </button>

      <div id="summary-content" className="bg-black p-12 rounded-3xl border border-white/10 shadow-2xl">
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2 tracking-tighter">VELOCRAFT</h1>
            <p className="text-red-600 font-mono text-sm uppercase tracking-[0.3em]">Build Specification</p>
          </div>
          <div className="text-right">
            <p className="text-zinc-500 font-mono text-xs uppercase mb-1">Date</p>
            <p className="text-white font-mono">{new Date().toLocaleDateString()}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-12">
          <div className="space-y-4">
            <h2 className="text-zinc-500 font-mono text-xs uppercase tracking-widest border-b border-white/10 pb-2">Components</h2>
            {selectedComponents.map((comp, idx) => (
              <div key={comp.id} className="flex justify-between items-center py-2 border-b border-white/5">
                <div>
                  <p className="text-white font-medium">{comp.name}</p>
                  <p className="text-zinc-500 text-xs uppercase font-mono">{comp.brand}</p>
                </div>
                <div className="text-right">
                  <p className="text-white font-mono">€{comp.price}</p>
                  <p className="text-zinc-500 font-mono text-xs">{comp.weight}g</p>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-zinc-900/50 p-8 rounded-2xl border border-white/5 flex flex-col justify-center">
            <div className="mb-8">
              <p className="text-zinc-500 font-mono text-xs uppercase tracking-widest mb-2">Total Weight</p>
              <p className="text-5xl font-bold text-white font-mono">{(totalWeight / 1000).toFixed(2)}<span className="text-xl ml-2 text-zinc-500">kg</span></p>
            </div>
            <div>
              <p className="text-red-600 font-mono text-xs uppercase tracking-widest mb-2">Total Price</p>
              <p className="text-5xl font-bold text-white font-mono">€{totalPrice.toLocaleString()}</p>
            </div>
          </div>
        </div>

        <div className="pt-12 border-t border-white/10">
          <p className="text-zinc-500 text-xs font-mono leading-relaxed">
            This specification is a preliminary build configuration from the VeloCraft Engine. 
            Final weights may vary based on frame size and hardware choices. 
            Prices exclude local taxes and shipping unless specified.
          </p>
        </div>
      </div>

      <div className="mt-12 flex flex-col sm:flex-row gap-4">
        <button 
          onClick={exportPDF}
          className="flex-1 bg-white text-black font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-zinc-200 transition-colors"
        >
          <Download className="w-5 h-5" />
          Download PDF Spec
        </button>
        <button className="flex-1 bg-red-600 text-white font-bold py-4 rounded-xl flex items-center justify-center gap-3 hover:bg-red-700 transition-colors">
          <Send className="w-5 h-5" />
          Send to WhatsApp
        </button>
      </div>
    </div>
  );
};
