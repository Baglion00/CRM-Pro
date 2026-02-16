import { QuoteData, AutomationRule, AutomationLog, AutomationTrigger } from '../types';

// --- Default Automation Rules ---
export const DEFAULT_RULES: AutomationRule[] = [
    {
        id: 'rule_expiring_3d',
        name: 'Preventivo in Scadenza (3 giorni)',
        description: 'Invia promemoria quando un preventivo scade tra 3 giorni',
        trigger: 'quote_expiring',
        enabled: true,
        delayDays: 3,
        channel: 'both',
        emailTemplate: 'Gentile {{clientName}},\n\nLe ricordiamo che il preventivo {{quoteNumber}} del {{quoteDate}} è in scadenza il {{expiryDate}}.\n\nLa invitiamo a visionarlo e confermare quanto prima.\n\nCordiali saluti,\n{{companyName}}',
        runCount: 0,
        targetAudience: 'client',
    },
    {
        id: 'rule_expiring_1d',
        name: 'Preventivo in Scadenza (1 giorno)',
        description: 'Promemoria urgente: preventivo scade domani',
        trigger: 'quote_expiring',
        enabled: true,
        delayDays: 1,
        channel: 'both',
        emailTemplate: 'Gentile {{clientName}},\n\nUltimo avviso: il preventivo {{quoteNumber}} scade domani ({{expiryDate}}).\n\nSe necessita di ulteriori informazioni, non esiti a contattarci.\n\nCordiali saluti,\n{{companyName}}',
        runCount: 0,
        targetAudience: 'client',
    },
    {
        id: 'rule_expired',
        name: 'Preventivo Scaduto',
        description: 'Notifica interna quando un preventivo è scaduto',
        trigger: 'quote_expired',
        enabled: true,
        delayDays: 0,
        channel: 'internal',
        runCount: 0,
        targetAudience: 'self',
    },
    {
        id: 'rule_followup_7d',
        name: 'Follow-up Automatico (7 giorni)',
        description: 'Invia follow-up se il cliente non risponde dopo 7 giorni',
        trigger: 'follow_up',
        enabled: true,
        delayDays: 7,
        channel: 'both',
        emailTemplate: 'Gentile {{clientName}},\n\nFaccio seguito al preventivo {{quoteNumber}} inviato il {{quoteDate}}.\n\nSarebbe disponibile per un confronto? Resto a disposizione per qualsiasi chiarimento.\n\nCordiali saluti,\n{{companyName}}',
        runCount: 0,
        targetAudience: 'client',
    },
    {
        id: 'rule_followup_14d',
        name: 'Follow-up Finale (14 giorni)',
        description: 'Secondo follow-up dopo 14 giorni senza risposta',
        trigger: 'follow_up',
        enabled: false,
        delayDays: 14,
        channel: 'email',
        emailTemplate: 'Gentile {{clientName}},\n\nDesideravo verificare se ha avuto modo di valutare il preventivo {{quoteNumber}}.\n\nSe il progetto non è più di interesse, la preghiamo di farcelo sapere così da poter aggiornare i nostri archivi.\n\nCordiali saluti,\n{{companyName}}',
        runCount: 0,
        targetAudience: 'client',
    },
    {
        id: 'rule_payment_overdue',
        name: 'Pagamento Scaduto',
        description: 'Promemoria di pagamento per fatture non pagate dopo 30 giorni',
        trigger: 'payment_overdue',
        enabled: true,
        delayDays: 30,
        channel: 'both',
        emailTemplate: 'Gentile {{clientName}},\n\nLa informiamo che il pagamento per il preventivo {{quoteNumber}} di {{amount}} risulta ancora in sospeso.\n\nLa preghiamo di procedere al saldo quanto prima.\n\nCordiali saluti,\n{{companyName}}',
        runCount: 0,
        targetAudience: 'client',
    },
    {
        id: 'rule_payment_received',
        name: 'Conferma Pagamento',
        description: 'Notifica interna quando un pagamento viene ricevuto',
        trigger: 'payment_received',
        enabled: true,
        delayDays: 0,
        channel: 'internal',
        runCount: 0,
        targetAudience: 'self',
    },
    {
        id: 'rule_accepted_notify',
        name: 'Notifica Accettazione',
        description: 'Avvisa il team quando un preventivo viene accettato',
        trigger: 'quote_accepted',
        enabled: true,
        delayDays: 0,
        channel: 'internal',
        runCount: 0,
        targetAudience: 'team',
    },
    {
        id: 'rule_weekly_report',
        name: 'Report Settimanale',
        description: 'Invia un riepilogo settimanale delle attività ogni lunedì',
        trigger: 'weekly_report',
        enabled: false,
        delayDays: 0,
        channel: 'email',
        emailTemplate: 'Riepilogo Settimanale AutoQuote Pro\n\n📊 Preventivi creati: {{weeklyCreated}}\n✅ Accettati: {{weeklyAccepted}}\n❌ Rifiutati: {{weeklyRejected}}\n💰 Fatturato: {{weeklyRevenue}}\n\nBuon lavoro!\n{{companyName}}',
        runCount: 0,
        targetAudience: 'self',
    },
];

