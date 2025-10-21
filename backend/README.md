# Customs Clearance Automation System - Backend API

FastAPI-based backend service for the Customs Clearance Automation System. This system digitizes the manual Excel-based customs clearance workflow to eliminate demurrage costs by ensuring vehicles are cleared within 7 days of port arrival.

## Features

- **Shipment Management**: Track shipments with automated financial calculations
- **Workflow Automation**: 34-step clearance process with automated target date calculations
- **Role-Based Access Control**: Department-specific access via Auth0 integration
- **Real-Time Alerts**: Automated alerts for at-risk shipments
- **Background Task Processing**: Celery-based async tasks for alert evaluation and email notifications
- **Audit Logging**: Complete change history for compliance
- **Performance Metrics**: Dashboard metrics for clearance cycle time and on-time rates

## Technology Stack

- **Framework**: FastAPI 0.104+
- **Database**: PostgreSQL 15+
- **ORM**: SQLAlchemy 2.0+
- **Cache/Queue**: Redis 7+
- **Task Queue**: Celery 5+
- **Authentication**: Auth0
- **Migrations**: Alembic

## Project Structure

```
backend/
├── app/
│   ├── api/              # API endpoints
│   ├── auth/             # Authentication & authorization
│   ├── models/           # SQLAlchemy models
│   ├── schemas/          # Pydantic schemas
│   ├── services/         # Business logic
│   ├── repositories/     # Data access layer
│   ├── tasks/            # Celery background tasks
│   ├── utils/            # Utility functions
│   ├── config.py         # Configuration management
│   ├── database.py       # Database setup
│   └── main.py           # FastAPI application
├── alembic/              # Database migrations
├── tests/                # Test suite
├── Dockerfile            # Container definition
├── docker-compose.yml    # Local development setup
└── requirements.txt      # Python dependencies
```

## Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional, for containerized setup)

For detailed setup instructions, see [DEVELOPMENT.md](DEVELOPMENT.md)

## Setup Instructions

### 1. Clone and Navigate

```bash
cd backend
```

### 2. Create Virtual Environment

```bash
python -m venv venv

# Windows
venv\Scripts\activate

# Linux/Mac
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

Copy the example environment file and update with your settings:

```bash
copy .env.example .env  # Windows
cp .env.example .env    # Linux/Mac
```

Edit `.env` and configure:
- Database connection string
- Redis URL
- Auth0 credentials
- SMTP settings

### 5. Run Database Migrations

```bash
alembic upgrade head
```

### 6. Seed Initial Data

Populate the database with initial users and workflow step templates:

```bash
python seed_database.py
```

This will create:
- 10 default users (PPR/APR for each department)
- 34 workflow step templates in the database

For more details, see [app/utils/README_SEED_DATA.md](app/utils/README_SEED_DATA.md)

### 7. Start Development Server

```bash
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at `http://localhost:8000`

## Docker Setup (Recommended)

### 1. Start All Services

```bash
docker-compose up -d
```

This starts:
- PostgreSQL database (port 5432)
- Redis (port 6379)
- FastAPI API (port 8000)
- Celery worker
- Celery beat scheduler

### 2. Run Migrations

```bash
docker-compose exec api alembic upgrade head
```

### 3. Seed Initial Data

```bash
docker-compose exec api python seed_database.py
```

### 4. View Logs

```bash
# View all service logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f api
docker-compose logs -f worker
docker-compose logs -f beat
docker-compose logs -f db
docker-compose logs -f redis
```

### 5. Stop Services

```bash
# Stop services but keep data
docker-compose stop

# Stop and remove containers (keeps volumes)
docker-compose down

# Stop and remove everything including volumes
docker-compose down -v
```

### Additional Docker Commands

```bash
# Rebuild containers after code changes
docker-compose up -d --build

# Restart a specific service
docker-compose restart api

# Execute commands in running container
docker-compose exec api bash

# View running containers
docker-compose ps

# Check service health
docker-compose exec api curl http://localhost:8000/api/v1/health

# Access database
docker-compose exec db psql -U user -d customs_clearance

# Access Redis CLI
docker-compose exec redis redis-cli
```

## API Documentation

Once the server is running, access:

