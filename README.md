# CareMatch

An MVP operations console for a caregiver placement agency. It runs the full pipeline — from an employer's application, through staff vetting and automated matching, to interview booking and a confirmed hire — in a single web app.

Built as a front-end prototype with React, Vite and Tailwind CSS. All data is stored in the browser (via `localStorage`), so it needs no backend to run.

> **Status:** Prototype / MVP. Intended to validate the workflow and UX before investing in a production backend. See [Beyond the MVP](#beyond-the-mvp).

## Features

- **Dashboard** — pipeline overview with live counts and recent activity.
- **Employer intake & vetting** — an application form; staff green-flag applicants into matching or red-flag them out with a recorded reason. Advisory warnings flag below-market budgets and past start dates.
- **Caregiver CRM** — insert, edit and delete caregiver profiles ("bullets"), each tagged to the matcher who interviewed them; search and filter by matcher.
- **Matching engine** — scores every available caregiver against a green-flagged employer's criteria (care type, live-in/out, region, language, experience, budget) and ranks them, showing *why* each fits.
- **Cases & WhatsApp automation** — proposing a match, booking an interview, and confirming a hire each generate the messages that would be sent to the matcher and employer. Confirmed hires close the case and remove the caregiver from future matching.
- **Bookings** — suppliers publish caregiver availability; employers book interview slots against it.

## Tech stack

- [React 18](https://react.dev/)
- [Vite](https://vite.dev/) — dev server and build
- [Tailwind CSS v4](https://tailwindcss.com/)
- [lucide-react](https://lucide.dev/) — icons

## Getting started

Requires [Node.js](https://nodejs.org/) 18 or later.

```bash
# Install dependencies
npm install

# Start the development server
npm run dev
```

Then open the URL Vite prints (usually http://localhost:5173).

To create a production build:

```bash
npm run build      # outputs to dist/
npm run preview    # preview the production build locally
```

## Project structure

```
carematch/
├── index.html          # Entry HTML
├── package.json
├── vite.config.js      # Vite + React + Tailwind plugins
└── src/
    ├── main.jsx        # Mounts <App /> into #root
    ├── index.css       # @import "tailwindcss";
    └── App.jsx         # The entire application (single-file component)
```

The whole app currently lives in `src/App.jsx`. As it grows, split the view components (Dashboard, Employers, CRM, Matching, Cases, Bookings, Messages) into separate files under `src/`.

## Data & privacy

The bundled sample data (names, phone numbers) is entirely fictional and for demonstration only. Nothing is sent to any server — all state lives in your browser's `localStorage`. Clearing your browser data resets the app to its seed state; there is also a **Reset demo data** control in the sidebar.

## Beyond the MVP

To take this to production:

- **Database + API** — replace `localStorage` with a real database (e.g. PostgreSQL or Supabase) behind an API shared by all users.
- **Real WhatsApp delivery** — wire the message log to the WhatsApp Business API (Meta Cloud API or Twilio); keep the log as an audit trail.
- **Authentication & roles** — separate staff console, employer self-service, and supplier portal.
- **Compliance** — a production system handling real personal data has obligations under Singapore's PDPA (data minimisation, security, access/correction) and the DNC registry for any outbound marketing.

## License

[MIT](LICENSE). The copyright line in `LICENSE` is a placeholder — update it to your name or organisation before publishing.
