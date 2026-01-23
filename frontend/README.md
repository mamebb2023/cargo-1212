# Cargo1212 Frontend - Technical Documentation

## Overview

The Cargo1212 frontend is a modern React-based single-page application (SPA) built with TypeScript, providing a comprehensive user interface for the cargo bidding platform. It connects shippers with carriers through an intuitive web interface.

## Technology Stack

### Core Framework
**React 19.2.0** - Modern JavaScript library for building user interfaces with component-based architecture

### Build Tools & Development
- **Vite** - Fast build tool and development server
- **TypeScript** - Type-safe JavaScript for better development experience
- **ESLint** - Code linting and quality enforcement

### UI & Styling
- **Tailwind CSS 4.1.17** - Utility-first CSS framework for rapid styling
- **Radix UI** - Accessible component primitives
- **Lucide React** - Beautiful icon library
- **Framer Motion** - Animation library for smooth interactions

### State Management & Data
- **React Router DOM 7.9.6** - Client-side routing
- **React Hot Toast** - Notification system
- **Zod** - Schema validation for forms and API responses
- **Class Variance Authority (CVA)** - Component variant management

### Development Tools
- **@tailwindcss/vite** - Tailwind CSS integration
- **@types/** packages - TypeScript definitions

## Project Structure

### Root Configuration
- **vite.config.ts** - Vite build configuration
- **tsconfig.json** - TypeScript configuration
- **eslint.config.js** - ESLint configuration
- **package.json** - Dependencies and scripts
- **vercel.json** - Deployment configuration for Vercel

### Source Code (`src/`)

#### `src/App.tsx`
**Main Application Component**
- React Router setup with protected routes
- Authentication context integration
- Toast notifications configuration
- Route definitions for all pages

**Route Structure**:
```text
// Public routes
/ (Landing page)
/about, /contact, /terms, /privacy
/login, /register

// Protected dashboard routes
/dashboard/*
  /stats (default)
  /bids, /bids/create, /bids/:id
  /my-bids, /offers, /offers/:bidId
  /profile, /settings, /notifications
  /submit-again
  /to-review (admin only)
```

#### `src/main.tsx`
**Application Entry Point**
- React 19 rendering with StrictMode
- App component mounting
- CSS imports

#### `src/index.css`
**Global Styles**
- Tailwind CSS directives
- Custom CSS variables for theming
- Base styles and utilities

### Components Architecture (`src/components/`)

#### Layout Components
- **layouts/DashboardLayout.tsx** - Main dashboard wrapper with sidebar navigation
- **auth/ProtectedRoute.tsx** - Route protection wrapper
- **auth/AdminRoute.tsx** - Admin-only route protection
- **auth/AuthRedirect.tsx** - Redirect authenticated users

#### UI Components (24 files)
Modular, reusable components following design system principles:
- Form components (inputs, buttons, selects)
- Data display components (tables, cards, lists)
- Navigation components (sidebar, breadcrumbs)
- Feedback components (loading, empty states)
- Modal and overlay components

### Pages Architecture (`src/pages/`)

#### Public Pages (27 total)
- **LandingPage.tsx** - Marketing homepage
- **AboutPage.tsx**, **ContactPage.tsx** - Static content pages
- **TermsPage.tsx**, **PrivacyPage.tsx** - Legal pages

#### Authentication Pages
- **auth/LoginPage.tsx** - User login interface
- **auth/RegisterPage.tsx** - User registration with role selection

#### Dashboard Pages
- **dashboard/StatsPage.tsx** - Dashboard overview and analytics
- **dashboard/BidsPage.tsx** - Available bids listing
- **dashboard/CreateBidPage.tsx** - Bid creation form
- **dashboard/BidDetailsPage.tsx** - Individual bid view with offers
- **dashboard/SubmitOfferPage.tsx** - Carrier offer submission
- **dashboard/MyBidsPage.tsx** - Shipper's created bids
- **dashboard/OffersPage.tsx** - Carrier's submitted offers
- **dashboard/ProfilePage.tsx** - User profile management
- **dashboard/SettingsPage.tsx** - Account settings
- **dashboard/NotificationsPage.tsx** - Notification center
- **dashboard/SubmitAgainPage.tsx** - Bid resubmission
- **admin/ToReviewPage.tsx** - Admin bid review interface

### Context & State (`src/context/`)
- **AuthContext** - Global authentication state management

### Hooks (`src/hooks/`)
- **useAuth.tsx** - Authentication logic and API integration

### Constants (`src/constant/`)
- **index.ts** - Application-wide constants and configuration

### Libraries (`src/lib/`)
- **utils.ts** - Utility functions (cn for class merging)
- **api.ts** - API client configuration
- **validation.ts** - Form validation schemas

### Types (`src/types/`)
- **index.ts** - TypeScript type definitions for API responses and components

## Key Features & Architecture Patterns

### Authentication Flow
1. **Registration**: Multi-step form with role selection (shipper/carrier)
2. **Login**: JWT-based authentication with token storage
3. **Protected Routes**: Automatic redirects based on auth status
4. **Role-Based Access**: Different UI/permissions for shipper/carrier/admin

### Component Design System
- **Consistent Styling**: Tailwind CSS with custom design tokens
- **Accessibility**: Radix UI primitives for screen reader support
- **Responsive Design**: Mobile-first approach with responsive breakpoints
- **Animation**: Framer Motion for smooth transitions

### API Integration
- **RESTful Communication**: Axios-based API client
- **Type Safety**: Zod schemas for API response validation
- **Error Handling**: Toast notifications for user feedback
- **Loading States**: Skeleton screens and loading indicators

### Form Management
- **Validation**: Zod schemas for form validation
- **User Experience**: Real-time validation feedback
- **File Uploads**: Drag-and-drop interfaces for documents

### Routing Architecture
- **Client-Side Routing**: React Router for SPA navigation
- **Protected Routes**: Authentication-based route guards
- **Nested Routes**: Dashboard with nested child routes
- **Dynamic Routing**: Bid details with URL parameters

## Build & Development

### Development Server
```bash
npm run dev
# or
npm run dev -- --host  # for network access
```

### Production Build
```bash
npm run build
```

### Code Quality
```bash
npm run lint
```

### TypeScript Compilation
```bash
npm run build  # Includes TypeScript compilation
```

## Styling Architecture

### Tailwind CSS Configuration
- **Utility-First**: Classes applied directly in JSX
- **Custom Design Tokens**: CSS variables for colors, spacing, typography
- **Responsive Design**: Mobile-first with sm/md/lg/xl breakpoints
- **Dark Mode Ready**: CSS variable system supports theme switching

### Component Variants
- **CVA (Class Variance Authority)**: Type-safe component variants
- **Consistent API**: Standardized prop interfaces
- **Theme Integration**: Automatic theme variable usage

## Performance Optimizations

### Build Optimizations
- **Vite**: Fast development and optimized production builds
- **Tree Shaking**: Unused code elimination
- **Code Splitting**: Route-based code splitting for smaller bundles

### Runtime Performance
- **React 19**: Latest React features for better performance
- **Memoization**: React.memo for expensive components
- **Lazy Loading**: Route-based component lazy loading

## Deployment

### Vercel Configuration
- **vercel.json**: Deployment configuration for Vercel platform
- **Static Asset Handling**: Optimized static file serving
- **Environment Variables**: Secure environment variable management

### Build Output
- **dist/**: Production build output
- **Static Assets**: Optimized CSS, JS, and image files
- **Index HTML**: Single-page application entry point

## Development Workflow

1. **Installation**: `npm install`
2. **Development**: `npm run dev`
3. **Code Quality**: `npm run lint` during development
4. **Build**: `npm run build` for production
5. **Preview**: `npm run preview` to test production build

## Integration Points

### Backend API
- **RESTful Endpoints**: Full API integration with Django backend
- **Authentication**: JWT token handling and refresh
- **File Uploads**: Multipart form data handling
- **Real-time Updates**: WebSocket-ready architecture

### External Services
- **Payment Processing**: Integration with payment gateways
- **File Storage**: Cloud storage for document uploads
- **Email Services**: Notification and verification emails

This React frontend provides a modern, accessible, and performant user interface for the Cargo1212 cargo bidding platform, built with industry best practices and scalable architecture patterns.