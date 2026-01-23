# Cargo1212 Backend - Technical Documentation

## Overview

Cargo1212 is a comprehensive cargo bidding system built with Django REST Framework. It facilitates connections between shippers (those who need to transport cargo) and carriers (transportation service providers) through a competitive bidding marketplace.

## Architecture

### Django Framework

**Django** is a high-level Python web framework that encourages rapid development and clean, pragmatic design. In this project, Django serves as the backend API server providing:

- **RESTful API**: Built using Django REST Framework (DRF)
- **Authentication**: JWT-based authentication with django-rest-framework-simplejwt
- **Database**: PostgreSQL with fallback to SQLite for development
- **File Management**: Django's built-in file handling for uploads
- **Admin Interface**: Django's automatic admin panel for content management

### Key Django Components

1. **Models**: Define data structures and relationships
2. **Views**: Handle HTTP requests and responses
3. **Serializers**: Convert model instances to/from JSON
4. **URLs**: Route URL patterns to views
5. **Middleware**: Process requests/responses globally
6. **Migrations**: Database schema version control

## Project Structure

### Apps Folder Structure

The backend is organized into Django apps, each handling specific business domains:

#### `apps/users/`
**Purpose**: User management and authentication
- **models.py**: Custom User model extending AbstractUser with roles (shipper, carrier, admin)
- **views.py**: Registration, login, profile management endpoints
- **serializers.py**: User data serialization
- **urls.py**: User-related API routes

**Key Features**:
- Email-based authentication (username optional)
- Role-based permissions (shipper, carrier, admin)
- User verification and payment confirmation
- Rating system integration

#### `apps/bids/`
**Purpose**: Cargo transport bid management
- **models.py**: Bid model with status workflow (pending → active → awarded → completed)
- **views.py**: CRUD operations for bids, bid approval workflow
- **serializers.py**: Bid data serialization with file upload support
- **urls.py**: Bid management routes
- **management/commands/auto_select_offers.py**: Background job for automatic offer selection

**Key Features**:
- Bid lifecycle management
- File attachment support
- Automatic deadline handling
- Admin approval workflow
- Bid deletion requests system

#### `apps/offers/`
**Purpose**: Carrier offers on bids
- **models.py**: Offer model linking carriers to bids with pricing
- **views.py**: Offer submission, management, and selection
- **serializers.py**: Offer data handling
- **urls.py**: Offer-related endpoints

**Key Features**:
- Competitive pricing system
- Offer status tracking
- Automatic selection on deadline expiry

#### `apps/payments/`
**Purpose**: Payment verification and proof management
- **models.py**: Payment records with proof uploads
- **views.py**: Payment submission and approval
- **serializers.py**: Payment data handling
- **urls.py**: Payment endpoints

**Key Features**:
- Payment proof upload system
- Admin verification workflow
- Integration with user verification status

#### `apps/verification/`
**Purpose**: User document verification system
- **models.py**: Document storage and verification status
- **views.py**: Document upload and verification management
- **serializers.py**: Document data handling
- **urls.py**: Verification endpoints

**Key Features**:
- Document upload for carriers
- Admin review process
- Verification status tracking

#### `apps/ratings/`
**Purpose**: User rating and review system
- **models.py**: Rating model between users
- **views.py**: Rating submission and retrieval
- **serializers.py**: Rating data handling
- **urls.py**: Rating endpoints
- **management/commands/update_ratings.py**: Rating aggregation command

**Key Features**:
- Bidirectional rating system
- Average rating calculation
- Rating history tracking

#### `apps/notifications/`
**Purpose**: In-app notification system
- **models.py**: Notification model with types
- **views.py**: Notification management
- **serializers.py**: Notification data handling
- **urls.py**: Notification endpoints
- **signals.py**: Automatic notification creation

**Key Features**:
- Real-time notification system
- Multiple notification types
- Unread status tracking
- Related object linking

#### `apps/admin_panel/`
**Purpose**: Administrative functions and analytics
- **views.py**: Admin-specific endpoints
- **serializers.py**: Admin data handling
- **urls.py**: Admin routes

**Key Features**:
- Bid approval/rejection
- User management
- System statistics
- Content moderation

### Config Folder

#### `config/settings.py`
**Core Configuration**:
- Django settings for database, authentication, CORS, file uploads
- Environment variable configuration
- Third-party app integration (DRF, JWT, CORS)
- Logging configuration

