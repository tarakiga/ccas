# Design Document

## Overview

The Customs Clearance Automation System backend is built using FastAPI (Python) with PostgreSQL for data persistence and Redis for task queuing. The architecture follows a layered approach with clear separation between API, business logic, and data access layers. The system integrates with Auth0 for authentication and uses Celery for asynchronous task processing.

### Technology Stack

- **API Framework**: FastAPI 0.104+
- **ORM**: SQLAlchemy 2.0+
- **Database**: PostgreSQL 15+
- **Cache/Queue**: Redis 7+
- **Task Queue**: Celery 5+
- **Authentication**: Auth0
- **Email**: SMTP (configurable provider)
- **Deployment**: Docker containers

## Architecture

### High-Level Architecture

```
┌─────────────┐
│   Client    │
│  (Next.js)  │
└──────┬──────┘
       │ HTTPS
       ▼
┌─────────────────────────────────────┐
│         FastAPI Application         │
│  ┌───────────────────────────────┐  │
│  │      API Layer (Routes)       │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │   Business Logic (Services)   │  │
│  └───────────┬───────────────────┘  │
│              │                       │
│  ┌───────────▼───────────────────┐  │
│  │  Data Access (Repositories)   │  │
│  └───────────┬───────────────────┘  │
└──────────────┼───────────────────────┘
               │
       ┌───────┴────────┐
       ▼                ▼
┌─────────────┐  ┌─────────────┐
│ PostgreSQL  │  │    Redis    │
└─────────────┘  └──────┬──────┘
                        │
                 ┌──────▼──────┐
                 │    Celery   │
                 │   Workers   │
                 └─────────────┘
```

### Directory Structure

```
backend/
├── app/
│   ├── __init__.py
│   ├── main.py                 # FastAPI app initialization
│   ├── config.py               # Configuration management
│   ├── dependencies.py         # Dependency injection
│   │
│   ├── api/                    # API layer
│   │   ├── __init__.py
│   │   ├── v1/
│   │   │   ├── __init__.py
│   │   │   ├── shipments.py   # Shipment endpoints
│   │   │   ├── workflow.py    # Workflow step endpoints
│   │   │   ├── alerts.py      # Alert endpoints
│   │   │   ├── audit.py       # Audit log endpoints
│   │   │   ├── metrics.py     # Metrics endpoints
│   │   │   └── health.py      # Health check endpoints
│   │
│   ├── models/                 # SQLAlchemy models
│   │   ├── __init__.py
│   │   ├── shipment.py
│   │   ├── workflow_step.py
│   │   ├── alert.py
│   │   ├── audit_log.py
│   │   └── user.py
│   │
│   ├── schemas/                # Pydantic schemas
│   │   ├── __init__.py
│   │   ├── shipment.py
│   │   ├── workflow_step.py
│   │   ├── alert.py
│   │   ├── audit_log.py
│   │   └── common.py
│   │
│   ├── services/               # Business logic
│   │   ├── __init__.py
│   │   ├── shipment_service.py
│   │   ├── workflow_service.py
│   │   ├── alert_service.py
│   │   ├── audit_service.py
│   │   └── metrics_service.py
│   │
│   ├── repositories/           # Data access
│   │   ├── __init__.py
│   │   ├── shipment_repository.py
│   │   ├── workflow_repository.py
│   │   ├── alert_repository.py
│   │   └── audit_repository.py
│   │
│   ├── tasks/                  # Celery tasks
│   │   ├── __init__.py
│   │   ├── alert_tasks.py
│   │   └── email_tasks.py
│   │
│   ├── auth/                   # Authentication
│   │   ├── __init__.py
│   │   ├── auth0.py
│   │   └── permissions.py
│   │
│   └── utils/                  # Utilities
│       ├── __init__.py
│       ├── date_utils.py
│       └── constants.py
│
├── alembic/                    # Database migrations
│   ├── versions/
│   └── env.py
│
├── tests/
│   ├── unit/
│   ├── integration/
│   └── conftest.py
│
├── Dockerfile
├── docker-compose.yml
├── requirements.txt
└── pyproject.toml
```

## Components and Interfaces

### 1. API Layer

#### Shipment Endpoints

