# 📋 Requirements Document - School Banking System

## 1. Project Overview

### 1.1 Purpose
The School Banking System is a comprehensive student management platform that combines banking features with course enrollment and payment processing. It enables administrators to manage student accounts and courses, while allowing students to manage their finances, transfer money, and purchase courses.

### 1.2 Scope
- Student account management with balance tracking
- Money transfer between students
- Course catalog and enrollment system
- Payment processing for course purchases
- Transaction history and reporting
- Role-based access control (Admin/Student)

### 1.3 Target Users
- **Administrators**: School staff managing student accounts and courses
- **Students**: Students managing their finances and enrolling in courses

---

## 2. Functional Requirements

### 2.1 Authentication & Authorization

#### FR-001: User Authentication
- **Description**: System must authenticate users via username and password
- **Priority**: High
- **Acceptance Criteria**:
  - Users can login with username and password
  - System validates credentials against database
  - JWT token issued upon successful authentication
  - Token expires after 24 hours
  - Invalid credentials return 401 error

#### FR-002: Role-Based Access Control
- **Description**: System must enforce role-based permissions
- **Priority**: High
- **Roles**:
  - **Admin**: Full system access
  - **Student**: Limited to personal account and features
- **Acceptance Criteria**:
  - Admin can access all admin endpoints
  - Students can only access student endpoints
  - Unauthorized access returns 403 error
  - Role stored in JWT token payload

#### FR-003: Session Management
- **Description**: System must manage user sessions
- **Priority**: Medium
- **Acceptance Criteria**:
  - JWT token stored in localStorage (frontend)
  - Token included in Authorization header for protected requests
  - User data refreshed on page load via `/auth/me` endpoint
  - Logout clears token from localStorage

---

### 2.2 Admin Features

#### FR-004: Create Student Account
- **Description**: Admin can create new student user accounts
- **Priority**: High
- **Input Fields**:
  - Username* (required, unique)
  - Email* (required, unique)
  - Full Name* (required)
  - Password (optional, auto-generated if empty)
  - Age (optional)
  - Address (optional)
- **Business Rules**:
  - Student ID auto-generated (format: SVXXXX)
  - Account created with initial balance of $10,000.00
  - Initial balance transaction logged
  - Password auto-generated if not provided (12 characters)
  - Temporary password displayed in notification
- **Acceptance Criteria**:
  - Student account created successfully
  - User, Student, and Account entities created
  - Initial balance transaction recorded
  - Temporary password returned if auto-generated
  - Duplicate username/email returns 409 error

#### FR-005: Set Student Balance
- **Description**: Admin can set or adjust student account balance
- **Priority**: High
- **Input Fields**:
  - Balance* (required, decimal)
  - Description (optional)
- **Business Rules**:
  - Sets absolute balance amount (not relative)
  - Adjustment transaction logged
  - Returns old balance, new balance, and difference
- **Acceptance Criteria**:
  - Balance updated successfully
  - Transaction logged with type "adjustment"
  - Response includes old and new balance
  - Invalid student ID returns 404 error

#### FR-006: View All Transactions
- **Description**: Admin can view all system transactions
- **Priority**: Medium
- **Acceptance Criteria**:
  - Returns all transactions (transfers, payments, adjustments)
  - Sorted by creation date (newest first)
  - Includes transaction details (type, amount, users, description, date)

#### FR-007: View Students with Balances
- **Description**: Admin can view all students with their account balances
- **Priority**: Medium
- **Acceptance Criteria**:
  - Returns list of all students
  - Includes user info, student info, and account balance
  - Formatted for easy display in table

#### FR-008: Course Management
- **Description**: Admin can create, read, update, and delete courses
- **Priority**: High
- **Operations**:
  - **Create**: Add new course with name, price, description, instructor, duration
  - **Read**: View all courses or single course by ID
  - **Update**: Modify course information
  - **Delete**: Remove course from system
- **Acceptance Criteria**:
  - All CRUD operations work correctly
  - Only admin can create/update/delete
  - All authenticated users can view courses

---

### 2.3 Student Features

#### FR-009: View Account Balance
- **Description**: Student can view their current account balance
- **Priority**: High
- **Acceptance Criteria**:
  - Displays current balance prominently
  - Shows currency (USD)
  - Updates in real-time after transactions

#### FR-010: Transfer Money
- **Description**: Student can transfer money to other students
- **Priority**: High
- **Input Fields**:
  - Recipient* (selected from dropdown with search)
  - Amount* (required, decimal, > 0)
  - Description (optional)
- **Business Rules**:
  - Sender must have sufficient balance
  - Recipient must exist and be a student
  - Cannot transfer to self
  - Transfer transaction logged for both parties
