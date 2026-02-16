import React from 'react';
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, Plus, CheckCircle2, Clock } from 'lucide-react';

export const CalendarView: React.FC = () => {
    const days = ['Lun', 'Mar', 'Mer', 'Gio', 'Ven', 'Sab', 'Dom'];
    const currentDate = new Date();

    // Generate dummy calendar grid
    const renderCalendarGrid = () => {
        const grid = [];
        for (let i = 0; i < 35; i++) {
            const isToday = i === 14;
            const isSelected = i === 14;
            const hasEvent = [14, 16, 20].includes(i);

            grid.push(
                <div key={i} className={`
                    min-h-[100px] border border-slate-100 p-2 relative group hover:bg-slate-50 transition-colors
                    ${isSelected ? 'bg-brand-50/30' : ''}
                `}>
                    <span className={`
                        text-sm font-semibold w-7 h-7 flex items-center justify-center rounded-full mb-1
                        ${isToday ? 'bg-brand-600 text-white shadow-md shadow-brand-500/30' : 'text-slate-500'}
                    `}>
                        {i + 1}
                    </span>

                    {hasEvent && (
                        <div className="bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs px-2 py-1 rounded-md font-medium truncate mb-1 cursor-pointer hover:bg-indigo-200">
                            Call con cliente
                        </div>
                    )}
                </div>
            );
        }
        return grid;
    };

    return (
        <div className="space-y-6 animate-fade-in h-[calc(100vh-120px)] flex flex-col">
            <div className="flex justify-between items-center">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <CalendarIcon className="text-brand-600" /> Calendario
                    </h1>
                    <p className="text-slate-500 mt-1">Organizza i tuoi appuntamenti e scadenze.</p>
                </div>
                <button className="px-4 py-2 bg-brand-600 text-white rounded-xl font-bold hover:bg-brand-700 transition-colors flex items-center gap-2 shadow-lg shadow-brand-500/20">
                    <Plus size={18} /> Nuovo Evento
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1">
                <div className="lg:col-span-3 bg-white rounded-2xl border border-slate-200 shadow-sm flex flex-col overflow-hidden">
                    {/* Calendar Header */}
                    <div className="p-4 border-b border-slate-100 flex justify-between items-center">
                        <div className="flex items-center gap-4">
                            <h2 className="text-lg font-bold text-slate-700">Febbraio 2026</h2>
                            <div className="flex gap-1">
                                <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronLeft size={20} /></button>
                                <button className="p-1 hover:bg-slate-100 rounded-lg text-slate-500"><ChevronRight size={20} /></button>
                            </div>
                        </div>
                        <div className="flex bg-slate-100 p-1 rounded-lg">
                            <button className="px-3 py-1 bg-white text-brand-600 rounded-md text-xs font-bold shadow-sm">Mese</button>
                            <button className="px-3 py-1 text-slate-500 hover:bg-white hover:text-slate-700 rounded-md text-xs font-medium transition-all">Settimana</button>
                            <button className="px-3 py-1 text-slate-500 hover:bg-white hover:text-slate-700 rounded-md text-xs font-medium transition-all">Giorno</button>
                        </div>
                    </div>

                    {/* Days Header */}
                    <div className="grid grid-cols-7 border-b border-slate-100">
                        {days.map(day => (
                            <div key={day} className="py-2 text-center text-xs font-bold text-slate-400 uppercase tracking-wider">
                                {day}
                            </div>
                        ))}
                    </div>

                    {/* Grid */}
                    <div className="grid grid-cols-7 flex-1">
                        {renderCalendarGrid()}
                    </div>
                </div>

                {/* Sidebar Tasks */}
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 flex flex-col">
                    <h3 className="font-bold text-slate-800 mb-4 flex justify-between items-center">
                        Prossimi Eventi
                        <span className="text-xs text-brand-600 bg-brand-50 px-2 py-1 rounded-full">3 oggi</span>
                    </h3>

                    <div className="space-y-3 overflow-y-auto flex-1 custom-scrollbar pr-2">
                        <div className="p-3 bg-indigo-50 rounded-xl border border-indigo-100">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-indigo-600 bg-white px-2 py-0.5 rounded-md shadow-sm">10:00</span>
                                <Clock size={14} className="text-indigo-400" />
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm">Call introduttiva Mario Rossi</h4>
                            <p className="text-xs text-slate-500 mt-1 truncate">Discutere requisiti nuovo sito web...</p>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors group">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">14:30</span>
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm group-hover:text-brand-700">Invio Preventivo #240</h4>
                        </div>

                        <div className="p-3 bg-white rounded-xl border border-slate-200 hover:border-brand-300 transition-colors group">
                            <div className="flex justify-between items-start mb-1">
                                <span className="text-xs font-bold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md group-hover:bg-brand-50 group-hover:text-brand-600 transition-colors">16:00</span>
                            </div>
                            <h4 className="font-bold text-slate-700 text-sm group-hover:text-brand-700">Revisione Design</h4>
                        </div>
                    </div>

                    <button className="mt-4 w-full py-2 border border-dashed border-slate-300 rounded-xl text-slate-500 text-sm font-bold hover:bg-slate-50 transition-colors flex items-center justify-center gap-2">
                        <Plus size={16} /> Aggiungi Task
                    </button>
                </div>
            </div>
        </div>
    );
};
