import React from 'react';
import {
    LayoutDashboard, Users, FileText, Package, Calendar,
    Settings, LogOut, Kanban, Megaphone, Shield,
    CreditCard, Globe, Share2, PenTool, LayoutList,
    Menu, X, ChevronRight
} from 'lucide-react';
import { InstallMode, UserRole } from '../types';

export type View = 'dashboard' | 'pipeline' | 'editor' | 'history' | 'clients' | 'catalog' | 'calendar' | 'analytics' | 'settings' | 'payments' | 'portal' | 'profile' | 'team' | 'automations' | 'integrations' | 'domains';

interface SidebarProps {
    view: View;
    setView: (view: View) => void;
    mobileMenuOpen: boolean;
    setMobileMenuOpen: (open: boolean) => void;
    installMode: InstallMode;
    onLogout: () => void;
    userRole?: UserRole;
}

export const Sidebar: React.FC<SidebarProps> = ({
    view, setView, mobileMenuOpen, setMobileMenuOpen, installMode, onLogout, userRole
}) => {

    const handleNav = (v: View) => {
        setView(v);
        if (window.innerWidth < 1024) setMobileMenuOpen(false);
    };

    const isActive = (v: View) => view === v;

    const MENU_GROUPS = [
        {
            title: 'Principale',
            items: [
                { key: 'dashboard', icon: <LayoutDashboard size={20} />, label: 'Dashboard' },
            ]
        },
        {
            title: 'Vendite',
            items: [
                { key: 'pipeline', icon: <Kanban size={20} />, label: 'Pipeline' },
                { key: 'editor', icon: <PenTool size={20} />, label: 'Nuovo Preventivo' },
                { key: 'history', icon: <FileText size={20} />, label: 'Storico' },
            ]
        },
        {
            title: 'Operazioni',
            items: [
                { key: 'clients', icon: <Users size={20} />, label: 'Clienti' },
                { key: 'catalog', icon: <Package size={20} />, label: 'Catalogo' },
                { key: 'calendar', icon: <Calendar size={20} />, label: 'Calendario' },
            ]
        },
        {
            title: 'Amministrazione',
            items: [
                { key: 'team', icon: <Shield size={20} />, label: 'Team' },
                { key: 'automations', icon: <Megaphone size={20} />, label: 'Automazioni' },
                ...(installMode === 'vps' ? [
                    { key: 'integrations', icon: <CreditCard size={20} />, label: 'Integrazioni' },
                    { key: 'domains', icon: <Globe size={20} />, label: 'Domini & VPS' }
                ] : []),
                { key: 'settings', icon: <Settings size={20} />, label: 'Impostazioni' },
            ]
        }
    ];

    return (
        <>
            {/* Mobile Backdrop */}
            {mobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden"
                    onClick={() => setMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/80 backdrop-blur-xl border-r border-slate-200 transform transition-transform duration-300 ease-out lg:translate-x-0 lg:static lg:h-screen flex flex-col ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
                }`}>
                {/* Header */}
                <div className="h-20 flex items-center justify-between px-6 border-b border-slate-100/50">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-brand-600 to-indigo-700 rounded-xl flex items-center justify-center text-white shadow-lg shadow-brand-500/30">
                            <LayoutList size={22} className="stroke-[2.5]" />
                        </div>
                        <div>
                            <h1 className="font-bold text-xl text-slate-900 leading-none tracking-tight">AutoQuote</h1>
                            <span className="text-[10px] font-bold text-brand-600 uppercase tracking-widest">Pro CRM</span>
                        </div>
                    </div>
                    <button
                        onClick={() => setMobileMenuOpen(false)}
                        className="lg:hidden p-2 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <div className="flex-1 overflow-y-auto py-6 px-4 space-y-8 custom-scrollbar">
                    {MENU_GROUPS.map((group, idx) => (
                        <div key={idx}>
                            <h3 className="px-4 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-3 ml-1">{group.title}</h3>
                            <div className="space-y-1">
                                {group.items.map((item) => {
                                    // @ts-ignore
                                    const isItemActive = isActive(item.key as View);
                                    return (
                                        <button
                                            key={item.key}
                                            onClick={() => handleNav(item.key as View)}
                                            className={`w-full flex items-center justify-between p-3 rounded-xl transition-all duration-200 group relative overflow-hidden ${isItemActive
                                                    ? 'bg-brand-600 text-white shadow-lg shadow-brand-500/30'
                                                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3.5 font-medium relative z-10">
                                                <span className={`transition-transform duration-300 ${isItemActive ? 'scale-110' : 'group-hover:scale-110'}`}>
                                                    {item.icon}
                                                </span>
                                                <span className="text-sm">{item.label}</span>
                                            </div>
                                            {isItemActive && (
                                                <div className="relative z-10">
                                                    <ChevronRight size={16} className="text-brand-200" />
                                                </div>
                                            )}
                                            {!isItemActive && (
                                                <div className="absolute inset-0 bg-slate-100 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <button
                        onClick={onLogout}
                        className="w-full flex items-center gap-3 p-3 text-slate-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 text-sm font-medium group"
                    >
                        <LogOut size={20} className="group-hover:-translate-x-1 transition-transform" />
                        <span>Esci dall'account</span>
                    </button>
                </div>
            </div>
        </>
    );
};
