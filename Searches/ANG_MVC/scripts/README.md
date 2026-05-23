# ANG System Starter

## One Command to Rule Them All

From the project root, simply run:

```bash
./agi start
```

This will automatically start:

- **Backend** (FastAPI + Uvicorn) → http://localhost:8081
- **Frontend** (Vite) → http://localhost:5173

Both services run in the background with live logging.
Press `Ctrl + C` to gracefully stop everything.

## Alternative (if you prefer Python directly)

```bash
python scripts/start.py
```

## Recommended: Global Command (Optional)

Add this to your `~/.bashrc` or `~/.zshrc`:

```bash
alias agi='cd /opt/lampp/htdocs/myprepProjects/Last-Prepration-fang/Searches/ANG_MVC && ./agi'
```

Then from **anywhere** in your system you can just type:

```bash
agi start
```

And the whole ANG stack (backend + frontend) will launch.
