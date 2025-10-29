# Quick Start: Backend Setup

## What Your Backend Needs to Implement

### 1. Minimum Requirements
- **REST API** on port 3000
- **JWT authentication**
- **CORS enabled** for `http://localhost:5173`
- **All endpoints** in `BACKEND_API_DOCS.md`

### 2. Essential Endpoints to Start With

First, implement these 3 for the app to work:

```javascript
// 1. POST /api/auth/login
// Returns: { success: true, data: { token: "...", user: {...} } }

// 2. GET /api/auth/me
// Returns: { success: true, data: { id, email, name, role } }

// 3. GET /api/employees
// Returns: { success: true, data: [...] }
```

### 3. Docker Quick Start

Create these files:

**docker-compose.yml** (in project root):
```yaml
version: '3.8'

services:
  backend:
    image: your-backend-image
    container_name: hr_backend
    ports:
      - "3000:3000"
    environment:
      - JWT_SECRET=your_secret_key
    restart: unless-stopped
```

**Backend Dockerfile**:
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### 4. Frontend is Ready

The frontend will automatically connect when:
- Your backend runs on `http://localhost:3000/api`
- CORS allows `http://localhost:5173`
- Login endpoint works with: `POST /api/auth/login`

### 5. Test It

```bash
# Start backend
docker-compose up

# Frontend will connect automatically
# Test login with: admin@hrsystem.com / admin123
```

## Full API Reference

See:
- `BACKEND_API_DOCS.md` - Complete API specs
- `BACKEND_SETUP_GUIDE.md` - Detailed setup guide

## Most Important: CORS!

Without proper CORS, the frontend can't call your API:

```javascript
// Express.js example
app.use(cors({
  origin: 'http://localhost:5173',
  credentials: true
}));
```

That's it! The frontend is ready and waiting.



