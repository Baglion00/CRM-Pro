import React, { useState } from 'react';
import {
    Users, UserPlus, Shield, Mail, MoreVertical, Crown, Edit3, Trash2, Check, X,
    Clock, Eye, PenTool, Lock, Settings, CreditCard, AlertTriangle
} from 'lucide-react';
import { TeamMember, UserRole, ROLE_PERMISSIONS } from '../types';

interface TeamManagerProps {
    members: TeamMember[];
    currentUserRole: UserRole;
    onInvite: (email: string, name: string, role: UserRole) => void;
    onUpdateRole: (memberId: string, role: UserRole) => void;
    onRemoveMember: (memberId: string) => void;
    showToast: (msg: string, type?: string) => void;
}

const PERMISSION_LABELS: Record<string, { label: string; icon: React.ReactNode; desc: string }> = {
    read: { label: 'Lettura', icon: <Eye size={14} />, desc: 'Visualizzare preventivi, clienti e dati' },
    write: { label: 'Scrittura', icon: <PenTool size={14} />, desc: 'Creare e modificare preventivi e clienti' },
    delete: { label: 'Eliminazione', icon: <Trash2 size={14} />, desc: 'Eliminare preventivi e dati' },
    manage_team: { label: 'Gestione Team', icon: <Users size={14} />, desc: 'Invitare e gestire i membri del team' },
    manage_settings: { label: 'Impostazioni', icon: <Settings size={14} />, desc: 'Modificare le impostazioni dell\'app' },
    manage_billing: { label: 'Fatturazione', icon: <CreditCard size={14} />, desc: 'Gestire pagamenti e abbonamento' },
};

