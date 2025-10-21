# Customs Clearance Automation System (CCAS)

**Al Hashar Group - Digital Transformation Initiative**

A comprehensive FastAPI-based backend system for automating customs clearance workflows, eliminating manual Excel-based processes, and preventing demurrage costs through intelligent alert management.

---

## 🎯 Project Overview

The Customs Clearance Automation System digitizes the manual 34-step customs clearance workflow to ensure vehicles are cleared within 7 days of port arrival, preventing costly demurrage charges.

### Key Features

- ✅ **Automated Workflow Management** - 34-step clearance process with automated target date calculations
- ✅ **Real-Time Alert System** - Intelligent alerts on Day 4-7 post-ETA with escalation rules
- ✅ **Role-Based Access Control** - Department-specific access via Auth0 integration
- ✅ **Performance Metrics** - Dashboard metrics for clearance time, on-time rates, and cost savings
- ✅ **Audit Logging** - Complete change history for compliance and accountability
- ✅ **Background Task Processing** - Celery-based async tasks for alert evaluation and notifications
- ✅ **Comprehensive Testing** - 88 tests with 100% pass rate

---

## 📊 Project Status

| Metric | Status |
|--------|--------|
| **Tests** | 88 passing (100%) ✅ |
| **Code Coverage** | 47% |
| **Python Version** | 3.12+ |
| **API Endpoints** | 30+ endpoints |
| **Documentation** | Complete ✅ |
| **Deployment** | Docker ready ✅ |

---

## 🚀 Quick Start

### Prerequisites

- Python 3.11+
- PostgreSQL 15+
- Redis 7+
- Docker & Docker Compose (optional)

### Using Docker (Recommended)

```bash
cd backend
docker-compose up -d
docker-compose exec api alembic upgrade head
docker-compose exec api python seed_database.py
```

The API will be available at `http://localhost:8000`

### Manual Setup

```bash
cd backend
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
pip install -r requirements.txt
alembic upgrade head
python seed_database.py
uvicorn app.main:app --reload
```

For detailed setup instructions, see [backend/DEVELOPMENT.md](backend/DEVELOPMENT.md)

---

## 📁 Project Structure

```
ccas/
├── backend/                    # FastAPI backend application
│   ├── app/
│   │   ├── api/               # API endpoints
│   │   ├── auth/              # Authentication & authorization
│   │   ├── models/            # SQLAlchemy models
│   │   ├── schemas/           # Pydantic schemas
│   │   ├── services/          # Business logic
│   │   ├── repositories/      # Data access layer
│   │   ├── tasks/             # Celery background tasks
│   │   ├── middleware/        # Custom middleware
│   │   ├── monitoring/        # Prometheus metrics
│   │   └── utils/             # Utility functions
│   ├── tests/                 # Test suite (88 tests)
│   ├── alembic/               # Database migrations
│   └── docs/                  # Documentation
├── supportDocs/               # Business requirements & SOPs
└── .kiro/                     # Kiro AI spec files

```

---

## 📚 Documentation

### Core Documentation
- **[README.md](backend/README.md)** - Backend overview and quick start
- **[DEVELOPMENT.md](backend/DEVELOPMENT.md)** - Detailed development setup guide
- **[API_DOCUMENTATION.md](backend/API_DOCUMENTATION.md)** - Complete API reference
- **[TEST_REPORT.md](backend/TEST_REPORT.md)** - Test results and coverage analysis

### Implementation Guides
- **[CELERY_IMPLEMENTATION.md](backend/CELERY_IMPLEMENTATION.md)** - Background task processing
- **[MONITORING.md](backend/MONITORING.md)** - Monitoring and observability
- **[CONCURRENCY_OPTIMIZATIONS.md](backend/CONCURRENCY_OPTIMIZATIONS.md)** - Performance optimizations
- **[SEED_DATA_IMPLEMENTATION.md](backend/SEED_DATA_IMPLEMENTATION.md)** - Database seeding

### Recent Updates
- **[FIXES_APPLIED.md](backend/FIXES_APPLIED.md)** - Bug fixes and improvements
- **[IMPROVEMENTS_SUMMARY.md](backend/IMPROVEMENTS_SUMMARY.md)** - Latest enhancements

---

## 🏗️ Architecture

### Technology Stack

- **Framework:** FastAPI 0.104+
- **Database:** PostgreSQL 15+
- **ORM:** SQLAlchemy 2.0+
- **Cache/Queue:** Redis 7+
- **Task Queue:** Celery 5+
- **Authentication:** Auth0
- **Migrations:** Alembic
- **Testing:** pytest
- **Monitoring:** Prometheus

### Key Components

