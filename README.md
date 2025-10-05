# 📦 Shipsy - Shipment Management System

A comprehensive shipment management system built with Next.js 15, PostgreSQL, and Drizzle ORM. Features custom JWT authentication, RESTful API, and a modern React UI.

## 🚀 Features

### Authentication
- Custom JWT authentication with HTTP-only cookies
- User registration and login
- Secure password hashing with bcrypt
- Token refresh mechanism
- Protected routes and API endpoints

### Shipment Management
- Create, read, update, delete shipments
- Track shipments with unique tracking numbers
- Filter by type (domestic/international), mode (air/sea/road/rail), and status
- Mark shipments as delivered
- View shipment statistics and analytics
- Pagination support

### Customer Management
- Full CRUD operations for customers
- Search customers by name, email, or phone
- Customer profile management
- Pagination support

### Dashboard
- Real-time statistics overview
- Shipment analytics by type and mode
- Revenue tracking
- Visual data presentation

## 🛠️ Tech Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Type-safe development
- **TailwindCSS** - Utility-first CSS framework
- **React Hooks** - Custom hooks for state management

### Backend
- **Next.js API Routes** - RESTful API endpoints
- **PostgreSQL** - Relational database
- **Drizzle ORM** - Type-safe database toolkit
- **JWT** - JSON Web Tokens for authentication
- **bcryptjs** - Password hashing
- **Zod** - Schema validation

### Architecture
- **Repository Pattern** - Data access abstraction
- **Service Layer** - Business logic separation
- **Controller Layer** - Request/response handling
- **Clean Architecture** - Separation of concerns

## 📁 Project Structure

```
shipsy/
├── app/                          # Next.js App Router
│   ├── api/                      # API Routes
│   │   ├── auth/                 # Authentication endpoints
│   │   ├── customers/            # Customer endpoints
│   │   └── shipments/            # Shipment endpoints
│   ├── dashboard/                # Dashboard page
│   ├── shipments/                # Shipments page
│   ├── customers/                # Customers page
│   ├── login/                    # Login page
│   ├── register/                 # Register page
│   └── layout.tsx                # Root layout
├── components/                   # React components
│   ├── ui/                       # Common UI components
│   ├── layout/                   # Layout components
│   ├── dashboard/                # Dashboard components
│   ├── shipments/                # Shipment components
│   └── customers/                # Customer components
├── lib/                          # Backend logic
│   ├── controllers/              # API controllers
│   ├── services/                 # Business logic
│   ├── repositories/             # Data access layer
│   ├── db/                       # Database configuration
│   ├── utils/                    # Utility functions
│   └── validators/               # Zod schemas
├── hooks/                        # Custom React hooks
├── models/                       # TypeScript models
└── types/                        # TypeScript type definitions

Total Files: 82 (46 backend, 36 frontend)
```

## 🔧 Installation

### Prerequisites
- Node.js 18+ and npm
- PostgreSQL database

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd shipsy
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/shipsy"
   JWT_SECRET="your-secret-key-here"
   JWT_REFRESH_SECRET="your-refresh-secret-key-here"
   JWT_EXPIRES_IN="15m"
   JWT_REFRESH_EXPIRES_IN="7d"
   ```

4. **Run database migrations**
   ```bash
   npm run db:push
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## 📚 API Documentation

### Authentication Endpoints

