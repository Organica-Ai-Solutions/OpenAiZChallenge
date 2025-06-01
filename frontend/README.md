# 🌐 NIS Protocol Frontend

> **Modern React/Next.js interface for archaeological discovery and AI-powered analysis**

[![Next.js](https://img.shields.io/badge/Next.js-15.2.4-black)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-18.3.1-blue)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.6.3-blue)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4.5-38bdf8)](https://tailwindcss.com/)

## 🎯 **Overview**

The NIS Protocol frontend is a cutting-edge web application that provides an intuitive interface for archaeological discovery, real-time analysis, and AI-powered insights. Built with modern React/Next.js architecture and enhanced with real-time WebSocket communication.

## ✨ **Key Features**

### 🏛️ **Archaeological Discovery Interface**
- **Interactive coordinate input** with validation and geolocation support
- **Multi-source data selection** (Satellite, LiDAR, Historical texts, Indigenous maps)
- **Real-time progress tracking** with WebSocket updates
- **Comprehensive results display** with confidence scoring
- **AI agent analysis integration** with detailed insights

### 🎨 **Modern UI/UX**
- **Dark theme design** with gradient backgrounds and modern aesthetics
- **Responsive layout** optimized for desktop, tablet, and mobile
- **Accessibility-first** design with proper ARIA labels and keyboard navigation
- **Smooth animations** and transitions for enhanced user experience
- **Component-based architecture** with reusable UI elements

### 🔄 **Real-Time Features**
- **WebSocket connections** with automatic reconnection and fallback
- **Live progress updates** during discovery and analysis processes
- **Real-time notifications** for system events and discoveries
- **Dynamic status indicators** showing connection and system health
- **Streaming data visualization** for ongoing processes

### 📊 **Data Visualization**
- **Interactive maps** with satellite overlays and discovery markers
- **Progress bars and charts** showing analysis confidence and completion
- **Tabbed interfaces** for organized data presentation
- **Export capabilities** for sharing results and generating reports
- **Filtering and search** functionality for large datasets

## 🏗️ **Architecture**

### **Technology Stack**
```
Frontend Stack:
├── Next.js 15.2.4          # React framework with app directory
├── React 18.3.1            # Component library
├── TypeScript 5.6.3        # Type safety and development experience
├── Tailwind CSS 3.4.5      # Utility-first styling
├── Radix UI                 # Accessible component primitives
├── Lucide React            # Modern icon library
└── WebSocket API           # Real-time communication
```

### **Project Structure**
```
frontend/
├── app/                    # Next.js app directory (route definitions)
│   ├── page.tsx           # Enhanced homepage with live stats
│   ├── archaeological-discovery/  # Discovery interface
│   ├── satellite/         # Satellite monitoring dashboard
│   ├── agent/             # AI agent interaction
│   ├── map/               # Interactive mapping
│   ├── chat/              # Chat interface
│   └── analytics/         # Data analytics dashboard
├── components/            # Reusable UI components
│   └── ui/               # Shadcn/ui component library
├── src/                  # Source utilities and libraries
│   └── lib/              # Utility libraries
│       ├── websocket.ts  # Enhanced WebSocket service
│       └── discovery-service.ts  # Backend API integration
├── hooks/                # Custom React hooks
├── styles/               # Global styles and themes
└── public/               # Static assets
```

## 🚀 **Pages & Features**

### 🏠 **Homepage** (`/`)
- **Live system dashboard** with real-time statistics
- **Quick action buttons** for immediate discovery
- **Feature showcase** with interactive cards
- **Recent activity feed** with WebSocket updates
- **System health indicators** and connection status

### 🔍 **Archaeological Discovery** (`/archaeological-discovery`)
- **Coordinate input form** with validation and quick location presets
- **Data source selection** with visual indicators
- **Real-time progress tracking** during discovery
- **Tabbed results display** (Discoveries, AI Analysis, Map View)
- **Site details** with confidence scoring and metadata
- **AI agent integration** for detailed analysis

### 🛰️ **Satellite Monitoring** (`/satellite`)
- **Real-time satellite feeds** with health monitoring
- **Automated change detection** visualization
- **Weather correlation** and environmental data
- **System diagnostics** and performance metrics
- **Health status dashboard** with component breakdown

### 🤖 **AI Agent Interface** (`/agent`)
- **Agent selection** and configuration
- **Direct agent interaction** and testing
- **Result visualization** and analysis
- **Performance metrics** and confidence tracking

### 🗺️ **Interactive Maps** (`/map`)
- **Satellite imagery layers** with multiple providers
- **Discovery markers** with detailed popups
- **Real-time updates** for new discoveries
- **Filtering capabilities** by confidence and date
- **Export options** for GeoJSON and other formats

### 💬 **Chat Interface** (`/chat`)
- **Natural language queries** for archaeological research
- **ReAct framework** for reasoning and action planning
- **Context-aware responses** with historical data
- **Multi-turn conversations** with memory persistence

### 📈 **Analytics Dashboard** (`/analytics`)
- **Interactive charts** showing discovery trends
- **Confidence distribution** visualization
- **Regional analysis** and performance metrics
- **Export capabilities** for research publications

## 🔌 **WebSocket Integration**

### **Enhanced WebSocket Service** (`src/lib/websocket.ts`)
```typescript
// Advanced features:
- Multiple endpoint fallback (IPv4/IPv6)
- Exponential backoff reconnection
- Connection timeout handling
- Message queue for offline scenarios
- Event-driven architecture with type safety
- Graceful degradation and error recovery
```

### **Supported Events**
- `connected` / `disconnected` - Connection status
- `notification` - System notifications and alerts
- `analysis_update` - Real-time analysis progress
- `discovery` - New archaeological discoveries
- `system_status` - Health and performance updates

## 🎨 **UI Components**

### **Custom Components**
- **HealthStatus** - Real-time system health monitoring
- **ProgressIndicator** - Enhanced progress bars with animations
- **DiscoveryCard** - Comprehensive site information display
- **MapVisualization** - Interactive geographical displays
- **NotificationCenter** - Toast and alert management

### **Shadcn/ui Integration**
- **Consistent design system** with customizable themes
- **Accessible components** following WAI-ARIA guidelines
- **Type-safe props** with TypeScript integration
- **Flexible styling** with Tailwind CSS utilities

## 🛠️ **Development**

### **Getting Started**
```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev

# Build for production
pnpm build

# Start production server
pnpm start

# Run type checking
pnpm type-check

# Run linting
pnpm lint
```

### **Environment Variables**
```env
# API Configuration
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_WS_URL=ws://localhost:8001

# Feature Flags
NEXT_PUBLIC_ENABLE_ANALYTICS=true
NEXT_PUBLIC_ENABLE_CHAT=true
NEXT_PUBLIC_ENABLE_MAPS=true

# Development
NODE_ENV=development
```

### **Development Guidelines**

#### **Code Organization**
- **Feature-based structure** with co-located components and logic
- **TypeScript strict mode** for enhanced type safety
- **Custom hooks** for reusable stateful logic
- **Service layer** for API and WebSocket communication

#### **Styling Conventions**
- **Tailwind CSS utilities** for consistent styling
- **Component variants** using class-variance-authority (cva)
- **Responsive design** with mobile-first approach
- **Dark theme support** with CSS variables

#### **State Management**
- **React hooks** for local component state
- **Context API** for shared application state
- **SWR/React Query** for server state management
- **WebSocket service** for real-time updates

## 🧪 **Testing**

### **Test Coverage**
- **Component tests** with React Testing Library
- **Integration tests** for page interactions
- **E2E tests** with Playwright
- **Visual regression tests** with Chromatic

### **Running Tests**
```bash
# Unit and integration tests
pnpm test

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage

# Visual tests
pnpm test:visual
```

## 📱 **Responsive Design**

### **Breakpoints**
- **Mobile**: 320px - 767px
- **Tablet**: 768px - 1023px
- **Desktop**: 1024px - 1439px
- **Large Desktop**: 1440px+

### **Mobile Optimizations**
- **Touch-friendly interfaces** with appropriate sizing
- **Gesture support** for maps and visualizations
- **Optimized loading** with code splitting
- **Progressive enhancement** for feature availability

## 🔒 **Security**

### **Frontend Security Measures**
- **Content Security Policy** (CSP) headers
- **XSS protection** with output encoding
- **CSRF protection** with token validation
- **Secure WebSocket** connections (WSS in production)
- **Input validation** and sanitization

## 🚀 **Performance**

### **Optimization Strategies**
- **Code splitting** with dynamic imports
- **Image optimization** with Next.js Image component
- **Bundle analysis** and tree shaking
- **Service worker** for offline functionality
- **CDN integration** for static assets

### **Performance Metrics**
- **First Contentful Paint**: < 1.5s
- **Largest Contentful Paint**: < 2.5s
- **Time to Interactive**: < 3.0s
- **Cumulative Layout Shift**: < 0.1

## 🌍 **Internationalization**

### **Multi-language Support**
- **English** (default)
- **Portuguese** (Brazilian)
- **Spanish** (Latin American)
- **Indigenous languages** (planned)

### **Implementation**
- **Next.js i18n** routing
- **Translation keys** with namespacing
- **Right-to-left** language support
- **Cultural adaptations** for date/time formats

## 📦 **Deployment**

### **Production Build**
```bash
# Build production bundle
pnpm build

# Export static files (if needed)
pnpm export

# Start production server
pnpm start
```

### **Docker Deployment**
```dockerfile
# Multi-stage build for optimization
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN pnpm install --frozen-lockfile
COPY . .
RUN pnpm build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/package.json ./package.json
RUN pnpm install --production
EXPOSE 3000
CMD ["pnpm", "start"]
```

### **Cloud Deployment Options**
- **Vercel** - Optimized Next.js hosting
- **Netlify** - JAMstack deployment
- **AWS Amplify** - Full-stack deployment
- **Google Cloud Run** - Containerized deployment

## 🔧 **Configuration**

### **Next.js Configuration** (`next.config.mjs`)
```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    appDir: true,
  },
  images: {
    domains: ['localhost', 'your-satellite-provider.com'],
  },
  webpack: (config) => {
    // Custom webpack configuration
    return config;
  },
};

export default nextConfig;
```

### **Tailwind Configuration** (`tailwind.config.ts`)
```typescript
import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Custom archaeological theme colors
      },
      animation: {
        // Custom animations for discoveries
      },
    },
  },
  plugins: [require('@tailwindcss/forms'), require('@tailwindcss/typography')],
};

export default config;
```

## 📚 **Documentation Links**

- **[Component Storybook](http://localhost:6006)** - Interactive component library
- **[API Documentation](http://localhost:8000/docs)** - Backend API reference
- **[Design System](./docs/design-system.md)** - UI/UX guidelines
- **[Architecture Guide](./docs/architecture.md)** - Technical documentation

## 🤝 **Contributing**

### **Development Workflow**
1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-ui`
3. **Implement** changes with tests
4. **Test** thoroughly across devices and browsers
5. **Document** new features and components
6. **Submit** a pull request with detailed description

### **Code Standards**
- **ESLint + Prettier** for code formatting
- **TypeScript strict mode** for type safety
- **Accessibility** compliance (WCAG 2.1 AA)
- **Performance** considerations for all features

## 📊 **Analytics & Monitoring**

### **User Analytics**
- **Page views** and user interactions
- **Feature usage** and adoption metrics
- **Performance** monitoring and optimization
- **Error tracking** and crash reporting

### **Development Metrics**
- **Bundle size** analysis and optimization
- **Build times** and deployment metrics
- **Test coverage** and quality gates
- **Accessibility** scores and compliance

---

<div align="center">

**🌐 NIS Protocol Frontend - Modern archaeological discovery interface 🏛️**

Built with ❤️ using React, Next.js, and TypeScript

</div> 