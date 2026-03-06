import React from 'react';
import * as XLSX from 'xlsx';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { Step, Component } from '../types';

interface ExcelImporterProps {
  onDataLoaded: (steps: Step[]) => void;
}

export const ExcelImporter: React.FC<ExcelImporterProps> = ({ onDataLoaded }) => {
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      const bstr = evt.target?.result;
      const wb = XLSX.read(bstr, { type: 'binary' });
      
      const newSteps: Step[] = wb.SheetNames.map((sheetName) => {
        const ws = wb.Sheets[sheetName];
        const data = XLSX.utils.sheet_to_json<any>(ws);
        
        return {
          id: sheetName.toLowerCase().replace(/\s+/g, '-'),
          title: sheetName,
          options: data.map((row: any, idx: number) => ({
            id: `${sheetName}-${idx}`,
            name: row.Name || 'Unknown Component',
            brand: row.Brand || 'Generic',
            price: Number(row.Price) || 0,
            weight: Number(row.Weight) || 0,
            image: row.ImageURL || `https://picsum.photos/seed/${row.Name}/800/600`,
            zIndex: Number(row.ZIndex) || 10,
          }))
        };
      });

      onDataLoaded(newSteps);
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 bg-zinc-800 hover:bg-zinc-700 text-white px-4 py-2 rounded-lg cursor-pointer transition-colors border border-white/10">
        <Upload className="w-4 h-4" />
        <span className="text-sm font-mono uppercase tracking-wider">Import .xlsx</span>
        <input type="file" className="hidden" accept=".xlsx, .xls" onChange={handleFileUpload} />
      </label>
      <div className="group relative">
        <FileSpreadsheet className="w-5 h-5 text-zinc-500 cursor-help" />
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-zinc-900 border border-white/10 rounded-lg text-[10px] text-zinc-400 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-50">
          <p className="font-bold text-white mb-1 uppercase tracking-widest">Excel Template</p>
          <p>Each tab = One Step (e.g., "Frame", "Wheels")</p>
          <p className="mt-1">Columns: Name, Brand, Price, Weight, ImageURL, ZIndex</p>
        </div>
      </div>
    </div>
  );
};