1. **Shipment Management** - Track shipments with automated financial calculations
2. **Workflow Engine** - 34-step clearance process with target date automation
3. **Alert System** - Real-time alerts with severity-based escalation
4. **Metrics Dashboard** - Performance tracking and reporting
5. **Audit System** - Complete change history for compliance

---

## 🧪 Testing

### Run Tests

```bash
cd backend

# Run all tests
pytest

# Run with coverage
pytest --cov=app --cov-report=html

# Run specific test suite
pytest tests/unit/
pytest tests/integration/
```

### Test Statistics

- **Total Tests:** 88
- **Unit Tests:** 40 (100% passing)
- **Integration Tests:** 48 (100% passing)
- **Execution Time:** ~8 minutes
- **Deprecation Warnings:** 0

---

## 🔐 Authentication

The system uses Auth0 for authentication with role-based access control:

- **Business Unit** - Create shipments, update ETA (max 3 times)
- **Finance** - Complete Finance department workflow steps
- **C&C (Customs & Clearance)** - Complete C&C department workflow steps
- **Stores** - Complete Stores department workflow steps
- **IA (Internal Audit)** - Read-only access to all data
- **Admin** - Full access to all operations

---

## 📊 API Endpoints

### Core Endpoints

- **Shipments:** `/api/v1/shipments` - CRUD operations, bulk import
- **Workflow:** `/api/v1/workflow-steps` - Step management, completion
- **Alerts:** `/api/v1/alerts` - Alert management, acknowledgment
- **Metrics:** `/api/v1/metrics` - Performance metrics, reporting
- **Audit:** `/api/v1/audit-logs` - Change history, compliance
- **Health:** `/api/v1/health` - System health checks

### API Documentation

- **Swagger UI:** http://localhost:8000/api/v1/docs
- **ReDoc:** http://localhost:8000/api/v1/redoc
- **OpenAPI JSON:** http://localhost:8000/api/v1/openapi.json

---

## 🔄 Background Tasks

### Scheduled Tasks

1. **Alert Evaluation** (Daily at 08:00 UTC)
   - Evaluates all active shipments for alert conditions
   - Creates alerts based on days post-ETA thresholds

2. **Email Notifications** (Every 5 minutes)
   - Processes pending email notifications
   - Sends alert emails to assigned users
   - Retries failed sends up to 3 times

### Task Queues

- `alerts` - High priority queue for alert evaluation
- `emails` - Medium priority queue for email sending
- `default` - Normal priority queue for other tasks

---

## 🚢 Deployment

### Docker Deployment

```bash
# Build and start all services
docker-compose up -d --build

# Run migrations
docker-compose exec api alembic upgrade head

# Seed initial data
docker-compose exec api python seed_database.py

# View logs
docker-compose logs -f api

# Stop services
docker-compose down
```

### Environment Variables

Key environment variables (see `.env.example`):

- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string
- `AUTH0_DOMAIN` - Auth0 tenant domain
- `AUTH0_AUDIENCE` - Auth0 API identifier
- `SMTP_*` - Email configuration

---

## 📈 Metrics & Monitoring

### Available Metrics

- **Clearance Time** - Average days from ETA to completion
- **On-Time Rate** - Percentage cleared within 7 days
- **Demurrage Savings** - Estimated cost avoidance
- **Delayed Steps** - Steps delayed by department
- **Alert Statistics** - Alert creation and resolution rates

### Monitoring

- Prometheus metrics at `/metrics`
- Structured JSON logging
- Request ID tracking
- Performance monitoring

---

## 🤝 Contributing

### Development Workflow

1. Create a feature branch
2. Make your changes
3. Run tests: `pytest`
4. Run linting: `ruff check app/`
5. Format code: `black app/`
6. Submit a pull request

### Code Quality

- All tests must pass (100% pass rate required)
- Code coverage should not decrease
- Follow PEP 8 style guidelines
- Add tests for new features

---

## 📝 License

Proprietary - Al Hashar Group

---

## 👥 Team

**AIQRA AI - Digital Transformation Team**

Developed by AIQRA AI for Al Hashar Group's digital transformation initiative.

For questions or support, contact the development team.

---

## 🎉 Recent Achievements

- ✅ 100% test pass rate (88/88 tests)
- ✅ Zero deprecation warnings
- ✅ Python 3.12+ compliant
- ✅ SQLAlchemy 2.0 compatible
- ✅ Comprehensive documentation
- ✅ Production-ready deployment

---

## 📖 Additional Resources

- [Product Requirements Document](supportDocs/prd.md)
- [Customs Clearance SOP](supportDocs/Customs_Clearance_SOPv3%2016.10.25.pdf)
- [Responsibility Matrix](supportDocs/Responsiblility%20List.xls)
- [Workflow Template](supportDocs/AHC-TBLE.xls)

---

**Built with ❤️ by the AIQRA AI Digital Transformation Team**
