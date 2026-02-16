import React, { useState, useMemo } from 'react';
import {
    User, Mail, Phone, MapPin, Building2, Globe, Camera, Edit3, Award, Target,
    TrendingUp, Zap, Calendar, Clock, FileText, CheckCircle2, Star, Flame,
    BarChart3, Trophy, Shield, Sparkles, ArrowUpRight, Heart
} from 'lucide-react';
import { QuoteData, CompanyInfo, CURRENCY_FORMATTER } from '../types';

interface ProfilePageProps {
    company: CompanyInfo;
    quotes: QuoteData[];
    userEmail?: string;
    onUpdateCompany: (company: CompanyInfo) => void;
    showToast: (msg: string, type?: string) => void;
}

// Achievement definitions
const ACHIEVEMENTS = [
    { id: 'first_quote', icon: FileText, label: 'Primo Preventivo', desc: 'Hai creato il tuo primo preventivo', threshold: 1, field: 'totalQuotes' as const, color: 'from-blue-400 to-blue-600' },
    { id: 'ten_quotes', icon: Target, label: 'Decathlon', desc: '10 preventivi creati', threshold: 10, field: 'totalQuotes' as const, color: 'from-emerald-400 to-emerald-600' },
    { id: 'fifty_quotes', icon: Trophy, label: 'Campione', desc: '50 preventivi creati', threshold: 50, field: 'totalQuotes' as const, color: 'from-amber-400 to-amber-600' },
    { id: 'first_accept', icon: CheckCircle2, label: 'Prima Vittoria', desc: 'Il tuo primo preventivo accettato', threshold: 1, field: 'acceptedQuotes' as const, color: 'from-green-400 to-green-600' },
    { id: 'ten_accept', icon: Star, label: 'Top Closer', desc: '10 preventivi accettati', threshold: 10, field: 'acceptedQuotes' as const, color: 'from-yellow-400 to-yellow-600' },
    { id: 'revenue_1k', icon: TrendingUp, label: 'Primo Mille', desc: '€1.000 di fatturato', threshold: 1000, field: 'totalRevenue' as const, color: 'from-violet-400 to-violet-600' },
    { id: 'revenue_10k', icon: Zap, label: 'Power Seller', desc: '€10.000 di fatturato', threshold: 10000, field: 'totalRevenue' as const, color: 'from-orange-400 to-orange-600' },
    { id: 'revenue_50k', icon: Flame, label: 'Infuocato', desc: '€50.000 di fatturato', threshold: 50000, field: 'totalRevenue' as const, color: 'from-red-400 to-red-600' },
    { id: 'streak_7', icon: Flame, label: 'Settimana di Fuoco', desc: '7 giorni consecutivi attivo', threshold: 7, field: 'currentStreak' as const, color: 'from-pink-400 to-pink-600' },
    { id: 'high_rate', icon: Shield, label: 'Tasso Perfetto', desc: 'Tasso di accettazione > 80%', threshold: 80, field: 'acceptRate' as const, color: 'from-cyan-400 to-cyan-600' },
];