- **Swagger UI**: http://localhost:8000/api/v1/docs
- **ReDoc**: http://localhost:8000/api/v1/redoc
- **OpenAPI JSON**: http://localhost:8000/api/v1/openapi.json

For detailed API documentation, see [API_DOCUMENTATION.md](API_DOCUMENTATION.md)

### API Endpoints Overview

#### Shipment Management
- `POST /api/v1/shipments` - Create new shipment
- `GET /api/v1/shipments` - List shipments (paginated, filtered)
- `GET /api/v1/shipments/{id}` - Get shipment details
- `PUT /api/v1/shipments/{id}` - Update shipment
- `PATCH /api/v1/shipments/{id}/eta` - Update ETA (Business Unit only)
- `DELETE /api/v1/shipments/{id}` - Soft delete shipment
- `POST /api/v1/shipments/import` - Bulk import shipments

#### Workflow Steps
- `GET /api/v1/shipments/{id}/workflow` - Get all steps for shipment
- `GET /api/v1/workflow-steps/{id}` - Get step details
- `PATCH /api/v1/workflow-steps/{id}/complete` - Mark step complete
- `GET /api/v1/workflow-steps/my-tasks` - Get current user's assigned steps

#### Alerts
- `GET /api/v1/alerts` - List alerts (filtered by user/shipment)
- `GET /api/v1/alerts/{id}` - Get alert details
- `PATCH /api/v1/alerts/{id}/acknowledge` - Acknowledge alert

#### Audit Logs
- `GET /api/v1/audit-logs` - Query audit logs (filtered)
- `GET /api/v1/audit-logs/shipment/{id}` - Get logs for specific shipment

#### Metrics
- `GET /api/v1/metrics/clearance-time` - Average clearance time by department
- `GET /api/v1/metrics/on-time-rate` - Percentage cleared within 7 days
- `GET /api/v1/metrics/demurrage-savings` - Calculated cost avoidance
- `GET /api/v1/metrics/delayed-steps` - Steps delayed by department

#### Health Checks
- `GET /api/v1/health` - Overall health status
- `GET /api/v1/health/db` - Database connectivity
- `GET /api/v1/health/redis` - Redis connectivity

### Authentication

All API endpoints (except health checks) require authentication via Auth0 JWT tokens.

#### Getting a Token

1. **Configure Auth0**:
   - Create an Auth0 account and application
   - Configure API with identifier matching `AUTH0_AUDIENCE`
   - Add custom claims for department and role

2. **Obtain Token**:
   ```bash
   curl --request POST \
     --url https://YOUR_DOMAIN.auth0.com/oauth/token \
     --header 'content-type: application/json' \
     --data '{
       "client_id":"YOUR_CLIENT_ID",
       "client_secret":"YOUR_CLIENT_SECRET",
       "audience":"YOUR_API_IDENTIFIER",
       "grant_type":"client_credentials"
     }'
   ```

3. **Use Token in Requests**:
   ```bash
   curl -X GET "http://localhost:8000/api/v1/shipments" \
     -H "Authorization: Bearer YOUR_JWT_TOKEN"
   ```

#### Role-Based Access Control

The system implements department-based access control:

- **Business Unit**: Can create shipments and update ETA (max 3 times)
- **Finance**: Can complete Finance department workflow steps
- **C&C (Customs & Clearance)**: Can complete C&C department workflow steps
- **Stores**: Can complete Stores department workflow steps
- **IA (Internal Audit)**: Read-only access to all data
- **Admin**: Full access to all operations

Users are automatically assigned to departments based on their email domain or Auth0 custom claims.

## Background Tasks

The system uses Celery for asynchronous background processing:

### Scheduled Tasks

1. **Alert Evaluation** (Daily at 08:00 UTC)
   - Evaluates all active shipments for alert conditions
   - Processes shipments in batches of 100
   - Creates alerts based on days post-ETA thresholds (Day 4-7)

2. **Email Notification Processing** (Every 5 minutes)
   - Processes pending email notifications
   - Sends alert emails to assigned users
   - Retries failed sends up to 3 times

### Task Queues

- `alerts`: High priority queue for alert evaluation
- `emails`: Medium priority queue for email sending
- `default`: Normal priority queue for other tasks