#### POST `/api/auth/register`
Register a new user
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "phone": "+1234567890",
  "password": "password123"
}
```

#### POST `/api/auth/login`
Login with credentials
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

#### POST `/api/auth/logout`
Logout and clear cookies

#### GET `/api/auth/me`
Get current user profile (requires authentication)

#### POST `/api/auth/refresh`
Refresh access token

#### PATCH `/api/auth/profile`
Update user profile
```json
{
  "name": "John Updated",
  "phone": "+1987654321"
}
```

#### POST `/api/auth/change-password`
Change user password
```json
{
  "currentPassword": "oldpassword",
  "newPassword": "newpassword"
}
```

### Shipment Endpoints

#### GET `/api/shipments`
Get all shipments with filters
- Query params: `type`, `mode`, `isDelivered`, `startDate`, `endDate`, `page`, `limit`

#### POST `/api/shipments`
Create a new shipment
```json
{
  "customerId": "customer-id",
  "origin": "New York",
  "destination": "Los Angeles",
  "type": "domestic",
  "mode": "air",
  "weight": 10.5,
  "cost": 150.00,
  "estimatedDeliveryDate": "2025-10-10"
}
```

#### GET `/api/shipments/:id`
Get shipment by ID

#### PUT `/api/shipments/:id`
Update shipment

#### DELETE `/api/shipments/:id`
Delete shipment

#### PATCH `/api/shipments/:id/deliver`
Mark shipment as delivered

#### GET `/api/shipments/pending`
Get pending shipments

#### GET `/api/shipments/delivered`
Get delivered shipments

#### GET `/api/shipments/stats`
Get shipment statistics

#### DELETE `/api/shipments/bulk`
Bulk delete shipments
```json
{
  "ids": ["id1", "id2", "id3"]
}
```

### Customer Endpoints

#### GET `/api/customers`
Get all customers with pagination
- Query params: `page`, `limit`

#### POST `/api/customers`
Create a new customer
```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "phone": "+1234567890",
  "address": "123 Main St, City, State 12345"
}
```

#### GET `/api/customers/:id`
Get customer by ID

#### PUT `/api/customers/:id`
Update customer

#### DELETE `/api/customers/:id`
Delete customer

#### GET `/api/customers/search?q=query`
Search customers

#### GET `/api/customers/stats`
Get customer statistics

#### DELETE `/api/customers/bulk`
Bulk delete customers

## 🎨 UI Components

### Common Components
- **Button** - 5 variants, 3 sizes, loading state
- **Input** - Label, error handling, icons
- **Select** - Dropdown with validation
- **Textarea** - Multi-line input
- **SearchBar** - Debounced search (300ms)
- **Pagination** - Smart pagination with dots
- **LoadingSpinner** - 4 sizes
- **ErrorMessage** - Error display with retry

### Layout Components
- **Navbar** - Top navigation with user menu
- **Sidebar** - Left navigation
- **DashboardLayout** - Main layout wrapper

### Feature Components
- **StatsCard** - Statistics display
- **ShipmentCard** - Shipment item display
- **ShipmentForm** - Create/edit shipment
- **CustomerCard** - Customer item display
- **CustomerForm** - Create/edit customer

## 🔐 Security Features

- JWT authentication with HTTP-only cookies
- Password hashing with bcrypt (10 salt rounds)
- Token refresh mechanism
- Protected API routes
- Input validation with Zod
- SQL injection prevention (Drizzle ORM)
- XSS protection

## 📊 Database Schema

### Users
- id, email (unique), password, name, phone, timestamps

### Customers
- id, name, email (unique), phone, address, timestamps

### Shipments
- id, trackingNumber (unique), customerId (FK), origin, destination
- type (domestic/international), mode (air/sea/road/rail)
- weight, cost, isDelivered, deliveryDate, estimatedDeliveryDate
- timestamps

## 🚦 Scripts

```bash
# Development
npm run dev          # Start dev server

# Build
npm run build        # Build for production
npm run start        # Start production server

# Database
npm run db:push      # Push schema to database
npm run db:studio    # Open Drizzle Studio

# Code Quality
npm run lint         # Run ESLint
```

## 🧪 Development Workflow

1. Backend changes → Update repositories/services/controllers
2. Frontend changes → Update components/hooks/pages
3. Database changes → Update schema.ts → Run `npm run db:push`
4. API changes → Update routes in `app/api/`

## 📝 Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| DATABASE_URL | PostgreSQL connection string | Yes |
| JWT_SECRET | Secret for access tokens | Yes |
| JWT_REFRESH_SECRET | Secret for refresh tokens | Yes |
| JWT_EXPIRES_IN | Access token expiry | No (default: 15m) |
| JWT_REFRESH_EXPIRES_IN | Refresh token expiry | No (default: 7d) |

## 🎯 Future Enhancements

- [ ] Real-time tracking with WebSockets
- [ ] Email notifications
- [ ] PDF invoice generation
- [ ] Advanced analytics dashboard
- [ ] Multi-language support
- [ ] Dark mode
- [ ] Mobile app
- [ ] API rate limiting
- [ ] Audit logs
- [ ] Role-based access control

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👥 Authors

- Your Name - Initial work

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Drizzle team for the excellent ORM
- TailwindCSS for the utility-first CSS framework