```python
POST   /api/v1/shipments              # Create shipment
GET    /api/v1/shipments              # List shipments (paginated, filtered)
GET    /api/v1/shipments/{id}         # Get shipment details
PUT    /api/v1/shipments/{id}         # Update shipment
PATCH  /api/v1/shipments/{id}/eta     # Update ETA (Business Unit only)
DELETE /api/v1/shipments/{id}         # Soft delete shipment
POST   /api/v1/shipments/import       # Bulk import from Excel data
```

#### Workflow Step Endpoints

```python
GET    /api/v1/shipments/{id}/workflow           # Get all steps for shipment
GET    /api/v1/workflow-steps/{id}               # Get step details
PATCH  /api/v1/workflow-steps/{id}/complete      # Mark step complete with actual date
GET    /api/v1/workflow-steps/my-tasks           # Get current user's assigned steps
```

#### Alert Endpoints

```python
GET    /api/v1/alerts                  # List alerts (filtered by user/shipment)
GET    /api/v1/alerts/{id}             # Get alert details
PATCH  /api/v1/alerts/{id}/acknowledge # Acknowledge alert
```

#### Audit Log Endpoints

```python
GET    /api/v1/audit-logs              # Query audit logs (filtered)
GET    /api/v1/audit-logs/shipment/{id} # Get logs for specific shipment
```

#### Metrics Endpoints

```python
GET    /api/v1/metrics/clearance-time      # Average clearance time by department
GET    /api/v1/metrics/on-time-rate        # Percentage cleared within 7 days
GET    /api/v1/metrics/demurrage-savings   # Calculated cost avoidance
GET    /api/v1/metrics/delayed-steps       # Steps delayed by department
```

#### Health Check Endpoints

```python
GET    /api/v1/health                  # Overall health status
GET    /api/v1/health/db               # Database connectivity
GET    /api/v1/health/redis            # Redis connectivity
```

### 2. Service Layer

#### ShipmentService

**Responsibilities:**
- Create shipments with auto-calculated financial fields
- Update shipment data with validation
- Handle ETA updates with edit count tracking
- Trigger workflow step generation
- Coordinate with audit service for logging

**Key Methods:**
```python
create_shipment(data: ShipmentCreate, user: User) -> Shipment
update_shipment(id: int, data: ShipmentUpdate, user: User) -> Shipment
update_eta(id: int, new_eta: date, user: User) -> Shipment
get_shipment(id: int, user: User) -> Shipment
list_shipments(filters: ShipmentFilters, user: User) -> Page[Shipment]
import_shipments(data: List[ShipmentImport], user: User) -> ImportResult
```

#### WorkflowService

**Responsibilities:**
- Generate 34 workflow steps for new shipments
- Recalculate target dates when ETA changes
- Update step completion status
- Enforce role-based step access
- Identify critical steps for alert evaluation

**Key Methods:**
```python
generate_workflow_steps(shipment: Shipment) -> List[WorkflowStep]
recalculate_target_dates(shipment: Shipment) -> None
complete_step(step_id: int, actual_date: date, user: User) -> WorkflowStep
get_user_assigned_steps(user: User, filters: StepFilters) -> List[WorkflowStep]
get_critical_incomplete_steps(shipment: Shipment) -> List[WorkflowStep]
```

#### AlertService

**Responsibilities:**
- Evaluate shipments for alert conditions
- Create alerts based on day-post-ETA and step status
- Determine alert recipients based on escalation rules
- Queue email notifications
- Track alert acknowledgment

**Key Methods:**
```python
evaluate_shipment_alerts(shipment: Shipment) -> List[Alert]
create_alert(shipment: Shipment, step: WorkflowStep, severity: AlertSeverity) -> Alert
determine_recipients(alert: Alert) -> List[User]
queue_email_notification(alert: Alert) -> None
acknowledge_alert(alert_id: int, user: User) -> Alert
```

#### MetricsService

**Responsibilities:**
- Calculate clearance cycle time metrics
- Compute on-time clearance rates
- Calculate demurrage cost avoidance
- Aggregate delayed steps by department
- Generate dashboard data

**Key Methods:**
```python
get_average_clearance_time(date_range: DateRange, department: Optional[str]) -> Dict
get_on_time_rate(date_range: DateRange) -> float
calculate_demurrage_savings(date_range: DateRange) -> Decimal
get_delayed_steps_by_department(date_range: DateRange) -> Dict[str, List[WorkflowStep]]
```