// --- Load/Save Rules ---
const RULES_KEY = 'autoquote_automation_rules';
const LOG_KEY = 'autoquote_automation_log';
const LAST_RUN_KEY = 'autoquote_automation_lastrun';

export const loadRules = (): AutomationRule[] => {
    try {
        const stored = localStorage.getItem(RULES_KEY);
        if (stored) return JSON.parse(stored);
    } catch { }
    return DEFAULT_RULES;
};

export const saveRules = (rules: AutomationRule[]): void => {
    localStorage.setItem(RULES_KEY, JSON.stringify(rules));
};

export const loadAutomationLog = (): AutomationLog[] => {
    try {
        const stored = localStorage.getItem(LOG_KEY);
        if (stored) return JSON.parse(stored);
    } catch { }
    return [];
};

export const saveAutomationLog = (log: AutomationLog[]): void => {
    // Keep last 200 entries
    localStorage.setItem(LOG_KEY, JSON.stringify(log.slice(-200)));
};

// --- Template Rendering ---
export const renderTemplate = (template: string, vars: Record<string, string>): string => {
    let result = template;
    Object.entries(vars).forEach(([key, value]) => {
        result = result.replace(new RegExp(`\\{\\{${key}\\}\\}`, 'g'), value);
    });
    return result;
};