export const TeamManager: React.FC<TeamManagerProps> = ({
    members, currentUserRole, onInvite, onUpdateRole, onRemoveMember, showToast
}) => {
    const [showInviteForm, setShowInviteForm] = useState(false);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteName, setInviteName] = useState('');
    const [inviteRole, setInviteRole] = useState<UserRole>('editor');
    const [activeTab, setActiveTab] = useState<'members' | 'permissions'>('members');
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editRole, setEditRole] = useState<UserRole>('editor');

    const canManageTeam = ROLE_PERMISSIONS[currentUserRole].permissions.includes('manage_team');

    const handleInvite = () => {
        if (!inviteEmail.trim()) { showToast('Inserisci un\'email', 'error'); return; }
        if (!inviteEmail.includes('@')) { showToast('Email non valida', 'error'); return; }
        if (members.some(m => m.email === inviteEmail.trim())) { showToast('Utente già nel team', 'error'); return; }
        onInvite(inviteEmail.trim(), inviteName.trim() || inviteEmail.split('@')[0], inviteRole);
        setInviteEmail('');
        setInviteName('');
        setShowInviteForm(false);
        showToast(`Invito inviato a ${inviteEmail}`, 'success');
    };

    const handleSaveRole = (memberId: string) => {
        onUpdateRole(memberId, editRole);
        setEditingId(null);
        showToast('Ruolo aggiornato', 'success');
    };

    const roleIcons: Record<UserRole, React.ReactNode> = {
        owner: <Crown size={14} className="text-purple-600" />,
        admin: <Shield size={14} className="text-blue-600" />,
        editor: <PenTool size={14} className="text-emerald-600" />,
        viewer: <Eye size={14} className="text-slate-500" />,
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Users size={24} className="text-brand-600" />
                        Gestione Team
                    </h2>
                    <p className="text-sm text-slate-500 mt-1">{members.length} membr{members.length === 1 ? 'o' : 'i'} nel team</p>
                </div>
                {canManageTeam && (
                    <button
                        onClick={() => setShowInviteForm(!showInviteForm)}
                        className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg hover:shadow-brand-500/25 transition-all"
                    >
                        <UserPlus size={16} />
                        Invita Membro
                    </button>
                )}
            </div>

            {/* Invite Form */}
            {showInviteForm && canManageTeam && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-6 animate-slide-down">
                    <h3 className="font-bold text-slate-800 mb-4 flex items-center gap-2">
                        <UserPlus size={18} className="text-brand-600" /> Nuovo Invito
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Nome</label>
                            <input
                                value={inviteName}
                                onChange={e => setInviteName(e.target.value)}
                                placeholder="Mario Rossi"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Email *</label>
                            <input
                                value={inviteEmail}
                                onChange={e => setInviteEmail(e.target.value)}
                                placeholder="email@example.com"
                                type="email"
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none"
                            />
                        </div>
                        <div className="space-y-1">
                            <label className="text-xs font-semibold text-slate-500">Ruolo</label>
                            <select
                                value={inviteRole}
                                onChange={e => setInviteRole(e.target.value as UserRole)}
                                className="w-full px-3 py-2.5 rounded-xl border border-slate-200 text-sm focus:ring-2 focus:ring-brand-500/20 focus:border-brand-400 outline-none bg-white"
                            >
                                <option value="admin">Amministratore</option>
                                <option value="editor">Editor</option>
                                <option value="viewer">Visualizzatore</option>
                            </select>
                        </div>
                        <div className="flex items-end gap-2">
                            <button onClick={handleInvite} className="flex-1 px-4 py-2.5 bg-gradient-to-r from-brand-500 to-brand-700 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all">
                                <Mail size={14} className="inline mr-1.5" />Invia
                            </button>
                            <button onClick={() => setShowInviteForm(false)} className="px-3 py-2.5 text-slate-400 hover:text-slate-600 transition-colors">
                                <X size={18} />
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Tabs */}
            <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
                {([
                    { key: 'members' as const, label: 'Membri', icon: Users },
                    { key: 'permissions' as const, label: 'Matrice Permessi', icon: Shield },
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

            {/* === MEMBERS TAB === */}
            {activeTab === 'members' && (
                <div className="grid gap-3">
                    {members.map(member => (
                        <div key={member.id} className="bg-white rounded-2xl shadow-sm border border-slate-200/80 p-5 hover:shadow-md transition-all">
                            <div className="flex items-center gap-4">
                                {/* Avatar */}
                                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-brand-100 to-brand-200 flex items-center justify-center text-lg font-bold text-brand-700">
                                    {member.avatarUrl ? (
                                        <img src={member.avatarUrl} alt={member.name} className="w-full h-full rounded-xl object-cover" />
                                    ) : (
                                        member.name.charAt(0).toUpperCase()
                                    )}
                                </div>

                                {/* Info */}
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2">
                                        <h4 className="font-bold text-slate-800 truncate">{member.name}</h4>
                                        {roleIcons[member.role]}
                                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${ROLE_PERMISSIONS[member.role].bg} ${ROLE_PERMISSIONS[member.role].color}`}>
                                            {ROLE_PERMISSIONS[member.role].label}
                                        </span>
                                        {member.status === 'invited' && (
                                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-700">
                                                <Clock size={10} className="inline mr-0.5" /> In attesa
                                            </span>
                                        )}
                                    </div>
                                    <p className="text-xs text-slate-500 truncate">{member.email}</p>
                                    {member.lastActive && (
                                        <p className="text-[10px] text-slate-400 mt-0.5">
                                            Ultimo accesso: {new Date(member.lastActive).toLocaleDateString('it-IT')}
                                        </p>
                                    )}
                                </div>

                                {/* Actions */}
                                {canManageTeam && member.role !== 'owner' && (
                                    <div className="flex items-center gap-1">
                                        {editingId === member.id ? (
                                            <div className="flex items-center gap-2">
                                                <select
                                                    value={editRole}
                                                    onChange={e => setEditRole(e.target.value as UserRole)}
                                                    className="px-2 py-1.5 rounded-lg border border-slate-200 text-xs bg-white"
                                                >
                                                    <option value="admin">Amministratore</option>
                                                    <option value="editor">Editor</option>
                                                    <option value="viewer">Visualizzatore</option>
                                                </select>
                                                <button onClick={() => handleSaveRole(member.id)} className="p-1.5 text-emerald-600 hover:bg-emerald-50 rounded-lg"><Check size={14} /></button>
                                                <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-50 rounded-lg"><X size={14} /></button>
                                            </div>
                                        ) : (
                                            <>
                                                <button onClick={() => { setEditingId(member.id); setEditRole(member.role); }} className="p-2 text-slate-400 hover:text-brand-600 hover:bg-brand-50 rounded-lg transition-colors" title="Modifica ruolo">
                                                    <Edit3 size={14} />
                                                </button>
                                                <button onClick={() => { onRemoveMember(member.id); showToast('Membro rimosso', 'success'); }} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors" title="Rimuovi">
                                                    <Trash2 size={14} />
                                                </button>
                                            </>
                                        )}
                                    </div>
                                )}
                                {member.role === 'owner' && (
                                    <div className="p-2 text-purple-400" title="Proprietario">
                                        <Lock size={16} />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}

                    {members.length === 0 && (
                        <div className="bg-white rounded-2xl border border-slate-200/80 p-12 text-center">
                            <Users size={40} className="mx-auto text-slate-300 mb-3" />
                            <p className="text-slate-500 font-medium">Nessun membro nel team</p>
                            <p className="text-xs text-slate-400 mt-1">Invita i tuoi collaboratori per iniziare!</p>
                        </div>
                    )}
                </div>
            )}

            {/* === PERMISSIONS MATRIX TAB === */}
            {activeTab === 'permissions' && (
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200/80 overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="bg-slate-50 border-b border-slate-200">
                                    <th className="text-left text-xs font-semibold text-slate-500 p-4 w-48">Permesso</th>
                                    {(['owner', 'admin', 'editor', 'viewer'] as UserRole[]).map(role => (
                                        <th key={role} className="text-center text-xs font-semibold text-slate-500 p-4">
                                            <div className="flex flex-col items-center gap-1">
                                                {roleIcons[role]}
                                                <span className={ROLE_PERMISSIONS[role].color}>{ROLE_PERMISSIONS[role].label}</span>
                                            </div>
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(PERMISSION_LABELS).map(([perm, info], i) => (
                                    <tr key={perm} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                        <td className="p-4">
                                            <div className="flex items-center gap-2">
                                                <span className="text-slate-400">{info.icon}</span>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-700">{info.label}</p>
                                                    <p className="text-[10px] text-slate-400">{info.desc}</p>
                                                </div>
                                            </div>
                                        </td>
                                        {(['owner', 'admin', 'editor', 'viewer'] as UserRole[]).map(role => (
                                            <td key={role} className="text-center p-4">
                                                {ROLE_PERMISSIONS[role].permissions.includes(perm) ? (
                                                    <div className="inline-flex w-7 h-7 rounded-lg bg-emerald-100 items-center justify-center">
                                                        <Check size={14} className="text-emerald-600" />
                                                    </div>
                                                ) : (
                                                    <div className="inline-flex w-7 h-7 rounded-lg bg-slate-100 items-center justify-center">
                                                        <X size={14} className="text-slate-300" />
                                                    </div>
                                                )}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Info banner */}
                    <div className="px-5 py-3 bg-amber-50 border-t border-amber-200/60 flex items-center gap-2 text-sm text-amber-700">
                        <AlertTriangle size={16} />
                        <span>Solo il <strong>Proprietario</strong> può gestire la fatturazione. Gli <strong>Amministratori</strong> possono gestire il team e le impostazioni.</span>
                    </div>
                </div>
            )}
        </div>
    );
};