- **Acceptance Criteria**:
  - Transfer successful if balance sufficient
  - Both accounts updated correctly
  - Transaction logged with type "transfer"
  - Insufficient balance returns 400 error
  - Invalid recipient returns 404 error

#### FR-011: Purchase Course
- **Description**: Student can purchase courses using account balance
- **Priority**: High
- **Business Rules**:
  - Student must have sufficient balance
  - Cannot purchase same course twice
  - Payment transaction logged
  - Enrollment created with "paid" status
- **Acceptance Criteria**:
  - Course purchased if balance sufficient
  - Balance deducted correctly
  - Enrollment created
  - Payment transaction logged
  - Insufficient balance returns 400 error
  - Already enrolled returns 400 error

#### FR-012: View Transaction History
- **Description**: Student can view their personal transaction history
- **Priority**: Medium
- **Acceptance Criteria**:
  - Returns all transactions for current user
  - Includes transfers (sent/received), payments, adjustments
  - Sorted by date (newest first)
  - Shows transaction details (type, amount, description, date)

#### FR-013: View Enrolled Courses
- **Description**: Student can view courses they have purchased
- **Priority**: Medium
- **Acceptance Criteria**:
  - Returns list of enrolled courses
  - Includes course details and enrollment date
  - Shows payment status

#### FR-014: Students List for Transfer
- **Description**: Student can view list of all students for transfer selection
- **Priority**: Medium
- **Acceptance Criteria**:
  - Returns all students except current user
  - Includes display name (Full Name + Student ID)
  - Searchable by name, email, or student ID

---

### 2.4 Course Features

#### FR-015: Course Catalog
- **Description**: All authenticated users can view available courses
- **Priority**: High
- **Acceptance Criteria**:
  - Displays all courses with details
  - Shows price, description, instructor, duration
  - Students can see if already enrolled

---

## 3. Non-Functional Requirements

### 3.1 Performance
- **NFR-001**: API response time < 500ms for 95% of requests
- **NFR-002**: Frontend page load time < 2 seconds
- **NFR-003**: Support at least 100 concurrent users

### 3.2 Security
- **NFR-004**: Passwords hashed with bcrypt (10 rounds)
- **NFR-005**: JWT tokens signed with secret key
- **NFR-006**: SQL injection prevention via TypeORM parameterized queries
- **NFR-007**: XSS protection via input validation
- **NFR-008**: CORS configured for allowed origins

### 3.3 Usability
- **NFR-009**: Responsive design for desktop and mobile
- **NFR-010**: Intuitive UI with clear navigation
- **NFR-011**: Error messages displayed clearly
- **NFR-012**: Success notifications for user actions

### 3.4 Reliability
- **NFR-013**: Database transactions for financial operations
- **NFR-014**: Error handling for all API endpoints
- **NFR-015**: Logging for errors and important events

### 3.5 Maintainability
- **NFR-016**: Code follows TypeScript best practices
- **NFR-017**: API documented with Swagger/OpenAPI
- **NFR-018**: Modular architecture (NestJS modules)

---

## 4. System Requirements

### 4.1 Backend Requirements
- **Framework**: NestJS 10.x
- **Language**: TypeScript 5.x
- **Database**: PostgreSQL 15+
- **ORM**: TypeORM 0.3.x
- **Authentication**: Passport.js + JWT
- **Validation**: Class-validator
- **Documentation**: Swagger/OpenAPI

### 4.2 Frontend Requirements
- **Framework**: Next.js 14+
- **Language**: TypeScript
- **HTTP Client**: Axios
- **State Management**: React Hooks
- **Styling**: CSS Modules

### 4.3 Infrastructure Requirements
- **Containerization**: Docker & Docker Compose
- **Database**: PostgreSQL 15 Alpine
- **Node.js**: 16+ (for local development)

---

## 5. Database Requirements

### 5.1 Entities
- **User**: Authentication and user information
- **Account**: User account balances
- **Student**: Student-specific information
- **Transaction**: All financial transactions
- **Course**: Course catalog
- **Enrollment**: Student course enrollments

### 5.2 Constraints
- Username must be unique
- Email must be unique (if provided)
- Student ID must be unique (if provided)
- Account balance cannot be negative (enforced in application logic)
- Transaction amounts must be positive

### 5.3 Initial Data
- Admin account (username: admin, password: admin123)
- 10 student accounts (student001-student010)
- 20 courses (various programming and technology courses)

---

## 6. API Requirements

### 6.1 Authentication
- **POST /auth/login**: User login
- **POST /auth/logout**: User logout
- **GET /auth/me**: Get current user info