#### AuditService

**Responsibilities:**
- Log all data modifications
- Capture user, timestamp, IP address
- Store old and new values
- Provide audit log querying

**Key Methods:**
```python
log_change(entity_type: str, entity_id: int, field: str, old_value: Any, new_value: Any, user: User, ip: str) -> AuditLog
query_logs(filters: AuditLogFilters) -> Page[AuditLog]
```

### 3. Repository Layer

#### ShipmentRepository

**Responsibilities:**
- CRUD operations for shipments
- Query shipments with filters and pagination
- Handle database transactions

**Key Methods:**
```python
create(shipment: Shipment) -> Shipment
update(shipment: Shipment) -> Shipment
get_by_id(id: int) -> Optional[Shipment]
list(filters: Dict, page: int, size: int) -> Tuple[List[Shipment], int]
get_active_shipments_by_eta_range(start: date, end: date) -> List[Shipment]
```

#### WorkflowRepository

**Responsibilities:**
- CRUD operations for workflow steps
- Query steps by shipment, user, status
- Bulk update operations

**Key Methods:**
```python
create_bulk(steps: List[WorkflowStep]) -> List[WorkflowStep]
update(step: WorkflowStep) -> WorkflowStep
get_by_shipment_id(shipment_id: int) -> List[WorkflowStep]
get_by_user_assignment(user_id: int, filters: Dict) -> List[WorkflowStep]
update_target_dates_bulk(shipment_id: int, eta: date) -> None
```

#### AlertRepository

**Responsibilities:**
- CRUD operations for alerts
- Query alerts by user, shipment, status
- Track alert delivery status

**Key Methods:**
```python
create(alert: Alert) -> Alert
update(alert: Alert) -> Alert
get_by_user(user_id: int, filters: Dict) -> List[Alert]
get_by_shipment(shipment_id: int) -> List[Alert]
get_pending_notifications() -> List[Alert]
```

#### AuditRepository

**Responsibilities:**
- Insert audit log entries
- Query logs with complex filters
- Ensure log immutability

**Key Methods:**
```python
create(log: AuditLog) -> AuditLog
query(filters: Dict, page: int, size: int) -> Tuple[List[AuditLog], int]
get_by_entity(entity_type: str, entity_id: int) -> List[AuditLog]
```

## Data Models

### Shipment

```python
class Shipment(Base):
    __tablename__ = "shipments"
    
    id: int (PK)
    shipment_number: str (unique, indexed)
    principal: str
    brand: str
    lc_number: str
    invoice_amount_omr: Decimal
    customs_duty_omr: Decimal (computed: invoice_amount * 0.05)
    vat_omr: Decimal (computed: invoice_amount * 0.05)
    insurance_omr: Decimal (computed: invoice_amount * 0.01)
    eta: date (indexed)
    eta_edit_count: int (default: 0)
    status: str (enum: active, completed, cancelled)
    created_by_id: int (FK -> users.id)
    created_at: datetime
    updated_at: datetime
    deleted_at: datetime (nullable, for soft delete)
```

### WorkflowStep

```python
class WorkflowStep(Base):
    __tablename__ = "workflow_steps"
    
    id: int (PK)
    shipment_id: int (FK -> shipments.id, indexed)
    step_number: Decimal (e.g., 9.0, 10.0)
    step_name: str
    description: str
    department: str (enum: BusinessUnit, Finance, C&C, Stores)
    target_date: date (computed: shipment.eta + offset_days)
    offset_days: int (e.g., 0 for step 9.0, 3 for step 10.0)
    actual_date: date (nullable)
    status: str (enum: pending, completed, overdue)
    is_critical: bool (for demurrage prevention)
    ppr_user_id: int (FK -> users.id)
    apr_user_id: int (FK -> users.id, nullable)
    created_at: datetime
    updated_at: datetime
```

### Alert

```python
class Alert(Base):
    __tablename__ = "alerts"
    
    id: int (PK)
    shipment_id: int (FK -> shipments.id, indexed)
    workflow_step_id: int (FK -> workflow_steps.id)
    severity: str (enum: warning, critical, urgent)
    message: str
    recipient_user_id: int (FK -> users.id, indexed)
    days_post_eta: int
    is_acknowledged: bool (default: False)
    acknowledged_at: datetime (nullable)
    email_sent: bool (default: False)
    email_sent_at: datetime (nullable)
    email_retry_count: int (default: 0)
    created_at: datetime
```

