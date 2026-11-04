# Local Development Guide — LTTMS V1

This guide covers running the Lake Tana Tourism Management System (LTTMS) backend and database locally for day-to-day development.

---

## 1. Prerequisites

- **Node.js**: v20.x LTS or higher
- **npm**: v10.x or higher
- **MongoDB**: Local MongoDB instance (v6.0 or v7.0) or Docker Desktop

---

## 2. Option A: Native Node.js + Local MongoDB

### Step 1: Install Dependencies
```bash
cd backend
npm install
```

### Step 2: Configure Local Environment
Copy the environment template:
```bash
cp .env.example .env
```
Ensure your `.env` contains:
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/lttms
JWT_SECRET=development-mode-jwt-secret-key-at-least-32-chars-long
JWT_REFRESH_SECRET=development-mode-jwt-refresh-secret-key-32-chars
FRONTEND_ORIGIN=http://localhost:3000,http://localhost:8080
LOG_LEVEL=debug
```

### Step 3: Run Seed Data (Optional)
To populate demo categories, destinations, eco-badges, and test accounts:
```bash
npm run seed
```

### Step 4: Start Development Server (with Hot Reload)
```bash
npm run dev
```

The server starts on port `5000` with nodemon live reload.
- **Swagger Documentation**: [http://localhost:5000/api-docs](http://localhost:5000/api-docs)
- **Liveness Probe**: [http://localhost:5000/api/v1/health](http://localhost:5000/api/v1/health)
- **Readiness Probe**: [http://localhost:5000/api/v1/ready](http://localhost:5000/api/v1/ready)

---

## 3. Option B: Docker Compose Development

If you prefer running MongoDB and the backend inside containers with hot-reloading:

```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml up --build
```

- Backend source code is bind-mounted from `./backend` to `/app` inside the container.
- Nodemon detects local file changes automatically.
- MongoDB is accessible at `127.0.0.1:27017` for tools like MongoDB Compass.

To stop development containers:
```bash
docker compose -f docker-compose.yml -f docker-compose.dev.yml down
```

---

## 4. Running Tests Locally

```bash
# Run full native test runner
npm test

# Run Jest with coverage
npm run test:coverage

# Run unit tests only
npm run test:unit

# Run security & swagger tests
npm run test:security
```
