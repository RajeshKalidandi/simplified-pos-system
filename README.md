# Restaurant POS System

A modern, real-time restaurant Point of Sale system built with React, TypeScript, and Supabase.

## 🚀 Features

### ✅ Core Features
- **User Authentication**: Secure login/signup with role-based access (Admin/Waiter)
- **Table Management**: Visual grid layout showing table status (Available/Occupied/Reserved)
- **Order Management**: Complete ordering workflow from table selection to order completion
- **Real-time Updates**: Live order status updates and table management
- **Admin Dashboard**: Kitchen management interface for order processing

### 🎯 User Roles
- **Waiters**: Can view tables, place orders, and manage their assigned orders
- **Admins**: Full access to all orders, table management, and kitchen operations

### 📊 Order Workflow
1. **Pending** → Order received and queued
2. **Preparing** → Kitchen is preparing the order
3. **Ready** → Order ready for serving
4. **Served** → Order completed and table available

## 🛠 Tech Stack

- **Frontend**: React 18 + TypeScript + Vite
- **Styling**: TailwindCSS + shadcn/ui components
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: React Hooks + Context
- **Authentication**: Supabase Auth with JWT tokens

## 📋 Database Schema

### Tables
- `profiles` - User roles and information
- `tables` - Restaurant table management
- `menu_items` - Menu with categories and pricing  
- `orders` - Order tracking and management
- `order_items` - Individual items per order

### Key Features
- Row Level Security (RLS) policies for data protection
- Real-time subscriptions for live updates
- Automatic timestamp management
- Foreign key relationships for data integrity

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Supabase account

### Installation

1. **Clone the repository**
```bash
git clone <YOUR_GIT_URL>
cd restaurant-pos-system
```

2. **Install dependencies**
```bash
npm install
```

3. **Set up Supabase**
   - Create a new Supabase project
   - Run the SQL migrations provided in the database setup
   - Configure authentication providers if needed

4. **Configure environment**
   - Update `src/integrations/supabase/client.ts` with your Supabase credentials
   - The project is already configured for the connected Supabase instance

5. **Start development server**
```bash
npm run dev
```

6. **Build for production**
```bash
npm run build
```

## 🔐 Authentication

### Demo Accounts
Create accounts with different roles:
- **Admin**: Full access to all features
- **Waiter**: Limited to order management

### Setup
1. Navigate to the application
2. Click "Sign Up" to create a new account
3. Select your role (Admin/Waiter)
4. Verify email if required
5. Login and start using the system

## 📱 Usage

### For Waiters
1. **Login** with waiter credentials
2. **Select Table** from the available tables grid
3. **Browse Menu** and add items to cart
4. **Place Order** with special instructions if needed
5. **Track Orders** through the system

### For Admins
1. **Login** with admin credentials
2. **Manage Orders** from the admin dashboard
3. **Update Status** as orders progress through kitchen
4. **Monitor Tables** and overall restaurant status
5. **View Analytics** and order history

## 🎨 UI/UX Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Real-time Updates**: Live status changes without page refresh
- **Intuitive Interface**: Color-coded status indicators
- **Smooth Animations**: Enhanced user experience with transitions
- **Toast Notifications**: User feedback for all actions

## 🔧 Development

### Project Structure
```
src/
├── components/         # Reusable UI components
│   ├── ui/            # shadcn/ui components
│   ├── TableGrid.tsx  # Table management interface
│   ├── MenuSelection.tsx # Order placement interface
│   ├── AdminOrders.tsx # Kitchen management
│   └── Dashboard.tsx   # Main dashboard
├── pages/             # Page components
│   ├── Index.tsx      # Main application
│   ├── Auth.tsx       # Authentication page
│   └── NotFound.tsx   # 404 page
├── integrations/      # External service integrations
│   └── supabase/      # Supabase configuration
├── hooks/             # Custom React hooks
└── lib/               # Utility functions
```

### Key Components
- **TableGrid**: Visual table management with status indicators
- **MenuSelection**: Shopping cart interface with item customization
- **AdminOrders**: Real-time order management for kitchen staff
- **Auth**: Secure authentication with role selection

## 🚀 Deployment

### Supabase Deployment
1. Ensure all database migrations are applied
2. Configure Row Level Security policies
3. Set up authentication providers
4. Update CORS settings for production domain

### Frontend Deployment
```bash
npm run build
# Deploy the dist/ folder to your hosting provider
```

### Environment Variables
- Supabase URL and keys are configured in the client
- No additional environment variables needed

## 📝 Original Lovable Project

**URL**: https://lovable.dev/projects/3f57ad2a-1d41-469d-8d42-e478f872f858

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/3f57ad2a-1d41-469d-8d42-e478f872f858) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (PostgreSQL + Auth + Real-time)

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/3f57ad2a-1d41-469d-8d42-e478f872f858) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
