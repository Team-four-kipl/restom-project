Restom backend (OTP auth)

Setup
1. Copy `.env.example` to `.env` and fill values.
2. Install dependencies: `npm install` in the `server/` folder.
3. Run in dev: `npm run dev` (requires ts-node-dev). Build: `npm run build` then `npm start`.

API Endpoints
- POST /api/auth/send-otp  { phone }
- POST /api/auth/verify-otp { phone, otp }
- POST /api/auth/signup     { name, email, phone, password }

Frontend wiring examples

1) Send OTP
fetch('/api/auth/send-otp', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ phone: '919999999999' }) })

2) Verify OTP
fetch('/api/auth/verify-otp', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ phone: '919999999999', otp: '123456' }) })

3) Signup
fetch('/api/auth/signup', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ name: 'Name', email: 'a@b.com', phone: '919999999999', password: 'pass123' }) })

Example curl
curl -X POST http://localhost:5000/api/auth/send-otp -H "Content-Type: application/json" -d "{\"phone\":\"919999999999\"}"


Notes
- Uses Fast2SMS integration via server-side axios call. Replace FAST2SMS_API_KEY in .env.
- Issues short-lived JWT on successful verify/signup to represent a session token stored by frontend.

Development & security notes
- DEV_VERBOSE_LOG=true will print request headers and JSON bodies (useful in dev only).
- DEV_ALLOW_OTP_FETCH=true combined with DEV_OTP_SECRET allows the protected `/dev/last-otp` endpoint to return the last OTP for a phone for testing. Do NOT enable in production.
- DEV_OTP_SECRET should be a long random string and required for `/api/admin/cleanup-expired-otps` in non-production.
- ENABLE_SOCKET_IO=true will enable Socket.IO and attach `io` to the Express app; keep this off unless you wire a frontend socket client.
- Frontend: set `VITE_API_BASE` to the backend base URL (for example `http://localhost:5000`) if you want to bypass the Vite proxy and call the backend directly during development.
