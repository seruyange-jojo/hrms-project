# HR Management System

A modern, full-stack HR Management System with React frontend and RESTful backend API.

## Project Status

✅ **Frontend**: Complete and ready  
🚧 **Backend**: In development

## Quick Start

### For Frontend Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Run development server**
   ```bash
   npm run dev
   ```

3. **Configure backend connection** (when backend is ready)
   
   Create `.env` file in project root:
   ```env
   VITE_API_URL=http://localhost:3000/api
   ```

4. **Enable demo mode** (for testing without backend)
   
   Add to `.env`:
   ```env
   VITE_DEMO_MODE=true
   ```

## Documentation

- **[FRONTEND_README.md](FRONTEND_README.md)** - Frontend setup and usage guide
- **[BACKEND_API_DOCS.md](BACKEND_API_DOCS.md)** - Complete API specifications for backend developer
- **[BACKEND_SETUP_GUIDE.md](BACKEND_SETUP_GUIDE.md)** - Backend setup and Docker guide
- **[QUICK_START_BACKEND.md](QUICK_START_BACKEND.md)** - Quick reference for backend developer
- **[BACKEND_COLLABORATION.md](BACKEND_COLLABORATION.md)** - How to collaborate on this project

## Features

- 📊 **Dashboard** with analytics and statistics
- 👥 **Employee Management** - CRUD operations
- 🏢 **Department Management** - Organize employees
- ⏰ **Attendance Tracking** - Check-in/check-out system
- 🏖️ **Leave Management** - Request and approve leaves
- 🔐 **Authentication** - Secure login with JWT

## Tech Stack

### Frontend
- React 18 with TypeScript
- Vite for build tooling
- Tailwind CSS for styling
- React Router for navigation
- Axios for API calls
- Recharts for data visualization

### Backend (To be built)
- REST API architecture
- JWT authentication
- Docker containerization
- Database (PostgreSQL recommended)

## Project Structure

```
hr-system/
├── src/
│   ├── components/      # Reusable UI components
│   ├── context/         # React Context (Auth)
│   ├── pages/          # Page components
│   ├── services/       # API integration
│   ├── types/          # TypeScript types
│   ├── App.tsx         # Main app
│   └── main.tsx        # Entry point
├── public/             # Static assets
├── docs/              # Documentation files
├── package.json        # Dependencies
└── vite.config.ts     # Vite configuration
```

## Backend Integration

### What Backend Developer Needs

Share these files with your backend developer:
1. `BACKEND_API_DOCS.md` - API specifications
2. `BACKEND_SETUP_GUIDE.md` - Setup instructions
3. `QUICK_START_BACKEND.md` - Quick reference
4. `src/services/api.ts` - API integration code

See [BACKEND_COLLABORATION.md](BACKEND_COLLABORATION.md) for detailed collaboration guide.

## Testing

### With Demo Mode (Frontend Only)
Set `VITE_DEMO_MODE=true` in `.env`
- Uses mock data
- No backend needed
- Login credentials: `admin@hrsystem.com` / `admin123`

### With Real Backend
Set `VITE_API_URL` to your backend URL
- Requires running backend server
- Full functionality enabled

## Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Required when backend is ready
VITE_API_URL=http://localhost:3000/api

# Optional: Enable for testing without backend
# VITE_DEMO_MODE=true
```

## Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Run linter
npm run lint
```

## Contributing

1. Frontend is feature-complete
2. Backend development in progress
3. See documentation files for integration details

## License

MIT License