// --- Evaluate Rules Against Quotes ---
export const evaluateRules = (quotes: QuoteData[], rules: AutomationRule[], companyName: string): AutomationLog[] => {
    const today = new Date();
    const todayStr = today.toISOString().split('T')[0];
    const logs: AutomationLog[] = [];
    const existingLog = loadAutomationLog();
    const lastRunStr = localStorage.getItem(LAST_RUN_KEY);

    // Only run once per day
    if (lastRunStr === todayStr) return [];

    rules.filter(r => r.enabled).forEach(rule => {
        quotes.forEach(q => {
            const clientName = q.client.company || q.client.name || 'Cliente';
            const logId = `${rule.id}_${q.id}_${todayStr}`;

            // Skip if already processed
            if (existingLog.some(l => l.id === logId)) return;

            let shouldTrigger = false;
            let action = '';

            switch (rule.trigger) {
                case 'quote_expiring': {
                    if (q.status === 'sent' && q.expiryDate) {
                        const daysUntil = Math.ceil((new Date(q.expiryDate).getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                        if (daysUntil === rule.delayDays) {
                            shouldTrigger = true;
                            action = `Promemoria scadenza: ${q.number} scade tra ${daysUntil} giorn${daysUntil === 1 ? 'o' : 'i'}`;
                        }
                    }
                    break;
                }
                case 'quote_expired': {
                    if (q.status === 'sent' && q.expiryDate && q.expiryDate < todayStr) {
                        const daysSince = Math.ceil((today.getTime() - new Date(q.expiryDate).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysSince === 1) { // just expired
                            shouldTrigger = true;
                            action = `Preventivo ${q.number} scaduto`;
                        }
                    }
                    break;
                }
                case 'follow_up': {
                    if (q.status === 'sent' && q.date) {
                        const daysSince = Math.floor((today.getTime() - new Date(q.date).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysSince === rule.delayDays) {
                            shouldTrigger = true;
                            action = `Follow-up per ${q.number}: ${daysSince} giorni senza risposta`;
                        }
                    }
                    break;
                }
                case 'payment_overdue': {
                    if (q.status === 'accepted' && q.paymentStatus !== 'paid' && q.date) {
                        const daysSince = Math.floor((today.getTime() - new Date(q.date).getTime()) / (1000 * 60 * 60 * 24));
                        if (daysSince >= rule.delayDays) {
                            shouldTrigger = true;
                            const total = q.items.reduce((s, i) => s + i.quantity * i.unitPrice, 0);
                            action = `Pagamento in ritardo per ${q.number}: €${total.toFixed(2)}`;
                        }
                    }
                    break;
                }
                case 'quote_accepted': {
                    // This is event-driven, not time-based; handled in App.tsx
                    break;
                }
                case 'payment_received': {
                    // This is event-driven, not time-based; handled in App.tsx
                    break;
                }
            }

            if (shouldTrigger) {
                logs.push({
                    id: logId,
                    ruleId: rule.id,
                    ruleName: rule.name,
                    quoteId: q.id,
                    quoteNumber: q.number,
                    clientName,
                    action,
                    status: rule.channel === 'internal' ? 'sent' : 'pending',
                    timestamp: new Date().toISOString(),
                    channel: rule.channel === 'both' ? 'email' : rule.channel,
                });
            }
        });
    });

    // Handle weekly report (no per-quote trigger)
    const weeklyRule = rules.find(r => r.id === 'rule_weekly_report' && r.enabled);
    if (weeklyRule && today.getDay() === 1) { // Monday
        const weekAgo = new Date(today);
        weekAgo.setDate(weekAgo.getDate() - 7);
        const weeklyCreated = quotes.filter(q => new Date(q.date) >= weekAgo).length;
        const weeklyAccepted = quotes.filter(q => q.status === 'accepted' && new Date(q.date) >= weekAgo).length;
        const logId = `${weeklyRule.id}_${todayStr}`;
        if (!existingLog.some(l => l.id === logId)) {
            logs.push({
                id: logId,
                ruleId: weeklyRule.id,
                ruleName: weeklyRule.name,
                action: `Report settimanale: ${weeklyCreated} creati, ${weeklyAccepted} accettati`,
                status: 'pending',
                timestamp: new Date().toISOString(),
                channel: 'email',
            });
        }
    }

    // Save new logs
    if (logs.length > 0) {
        saveAutomationLog([...existingLog, ...logs]);
    }

    localStorage.setItem(LAST_RUN_KEY, todayStr);
    return logs;
};

// --- Get Trigger Display Info ---
export const TRIGGER_CONFIG: Record<AutomationTrigger, { icon: string; label: string; color: string }> = {
    quote_expiring: { icon: '⏰', label: 'Scadenza Preventivo', color: 'text-amber-600' },
    quote_expired: { icon: '❌', label: 'Preventivo Scaduto', color: 'text-red-600' },
    quote_sent: { icon: '📤', label: 'Preventivo Inviato', color: 'text-blue-600' },
    quote_accepted: { icon: '✅', label: 'Preventivo Accettato', color: 'text-emerald-600' },
    payment_overdue: { icon: '💳', label: 'Pagamento Scaduto', color: 'text-red-600' },
    payment_received: { icon: '💰', label: 'Pagamento Ricevuto', color: 'text-emerald-600' },
    follow_up: { icon: '📧', label: 'Follow-up', color: 'text-violet-600' },
    recurring_due: { icon: '🔄', label: 'Rinnovo Ricorrente', color: 'text-cyan-600' },
    weekly_report: { icon: '📊', label: 'Report Settimanale', color: 'text-indigo-600' },
};
