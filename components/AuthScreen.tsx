import React, { useState } from 'react';
import { Mail, Loader2, Lock, ArrowRight, Eye, EyeOff, UserPlus, LogIn } from 'lucide-react';

interface AuthScreenProps {
    onEmailLogin: (email: string, password: string) => Promise<void>;
    onEmailSignUp: (email: string, password: string) => Promise<void>;
    onSkip: () => void;
    error: string | null;
}

export const AuthScreen: React.FC<AuthScreenProps> = ({
    onEmailLogin, onEmailSignUp, onSkip, error
}) => {
    const [mode, setMode] = useState<'login' | 'register'>('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [localError, setLocalError] = useState<string | null>(null);

    const handleSubmit = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!email || !password) {
            setLocalError('Inserisci email e password');
            return;
        }
        if (mode === 'register' && password !== confirmPassword) {
            setLocalError('Le password non corrispondono');
            return;
        }
        if (mode === 'register' && password.length < 6) {
            setLocalError('La password deve avere almeno 6 caratteri');
            return;
        }
        setLocalError(null);
        setLoading(true);
        try {
            if (mode === 'register') {
                await onEmailSignUp(email, password);
            } else {
                await onEmailLogin(email, password);
            }
        } finally {
            setLoading(false);
        }
    };

    const displayError = localError || error;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex items-center justify-center p-4">
            {/* Background decoration */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-brand-500/10 rounded-full blur-3xl" />
                <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-violet-500/10 rounded-full blur-3xl" />
            </div>

            <div className="w-full max-w-md relative z-10 animate-scale-in">
                {/* Logo */}
                <div className="text-center mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-brand-400 via-brand-500 to-brand-700 rounded-3xl flex items-center justify-center text-4xl mx-auto mb-5 shadow-2xl shadow-brand-500/30 rotate-3 hover:rotate-0 transition-transform">
                        📋
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">AutoQuote Pro</h1>
                    <p className="text-brand-300/80 text-sm mt-2">
                        {mode === 'login' ? 'Accedi al tuo account' : 'Crea il tuo account'}
                    </p>
                </div>

                {/* Mode Tabs */}
                <div className="flex bg-white/5 backdrop-blur-sm rounded-2xl p-1 mb-6 border border-white/10">
                    <button
                        onClick={() => { setMode('login'); setLocalError(null); }}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'login'
                                ? 'bg-white text-slate-800 shadow-lg'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <LogIn size={16} /> Accedi
                    </button>
                    <button
                        onClick={() => { setMode('register'); setLocalError(null); }}
                        className={`flex-1 py-3 rounded-xl text-sm font-semibold transition-all flex items-center justify-center gap-2 ${mode === 'register'
                                ? 'bg-white text-slate-800 shadow-lg'
                                : 'text-white/60 hover:text-white'
                            }`}
                    >
                        <UserPlus size={16} /> Registrati
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-3xl shadow-2xl overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-7 space-y-5">
                        {/* Email */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Email
                            </label>
                            <div className="relative">
                                <Mail size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={e => setEmail(e.target.value)}
                                    placeholder="tua@email.it"
                                    autoComplete="email"
                                    className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm bg-slate-50/50"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                Password
                            </label>
                            <div className="relative">
                                <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                <input
                                    type={showPassword ? 'text' : 'password'}
                                    value={password}
                                    onChange={e => setPassword(e.target.value)}
                                    placeholder="••••••••"
                                    autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
                                    className="w-full pl-11 pr-12 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm bg-slate-50/50"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password (register only) */}
                        {mode === 'register' && (
                            <div className="animate-fade-in">
                                <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                                    Conferma Password
                                </label>
                                <div className="relative">
                                    <Lock size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                                    <input
                                        type={showPassword ? 'text' : 'password'}
                                        value={confirmPassword}
                                        onChange={e => setConfirmPassword(e.target.value)}
                                        placeholder="••••••••"
                                        autoComplete="new-password"
                                        className="w-full pl-11 pr-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none text-sm bg-slate-50/50"
                                    />
                                </div>
                            </div>
                        )}

                        {/* Error */}
                        {displayError && (
                            <div className="p-3 rounded-xl bg-red-50 border border-red-100 text-xs text-red-600 font-medium animate-fade-in">
                                {displayError}
                            </div>
                        )}

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 rounded-xl font-bold text-sm bg-gradient-to-r from-brand-500 to-brand-700 text-white hover:shadow-xl hover:shadow-brand-500/25 transition-all flex items-center justify-center gap-2 disabled:opacity-50 active:scale-[0.98]"
                        >
                            {loading ? (
                                <Loader2 size={18} className="animate-spin" />
                            ) : (
                                <>
                                    {mode === 'login' ? <LogIn size={18} /> : <UserPlus size={18} />}
                                    {mode === 'login' ? 'Accedi' : 'Crea Account'}
                                    <ArrowRight size={16} />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Footer */}
                    <div className="px-7 py-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                        <button
                            onClick={onSkip}
                            className="text-xs text-slate-400 hover:text-slate-600 transition-colors flex items-center gap-1.5 font-medium"
                        >
                            <Lock size={12} /> Continua senza account (offline)
                        </button>
                    </div>
                </div>

                <p className="text-center text-white/20 text-xs mt-8">
                    AutoQuote Pro — Creato da Andrea Baglioni
                </p>
            </div>
        </div>
    );
};
