# PACIFICAWAY Web

Set `VITE_API_BASE` in an `.env` file (or your shell) before running the app so the frontend can contact the API, then install dependencies and start the dev server:

```bash
npm install
npm run dev
```

For example, in GitHub Codespaces you might set:

```bash
VITE_API_BASE=https://laughing-funicular-rvgpqj5wqxx2xgqr-4000.app.github.dev
```

If `VITE_API_BASE` is missing the UI will surface an error instead of calling the wrong host.