export const ProfilePage: React.FC<ProfilePageProps> = ({
    company, quotes, userEmail, onUpdateCompany, showToast
}) => {
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState(company);
    const [activeTab, setActiveTab] = useState<'overview' | 'achievements' | 'activity'>('overview');

    // Compute stats
    const stats = useMemo(() => {
        const totalQuotes = quotes.length;
        const acceptedQuotes = quotes.filter(q => q.status === 'accepted').length;
        const totalRevenue = quotes
            .filter(q => q.status === 'accepted')
            .reduce((sum, q) => sum + q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0), 0);
        const avgDealSize = acceptedQuotes > 0 ? totalRevenue / acceptedQuotes : 0;
        const acceptRate = totalQuotes > 0 ? Math.round((acceptedQuotes / totalQuotes) * 100) : 0;

        // Activity heatmap: last 365 days
        const today = new Date();
        const activityMap: Record<string, number> = {};
        quotes.forEach(q => {
            const d = q.date?.split('T')[0];
            if (d) activityMap[d] = (activityMap[d] || 0) + 1;
        });

        // Current streak (consecutive days with activity)
        let currentStreak = 0;
        const checkDate = new Date(today);
        for (let i = 0; i < 365; i++) {
            const key = checkDate.toISOString().split('T')[0];
            if (activityMap[key]) {
                currentStreak++;
                checkDate.setDate(checkDate.getDate() - 1);
            } else {
                break;
            }
        }

        // Best month
        const monthMap: Record<string, number> = {};
        quotes.filter(q => q.status === 'accepted').forEach(q => {
            const m = q.date?.substring(0, 7);
            if (m) {
                const rev = q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                monthMap[m] = (monthMap[m] || 0) + rev;
            }
        });
        const bestMonth = Object.entries(monthMap).sort(([, a], [, b]) => b - a)[0];

        // Recent activity (last 10)
        const recentActivity = [...quotes]
            .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
            .slice(0, 10);

        return { totalQuotes, acceptedQuotes, totalRevenue, avgDealSize, acceptRate, activityMap, currentStreak, bestMonth, recentActivity };
    }, [quotes]);

    // Heatmap weeks (last 52 weeks)
    const heatmapWeeks = useMemo(() => {
        const weeks: { date: string; count: number; day: number }[][] = [];
        const today = new Date();
        const startDay = today.getDay(); // 0=Sunday

        // Go back to the start of 52 weeks ago
        const start = new Date(today);
        start.setDate(start.getDate() - (52 * 7 + startDay));

        let currentWeek: { date: string; count: number; day: number }[] = [];
        const cursor = new Date(start);

        for (let i = 0; i < 53 * 7; i++) {
            const key = cursor.toISOString().split('T')[0];
            const dayOfWeek = cursor.getDay();

            if (dayOfWeek === 0 && currentWeek.length > 0) {
                weeks.push(currentWeek);
                currentWeek = [];
            }

            if (cursor <= today) {
                currentWeek.push({
                    date: key,
                    count: stats.activityMap[key] || 0,
                    day: dayOfWeek
                });
            }

            cursor.setDate(cursor.getDate() + 1);
        }
        if (currentWeek.length > 0) weeks.push(currentWeek);
        return weeks;
    }, [stats.activityMap]);

    const getHeatColor = (count: number) => {
        if (count === 0) return 'bg-slate-100 dark:bg-slate-700/50';
        if (count === 1) return 'bg-brand-200';
        if (count === 2) return 'bg-brand-400';
        if (count <= 4) return 'bg-brand-500';
        return 'bg-brand-700';
    };

    // Unlocked achievements
    const unlockedAchievements = useMemo(() => {
        return ACHIEVEMENTS.map(a => ({
            ...a,
            unlocked: stats[a.field] >= a.threshold,
            progress: Math.min(100, Math.round((stats[a.field] / a.threshold) * 100))
        }));
    }, [stats]);

    const unlockedCount = unlockedAchievements.filter(a => a.unlocked).length;

    const handleSaveProfile = () => {
        onUpdateCompany(editData);
        setIsEditing(false);
        showToast('Profilo aggiornato!', 'success');
    };

    // Level calculation based on XP
    const xp = stats.totalQuotes * 10 + stats.acceptedQuotes * 25 + Math.floor(stats.totalRevenue / 100);
    const level = Math.floor(xp / 100) + 1;
    const xpInLevel = xp % 100;

    return (
        <div className="space-y-6 animate-fade-in">

            {/* Profile Header Card */}
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-brand-600 via-brand-700 to-brand-900 text-white shadow-xl shadow-brand-500/20">
                {/* Decorative elements */}
                <div className="absolute inset-0 opacity-10">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-white rounded-full -translate-y-1/2 translate-x-1/2" />
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-white rounded-full translate-y-1/2 -translate-x-1/2" />
                </div>

                <div className="relative p-8">
                    <div className="flex flex-col md:flex-row items-center md:items-start gap-6">
                        {/* Avatar */}
                        <div className="relative group">
                            <div className="w-28 h-28 rounded-2xl bg-white/20 backdrop-blur-md border-2 border-white/30 flex items-center justify-center text-4xl font-bold shadow-lg">
                                {company.logoUrl ? (
                                    <img src={company.logoUrl} alt="Logo" className="w-full h-full object-cover rounded-2xl" />
                                ) : (
                                    <span>{(company.name || 'A').charAt(0).toUpperCase()}</span>
                                )}
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-gradient-to-br from-amber-400 to-amber-600 rounded-lg flex items-center justify-center text-[10px] font-black shadow-md border-2 border-white">
                                {level}
                            </div>
                            <button className="absolute inset-0 bg-black/0 group-hover:bg-black/20 rounded-2xl transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100">
                                <Camera size={20} />
                            </button>
                        </div>

                        {/* Info */}
                        <div className="flex-1 text-center md:text-left">
                            <div className="flex items-center gap-3 justify-center md:justify-start">
                                <h1 className="text-3xl font-bold">{company.name || 'Il Tuo Profilo'}</h1>
                                <button onClick={() => { setIsEditing(!isEditing); setEditData(company); }} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors">
                                    <Edit3 size={16} />
                                </button>
                            </div>
                            {userEmail && <p className="text-white/70 mt-1 text-sm">{userEmail}</p>}
                            {company.address && (
                                <p className="text-white/60 text-sm mt-1 flex items-center gap-1.5 justify-center md:justify-start">
                                    <MapPin size={14} /> {company.address}
                                </p>
                            )}

                            {/* XP Bar */}
                            <div className="mt-4 max-w-md">
                                <div className="flex justify-between text-xs mb-1">
                                    <span className="font-medium text-white/80">Livello {level}</span>
                                    <span className="text-white/60">{xpInLevel}/100 XP</span>
                                </div>
                                <div className="h-2 bg-white/20 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-gradient-to-r from-amber-300 to-amber-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${xpInLevel}%` }}
                                    />
                                </div>
                            </div>

                            {/* Quick stats */}
                            <div className="flex items-center gap-4 mt-4 justify-center md:justify-start">
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Flame size={16} className="text-orange-300" />
                                    <span className="font-semibold">{stats.currentStreak}</span>
                                    <span className="text-white/60 text-xs">giorni streak</span>
                                </div>
                                <div className="w-px h-4 bg-white/20" />
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Trophy size={16} className="text-amber-300" />
                                    <span className="font-semibold">{unlockedCount}/{ACHIEVEMENTS.length}</span>
                                    <span className="text-white/60 text-xs">traguardi</span>
                                </div>
                                <div className="w-px h-4 bg-white/20" />
                                <div className="flex items-center gap-1.5 text-sm">
                                    <Heart size={16} className="text-pink-300" />
                                    <span className="font-semibold">{stats.acceptRate}%</span>
                                    <span className="text-white/60 text-xs">successo</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit profile drawer */}
            {isEditing && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-slide-down">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <Edit3 size={18} className="text-brand-600" /> Modifica Profilo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {[
                            { key: 'name', label: 'Nome Azienda', icon: Building2, placeholder: 'La tua azienda' },
                            { key: 'email', label: 'Email', icon: Mail, placeholder: 'email@example.com' },
                            { key: 'phone', label: 'Telefono', icon: Phone, placeholder: '+39 ...' },
                            { key: 'address', label: 'Indirizzo', icon: MapPin, placeholder: 'Via ...' },
                            { key: 'website', label: 'Sito Web', icon: Globe, placeholder: 'www.example.com' },
                            { key: 'vatId', label: 'P.IVA', icon: Shield, placeholder: 'IT...' },
                        ].map(f => (
                            <div key={f.key} className="space-y-1">
                                <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                    <f.icon size={12} /> {f.label}
                                </label>
                                <input
                                    value={(editData as any)[f.key] || ''}
                                    onChange={e => setEditData(prev => ({ ...prev, [f.key]: e.target.value }))}
                                    placeholder={f.placeholder}
                                    className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all"
                                />
                            </div>
                        ))}
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <Camera size={12} /> URL Logo
                            </label>
                            <input
                                value={editData.logoUrl || ''}
                                onChange={e => setEditData(prev => ({ ...prev, logoUrl: e.target.value }))}
                                placeholder="https://..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500 flex items-center gap-1.5">
                                <Building2 size={12} /> IBAN
                            </label>
                            <input
                                value={editData.iban || ''}
                                onChange={e => setEditData(prev => ({ ...prev, iban: e.target.value }))}
                                placeholder="IT..."
                                className="w-full px-3 py-2 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none transition-all"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2 mt-5 justify-end">
                        <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-sm text-slate-500 hover:text-slate-700 font-medium">Annulla</button>
                        <button onClick={handleSaveProfile} className="px-5 py-2 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                            Salva Profilo
                        </button>
                    </div>
                </div>
            )}

            {/* Tab navigation */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {([
                    { key: 'overview' as const, label: 'Panoramica', icon: BarChart3 },
                    { key: 'achievements' as const, label: 'Traguardi', icon: Trophy },
                    { key: 'activity' as const, label: 'Attività', icon: Calendar },
                ]).map(tab => (
                    <button
                        key={tab.key}
                        onClick={() => setActiveTab(tab.key)}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === tab.key
                            ? 'bg-white text-brand-700 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                            }`}
                    >
                        <tab.icon size={16} />
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* === PANORAMICA TAB === */}
            {activeTab === 'overview' && (
                <div className="space-y-6">
                    {/* Performance Ring Cards */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                        {[
                            { label: 'Preventivi Totali', value: stats.totalQuotes.toString(), sub: `${stats.acceptedQuotes} accettati`, percent: Math.min(100, stats.totalQuotes * 2), gradient: 'from-blue-500 to-cyan-500', icon: FileText },
                            { label: 'Fatturato Totale', value: CURRENCY_FORMATTER.format(stats.totalRevenue), sub: `Media: ${CURRENCY_FORMATTER.format(stats.avgDealSize)}`, percent: Math.min(100, stats.totalRevenue / 500), gradient: 'from-emerald-500 to-green-500', icon: TrendingUp },
                            { label: 'Tasso Successo', value: `${stats.acceptRate}%`, sub: `${stats.acceptedQuotes} su ${stats.totalQuotes}`, percent: stats.acceptRate, gradient: 'from-violet-500 to-purple-500', icon: Target },
                            { label: 'Streak Attuale', value: `${stats.currentStreak}`, sub: 'giorni consecutivi', percent: Math.min(100, stats.currentStreak * 14), gradient: 'from-orange-500 to-red-500', icon: Flame },
                        ].map((card, i) => (
                            <div key={i} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 hover:shadow-md transition-shadow">
                                <div className="flex items-center gap-3 mb-4">
                                    {/* SVG Progress Ring */}
                                    <div className="relative w-14 h-14 flex-shrink-0">
                                        <svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90">
                                            <circle cx="18" cy="18" r="14" fill="none" stroke="#f1f5f9" strokeWidth="3" />
                                            <circle
                                                cx="18" cy="18" r="14" fill="none" strokeWidth="3"
                                                strokeDasharray={`${card.percent * 0.88} ${88 - card.percent * 0.88}`}
                                                strokeLinecap="round"
                                                className={`text-transparent`}
                                                style={{
                                                    stroke: `url(#grad-${i})`,
                                                    transition: 'stroke-dasharray 1s ease-out'
                                                }}
                                            />
                                            <defs>
                                                <linearGradient id={`grad-${i}`}>
                                                    <stop offset="0%" className={card.gradient.split(' ')[0].replace('from-', 'text-')} style={{ stopColor: 'currentColor' }} />
                                                    <stop offset="100%" className={card.gradient.split(' ')[1].replace('to-', 'text-')} style={{ stopColor: 'currentColor' }} />
                                                </linearGradient>
                                            </defs>
                                        </svg>
                                        <div className="absolute inset-0 flex items-center justify-center">
                                            <card.icon size={16} className="text-slate-400" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-2xl font-bold text-slate-800">{card.value}</p>
                                        <p className="text-xs text-slate-400 font-medium">{card.label}</p>
                                    </div>
                                </div>
                                <p className="text-xs text-slate-500">{card.sub}</p>
                            </div>
                        ))}
                    </div>

                    {/* Activity Heatmap */}
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                <Calendar size={18} className="text-brand-600" />
                                Mappa Attività
                            </h3>
                            <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                <span>Meno</span>
                                {[0, 1, 2, 3, 4].map(n => (
                                    <div key={n} className={`w-3 h-3 rounded-sm ${getHeatColor(n)}`} />
                                ))}
                                <span>Più</span>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <div className="flex gap-[3px] min-w-[700px]">
                                {heatmapWeeks.map((week, wi) => (
                                    <div key={wi} className="flex flex-col gap-[3px]">
                                        {week.map((day, di) => (
                                            <div
                                                key={di}
                                                className={`w-[13px] h-[13px] rounded-[3px] ${getHeatColor(day.count)} transition-colors hover:ring-2 hover:ring-brand-300 cursor-pointer`}
                                                title={`${day.date}: ${day.count} attività`}
                                            />
                                        ))}
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                            <span>{Object.keys(stats.activityMap).length} giorni attivi nell'ultimo anno</span>
                            <span>{stats.totalQuotes} contributi totali</span>
                        </div>
                    </div>

                    {/* Best month & quick info */}
                    {stats.bestMonth && (
                        <div className="bg-gradient-to-r from-amber-50 to-orange-50 rounded-2xl border border-amber-200/60 p-5">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-orange-500 flex items-center justify-center text-white shadow-md">
                                    <Sparkles size={20} />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-amber-900">Miglior Mese: {stats.bestMonth[0]}</p>
                                    <p className="text-xs text-amber-700">{CURRENCY_FORMATTER.format(stats.bestMonth[1])} di fatturato</p>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* === TRAGUARDI TAB === */}
            {activeTab === 'achievements' && (
                <div className="space-y-4">
                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white shadow-md">
                            <Trophy size={20} />
                        </div>
                        <div>
                            <h3 className="font-bold text-slate-800">I Tuoi Traguardi</h3>
                            <p className="text-xs text-slate-500">{unlockedCount} su {ACHIEVEMENTS.length} sbloccati</p>
                        </div>
                        {/* Progress bar */}
                        <div className="flex-1 max-w-xs">
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                                <div
                                    className="h-full bg-gradient-to-r from-amber-400 to-amber-600 rounded-full transition-all duration-1000"
                                    style={{ width: `${(unlockedCount / ACHIEVEMENTS.length) * 100}%` }}
                                />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {unlockedAchievements.map(a => (
                            <div
                                key={a.id}
                                className={`relative overflow-hidden rounded-2xl border p-4 transition-all ${a.unlocked
                                    ? 'bg-white border-slate-200/80 shadow-sm hover:shadow-md'
                                    : 'bg-slate-50 border-slate-100 opacity-60'
                                    }`}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-md ${a.unlocked
                                        ? `bg-gradient-to-br ${a.color}`
                                        : 'bg-slate-300'
                                        }`}
                                    >
                                        <a.icon size={22} />
                                    </div>
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-bold text-slate-800 text-sm">{a.label}</h4>
                                            {a.unlocked && (
                                                <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 text-[10px] font-bold rounded-full">
                                                    ✓ Sbloccato
                                                </span>
                                            )}
                                        </div>
                                        <p className="text-xs text-slate-500 mt-0.5">{a.desc}</p>
                                        {!a.unlocked && (
                                            <div className="mt-2">
                                                <div className="flex justify-between text-[10px] text-slate-400 mb-0.5">
                                                    <span>Progresso</span>
                                                    <span>{a.progress}%</span>
                                                </div>
                                                <div className="h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                                    <div className={`h-full bg-gradient-to-r ${a.color} rounded-full transition-all`} style={{ width: `${a.progress}%` }} />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                                {a.unlocked && (
                                    <div className="absolute top-0 right-0 w-20 h-20 opacity-5">
                                        <a.icon size={80} />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* === ATTIVITÀ TAB === */}
            {activeTab === 'activity' && (
                <div className="space-y-4">
                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                        <Clock size={18} className="text-brand-600" />
                        Attività Recente
                    </h3>

                    {stats.recentActivity.length === 0 ? (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                            <FileText size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">Nessuna attività ancora</p>
                            <p className="text-xs text-slate-400 mt-1">Crea il tuo primo preventivo per iniziare!</p>
                        </div>
                    ) : (
                        <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                            {stats.recentActivity.map((quote, i) => {
                                const total = quote.items.reduce((s, item) => s + item.quantity * item.unitPrice, 0);
                                const statusColors: Record<string, string> = {
                                    draft: 'bg-slate-100 text-slate-600',
                                    sent: 'bg-blue-100 text-blue-600',
                                    accepted: 'bg-emerald-100 text-emerald-600',
                                    rejected: 'bg-red-100 text-red-600',
                                    expired: 'bg-amber-100 text-amber-600',
                                };
                                const statusLabels: Record<string, string> = {
                                    draft: 'Bozza', sent: 'Inviato', accepted: 'Accettato', rejected: 'Rifiutato', expired: 'Scaduto'
                                };

                                return (
                                    <div key={quote.id} className={`flex items-center gap-4 px-5 py-4 hover:bg-slate-50 transition-colors ${i > 0 ? 'border-t border-slate-100' : ''}`}>
                                        {/* Timeline dot */}
                                        <div className="flex flex-col items-center">
                                            <div className={`w-3 h-3 rounded-full ${quote.status === 'accepted' ? 'bg-emerald-500' : quote.status === 'rejected' ? 'bg-red-400' : 'bg-brand-400'}`} />
                                            {i < stats.recentActivity.length - 1 && <div className="w-px h-8 bg-slate-200 mt-1" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2">
                                                <p className="font-semibold text-slate-800 text-sm truncate">{quote.number}</p>
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${statusColors[quote.status || 'draft']}`}>
                                                    {statusLabels[quote.status || 'draft']}
                                                </span>
                                            </div>
                                            <p className="text-xs text-slate-500 truncate">
                                                {quote.client.company || quote.client.name || 'Cliente non specificato'}
                                            </p>
                                        </div>

                                        <div className="text-right flex-shrink-0">
                                            <p className="font-bold text-slate-700 text-sm">{CURRENCY_FORMATTER.format(total)}</p>
                                            <p className="text-[10px] text-slate-400">{new Date(quote.date).toLocaleDateString('it-IT')}</p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
