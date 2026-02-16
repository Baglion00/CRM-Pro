import React, { useRef, useState, useEffect } from 'react';
import { PenTool, RotateCcw, Check, X } from 'lucide-react';

interface SignaturePadProps {
    onSave: (signatureBase64: string, name: string) => void;
    onCancel: () => void;
    isOpen: boolean;
    signerName?: string;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ onSave, onCancel, isOpen, signerName = '' }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [isDrawing, setIsDrawing] = useState(false);
    const [hasSignature, setHasSignature] = useState(false);
    const [name, setName] = useState(signerName);

    useEffect(() => {
        if (isOpen && canvasRef.current) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d')!;
            const rect = canvas.getBoundingClientRect();
            canvas.width = rect.width * 2;
            canvas.height = rect.height * 2;
            ctx.scale(2, 2);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2.5;
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';
            // Draw guide line
            ctx.beginPath();
            ctx.strokeStyle = '#e2e8f0';
            ctx.lineWidth = 1;
            ctx.setLineDash([5, 5]);
            ctx.moveTo(20, rect.height - 30);
            ctx.lineTo(rect.width - 20, rect.height - 30);
            ctx.stroke();
            ctx.setLineDash([]);
            ctx.strokeStyle = '#1e293b';
            ctx.lineWidth = 2.5;
        }
    }, [isOpen]);

    const getPosition = (e: React.MouseEvent | React.TouchEvent) => {
        const canvas = canvasRef.current!;
        const rect = canvas.getBoundingClientRect();
        if ('touches' in e) {
            return { x: e.touches[0].clientX - rect.left, y: e.touches[0].clientY - rect.top };
        }
        return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };

    const start = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        setIsDrawing(true);
        const pos = getPosition(e);
        ctx.beginPath();
        ctx.moveTo(pos.x, pos.y);
    };

    const draw = (e: React.MouseEvent | React.TouchEvent) => {
        e.preventDefault();
        if (!isDrawing) return;
        const ctx = canvasRef.current?.getContext('2d');
        if (!ctx) return;
        const pos = getPosition(e);
        ctx.lineTo(pos.x, pos.y);
        ctx.stroke();
        setHasSignature(true);
    };

    const stop = () => setIsDrawing(false);

    const clear = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d')!;
        const rect = canvas.getBoundingClientRect();
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // Redraw guide line
        ctx.beginPath();
        ctx.strokeStyle = '#e2e8f0';
        ctx.lineWidth = 1;
        ctx.setLineDash([5, 5]);
        ctx.moveTo(20, rect.height - 30);
        ctx.lineTo(rect.width - 20, rect.height - 30);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.strokeStyle = '#1e293b';
        ctx.lineWidth = 2.5;
        setHasSignature(false);
    };

    const save = () => {
        if (!canvasRef.current || !hasSignature) return;
        const data = canvasRef.current.toDataURL('image/png');
        onSave(data, name);
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
            <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-scale-in">
                {/* Header */}
                <div className="p-6 pb-4 flex items-center justify-between border-b border-slate-100">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center text-brand-600">
                            <PenTool size={20} />
                        </div>
                        <div>
                            <h2 className="font-bold text-slate-800">Firma Digitale</h2>
                            <p className="text-xs text-slate-400">Disegna la tua firma qui sotto</p>
                        </div>
                    </div>
                    <button onClick={onCancel} className="p-2 hover:bg-slate-100 rounded-xl transition-colors">
                        <X size={18} className="text-slate-400" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {/* Name input */}
                    <div>
                        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                            Nome e Cognome
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            placeholder="Mario Rossi"
                            className="w-full px-4 py-2.5 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm bg-white"
                        />
                    </div>

                    {/* Canvas */}
                    <div className="border-2 border-dashed border-slate-200 rounded-2xl overflow-hidden bg-slate-50/50">
                        <canvas
                            ref={canvasRef}
                            onMouseDown={start}
                            onMouseMove={draw}
                            onMouseUp={stop}
                            onMouseLeave={stop}
                            onTouchStart={start}
                            onTouchMove={draw}
                            onTouchEnd={stop}
                            className="w-full cursor-crosshair touch-none"
                            style={{ height: '200px' }}
                        />
                    </div>

                    <p className="text-xs text-center text-slate-400">Firma sopra la linea tratteggiata usando il mouse o il dito</p>

                    {/* Actions */}
                    <div className="flex gap-2">
                        <button onClick={clear}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-colors flex items-center justify-center gap-2">
                            <RotateCcw size={16} /> Cancella
                        </button>
                        <button onClick={save} disabled={!hasSignature || !name}
                            className="flex-1 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:shadow-lg hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50">
                            <Check size={16} /> Conferma Firma
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
