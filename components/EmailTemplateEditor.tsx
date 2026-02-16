import React, { useState } from 'react';
import { EmailTemplate } from '../types';
import { Save, Plus, X, Variable, Eye, ChevronRight, Mail } from 'lucide-react';

interface EmailTemplateEditorProps {
    templates: EmailTemplate[];
    onSave: (templates: EmailTemplate[]) => void;
    showToast: (msg: string, type: 'success' | 'error') => void;
}

const AVAILABLE_VARIABLES = [
    { key: '{{client.name}}', label: 'Nome Cliente' },
    { key: '{{client.email}}', label: 'Email Cliente' },
    { key: '{{quote.number}}', label: 'Numero Preventivo' },
    { key: '{{quote.total}}', label: 'Totale' },
    { key: '{{quote.link}}', label: 'Link Preventivo' },
    { key: '{{company.name}}', label: 'Nome Tua Azienda' },
    { key: '{{date.today}}', label: 'Data Odierna' },
];

export const EmailTemplateEditor: React.FC<EmailTemplateEditorProps> = ({ templates, onSave, showToast }) => {
    const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
    const [editingTemplate, setEditingTemplate] = useState<EmailTemplate | null>(null);

    const activeTemplate = editingTemplate || templates.find(t => t.id === selectedTemplateId);

    const handleCreate = () => {
        const newTemplate: EmailTemplate = {
            id: crypto.randomUUID(),
            name: 'Nuovo Modello',
            subject: '',
            body: 'Gentile {{client.name}},\n\necco il preventivo richiesto...',
            variables: []
        };
        setEditingTemplate(newTemplate);
        setSelectedTemplateId(newTemplate.id);
    };

    const handleSelect = (t: EmailTemplate) => {
        setSelectedTemplateId(t.id);
        setEditingTemplate({ ...t });
    };

    const handleSave = () => {
        if (!editingTemplate) return;
        if (!editingTemplate.name) {
            showToast('Il nome del modello è obbligatorio', 'error');
            return;
        }

        const newTemplates = selectedTemplateId && templates.some(t => t.id === selectedTemplateId)
            ? templates.map(t => t.id === selectedTemplateId ? editingTemplate : t)
            : [...templates, editingTemplate];

        onSave(newTemplates);
        setEditingTemplate(null);
        showToast('Modello salvato!', 'success');
    };

    const handleDelete = (id: string) => {
        if (window.confirm('Sei sicuro di voler eliminare questo modello?')) {
            const newTemplates = templates.filter(t => t.id !== id);
            onSave(newTemplates);
            if (selectedTemplateId === id) {
                setSelectedTemplateId(null);
                setEditingTemplate(null);
            }
            showToast('Modello eliminato', 'success');
        }
    };

    const insertVariable = (variable: string) => {
        if (!editingTemplate) return;
        const textarea = document.getElementById('template-body') as HTMLTextAreaElement;
        if (textarea) {
            const start = textarea.selectionStart;
            const end = textarea.selectionEnd;
            const text = editingTemplate.body;
            const newBody = text.substring(0, start) + variable + text.substring(end);
            setEditingTemplate({ ...editingTemplate, body: newBody });

            // Re-focus and set cursor position (next tick)
            setTimeout(() => {
                textarea.focus();
                textarea.setSelectionRange(start + variable.length, start + variable.length);
            }, 0);
        }
    };

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 h-[600px]">
            {/* Sidebar List */}
            <div className="bg-slate-50 rounded-xl border border-slate-200 p-4 flex flex-col">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-slate-700">I tuoi Modelli</h3>
                    <button onClick={handleCreate} className="p-2 bg-brand-600 text-white rounded-lg hover:bg-brand-700 transition-colors">
                        <Plus size={16} />
                    </button>
                </div>
                <div className="space-y-2 overflow-y-auto flex-1">
                    {templates.length === 0 && (
                        <div className="text-center py-8 text-slate-400 text-sm">
                            Nessun modello salvato. Creane uno nuovo!
                        </div>
                    )}
                    {templates.map(t => (
                        <div
                            key={t.id}
                            onClick={() => handleSelect(t)}
                            className={`p-3 rounded-lg border cursor-pointer transition-all flex items-center justify-between group ${selectedTemplateId === t.id
                                    ? 'bg-white border-brand-500 shadow-md ring-1 ring-brand-500/20'
                                    : 'bg-white border-slate-200 hover:border-brand-300'
                                }`}
                        >
                            <span className={`text-sm font-medium ${selectedTemplateId === t.id ? 'text-brand-700' : 'text-slate-700'}`}>
                                {t.name}
                            </span>
                            <button
                                onClick={(e) => { e.stopPropagation(); handleDelete(t.id); }}
                                className="opacity-0 group-hover:opacity-100 p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-all"
                            >
                                <X size={14} />
                            </button>
                        </div>
                    ))}
                </div>
            </div>

            {/* Editor Area */}
            <div className="md:col-span-2 bg-white rounded-xl border border-slate-200 shadow-sm flex flex-col">
                {activeTemplate ? (
                    <>
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50 rounded-t-xl">
                            <div className="flex items-center gap-2">
                                <Mail size={18} className="text-brand-500" />
                                <span className="font-bold text-slate-700">{editingTemplate ? 'Modifica Modello' : 'Anteprima Modello'}</span>
                            </div>
                            {editingTemplate && (
                                <button
                                    onClick={handleSave}
                                    className="flex items-center gap-2 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors"
                                >
                                    <Save size={16} /> Salva
                                </button>
                            )}
                        </div>

                        <div className="p-6 space-y-4 flex-1 overflow-y-auto">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome Modello</label>
                                    <input
                                        value={activeTemplate.name}
                                        onChange={(e) => editingTemplate && setEditingTemplate({ ...editingTemplate, name: e.target.value })}
                                        disabled={!editingTemplate}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 outline-none"
                                        placeholder="Es. Preventivo Standard"
                                    />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Oggetto Email</label>
                                    <input
                                        value={activeTemplate.subject}
                                        onChange={(e) => editingTemplate && setEditingTemplate({ ...editingTemplate, subject: e.target.value })}
                                        disabled={!editingTemplate}
                                        className="w-full px-3 py-2 rounded-lg border border-slate-200 text-sm focus:border-brand-500 outline-none"
                                        placeholder="Es. Il tuo preventivo {{quote.number}}"
                                    />
                                </div>
                            </div>

                            <div className="flex gap-4 h-full min-h-[300px]">
                                <div className="flex-1 flex flex-col">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1 flex justify-between">
                                        <span>Contenuto Email</span>
                                        <span className="text-xs text-brand-600 font-normal normal-case flex items-center gap-1">
                                            <Variable size={12} /> Clicca le variabili a destra per inserirle
                                        </span>
                                    </label>
                                    <textarea
                                        id="template-body"
                                        value={activeTemplate.body}
                                        onChange={(e) => editingTemplate && setEditingTemplate({ ...editingTemplate, body: e.target.value })}
                                        disabled={!editingTemplate}
                                        className="w-full flex-1 p-4 rounded-lg border border-slate-200 text-sm font-mono focus:border-brand-500 outline-none resize-none leading-relaxed"
                                        placeholder="Scrivi qui il corpo dell'email..."
                                    />
                                </div>

                                {/* Variables Sidebar */}
                                <div className="w-48 space-y-2">
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Variabili Dinamiche</label>
                                    <div className="space-y-1">
                                        {AVAILABLE_VARIABLES.map(v => (
                                            <button
                                                key={v.key}
                                                onClick={() => insertVariable(v.key)}
                                                disabled={!editingTemplate}
                                                className="w-full text-left px-3 py-2 rounded-lg bg-slate-50 hover:bg-brand-50 border border-slate-100 hover:border-brand-200 text-xs text-slate-600 hover:text-brand-700 transition-all flex items-center justify-between group disabled:opacity-50 disabled:cursor-not-allowed"
                                            >
                                                <span>{v.label}</span>
                                                <code className="bg-white px-1 py-0.5 rounded text-[10px] text-slate-400 font-mono group-hover:text-brand-500 border border-slate-100">{v.key}</code>
                                            </button>
                                        ))}
                                    </div>
                                    <div className="p-3 bg-blue-50 rounded-lg text-xs text-blue-700 border border-blue-100 mt-4">
                                        <p className="flex items-start gap-1">
                                            <Eye size={12} className="mt-0.5 shrink-0" />
                                            Le variabili verranno sostituite automaticamente al momento dell'invio.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-slate-400 p-8 text-center">
                        <div className="w-16 h-16 bg-slate-50 rounded-full flex items-center justify-center mb-4">
                            <Mail size={32} className="text-slate-300" />
                        </div>
                        <h3 className="font-semibold text-slate-600 mb-1">Nessun modello selezionato</h3>
                        <p className="text-sm">Seleziona un modello dalla lista o creane uno nuovo per iniziare.</p>
                        <button onClick={handleCreate} className="mt-6 px-4 py-2 bg-brand-600 text-white rounded-lg text-sm font-bold hover:bg-brand-700 transition-colors">
                            Crea Nuovo Modello
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};
