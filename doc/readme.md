# 🏦 School Banking System - Student Management Platform

A comprehensive student management system with banking features, course enrollment, and payment processing. Built with **NestJS**, **Next.js**, and **PostgreSQL**.

## 📋 Table of Contents

- [Features](#-features)
- [System Architecture](#-system-architecture)
- [Database Schema](#-database-schema)
- [Setup & Installation](#-setup--installation)
- [Authentication](#-authentication)
- [UI Screens](#-ui-screens)
- [API Documentation](#-api-documentation)
- [Database Seeding](#-database-seeding)
- [Deployment](#-deployment)

## 🚀 Features

### Authentication & Authorization
- ✅ JWT-based authentication with 24-hour token expiration
- ✅ Role-based access control (Admin, Student)
- ✅ Secure password hashing with bcrypt
- ✅ Auto-refresh user data on page load

### Admin Features
- ✅ **Create Student Accounts** - Create new student users with auto-generated student ID and password
- ✅ **Manage Student Balances** - Set/adjust account balances for any student
- ✅ **View All Transactions** - Monitor all system transactions (transfers, payments, adjustments)
- ✅ **Course Management** - Full CRUD operations for courses
- ✅ **Student List with Balances** - View all students with their account balances
- ✅ **Statistics Dashboard** - View total students, courses, and transactions

### Student Features
- ✅ **Account Dashboard** - View current balance prominently
- ✅ **Transfer Money** - Send money to other students with searchable dropdown
- ✅ **Purchase Courses** - Buy courses using account balance
- ✅ **Transaction History** - View all personal transactions
- ✅ **Enrolled Courses** - View purchased courses
- ✅ **Students List** - View all students for transfer selection

### Course Management
- ✅ **Create Courses** - Admin can create courses with price, description, instructor, duration
- ✅ **View Courses** - All authenticated users can view available courses
- ✅ **Update/Delete Courses** - Admin can modify or remove courses
- ✅ **Course Enrollment** - Students can purchase courses with automatic payment processing

## 🏗️ System Architecture

### Backend (NestJS)
- **Framework**: NestJS 10.x
- **Database**: PostgreSQL 15 with TypeORM
- **Authentication**: JWT with Passport.js
- **Validation**: Class-validator & Class-transformer
- **Documentation**: Swagger/OpenAPI 3.0
- **API Style**: RESTful

### Frontend (Next.js)
- **Framework**: Next.js 14+ with React 18
- **Language**: TypeScript
- **State Management**: React Hooks (useState, useEffect)
- **HTTP Client**: Axios
- **Styling**: CSS Modules + Inline Styles
- **UI Components**: Custom components with modern design

### Infrastructure
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 Alpine
- **Network**: Bridge network for service communication

## 📊 Database Schema

### Entities

#### User Entity
```typescript
{
  id: number (PK, Auto-increment)
  username: string (Unique)
  email: string (Unique, Optional)
  fullName: string (Optional)
  studentId: string (Unique, Optional, Auto-generated: SVXXXX)
  password: string (Hashed with bcrypt)
  role: enum ('admin' | 'student')
  createdAt: Date
}
```

#### Account Entity
```typescript
{
  id: number (PK, Auto-increment)
  userId: number (FK -> User.id)
  balance: decimal (Default: 0.00)
  currency: string (Default: 'USD')
  createdAt: Date
  updatedAt: Date
}
```

#### Student Entity
```typescript
{
  id: number (PK, Auto-increment)
  userId: number (FK -> User.id, Optional)
  name: string
  email: string
  age: number (Optional)
  address: string (Optional)
}
```

#### Transaction Entity
```typescript
{
  id: number (PK, Auto-increment)
  fromUserId: number (FK -> User.id, Nullable)
  toUserId: number (FK -> User.id, Nullable)
  amount: decimal
  type: enum ('transfer' | 'payment' | 'adjustment')
  description: string (Optional)
  createdAt: Date
}
```

#### Course Entity
```typescript
{
  id: number (PK, Auto-increment)
  name: string
  price: decimal
  description: string (Optional)
  instructor: string (Optional)
  duration: string (Optional)
  createdAt: Date
  updatedAt: Date
}
```

#### Enrollment Entity
```typescript
{
  id: number (PK, Auto-increment)
  userId: number (FK -> User.id)
  courseId: number (FK -> Course.id)
  paymentStatus: enum ('paid' | 'pending' | 'refunded')
  enrolledAt: Date
}
```

### Relationships
- **User** → **Account** (One-to-One)
- **User** → **Student** (One-to-One, Optional)
- **User** → **Transaction** (One-to-Many, as sender/receiver)
- **User** → **Enrollment** (One-to-Many)
- **Course** → **Enrollment** (One-to-Many)

## 🛠️ Setup & Installation

### Prerequisites
- **Docker** 20.10+ and **Docker Compose** 2.0+
- **Node.js** 16+ (for local development)
- **npm** or **yarn**

### Quick Start with Docker (Recommended)

1. **Clone the repository:**
   ```bash
   git clone <repository-url>
   cd tester_api
   ```

2. **Start all services:**
   ```bash
   docker-compose up -d
   ```

3. **Access the application:**
   - **Frontend**: http://localhost:3000
   - **Backend API**: http://localhost:3001
   - **Swagger UI**: http://localhost:3001/api
   - **PostgreSQL**: localhost:5432

4. **Check logs:**
   ```bash
   docker-compose logs -f
   ```

### Local Development Setup

1. **Install dependencies:**
   ```bash
   # Backend
   cd backend
   npm install
   
   # Frontend
   cd ../frontend
   npm install
   ```

2. **Configure environment variables:**
   
   **Backend** (`backend/.env`):
   ```env
   PORT=3001
   DB_HOST=localhost
   DB_PORT=5432
   DB_USERNAME=postgres
   DB_PASSWORD=postgres
   DB_NAME=tester_db
   JWT_SECRET=your-secret-key-change-in-production
   ```

   **Frontend** (`frontend/.env.local`):
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

3. **Start PostgreSQL:**
   ```bash
   docker-compose up -d postgres
   ```

4. **Start development servers:**
   ```bash
   # Terminal 1: Backend
   cd backend
   npm run start:dev
   
   # Terminal 2: Frontend
   cd frontend
   npm run dev
   ```

### Network Access (Share with Team)

To access from other devices on the same network:

1. **Find your local IP:**
   ```bash
   # macOS/Linux
   ifconfig | grep "inet " | grep -v 127.0.0.1
   
   # Windows
   ipconfig
   ```

2. **Update docker-compose.yml:**
   ```yaml
   # Replace localhost with your IP (e.g., 192.168.1.6)
   environment:
     NEXT_PUBLIC_API_URL: http://192.168.1.6:3001
   ```

3. **Restart containers:**
   ```bash
   docker-compose restart frontend backend
   ```

4. **Access from other devices:**
   - Frontend: `http://YOUR_IP:3000`
   - Backend: `http://YOUR_IP:3001`

## 🔐 Authentication

### Default Accounts

#### Admin Account
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`
- **Initial Balance**: $0.00

#### Student Accounts (Auto-seeded)
- **Username**: `student001`, `student002`, ..., `student010`
- **Password**: `student1123`, `student2123`, ..., `student10123`
- **Student ID**: `SV001`, `SV002`, ..., `SV010`
- **Initial Balance**: $10,000.00 each

### JWT Authentication Flow

1. **Login:**
   ```bash
   POST /auth/login
   Content-Type: application/json
   
   {
     "username": "admin",
     "password": "admin123"
   }
   ```

2. **Response:**
   ```json
   {
     "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
     "user": {
       "id": 1,
       "username": "admin",
       "role": "admin"
     }
   }
   ```

3. **Use token in requests:**
   ```
   Authorization: Bearer <access_token>
   ```

4. **Token expiration**: 24 hours

## 🖥️ UI Screens

### 1. Login Screen
**Path**: `/` (Default)

**Features:**
- Username and password input fields
- Login button
- Error message display
- Default credentials hint

**Access**: Public (unauthenticated users)

---

### 2. Admin Dashboard
**Path**: `/` (After admin login)

**Main Sections:**

#### Header
- Title: "Admin Dashboard"
- Action buttons:
  - **Create Student** button (green)
  - **Create Course** button (green)
  - **Logout** button (red) with username display

#### Statistics Cards
- **Total Students** - Count of all students
- **Total Courses** - Count of all courses
- **Total Transactions** - Count of all transactions

#### Students Table
- Columns: ID, Name, Email, Age, Address, Balance (USD), Actions
- **Set Balance** button for each student
- Empty state message if no students

#### Courses Table
- Columns: ID, Name, Price (USD), Instructor, Duration
- Displays all available courses

#### Transactions Table
- Columns: ID, Type, From User, To User, Amount, Description, Date
- Shows all system transactions (newest first)

**Modals:**

##### Create Student Modal
- **Fields:**
  - Username* (required)
  - Email* (required)
  - Full Name* (required)
  - Password (optional, auto-generated if empty)
  - Age (optional)
  - Address (optional)
- **Features:**
  - Auto-generates Student ID (format: SVXXXX)
  - Auto-generates password if not provided
  - Creates account with $10,000 initial balance
  - Shows temporary password in success notification

##### Create Course Modal
- **Fields:**
  - Name* (required)
  - Price* (required, decimal)
  - Description (optional)
  - Instructor (optional)
  - Duration (optional)

##### Set Balance Modal
- **Fields:**
  - Balance* (required, decimal)
  - Description (optional)
- **Features:**
  - Sets absolute balance amount
  - Logs adjustment transaction

---

### 3. Student Dashboard
**Path**: `/` (After student login)

**Tab Navigation:**
- **Dashboard** (default)
- **Courses**
- **History**

#### Dashboard Tab

##### Account Balance Card
- Large display of current balance
- Currency: USD
- Gradient background with animation

##### Quick Actions
- **Transfer Money** button (prominent)

##### Recent Transactions
- Last 5 transactions
- Shows: Type, Amount, Description, Date
- "View All" link to History tab

#### Courses Tab

##### Course Cards Grid
- Each card displays:
  - Course name
  - Price
  - Description
  - Instructor
  - Duration
  - **Buy Course** button
- **Buy Course** button:
  - Enabled if: Sufficient balance AND not enrolled
  - Disabled if: Insufficient balance OR already enrolled
  - Shows "Already Enrolled" if purchased

#### History Tab

##### Transaction History Table
- Columns: Type, Amount, Description, Date
- Shows all personal transactions
- Sorted by date (newest first)

**Modals:**

##### Transfer Money Modal
- **Recipient Selection:**
  - Search box (search by name, email, or student ID)
  - Dropdown with filtered students
  - Format: "Full Name (Student ID)" or "Full Name (Email)"
  - Excludes current user
- **Fields:**
  - Amount* (required, decimal)
  - Description (optional)
- **Features:**
  - Validates sufficient balance
  - Validates recipient exists and is a student
  - Creates transfer transaction
  - Updates both accounts

##### Confirm Purchase Modal
- Shows course name and price
- **Confirm** and **Cancel** buttons
- Creates enrollment and payment transaction

---

### 4. Notification System

**Toast Notifications:**
- **Position**: Top-right corner
- **Types**:
  - ✅ Success (green)
  - ❌ Error (red)
  - ℹ️ Info (blue)
  - ⚠️ Warning (yellow)
- **Features**:
  - Auto-dismiss after 5-8 seconds
  - Manual close button (×)
  - Slide-in animation
  - Special display for temporary passwords

---

## 📚 API Documentation

### Base URL
```
http://localhost:3001
```

### Swagger UI
```
http://localhost:3001/api
```

### Authentication Endpoints

#### POST /auth/login
**Description**: Authenticate user and get JWT token

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "id": 1,
    "username": "admin",
    "role": "admin"
  }
}
```

#### POST /auth/logout
**Description**: Logout user (stateless)

**Headers**: `Authorization: Bearer <token>`

**Response:**
```json
{
  "message": "Logged out successfully"
}
```

#### GET /auth/me
**Description**: Get current user information

**Headers**: `Authorization: Bearer <token>`

**Response:**
```json
{
  "id": 1,
  "username": "admin",
  "role": "admin",
  "email": "admin@school.edu",
  "fullName": "System Administrator"
}
```

---

### Admin Endpoints

**Base Path**: `/admin`  
**Required**: Admin role + JWT token

#### POST /admin/students
**Description**: Create new student user account

**Request:**
```json
{
  "username": "student001",
  "email": "student001@school.edu",
  "fullName": "John Doe",
  "password": "optional-password",
  "age": 20,
  "address": "123 Main St"
}
```

**Response:**
```json
{
  "user": {
    "id": 2,
    "username": "student001",
    "email": "student001@school.edu",
    "fullName": "John Doe",
    "studentId": "SV1234",
    "role": "student"
  },
  "student": {
    "id": 1,
    "name": "John Doe",
    "email": "student001@school.edu",
    "age": 20,
    "address": "123 Main St"
  },
  "account": {
    "id": 1,
    "balance": 10000.00,
    "currency": "USD"
  },
  "tempPassword": "generated-password-if-not-provided"
}
```

#### PUT /admin/students/:id/balance
**Description**: Set/adjust student account balance

**Path Parameters**: `id` (User ID)

**Request:**
```json
{
  "balance": 5000.00,
  "description": "Scholarship adjustment"
}
```

**Response:**
```json
{
  "message": "Balance updated successfully",
  "oldBalance": 10000.00,
  "newBalance": 5000.00,
  "difference": -5000.00
}
```

#### GET /admin/transactions
**Description**: Get all transactions in the system

**Response:**
```json
[
  {
    "id": 1,
    "fromUserId": null,
    "toUserId": 2,
    "amount": 10000.00,
    "type": "adjustment",
    "description": "Initial account balance",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /admin/students/with-balances
**Description**: Get all students with their account balances

**Response:**
```json
[
  {
    "user": {
      "id": 2,
      "username": "student001",
      "email": "student001@school.edu",
      "fullName": "John Doe",
      "studentId": "SV001",
      "role": "student"
    },
    "account": {
      "id": 1,
      "balance": 10000.00,
      "currency": "USD"
    }
  }
]
```

#### POST /admin/fix-admin-role
**Description**: Fix admin user role if incorrect

**Response:**
```json
{
  "message": "Admin role fixed successfully"
}
```

---

### Student Endpoints

**Base Path**: `/` (root)  
**Required**: Student role + JWT token

#### GET /me/account
**Description**: Get current student's account balance

**Response:**
```json
{
  "id": 1,
  "balance": 10000.00,
  "currency": "USD"
}
```

#### POST /transactions/transfer
**Description**: Transfer money to another student

**Request:**
```json
{
  "toUserId": 3,
  "amount": 100.00,
  "description": "Lunch money"
}
```

**Response:**
```json
{
  "message": "Transfer successful",
  "transaction": {
    "id": 1,
    "fromUserId": 2,
    "toUserId": 3,
    "amount": 100.00,
    "type": "transfer",
    "description": "Lunch money",
    "createdAt": "2025-01-01T00:00:00.000Z"
  },
  "newBalance": 9900.00
}
```

#### POST /courses/:id/buy
**Description**: Purchase a course

**Path Parameters**: `id` (Course ID)

**Response:**
```json
{
  "message": "Course purchased successfully",
  "enrollment": {
    "id": 1,
    "userId": 2,
    "courseId": 1,
    "paymentStatus": "paid",
    "enrolledAt": "2025-01-01T00:00:00.000Z"
  },
  "remainingBalance": 9500.00
}
```

#### GET /transactions/history
**Description**: Get personal transaction history

**Response:**
```json
[
  {
    "id": 1,
    "fromUserId": null,
    "toUserId": 2,
    "amount": 10000.00,
    "type": "adjustment",
    "description": "Initial account balance",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /me/enrollments
**Description**: Get enrolled courses

**Response:**
```json
[
  {
    "id": 1,
    "course": {
      "id": 1,
      "name": "Introduction to Programming",
      "price": 500.00,
      "description": "Learn the fundamentals...",
      "instructor": "Dr. John Smith",
      "duration": "12 weeks"
    },
    "paymentStatus": "paid",
    "enrolledAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /students/list
**Description**: Get list of all students (excluding self) for transfer

**Response:**
```json
[
  {
    "id": 3,
    "username": "student002",
    "email": "student002@school.edu",
    "fullName": "Jane Doe",
    "studentId": "SV002",
    "displayName": "Jane Doe (SV002)"
  }
]
```

---

### Course Endpoints

**Base Path**: `/courses`  
**Required**: JWT token (all endpoints), Admin role (for create/update/delete)

#### GET /courses
**Description**: Get all available courses

**Response:**
```json
[
  {
    "id": 1,
    "name": "Introduction to Programming",
    "price": 500.00,
    "description": "Learn the fundamentals...",
    "instructor": "Dr. John Smith",
    "duration": "12 weeks",
    "createdAt": "2025-01-01T00:00:00.000Z"
  }
]
```

#### GET /courses/:id
**Description**: Get course by ID

**Path Parameters**: `id` (Course ID)

#### POST /courses
**Description**: Create new course (Admin only)

**Request:**
```json
{
  "name": "Advanced React",
  "price": 600.00,
  "description": "Learn advanced React patterns",
  "instructor": "Prof. Smith",
  "duration": "10 weeks"
}
```

#### PATCH /courses/:id
**Description**: Update course (Admin only)

**Request:**
```json
{
  "name": "Updated Course Name",
  "price": 700.00
}
```

#### DELETE /courses/:id
**Description**: Delete course (Admin only)

---

## 🌱 Database Seeding

The system automatically seeds initial data on startup:

### Seeded Data

1. **Admin Account**
   - Username: `admin`
   - Password: `admin123`
   - Role: `admin`
   - Account balance: $0.00

2. **10 Student Accounts**
   - Usernames: `student001` to `student010`
   - Passwords: `student1123` to `student10123`
   - Student IDs: `SV001` to `SV010`
   - Initial balance: $10,000.00 each
   - Names: Vietnamese names (Nguyen Van A, Tran Thi B, etc.)

3. **20 Courses**
   - Various programming and technology courses
   - Prices range from $500 to $900
   - Includes: Programming, Web Development, Database, ML, Cybersecurity, etc.

### Manual Seeding

If you need to re-seed the database:

```bash
# The seed service runs automatically on backend startup
# To force re-seed, restart the backend:
docker-compose restart backend
```

## 🚀 Deployment

### Production Build

1. **Build Docker images:**
   ```bash
   docker-compose build
   ```

2. **Start services:**
   ```bash
   docker-compose up -d
   ```

3. **Check status:**
   ```bash
   docker-compose ps
   ```

### Environment Variables

**Backend** (`docker-compose.yml`):
```yaml
environment:
  PORT: 3001
  DB_HOST: postgres
  DB_PORT: 5432
  DB_USERNAME: postgres
  DB_PASSWORD: postgres
  DB_NAME: tester_db
  JWT_SECRET: your-secret-key-change-in-production
```

**Frontend** (`docker-compose.yml`):
```yaml
environment:
  NEXT_PUBLIC_API_URL: http://localhost:3001
```

### Health Checks

- **Backend**: http://localhost:3001/api (Swagger UI)
- **Frontend**: http://localhost:3000
- **Database**: `docker-compose exec postgres psql -U postgres -d tester_db -c "SELECT 1;"`

## 📝 Notes

- **Student ID Format**: Auto-generated as `SV` + 4 random digits (e.g., `SV1234`)
- **Initial Balance**: New students receive $10,000.00 automatically
- **Password Generation**: 12-character random password if not provided
- **Token Expiration**: JWT tokens expire after 24 hours
- **Currency**: All amounts are in USD
- **Transaction Types**: `transfer`, `payment`, `adjustment`

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.