### AuditLog

```python
class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id: int (PK)
    entity_type: str (e.g., "shipment", "workflow_step")
    entity_id: int (indexed)
    field_name: str
    old_value: str (JSON serialized)
    new_value: str (JSON serialized)
    user_id: int (FK -> users.id, indexed)
    ip_address: str
    created_at: datetime (indexed)
```

### User

```python
class User(Base):
    __tablename__ = "users"
    
    id: int (PK)
    auth0_id: str (unique, indexed)
    email: str (unique, indexed)
    full_name: str
    department: str (enum: BusinessUnit, Finance, C&C, Stores, IA)
    role: str (enum: PPR, APR, Manager, Admin, ReadOnly)
    is_active: bool (default: True)
    created_at: datetime
    updated_at: datetime
```

### Database Indexes

```sql
-- Shipments
CREATE INDEX idx_shipments_eta ON shipments(eta);
CREATE INDEX idx_shipments_status ON shipments(status);
CREATE INDEX idx_shipments_number ON shipments(shipment_number);

-- Workflow Steps
CREATE INDEX idx_workflow_shipment ON workflow_steps(shipment_id);
CREATE INDEX idx_workflow_status ON workflow_steps(status);
CREATE INDEX idx_workflow_ppr ON workflow_steps(ppr_user_id);
CREATE INDEX idx_workflow_target_date ON workflow_steps(target_date);

-- Alerts
CREATE INDEX idx_alerts_recipient ON alerts(recipient_user_id);
CREATE INDEX idx_alerts_shipment ON alerts(shipment_id);
CREATE INDEX idx_alerts_acknowledged ON alerts(is_acknowledged);
CREATE INDEX idx_alerts_email_sent ON alerts(email_sent);

-- Audit Logs
CREATE INDEX idx_audit_entity ON audit_logs(entity_type, entity_id);
CREATE INDEX idx_audit_user ON audit_logs(user_id);
CREATE INDEX idx_audit_created ON audit_logs(created_at);

-- Users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_department ON users(department);
```

## Error Handling

### Error Response Format

