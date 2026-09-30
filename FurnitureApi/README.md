# Furniture API

A simple Node.js and Express API for your furniture store.

## Setup Instructions

1.  **Configure Environment Variables**:
    *   Copy `.env.example` to `.env` and fill in the database credentials (`DB_HOST`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`).
    *   Set `JWT_SECRET` to a long random string (32+ chars). The server will not start without it.
    *   Set `CORS_ORIGIN` to the URL(s) of your frontend.
    *   Never commit `.env` — it is ignored by `.gitignore`.
2.  **XAMPP Setup**:
    *   Ensure MySQL is running in XAMPP.
    *   Make sure you have a database named `furniture` (or whatever you set in `.env`).
3.  **Run the Server**:
    ```bash
    npm install
    npm run dev
    ```

## API Endpoints

- `GET /getProducts`: Fetches all products from the `products` table.
- `GET /`: Health check endpoint.
