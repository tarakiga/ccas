# Development Setup Guide

This guide provides detailed instructions for setting up the Customs Clearance Automation System backend for local development.

## Prerequisites

### Required Software

- **Python 3.11+**: The application requires Python 3.11 or higher
- **PostgreSQL 15+**: Database server
- **Redis 7+**: Cache and message broker
- **Git**: Version control

### Optional Tools

- **Docker Desktop**: For containerized development
- **pgAdmin**: PostgreSQL GUI client
- **Redis Insight**: Redis GUI client
- **Postman**: API testing tool

## Python Version Requirement

This project requires **Python 3.11 or higher** due to:
- Modern type hints and syntax features
- Performance improvements in asyncio
- Enhanced error messages
- Better typing support in SQLAlchemy 2.0

### Check Python Version

```bash
python --version
# Should output: Python 3.11.x or higher
```

### Installing Python 3.11+

#### Windows
1. Download from [python.org](https://www.python.org/downloads/)
2. Run installer and check "Add Python to PATH"
3. Verify installation: `python --version`

#### macOS
```bash
# Using Homebrew
brew install python@3.11

# Verify
python3.11 --version
```

#### Linux (Ubuntu/Debian)
```bash
# Add deadsnakes PPA
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update

# Install Python 3.11
sudo apt install python3.11 python3.11-venv python3.11-dev

# Verify
python3.11 --version
```

## Step-by-Step Setup

### 1. Clone the Repository

```bash
git clone <repository-url>
cd customs-clearance-backend/backend
```

### 2. Create Virtual Environment

Using a virtual environment isolates project dependencies from system Python packages.

```bash
# Create virtual environment
python -m venv venv

# Activate virtual environment
# Windows (Command Prompt)
venv\Scripts\activate.bat

# Windows (PowerShell)
venv\Scripts\Activate.ps1

# Linux/macOS
source venv/bin/activate
```

You should see `(venv)` prefix in your terminal prompt.

### 3. Install Dependencies

```bash
# Upgrade pip
pip install --upgrade pip

# Install all dependencies
pip install -r requirements.txt

# Verify installation
pip list
```

#### Development Dependencies

For development, you may want additional tools:

```bash
# Install development tools
pip install black ruff pytest-watch ipython

# black: Code formatter
# ruff: Fast Python linter
# pytest-watch: Auto-run tests on file changes
# ipython: Enhanced Python shell
```

### 4. Install and Configure PostgreSQL

#### Option A: Local Installation

**Windows:**
1. Download PostgreSQL installer from [postgresql.org](https://www.postgresql.org/download/windows/)
2. Run installer and note the password you set
3. Add PostgreSQL bin directory to PATH

**macOS:**
```bash
brew install postgresql@15
brew services start postgresql@15
```

**Linux:**
```bash
sudo apt install postgresql-15 postgresql-contrib
sudo systemctl start postgresql
```

#### Create Database

```bash
# Connect to PostgreSQL
psql -U postgres

# Create database and user
CREATE DATABASE customs_clearance;
CREATE USER customs_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE customs_clearance TO customs_user;

# Exit psql
\q
```

#### Option B: Docker PostgreSQL

```bash
docker run -d \
  --name customs-postgres \
  -e POSTGRES_DB=customs_clearance \
  -e POSTGRES_USER=customs_user \
  -e POSTGRES_PASSWORD=your_password \
  -p 5432:5432 \
  postgres:15
```

### 5. Install and Configure Redis

#### Option A: Local Installation

**Windows:**
1. Download Redis from [redis.io](https://redis.io/download) or use WSL
2. Or use [Memurai](https://www.memurai.com/) (Redis-compatible for Windows)

**macOS:**
```bash
brew install redis
brew services start redis
```

**Linux:**
```bash
sudo apt install redis-server
sudo systemctl start redis-server
```

#### Option B: Docker Redis

```bash
docker run -d \
  --name customs-redis \
  -p 6379:6379 \
  redis:7
```

### 6. Configure Environment Variables

Copy the example environment file:

```bash
# Windows
copy .env.example .env

# Linux/macOS
cp .env.example .env
```

Edit `.env` file with your configuration:

```bash
# Database Configuration
DATABASE_URL=postgresql://customs_user:your_password@localhost:5432/customs_clearance

# Redis Configuration
REDIS_URL=redis://localhost:6379/0

# Auth0 Configuration (get from Auth0 dashboard)
AUTH0_DOMAIN=your-tenant.auth0.com
AUTH0_AUDIENCE=https://your-api-identifier

# Email Configuration (example with Gmail)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@alhashargroup.com
SMTP_TLS=True

# Development Settings
DEBUG=True
LOG_LEVEL=DEBUG
LOG_FORMAT=text
```

#### Auth0 Setup

1. Create Auth0 account at [auth0.com](https://auth0.com)
2. Create a new API in Auth0 dashboard
3. Note the Domain and API Identifier
4. Configure custom claims for department and role
5. Update `.env` with Auth0 credentials

#### Gmail SMTP Setup

1. Enable 2-factor authentication on your Google account
2. Generate an App Password: [myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
3. Use the app password in `SMTP_PASSWORD`

### 7. Run Database Migrations

Alembic manages database schema migrations.

```bash
# Check current migration status
alembic current

# Apply all pending migrations
alembic upgrade head

# Verify tables were created
alembic current
# Should show: (head) - latest migration
```

#### Common Migration Commands

```bash
# View migration history
alembic history

# Upgrade to specific revision
alembic upgrade <revision_id>

# Downgrade one revision
alembic downgrade -1

# Downgrade to specific revision
alembic downgrade <revision_id>

# Create new migration (after model changes)
alembic revision --autogenerate -m "Description of changes"
```

### 8. Seed Initial Data

Populate the database with initial users and workflow templates:

```bash
python seed_database.py
```

This creates:
- 10 default users (2 per department: PPR and APR)
- 34 workflow step templates
- Sample data for testing (optional)

**Default Users Created:**

| Email | Department | Role | Password |
|-------|------------|------|----------|
| bu.ppr@alhashargroup.com | Business Unit | PPR | (set via Auth0) |
| bu.apr@alhashargroup.com | Business Unit | APR | (set via Auth0) |
| finance.ppr@alhashargroup.com | Finance | PPR | (set via Auth0) |
| finance.apr@alhashargroup.com | Finance | APR | (set via Auth0) |
| cc.ppr@alhashargroup.com | C&C | PPR | (set via Auth0) |
| cc.apr@alhashargroup.com | C&C | APR | (set via Auth0) |
| stores.ppr@alhashargroup.com | Stores | PPR | (set via Auth0) |
| stores.apr@alhashargroup.com | Stores | APR | (set via Auth0) |
| ia.user@alhashargroup.com | IA | ReadOnly | (set via Auth0) |
| admin@alhashargroup.com | Admin | Admin | (set via Auth0) |

For more details, see [app/utils/README_SEED_DATA.md](app/utils/README_SEED_DATA.md)

### 9. Start Development Server

```bash
# Start FastAPI development server with auto-reload
uvicorn app.main:app --reload --host 0.0.0.0 --port 8000
```

The server will start at `http://localhost:8000`

**Server Options:**
- `--reload`: Auto-reload on code changes
- `--host 0.0.0.0`: Listen on all network interfaces
- `--port 8000`: Port number
- `--log-level debug`: Set log level

#### Verify Server is Running

```bash
# Check health endpoint
curl http://localhost:8000/api/v1/health

# Expected response:
# {"status":"healthy","version":"0.1.0","uptime":...}
```

### 10. Start Celery Workers (Optional)

For background task processing:

```bash
# Terminal 1: Start Celery worker
celery -A app.celery_app worker --loglevel=info -Q alerts,emails,default

# Terminal 2: Start Celery beat scheduler
celery -A app.celery_app beat --loglevel=info

# Or use the helper script (runs both in one process - dev only)
python run_celery.py worker-beat
```

## Running Tests

### Run All Tests

```bash
# Run all tests
pytest

# Run with verbose output
pytest -v

# Run with coverage report
pytest --cov=app --cov-report=html

# Open coverage report
# Windows
start htmlcov/index.html

# macOS
open htmlcov/index.html

# Linux
xdg-open htmlcov/index.html
```

### Run Specific Tests

```bash
# Run unit tests only
pytest tests/unit/

# Run integration tests only
pytest tests/integration/

# Run specific test file
pytest tests/unit/test_shipment_service.py

# Run specific test function
pytest tests/unit/test_shipment_service.py::test_create_shipment

# Run tests matching pattern
pytest -k "shipment"
```

### Test Configuration

Tests use a separate test database configured in `tests/conftest.py`:
- SQLite in-memory database for fast unit tests
- PostgreSQL test database for integration tests
- Fixtures for common test data

### Watch Mode (Auto-run tests)

```bash
# Install pytest-watch
pip install pytest-watch

# Run tests on file changes
ptw
```

## Development Workflow

### 1. Make Code Changes

Edit files in the `app/` directory:
- `models/`: Database models
- `schemas/`: Request/response schemas
- `services/`: Business logic
- `repositories/`: Data access
- `api/`: API endpoints

### 2. Format Code

```bash
# Format with black
black app/ tests/

# Check formatting without changes
black --check app/ tests/
```

### 3. Lint Code

```bash
# Run ruff linter
ruff check app/ tests/

# Auto-fix issues
ruff check --fix app/ tests/
```

### 4. Run Tests

```bash
# Run tests
pytest

# Run with coverage
pytest --cov=app
```

### 5. Create Database Migration

If you modified models:

```bash
# Generate migration
alembic revision --autogenerate -m "Add new field to shipment"

# Review generated migration in alembic/versions/

# Apply migration
alembic upgrade head
```

### 6. Test API Endpoints

```bash
# Using curl
curl -X GET "http://localhost:8000/api/v1/health"

# Using httpie (install: pip install httpie)
http GET http://localhost:8000/api/v1/health

# Using Swagger UI
# Open http://localhost:8000/api/v1/docs in browser
```

## Troubleshooting

### Database Connection Issues

```bash
# Test PostgreSQL connection
psql -U customs_user -d customs_clearance -h localhost

# Check if PostgreSQL is running
# Windows
sc query postgresql-x64-15

# macOS
brew services list | grep postgresql

# Linux
sudo systemctl status postgresql
```

### Redis Connection Issues

```bash
# Test Redis connection
redis-cli ping
# Should return: PONG

# Check if Redis is running
# Windows
sc query Redis

# macOS
brew services list | grep redis

# Linux
sudo systemctl status redis-server
```

### Migration Issues

```bash
# Reset database (WARNING: deletes all data)
alembic downgrade base
alembic upgrade head

# Or drop and recreate database
dropdb customs_clearance
createdb customs_clearance
alembic upgrade head
python seed_database.py
```

### Import Errors

```bash
# Ensure virtual environment is activated
# You should see (venv) in prompt

# Reinstall dependencies
pip install -r requirements.txt

# Check Python path
python -c "import sys; print(sys.path)"
```

### Port Already in Use

```bash
# Find process using port 8000
# Windows
netstat -ano | findstr :8000

# Linux/macOS
lsof -i :8000

# Kill process
# Windows
taskkill /PID <pid> /F

# Linux/macOS
kill -9 <pid>
```

## IDE Setup

### VS Code

Recommended extensions:
- Python (Microsoft)
- Pylance
- Python Test Explorer
- SQLTools
- Docker

Recommended settings (`.vscode/settings.json`):
```json
{
  "python.linting.enabled": true,
  "python.linting.ruffEnabled": true,
  "python.formatting.provider": "black",
  "python.testing.pytestEnabled": true,
  "python.testing.unittestEnabled": false,
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.organizeImports": true
  }
}
```

### PyCharm

1. Open project directory
2. Configure Python interpreter: Settings → Project → Python Interpreter
3. Select virtual environment: `venv/bin/python`
4. Enable pytest: Settings → Tools → Python Integrated Tools → Testing → pytest
5. Configure database: Database tool window → Add PostgreSQL datasource

## Additional Resources

- [FastAPI Documentation](https://fastapi.tiangolo.com/)
- [SQLAlchemy Documentation](https://docs.sqlalchemy.org/)
- [Alembic Documentation](https://alembic.sqlalchemy.org/)
- [Celery Documentation](https://docs.celeryproject.org/)
- [Auth0 Documentation](https://auth0.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Redis Documentation](https://redis.io/documentation)

## Getting Help

- Check [API_DOCUMENTATION.md](API_DOCUMENTATION.md) for API details
- Check [CELERY_IMPLEMENTATION.md](CELERY_IMPLEMENTATION.md) for background tasks
- Check [MONITORING.md](MONITORING.md) for monitoring setup
- Review test files in `tests/` for usage examples
- Check application logs for error details

## Next Steps

After completing setup:

1. Explore the API documentation at http://localhost:8000/api/v1/docs
2. Review the codebase structure in `app/`
3. Run the test suite to verify everything works
4. Try creating a test shipment via API
5. Monitor Celery tasks for alert evaluation
6. Review the PRD in `supportDocs/prd.md` for business context