All API errors return consistent JSON structure:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": [
      {
        "field": "eta",
        "message": "ETA cannot be in the past"
      }
    ]
  }
}
```

### Error Categories

1. **Validation Errors (400)**
   - Invalid input format
   - Missing required fields
   - Business rule violations

2. **Authentication Errors (401)**
   - Missing or invalid token
   - Expired token

3. **Authorization Errors (403)**
   - Insufficient permissions
   - Department access restrictions

4. **Not Found Errors (404)**
   - Resource does not exist

5. **Conflict Errors (409)**
   - Concurrent modification detected
   - ETA edit limit exceeded

6. **Server Errors (500)**
   - Database connection failures
   - Unexpected exceptions

### Exception Handling Strategy

- Use FastAPI exception handlers for consistent error responses
- Log all errors with context (user, request ID, timestamp)
- Implement circuit breaker for external service calls (Auth0, SMTP)
- Use database transactions with rollback on errors
- Implement retry logic for transient failures (email sending)

## Testing Strategy

### Unit Tests

**Coverage Target**: 80%+

**Focus Areas:**
- Service layer business logic
- Data validation in schemas
- Date calculations and ETA offset logic
- Alert condition evaluation
- Financial field calculations

**Tools:**
- pytest for test framework
- pytest-cov for coverage reporting
- Factory Boy for test data generation
- Freezegun for date/time mocking

### Integration Tests

**Focus Areas:**
- API endpoint request/response flows
- Database operations and transactions
- Auth0 integration
- Celery task execution
- Email sending

**Tools:**
- pytest with FastAPI TestClient
- Docker Compose for test database
- Fakeredis for Redis mocking
- SMTP test server for email verification

### Performance Tests

**Focus Areas:**
- API response times under load
- Alert evaluation for 1000+ shipments
- Concurrent request handling
- Database query optimization

**Tools:**
- Locust for load testing
- pytest-benchmark for micro-benchmarks
- PostgreSQL EXPLAIN ANALYZE for query profiling

### Test Data

- Use Factory Boy to generate realistic test shipments
- Create fixtures for workflow step templates
- Mock Auth0 responses for authentication tests
- Use time-travel (Freezegun) to test alert timing logic

## Security Considerations

### Authentication & Authorization

- All API endpoints require valid Auth0 JWT token
- Token validation includes signature verification and expiration check
- User department and role extracted from Auth0 custom claims
- Implement role-based access control (RBAC) at service layer

### Data Protection

- Use parameterized queries to prevent SQL injection
- Validate and sanitize all user inputs
- Implement rate limiting on API endpoints (100 requests/minute per user)
- Use HTTPS for all communications
- Store sensitive configuration in environment variables

### Audit & Compliance

- Log all data modifications with user attribution
- Retain audit logs for 7 years minimum
- Implement soft delete for shipments (preserve data)
- Provide audit trail export for compliance reporting

## Deployment Architecture

### Docker Containers

```yaml
services:
  api:
    image: customs-clearance-api:latest
    replicas: 3
    environment:
      - DATABASE_URL
      - REDIS_URL
      - AUTH0_DOMAIN
      - AUTH0_AUDIENCE
    ports:
      - "8000:8000"
    depends_on:
      - db
      - redis
  
  worker:
    image: customs-clearance-api:latest
    command: celery -A app.tasks worker --loglevel=info
    replicas: 2
    environment:
      - DATABASE_URL
      - REDIS_URL
    depends_on:
      - db
      - redis
  
  beat:
    image: customs-clearance-api:latest
    command: celery -A app.tasks beat --loglevel=info
    environment:
      - DATABASE_URL
      - REDIS_URL
    depends_on:
      - redis
  
  db:
    image: postgres:15
    environment:
      - POSTGRES_DB=customs_clearance
      - POSTGRES_USER
      - POSTGRES_PASSWORD
    volumes:
      - postgres_data:/var/lib/postgresql/data
  
  redis:
    image: redis:7
    volumes:
      - redis_data:/data
```

### Environment Configuration

```python
# config.py
class Settings(BaseSettings):
    # Database
    DATABASE_URL: str
    DB_POOL_SIZE: int = 20
    DB_MAX_OVERFLOW: int = 10
    
    # Redis
    REDIS_URL: str
    
    # Auth0
    AUTH0_DOMAIN: str
    AUTH0_AUDIENCE: str
    AUTH0_ALGORITHMS: List[str] = ["RS256"]
    
    # Email
    SMTP_HOST: str
    SMTP_PORT: int = 587
    SMTP_USER: str
    SMTP_PASSWORD: str
    SMTP_FROM: str
    
    # Application
    API_V1_PREFIX: str = "/api/v1"
    PROJECT_NAME: str = "Customs Clearance API"
    DEBUG: bool = False
    
    # Celery
    CELERY_BROKER_URL: str
    CELERY_RESULT_BACKEND: str
    
    class Config:
        env_file = ".env"
```

## Monitoring & Observability

### Logging

- Use structured logging (JSON format)
- Log levels: DEBUG, INFO, WARNING, ERROR, CRITICAL
- Include request ID in all logs for tracing
- Log to stdout for container environments

### Metrics

- Expose Prometheus metrics endpoint
- Track API request counts, latencies, error rates
- Monitor database connection pool usage
- Track Celery task execution times and failures
- Monitor alert evaluation and email sending success rates

### Health Checks

- Implement liveness probe (basic HTTP 200 response)
- Implement readiness probe (check DB and Redis connectivity)
- Set probe intervals: liveness=30s, readiness=10s

## Performance Optimization

### Database

- Use connection pooling (20 connections, 10 overflow)
- Implement query result caching for metrics endpoints (5-minute TTL)
- Use database indexes on frequently queried columns
- Implement pagination for list endpoints (default 50 items)

### API

- Use async/await for I/O operations
- Implement response compression (gzip)
- Cache Auth0 public keys for token validation
- Use database read replicas for reporting queries

### Background Tasks

- Process alerts in batches (100 shipments per task)
- Use Celery task priorities (high for alerts, normal for emails)
- Implement task result expiration (24 hours)
- Use Redis for task result backend