For more details, see [app/tasks/README.md](app/tasks/README.md)

## Running Tests

```bash
# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test file
pytest tests/unit/test_auth.py

# Run integration tests only
pytest tests/integration/

# Run unit tests only
pytest tests/unit/
```

For detailed test results and coverage analysis, see [TEST_REPORT.md](TEST_REPORT.md)

## Database Migrations

### Create a New Migration

```bash
alembic revision --autogenerate -m "Description of changes"
```

### Apply Migrations

```bash
alembic upgrade head
```

### Rollback Migration

```bash
alembic downgrade -1
```

## Development Commands

### Format Code

```bash
black app/ tests/
```

### Lint Code

```bash
ruff check app/ tests/
```

### Run Celery Worker (Local)

```bash
# Run worker only
celery -A app.tasks worker --loglevel=info -Q alerts,emails,default

# Or use the helper script
python run_celery.py worker
```

### Run Celery Beat (Local)

```bash
# Run beat scheduler only
celery -A app.tasks beat --loglevel=info

# Or use the helper script
python run_celery.py beat
```

### Run Both Worker and Beat (Development)

```bash
# Run both in single process (development only)
celery -A app.tasks worker --beat --loglevel=info

# Or use the helper script
python run_celery.py worker-beat
```

**Note:** In production, always run worker and beat as separate processes.

### Monitor Celery Tasks

```bash
# Install Flower (web-based monitoring)
pip install flower

# Run Flower
celery -A app.tasks flower

# Access at http://localhost:5555
```

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Required |
| `REDIS_URL` | Redis connection string | Required |
| `AUTH0_DOMAIN` | Auth0 tenant domain | Required |
| `AUTH0_AUDIENCE` | Auth0 API identifier | Required |
| `SMTP_HOST` | SMTP server hostname | Required |
| `SMTP_PORT` | SMTP server port | 587 |
| `SMTP_USER` | SMTP username | Required |
| `SMTP_PASSWORD` | SMTP password | Required |
| `SMTP_FROM` | From email address | Required |
| `SMTP_TLS` | Enable TLS for SMTP | True |
| `CELERY_BROKER_URL` | Celery broker URL | Uses REDIS_URL |
| `CELERY_RESULT_BACKEND` | Celery result backend URL | Uses REDIS_URL |
| `LOG_LEVEL` | Logging level | INFO |
| `LOG_FORMAT` | Log format (json/text) | json |
| `DEBUG` | Enable debug mode | False |

## Health Checks

- **Overall Health**: `GET /api/v1/health`
- **Database Health**: `GET /api/v1/health/db`
- **Redis Health**: `GET /api/v1/health/redis`

## Documentation

This project includes comprehensive documentation:

- **[DEVELOPMENT.md](DEVELOPMENT.md)** - Detailed development setup guide
- **[TEST_REPORT.md](TEST_REPORT.md)** - Test results and coverage analysis (100% passing ✅)
- **[FIXES_APPLIED.md](FIXES_APPLIED.md)** - Recent bug fixes and improvements
- **[API_DOCUMENTATION.md](API_DOCUMENTATION.md)** - Complete API reference
- **[CELERY_IMPLEMENTATION.md](CELERY_IMPLEMENTATION.md)** - Background task processing
- **[MONITORING.md](MONITORING.md)** - Monitoring and observability setup
- **[CONCURRENCY_OPTIMIZATIONS.md](CONCURRENCY_OPTIMIZATIONS.md)** - Performance optimizations
- **[SEED_DATA_IMPLEMENTATION.md](SEED_DATA_IMPLEMENTATION.md)** - Database seeding details
- **[OPENAPI_IMPLEMENTATION.md](OPENAPI_IMPLEMENTATION.md)** - OpenAPI/Swagger configuration
- **[app/tasks/README.md](app/tasks/README.md)** - Celery tasks documentation
- **[app/auth/README.md](app/auth/README.md)** - Authentication and authorization
- **[app/utils/README_SEED_DATA.md](app/utils/README_SEED_DATA.md)** - Seed data utilities

## Contributing

1. Create a feature branch
2. Make your changes
3. Run tests and linting
4. Submit a pull request

## License

Proprietary - Al Hashar Group