**Key Settings**:
```python
# Database (PostgreSQL primary, SQLite fallback)
DATABASES = {
    "default": {
        "ENGINE": "django.db.backends.postgresql",
        "NAME": os.environ.get("DB_NAME", "cargo1212"),
        # ... other settings
    }
}

# JWT Authentication
SIMPLE_JWT = {
    "ACCESS_TOKEN_LIFETIME": timedelta(hours=1),
    "REFRESH_TOKEN_LIFETIME": timedelta(days=7),
    # ... other JWT settings
}

# CORS for frontend integration
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:5173"]
```

#### `config/urls.py`
Main URL configuration routing to different apps

#### `config/asgi.py` & `config/wsgi.py`
ASGI and WSGI application configurations for deployment

### Middleware Folder

#### `middleware/auth_middleware.py`
Custom authentication middleware for JWT token handling

#### `middleware/role_permission_middleware.py`
Role-based access control middleware

#### `middleware/request_logging_middleware.py`
Request/response logging for debugging and monitoring

### Utils Folder

#### `utils/jwt_handler.py`
JWT token creation and validation utilities

#### `utils/response.py`
Standardized API response formatting

#### `utils/file_uploader.py`
File upload handling and validation

#### `utils/helpers.py`
General utility functions

## Scripts and Automation

### `setup.bat`
**Windows setup script** that:
1. Sets up PostgreSQL database
2. Creates Python virtual environment
3. Installs dependencies
4. Runs migrations
5. Creates admin user
6. Starts development server

### `setup_postgres.bat`
**PostgreSQL-specific setup**:
- Checks PostgreSQL installation
- Creates database and user
- Generates `.env` file with default settings

### `auto_select_monitor.bat`
**Background monitoring script**:
- Runs continuously checking for expired bid deadlines
- Automatically selects winning offers when deadlines pass
- Runs every 2 seconds in production-like monitoring

### `create_admin.py`
**Admin user creation script**:
- Creates initial admin user for system access
- Used during initial setup

## Database Design

### Core Entities

1. **User**: Custom user model with roles and verification
2. **Bid**: Transport requests from shippers
3. **Offer**: Carrier proposals on bids
4. **Payment**: Payment verification records
5. **Verification**: Document verification system
6. **Rating**: User rating system
7. **Notification**: In-app messaging system

### Key Relationships

- User has many Bids (if shipper) or Offers (if carrier)
- Bid has many Offers
- Bid belongs to one User (shipper)
- Offer belongs to one User (carrier) and one Bid
- Rating connects rater to ratee
- Notification links to users and related objects

## API Architecture

### Authentication Flow
1. User registration/login
2. JWT token generation
3. Token-based API access
4. Role-based permissions

### REST API Endpoints
- `/api/users/`: User management
- `/api/bids/`: Bid operations
- `/api/offers/`: Offer management
- `/api/payments/`: Payment handling
- `/api/verification/`: Document verification
- `/api/ratings/`: Rating system
- `/api/notifications/`: Notification management

### File Upload System
- Bid attachments
- Payment proofs
- Verification documents
- Stored in `media/` directory

## Testing

### Test Folder Structure

#### `test/`
**Purpose**: Unit and integration tests for the Django backend
- **test_example.py**: Basic test examples demonstrating Django testing patterns

**Test Coverage**:
- User model creation and properties
- String representation methods
- Role-based functionality
- Basic CRUD operations

**Running Tests**:
```bash
# Run all tests
python manage.py test

# Run specific test file
python manage.py test test.test_example

# Run with coverage
coverage run manage.py test
coverage report
```

**Test Structure**:
- Uses Django's built-in TestCase class
- setUp() method for test data initialization
- Individual test methods for specific functionality
- Assertions for expected behavior validation

## Deployment Considerations

### Environment Variables
- Database configuration
- JWT secrets
- CORS settings
- File upload limits
- Debug mode

### Production Setup
- PostgreSQL database
- Static file serving
- HTTPS configuration
- Background job scheduling
- Monitoring and logging

## Development Workflow

1. Run `setup.bat` for initial setup
2. Activate virtual environment: `venv\Scripts\activate`
3. Run migrations: `python manage.py migrate`
4. Start server: `python manage.py runserver`
5. Auto-selection monitor runs in background

This Django backend provides a robust, scalable foundation for the cargo bidding platform with comprehensive API endpoints, automated workflows, and proper separation of concerns across multiple Django apps.