### 6.2 Admin APIs
- **POST /admin/students**: Create student
- **PUT /admin/students/:id/balance**: Set student balance
- **GET /admin/transactions**: Get all transactions
- **GET /admin/students/with-balances**: Get students with balances
- **POST /admin/fix-admin-role**: Fix admin role

### 6.3 Student APIs
- **GET /me/account**: Get account balance
- **POST /transactions/transfer**: Transfer money
- **POST /courses/:id/buy**: Purchase course
- **GET /transactions/history**: Get transaction history
- **GET /me/enrollments**: Get enrolled courses
- **GET /students/list**: Get students list for transfer

### 6.4 Course APIs
- **GET /courses**: Get all courses
- **GET /courses/:id**: Get course by ID
- **POST /courses**: Create course (Admin)
- **PATCH /courses/:id**: Update course (Admin)
- **DELETE /courses/:id**: Delete course (Admin)

---

## 7. User Stories

### 7.1 Admin Stories

**US-001**: As an admin, I want to create student accounts so that students can access the system.
- **Acceptance**: Admin can create student with auto-generated ID and password

**US-002**: As an admin, I want to set student balances so that I can manage their accounts.
- **Acceptance**: Admin can set any student's balance with description

**US-003**: As an admin, I want to view all transactions so that I can monitor system activity.
- **Acceptance**: Admin sees all transactions in chronological order

**US-004**: As an admin, I want to manage courses so that students can enroll.
- **Acceptance**: Admin can create, update, and delete courses

### 7.2 Student Stories

**US-005**: As a student, I want to view my balance so that I know how much money I have.
- **Acceptance**: Student sees current balance prominently displayed

**US-006**: As a student, I want to transfer money to other students so that I can pay them.
- **Acceptance**: Student can select recipient and transfer money

**US-007**: As a student, I want to purchase courses so that I can enroll in classes.
- **Acceptance**: Student can buy courses if balance is sufficient

**US-008**: As a student, I want to view my transaction history so that I can track my spending.
- **Acceptance**: Student sees all personal transactions

---

## 8. Business Rules

### 8.1 Account Rules
- New students receive $10,000.00 initial balance
- Admin account starts with $0.00
- Balance cannot go negative (enforced in application)
- All amounts in USD

### 8.2 Transaction Rules
- Transfer: Between two students, both accounts updated
- Payment: Student to system (course purchase)
- Adjustment: Admin sets balance (from/to system)

### 8.3 Course Rules
- Students can only purchase each course once
- Payment deducted immediately upon purchase
- Enrollment status: "paid" after successful purchase

### 8.4 Student ID Rules
- Auto-generated format: SV + 4 random digits
- Must be unique
- Generated if not provided by admin

---

## 9. Error Handling

### 9.1 HTTP Status Codes
- **200**: Success
- **201**: Created
- **400**: Bad Request (validation errors, insufficient balance)
- **401**: Unauthorized (invalid/missing token)
- **403**: Forbidden (insufficient permissions)
- **404**: Not Found (resource doesn't exist)
- **409**: Conflict (duplicate username/email)
- **500**: Internal Server Error

### 9.2 Error Messages
- Clear, user-friendly error messages
- Validation errors show specific field issues
- Security errors don't reveal sensitive information

---

## 10. Testing Requirements

### 10.1 Unit Tests
- Service layer logic
- Utility functions
- Validation rules

### 10.2 Integration Tests
- API endpoints
- Database operations
- Authentication flow

### 10.3 E2E Tests
- Complete user workflows
- Admin operations
- Student operations

---

## 11. Deployment Requirements

### 11.1 Environment
- Docker containers for all services
- Environment variables for configuration
- Database persistence via volumes

### 11.2 Monitoring
- Application logs
- Error tracking
- Performance metrics

---

## 12. Future Enhancements

### 12.1 Planned Features
- Email notifications for transactions
- Password reset functionality
- Course reviews and ratings
- Payment refunds
- Multi-currency support
- Reporting and analytics dashboard
- Mobile app (React Native)

### 12.2 Technical Improvements
- Redis caching
- WebSocket for real-time updates
- File upload for course materials
- Payment gateway integration
- Advanced search and filtering

---

## 13. Glossary

- **Account**: User's financial account with balance
- **Adjustment**: Admin-initiated balance change
- **Enrollment**: Student's course registration
- **JWT**: JSON Web Token for authentication
- **Student ID**: Unique identifier for students (format: SVXXXX)
- **Transaction**: Financial operation (transfer, payment, adjustment)

---

## 14. Revision History

| Version | Date | Author | Changes |
|---------|------|--------|---------|
| 1.0 | 2025-01-01 | Development Team | Initial requirements document |

