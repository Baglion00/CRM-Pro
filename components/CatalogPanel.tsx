import React, { useState, useMemo } from 'react';
import { CatalogItem, CURRENCY_FORMATTER } from '../types';
import { Plus, Trash2, Search, Package, Edit3, X, Tag, Save } from 'lucide-react';
import { ConfirmDialog } from './ui/ConfirmDialog';

interface CatalogPanelProps {
    items: CatalogItem[];
    onSave: (item: Partial<CatalogItem>) => void;
    onDelete: (id: string) => void;
    showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const EMPTY_ITEM: Partial<CatalogItem> = {
    name: '', description: '', unitPrice: 0, taxRate: 0, category: 'Generale'
};

export const CatalogPanel: React.FC<CatalogPanelProps> = ({ items, onSave, onDelete, showToast }) => {
    const [search, setSearch] = useState('');
    const [editing, setEditing] = useState<Partial<CatalogItem> | null>(null);
    const [deleteTarget, setDeleteTarget] = useState<CatalogItem | null>(null);
    const [filterCategory, setFilterCategory] = useState<string>('all');

    const categories = useMemo(() => {
        const cats = new Set(items.map(i => i.category || 'Generale'));
        return ['all', ...Array.from(cats).sort()];
    }, [items]);

    const filtered = useMemo(() => {
        return items.filter(item => {
            const matchesSearch = !search ||
                item.name.toLowerCase().includes(search.toLowerCase()) ||
                item.description.toLowerCase().includes(search.toLowerCase());
            const matchesCategory = filterCategory === 'all' || item.category === filterCategory;
            return matchesSearch && matchesCategory;
        });
    }, [items, search, filterCategory]);

    const handleSave = () => {
        if (!editing?.name?.trim()) {
            showToast('Inserisci il nome del prodotto/servizio', 'error');
            return;
        }
        onSave(editing);
        setEditing(null);
        showToast(editing.id ? 'Prodotto aggiornato!' : 'Prodotto aggiunto al catalogo!', 'success');
    };

    const handleDelete = () => {
        if (deleteTarget) {
            onDelete(deleteTarget.id);
            setDeleteTarget(null);
            showToast('Prodotto rimosso dal catalogo', 'info');
        }
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800">Catalogo Prodotti</h2>
                    <p className="text-slate-500 text-sm mt-1">{items.length} prodotti/servizi salvati</p>
                </div>
                <button
                    onClick={() => setEditing({ ...EMPTY_ITEM })}
                    className="bg-gradient-to-r from-brand-500 to-brand-700 text-white px-5 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all active:scale-[0.97] flex items-center gap-2"
                >
                    <Plus size={18} /> Nuovo Prodotto
                </button>
            </div>

            {/* Search + Category Filters */}
            <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative flex-1">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Cerca nel catalogo..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all text-sm"
                    />
                </div>
                <div className="flex gap-2 overflow-x-auto pb-1">
                    {categories.map(cat => (
                        <button
                            key={cat}
                            onClick={() => setFilterCategory(cat)}
                            className={`px-4 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${filterCategory === cat
                                    ? 'bg-brand-500 text-white shadow-sm'
                                    : 'bg-white border border-slate-200 text-slate-600 hover:border-brand-300'
                                }`}
                        >
                            {cat === 'all' ? 'Tutti' : cat}
                        </button>
                    ))}
                </div>
            </div>

            {/* Product Grid */}
            {filtered.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filtered.map(item => (
                        <div key={item.id} className="bg-white border border-slate-200/80 rounded-2xl p-5 shadow-sm hover:shadow-md transition-all group relative overflow-hidden">
                            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-violet-500 to-purple-600 opacity-0 group-hover:opacity-100 transition-opacity" />

                            <div className="flex items-start justify-between mb-3">
                                <div className="flex items-center gap-2">
                                    <div className="w-9 h-9 rounded-lg bg-violet-50 text-violet-600 flex items-center justify-center">
                                        <Package size={18} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-800 text-sm">{item.name}</h4>
                                        <span className="text-xs text-slate-400 flex items-center gap-1">
                                            <Tag size={10} /> {item.category || 'Generale'}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <button onClick={() => setEditing({ ...item })} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400 hover:text-brand-600 transition-colors">
                                        <Edit3 size={14} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(item)} className="p-1.5 rounded-lg hover:bg-red-50 text-slate-400 hover:text-red-500 transition-colors">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>

                            <p className="text-xs text-slate-500 mb-3 line-clamp-2">{item.description || 'Nessuna descrizione'}</p>

                            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                <span className="text-lg font-bold text-slate-800">{CURRENCY_FORMATTER.format(item.unitPrice)}</span>
                                <span className="text-xs text-slate-400">IVA {item.taxRate}%</span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white border border-slate-200/80 rounded-2xl p-12 text-center">
                    <Package size={48} className="mx-auto text-slate-200 mb-4" />
                    <p className="text-slate-400 font-medium">Nessun prodotto nel catalogo</p>
                    <p className="text-sm text-slate-300 mt-1">Aggiungi i tuoi servizi e prodotti per velocizzare la creazione dei preventivi.</p>
                </div>
            )}

            {/* Edit/Create Modal */}
            {editing && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-scale-in">
                        <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                            <h3 className="font-bold text-slate-800">{editing.id ? 'Modifica Prodotto' : 'Nuovo Prodotto'}</h3>
                            <button onClick={() => setEditing(null)} className="p-1.5 rounded-lg hover:bg-slate-100 text-slate-400">
                                <X size={18} />
                            </button>
                        </div>
                        <div className="p-6 space-y-4">
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Nome *</label>
                                <input
                                    type="text"
                                    value={editing.name || ''}
                                    onChange={e => setEditing({ ...editing, name: e.target.value })}
                                    placeholder="es. Sviluppo Sito Web"
                                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Descrizione</label>
                                <textarea
                                    value={editing.description || ''}
                                    onChange={e => setEditing({ ...editing, description: e.target.value })}
                                    placeholder="Descrizione del servizio..."
                                    rows={2}
                                    className="w-full mt-1 px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm resize-none"
                                />
                            </div>
                            <div className="grid grid-cols-3 gap-3">
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Prezzo (€)</label>
                                    <input
                                        type="number"
                                        value={editing.unitPrice || 0}
                                        onChange={e => setEditing({ ...editing, unitPrice: parseFloat(e.target.value) || 0 })}
                                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">IVA %</label>
                                    <input
                                        type="number"
                                        value={editing.taxRate || 0}
                                        onChange={e => setEditing({ ...editing, taxRate: parseFloat(e.target.value) || 0 })}
                                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm"
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Categoria</label>
                                    <input
                                        type="text"
                                        value={editing.category || ''}
                                        onChange={e => setEditing({ ...editing, category: e.target.value })}
                                        placeholder="Generale"
                                        className="w-full mt-1 px-3 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm"
                                    />
                                </div>
                            </div>
                        </div>
                        <div className="p-6 border-t border-slate-100 flex justify-end gap-3">
                            <button onClick={() => setEditing(null)} className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-100 transition-colors">
                                Annulla
                            </button>
                            <button onClick={handleSave} className="px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all flex items-center gap-2">
                                <Save size={16} /> {editing.id ? 'Aggiorna' : 'Salva'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Delete dialog */}
            <ConfirmDialog
                isOpen={!!deleteTarget}
                title="Elimina Prodotto"
                message={`Vuoi eliminare "${deleteTarget?.name}" dal catalogo?`}
                confirmLabel="Elimina"
                onConfirm={handleDelete}
                onCancel={() => setDeleteTarget(null)}
                variant="danger"
            />
        </div>
    );
};
