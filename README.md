# Helen's Barber Shop

A Flask-powered barbershop website with service listings, appointment booking, a photo gallery, customer reviews, member sign-in, and an admin booking dashboard.

## Features

- Responsive home, about, services, gallery, reviews, and contact pages
- Appointment booking with a SQLite database
- Member sign-in and account creation
- Admin dashboard for filtering and updating bookings
- Optional Groq-powered chat assistant

## Requirements

- Python 3.10 or newer
- A Groq API key for the chat assistant (optional)

## Run on Windows

From the project folder, run these commands in PowerShell:

```powershell
Set-Location .\server
py -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install --upgrade pip
python -m pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `server/.env` and set a random `SECRET_KEY`, plus a unique `ADMIN_USERNAME` and strong `ADMIN_PASSWORD`. Set `GROQ_API_KEY` if you want to enable the chat assistant. Keep `.env` private; it is excluded from Git.

Generate a random Flask secret with:

```powershell
python -c "import secrets; print(secrets.token_hex(32))"
```

Start the app while still in the `server` folder:

```powershell
python app.py
```

Open <http://127.0.0.1:5000>. The admin login is at <http://127.0.0.1:5000/admin/login>. The SQLite database is created locally by the app and should not be committed.

## Project Layout

```text
server/
  app.py                 Flask application and routes
  requirements.txt       Python dependencies
  .env.example           Environment variable template
  static/                CSS, JavaScript, and image assets
  templates/             Jinja page templates
  models/ and routes/    Supporting data models and route modules
```

## Security

Never commit `.env`, database files, virtual environments, or real API credentials. Use a strong, private admin password and a unique `SECRET_KEY` for each deployment. If a credential has been shared or exposed, revoke or rotate it before continuing to use the app.