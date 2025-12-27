# Panel React App

React frontend for the Panel project. Works on desktop, tablet, and mobile. Uses the existing Express API.

## Quick start
```bash
cd Panel
cp env.example .env # adjust VITE_API_BASE_URL if backend is remote
npm install
npm run dev
```

The Vite dev server proxies `/api` to `http://localhost:3000` so you can run the Express backend alongside: `npm start` from the repo root.

## Build
```bash
npm run build
```
This emits `Panel/dist/`. Serve that folder from your backend or static hosting. For production behind Express, you can mount `express.static('Panel/dist')` and send `index.html` for React Router fallbacks.

## Structure
- `src/App.jsx`: Routes (login, register, dashboard, feature placeholders, 404)
- `src/context/AuthContext.jsx`: Auth state, login/register/logout via `/api/auth`
- `src/services/apiClient.js`: Axios client with token helper and base URL
- `src/index.css`: Responsive, mobile-first styles and layout shell
- `src/pages/*`: Page components; feature routes are ready for wiring to real API data

## Next integrations to wire
- Connect Daily Report / Materials / Received / Total Price / Settings pages to their API endpoints.
- Add PWA (manifest + service worker) and serve built assets from Express for one-domain deployment.
# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
