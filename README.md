# FINTECH by Amity — 3D Finance OS

A browser-based personal finance dashboard with a cinematic 3D intro, real-time charts, and tools for tracking spending, loans, and investments — built entirely with vanilla JavaScript, HTML, and CSS (no backend required).

![Status](https://img.shields.io/badge/status-alpha-orange) ![Version](https://img.shields.io/badge/version-1.0.0--alpha-blue)

## Features

- **3D Launch Sequence** — animated Three.js intro before entering the app
- **Dashboard** — at-a-glance view of remaining budget, total assets, and total spending
- **Transactions** — add and categorize income/expenses (Housing, Food, Transport, Shopping, Utilities, Other)
- **Bank Accounts & FDs** — track balances across multiple accounts
- **Quick Interest Calculator** — estimate returns on fixed deposits
- **Loans & EMI** — mortgage/auto loan calculator with amortization summary
- **SIP Investments** — project wealth growth from systematic investment plans
- **Financial Goals** — set and track progress toward savings goals
- **Analytics** — expense distribution and category breakdown charts (via Chart.js)
- Currency formatted in INR (₹)

## Tech Stack

- **Frontend:** HTML5, CSS3, vanilla JavaScript (no framework)
- **3D Graphics:** [Three.js](https://threejs.org/) (r128) for the intro animation
- **Charts:** [Chart.js](https://www.chartjs.org/) for analytics visualizations
- **Fonts:** Google Fonts (Outfit)
- **Storage:** In-memory app state (`appData` object) — no backend or database currently connected; data resets on page refresh

## Project Structure
## Getting Started

No build step or dependencies to install — it's a static site.

1. Clone the repository
```bash
   git clone https://github.com/yuvacharanvps/scproject.git
   cd scproject
```

2. Open `index.html` in a browser, or serve it locally:
```bash
   npx serve .
```
   (or simply double-click `index.html`)

3. Enter a starting budget on the landing screen and click **Initialize OS Core** to launch the dashboard.

## Known Limitations / Roadmap

- [ ] Persist data with `localStorage` or a real backend/database (currently resets on refresh)
- [ ] User authentication (currently shows a static "Admin User" badge)
- [ ] Export transactions/reports (e.g. CSV/PDF)
- [ ] Mobile sidebar navigation (sidebar is hidden under 768px — needs a menu toggle)
- [ ] Backend API for multi-device sync

## Contributing

Pull requests are welcome. For major changes, open an issue first to discuss what you'd like to change.
