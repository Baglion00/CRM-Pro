# 🚀 AutoQuote Pro CRM

![Dashboard Preview](dashboard_modern_v3.png)

**AutoQuote Pro** è il CRM definitivo per professionisti e agenzie che vogliono gestire clienti, preventivi e fatturazione con eleganza e velocità. Progettato con un'interfaccia moderna e "No Code", permette di gestire tutto dal web, inclusa la configurazione del server VPS.

## ✨ Nuove Funzionalità (v2.0)

### 📊 Pipeline di Vendita
Gestisci le tue trattative con una vista Kanban intuitiva. Trascina le card, aggiorna gli stati e chiudi più contratti.

![Pipeline View](pipeline_modern_v3.png)

### 📅 Calendario Intelligente
Non perdere mai un appuntamento o una scadenza. Il nuovo calendario integrato ti mostra task, follow-up e scadenze dei preventivi.

![Calendar View](calendar_view.png)

### 📧 Modelli Email Dinamici
Crea email personalizzate con editor visuale e variabili dinamiche (es. `{{client.name}}`). Risparmia ore di lavoro manuale.

![Settings & Templates](settings_modern_v3.png)

### ☁️ Configurazione VPS Automatica
Dimentica il terminale. Configura il tuo dominio, attiva l'SSL e gestisci il tuo server direttamente dall'interfaccia web del CRM.

![VPS Settings](vps_settings_modern_v3.png)

---

## 🛠 Installazione

### Requisiti
- Node.js > 18
- Un server VPS (Ubuntu 20.04+) pulito (per la modalità VPS)

### Installazione Rapida (Locale)
```bash
git clone https://github.com/Baglion00/CRM-Pro.git
cd CRM-Pro
npm install
npm run dev
```

### Installazione su VPS (Automatica)
Abbiamo creato uno script magico che fa tutto per te. Collegati al tuo server ed esegui:

```bash
curl -O https://raw.githubusercontent.com/Baglion00/CRM-Pro/main/install_vps.sh
chmod +x install_vps.sh
sudo ./install_vps.sh tuo-dominio.com
```

Una volta installato, accedi al pannello web per completare la configurazione dei domini e dell'SSL con un click!

---

## 💎 Caratteristiche Principali

- **Preventivi PDF Automatici**: Genera preventivi professionali in secondi.
- **Gestione Clienti**: Anagrafica completa con ricerca partita IVA.
- **Automazioni**: Invia email di follow-up e promemoria automaticamente.
- **Multi-Utente**: Gestisci il tuo team con permessi granulari.
- **Pagamenti**: Integrazione con Stripe e PayPal (in modalità VPS).

---

## 📸 Galleria

| Dashboard | Impostazioni |
|-----------|--------------|
| ![Dashboard](dashboard_overview.png) | ![Impostazioni](auth_setup_settings_tour.webp) |

---

Made with ❤️ by Andrea Baglioni
