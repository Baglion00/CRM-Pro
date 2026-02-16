import React from 'react';
import { Kanban, MoreHorizontal, Plus } from 'lucide-react';

export const PipelineView: React.FC = () => {
    const stages = [
        { id: 'lead', name: 'Nuovi Lead', count: 3, color: 'bg-blue-500' },
        { id: 'contacted', name: 'Contattati', count: 5, color: 'bg-amber-500' },
        { id: 'proposal', name: 'In Trattativa', count: 2, color: 'bg-purple-500' },
        { id: 'won', name: 'Vinti', count: 12, color: 'bg-emerald-500' },
    ];

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Kanban className="text-brand-600" /> Pipeline Vendite
                    </h1>
                    <p className="text-slate-500 mt-1">Gestisci le trattative e monitora il processo di vendita.</p>
                </div>
                <button className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-500/20">
                    <Plus size={18} /> Nuova Trattativa
                </button>
            </div>

            <div className="flex gap-4 overflow-x-auto pb-4 flex-1">
                {stages.map(stage => (
                    <div key={stage.id} className="min-w-[280px] w-full max-w-xs flex flex-col bg-slate-50/50 rounded-xl border border-slate-200/60">
                        <div className="p-3 border-b border-slate-200/60 flex justify-between items-center bg-white rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <span className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
                                <span className="font-bold text-slate-700 text-sm">{stage.name}</span>
                                <span className="px-1.5 py-0.5 bg-slate-100 text-slate-500 text-xs rounded-md font-medium">{stage.count}</span>
                            </div>
                            <button className="text-slate-400 hover:text-slate-600"><MoreHorizontal size={16} /></button>
                        </div>

                        <div className="p-2 space-y-2 overflow-y-auto flex-1 custom-scrollbar">
                            {[...Array(stage.count)].map((_, i) => (
                                <div key={i} className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm hover:shadow-md transition-shadow cursor-grab active:cursor-grabbing group">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Azienda {(i + 1) * 10}</div>
                                        <button className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-slate-600"><MoreHorizontal size={14} /></button>
                                    </div>
                                    <h4 className="font-bold text-slate-800 mb-1">Progetto CRM Custom</h4>
                                    <div className="flex items-center justify-between mt-3">
                                        <span className="text-sm font-bold text-slate-700">€ 2.500</span>
                                        <div className="w-6 h-6 rounded-full bg-brand-100 text-brand-600 flex items-center justify-center text-xs font-bold border border-white ring-1 ring-slate-100">
                                            AB
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button className="min-w-[280px] h-12 border-2 border-dashed border-slate-300 rounded-xl flex items-center justify-center text-slate-500 font-bold hover:border-brand-400 hover:text-brand-600 hover:bg-brand-50/50 transition-all">
                    <Plus size={18} className="mr-2" /> Aggiungi Fase
                </button>
            </div>
        </div>
    );
};
