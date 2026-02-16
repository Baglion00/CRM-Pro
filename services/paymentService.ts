import { PaymentProvider, PaymentGatewayConfig, PaymentLink, CURRENCY_FORMATTER } from '../types';

// --- Storage ---
const GATEWAY_KEY = 'autoquote_payment_gateways';
const LINKS_KEY = 'autoquote_payment_links';

// --- Provider Metadata ---
export const PROVIDER_INFO: Record<PaymentProvider, { name: string; logo: string; color: string; bg: string; description: string; fields: { key: string; label: string; placeholder: string }[] }> = {
    stripe: {
        name: 'Stripe',
        logo: 'https://images.stripeassets.com/fzn2n1nzq965/1hgcBNd12BfT9VLgbId7By/01d91920114b124fb4cf6d448f9f06eb/favicon.svg',
        color: 'text-violet-700',
        bg: 'bg-violet-50',
        description: 'Accetta pagamenti con carta di credito, SEPA e altro tramite Stripe.',
        fields: [
            { key: 'apiKey', label: 'Publishable Key', placeholder: 'pk_test_...' },
            { key: 'secretKey', label: 'Secret Key', placeholder: 'sk_test_...' },
        ],
    },
    paypal: {
        name: 'PayPal',
        logo: 'https://www.paypalobjects.com/marketing/web/logos/paypal-mark-color_new.svg',
        color: 'text-blue-700',
        bg: 'bg-blue-50',
        description: 'Ricevi pagamenti tramite PayPal, carte e bonifici.',
        fields: [
            { key: 'apiKey', label: 'Client ID', placeholder: 'AXxxxxxx...' },
            { key: 'secretKey', label: 'Client Secret', placeholder: 'ELxxxxxx...' },
        ],
    },
    gocardless: {
        name: 'GoCardless',
        logo: 'https://gocardless.com/content-platform/icons/icon-512x512.png?v=782d298e4e4d81e33987efc57ce8e4d0',
        color: 'text-teal-700',
        bg: 'bg-teal-50',
        description: 'Incassa tramite addebito diretto SEPA con GoCardless.',
        fields: [
            { key: 'apiKey', label: 'Access Token', placeholder: 'sandbox_...' },
            { key: 'secretKey', label: 'Webhook Secret', placeholder: 'whsec_...' },
        ],
    },
};

// --- Load/Save ---
export const loadGatewayConfigs = (): PaymentGatewayConfig[] => {
    try {
        const stored = localStorage.getItem(GATEWAY_KEY);
        if (stored) return JSON.parse(stored);
    } catch { }
    return [
        { provider: 'stripe', enabled: false, apiKey: '', secretKey: '', mode: 'test' },
        { provider: 'paypal', enabled: false, apiKey: '', secretKey: '', mode: 'test' },
        { provider: 'gocardless', enabled: false, apiKey: '', secretKey: '', mode: 'test' },
    ];
};

export const saveGatewayConfigs = (configs: PaymentGatewayConfig[]): void => {
    localStorage.setItem(GATEWAY_KEY, JSON.stringify(configs));
};

export const loadPaymentLinks = (): PaymentLink[] => {
    try {
        const stored = localStorage.getItem(LINKS_KEY);
        if (stored) return JSON.parse(stored);
    } catch { }
    return [];
};

export const savePaymentLinks = (links: PaymentLink[]): void => {
    localStorage.setItem(LINKS_KEY, JSON.stringify(links));
};

// --- Generate Payment Link ---
export const generatePaymentLink = (
    provider: PaymentProvider,
    config: PaymentGatewayConfig,
    quoteId: string,
    amount: number,
    currency: string = 'EUR',
    description: string = ''
): PaymentLink => {
    let url = '';

    switch (provider) {
        case 'stripe': {
            // In production, this would call Stripe API to create a payment link
            // For now, generate a simulated URL structure
            if (config.mode === 'live') {
                url = `https://checkout.stripe.com/pay/${config.apiKey}?amount=${Math.round(amount * 100)}&currency=${currency.toLowerCase()}&description=${encodeURIComponent(description)}`;
            } else {
                url = `https://checkout.stripe.com/test/pay/${config.apiKey}?amount=${Math.round(amount * 100)}&currency=${currency.toLowerCase()}`;
            }
            break;
        }
        case 'paypal': {
            if (config.mode === 'live') {
                url = `https://www.paypal.com/paypalme/${config.apiKey}/${amount}${currency}`;
            } else {
                url = `https://www.sandbox.paypal.com/paypalme/${config.apiKey}/${amount}${currency}`;
            }
            break;
        }
        case 'gocardless': {
            url = `https://pay.gocardless.com/flow/${config.apiKey}?amount=${Math.round(amount * 100)}&currency=${currency}`;
            break;
        }
    }

    const link: PaymentLink = {
        id: `plink_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
        quoteId,
        provider,
        url,
        amount,
        currency,
        status: 'pending',
        createdAt: new Date().toISOString(),
    };

    // Save to stored links
    const existing = loadPaymentLinks();
    savePaymentLinks([...existing, link]);

    return link;
};

// --- Get Active Providers ---
export const getActiveProviders = (): PaymentGatewayConfig[] => {
    return loadGatewayConfigs().filter(c => c.enabled && c.apiKey);
};

// --- Format Amount ---
export const formatPaymentAmount = (amount: number): string => {
    return CURRENCY_FORMATTER.format(amount);
};
