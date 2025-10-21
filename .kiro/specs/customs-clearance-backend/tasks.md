# Implementation Plan

- [x] 1. Set up project structure and core configuration





  - Create FastAPI project with proper directory structure (api, models, schemas, services, repositories, tasks, auth, utils)
  - Configure SQLAlchemy with PostgreSQL connection and session management
  - Set up Alembic for database migrations
  - Create configuration management using Pydantic Settings with environment variables
  - Set up logging configuration with structured JSON format
  - _Requirements: 15.5_

- [x] 2. Implement database models and migrations





  - [x] 2.1 Create User model with Auth0 integration fields


    - Define User model with id, auth0_id, email, full_name, department, role, is_active, timestamps
    - Add database indexes for email, auth0_id, and department
    - _Requirements: 9.2_

  - [x] 2.2 Create Shipment model with financial calculations


    - Define Shipment model with all required fields (shipment_number, principal, brand, lc_number, invoice_amount, eta, etc.)
    - Implement computed properties for customs_duty_omr, vat_omr, insurance_omr
    - Add eta_edit_count field with default value 0
    - Add status field with enum (active, completed, cancelled)
    - Add soft delete support with deleted_at field
    - Add database indexes for shipment_number, eta, and status
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1_

  - [x] 2.3 Create WorkflowStep model with target date calculation


    - Define WorkflowStep model with shipment relationship, step_number, step_name, department, target_date, offset_days, actual_date, status, is_critical
    - Add ppr_user_id and apr_user_id foreign keys to User model
    - Add database indexes for shipment_id, status, ppr_user_id, target_date
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 2.4 Create Alert model for notification tracking


    - Define Alert model with shipment and workflow_step relationships, severity, message, recipient_user_id, days_post_eta
    - Add fields for acknowledgment tracking (is_acknowledged, acknowledged_at)
    - Add fields for email delivery tracking (email_sent, email_sent_at, email_retry_count)
    - Add database indexes for recipient_user_id, shipment_id, is_acknowledged, email_sent
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1_

  - [x] 2.5 Create AuditLog model for change tracking


    - Define AuditLog model with entity_type, entity_id, field_name, old_value, new_value, user_id, ip_address, created_at
    - Add database indexes for entity_type+entity_id composite, user_id, created_at
    - _Requirements: 8.1, 8.2, 8.3, 8.4_

  - [x] 2.6 Generate and apply initial database migration


    - Create Alembic migration for all models
    - Apply migration to create database schema
    - _Requirements: 1.1_

- [x] 3. Create Pydantic schemas for request/response validation





  - [x] 3.1 Create shipment schemas


    - Define ShipmentCreate schema with required fields and validation rules
    - Define ShipmentUpdate schema with optional fields
    - Define ShipmentResponse schema with computed financial fields
    - Define ShipmentFilters schema for list endpoint query parameters
    - Define ShipmentImport schema for bulk import
    - Add validators for positive invoice amounts, valid dates, enum values
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

  - [x] 3.2 Create workflow step schemas


    - Define WorkflowStepResponse schema with all fields
    - Define WorkflowStepComplete schema for marking steps complete
    - Define StepFilters schema for filtering user tasks
    - Add validator to ensure actual_date is not in future
    - _Requirements: 4.2, 13.2_

  - [x] 3.3 Create alert schemas


    - Define AlertResponse schema with shipment and step details
    - Define AlertFilters schema for querying alerts
    - _Requirements: 6.1_

  - [x] 3.4 Create audit log schemas


    - Define AuditLogResponse schema with all fields
    - Define AuditLogFilters schema with entity_type, entity_id, user_id, date_range filters
    - _Requirements: 8.5_

  - [x] 3.5 Create metrics schemas


    - Define ClearanceTimeMetrics schema for average clearance time response
    - Define OnTimeRateMetrics schema for on-time clearance percentage
    - Define DemurrageSavings schema for cost avoidance calculation
    - Define DelayedStepsMetrics schema for delayed steps by department
    - Define DateRange schema for metrics query parameters
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_

  - [x] 3.6 Create common schemas


    - Define Page schema for paginated responses with items, total, page, size
    - Define ErrorResponse schema with code, message, details
    - Define HealthCheckResponse schema with status, version, uptime, dependencies
    - _Requirements: 13.5, 15.1, 15.5_

- [x] 4. Implement authentication and authorization




  - [x] 4.1 Set up Auth0 integration


    - Create Auth0 client configuration with domain, audience, algorithms
    - Implement JWT token validation using python-jose library
    - Create dependency function to extract and validate token from Authorization header
    - Extract user claims (email, auth0_id) from validated token
    - _Requirements: 9.1_

  - [x] 4.2 Implement user management


    - Create function to get or create User from Auth0 token claims
    - Map user email domain to department (e.g., finance@alhashargroup.com -> Finance)
    - Assign default role based on department
    - _Requirements: 9.2_

  - [x] 4.3 Implement role-based access control


    - Create permission checker functions for department-based access
    - Implement check for Business Unit role on ETA update endpoint
    - Implement check for PPR/APR role on workflow step completion
    - Implement read-only access for IA role
    - Return 403 Forbidden for unauthorized access attempts
    - _Requirements: 2.4, 4.3, 9.3, 9.4, 9.5_

- [x] 5. Implement repository layer for data access




  - [x] 5.1 Create ShipmentRepository


    - Implement create method with database transaction
    - Implement update method with optimistic locking check
    - Implement get_by_id method with relationship loading
    - Implement list method with filters (status, eta_range, principal) and pagination
    - Implement get_active_shipments_by_eta_range for alert evaluation
    - _Requirements: 1.1, 11.2_

  - [x] 5.2 Create WorkflowRepository


    - Implement create_bulk method for generating 34 steps efficiently
    - Implement update method for single step updates
    - Implement get_by_shipment_id method with user assignments loaded
    - Implement get_by_user_assignment method filtered by PPR/APR
    - Implement update_target_dates_bulk method for ETA change recalculation
    - _Requirements: 3.1, 5.2_

  - [x] 5.3 Create AlertRepository


    - Implement create method for new alerts
    - Implement update method for acknowledgment and email status
    - Implement get_by_user method filtered by recipient
    - Implement get_by_shipment method for shipment alert history
    - Implement get_pending_notifications method for email queue processing
    - _Requirements: 6.1, 7.1_

  - [x] 5.4 Create AuditRepository


    - Implement create method for audit log entries
    - Implement query method with complex filters (entity, user, date_range) and pagination
    - Implement get_by_entity method for entity-specific audit trail
    - _Requirements: 8.1, 8.5_

- [x] 6. Implement service layer business logic







  - [x] 6.1 Create ShipmentService


    - Implement create_shipment method that calculates financial fields (customs_duty, vat, insurance) and triggers workflow generation
    - Implement update_shipment method with audit logging
    - Implement update_eta method that validates edit count limit (max 3), increments counter, recalculates workflow target dates, and triggers alert evaluation
    - Implement get_shipment method with authorization check
    - Implement list_shipments method with filters and pagination
    - Implement import_shipments method for bulk import with validation and error collection
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5, 2.1, 2.2, 2.3, 2.5, 5.1, 5.5, 14.1, 14.2, 14.3, 14.4, 14.5_

  - [x] 6.2 Create WorkflowService


    - Implement generate_workflow_steps method that creates 34 steps with predefined step numbers, names, departments, offset_days, is_critical flags, and PPR/APR assignments
    - Implement recalculate_target_dates method that updates all step target_dates based on new ETA plus offset_days
    - Implement complete_step method that validates user is PPR or APR, validates actual_date is not future, updates step status, and logs audit entry
    - Implement get_user_assigned_steps method filtered by user's PPR/APR assignments
    - Implement get_critical_incomplete_steps method for alert evaluation
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5, 4.1, 4.2, 4.3, 4.4, 4.5, 5.2, 5.3_

  - [x] 6.3 Create AlertService


    - Implement evaluate_shipment_alerts method that calculates days_post_eta, identifies incomplete critical steps, and creates alerts based on day thresholds (Day 4=warning, Day 5=critical, Day 6=escalate to APR, Day 7=urgent to management)
    - Implement create_alert method with severity determination
    - Implement determine_recipients method that returns PPR for Day 5, PPR+APR+manager for Day 6, PPR+APR+manager+IA+senior_mgmt for Day 7
    - Implement queue_email_notification method that creates Celery task
    - Implement acknowledge_alert method with timestamp recording
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.4_

  - [x] 6.4 Create MetricsService







    - Implement get_average_clearance_time method that calculates average days from ETA to final step completion, grouped by department
    - Implement get_on_time_rate method that calculates percentage of shipments with all critical steps completed by Day 7
    - Implement calculate_demurrage_savings method that estimates cost avoidance based on on-time clearances (assume $100/day demurrage cost)
    - Implement get_delayed_steps_by_department method that returns steps with actual_date > target_date grouped by department
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


  - [x] 6.5 Create AuditService





    - Implement log_change method that creates audit log entry with entity details, field changes, user, IP address, and timestamp
    - Implement query_logs method with filters and pagination
    - Integrate audit logging into ShipmentService and WorkflowService for all data modifications
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

- [x] 7. Implement API endpoints





  - [x] 7.1 Create shipment endpoints


    - Implement POST /api/v1/shipments endpoint that validates input, calls ShipmentService.create_shipment, returns 201 with created shipment
    - Implement GET /api/v1/shipments endpoint with query parameters for filters and pagination
    - Implement GET /api/v1/shipments/{id} endpoint with authorization check
    - Implement PUT /api/v1/shipments/{id} endpoint with authorization check and audit logging
    - Implement PATCH /api/v1/shipments/{id}/eta endpoint restricted to Business Unit role
    - Implement DELETE /api/v1/shipments/{id} endpoint with soft delete
    - Implement POST /api/v1/shipments/import endpoint for bulk import
    - Add error handling for validation errors (400), not found (404), conflict (409)
    - _Requirements: 1.1, 2.1, 2.2, 2.3, 2.4, 13.1, 13.5, 14.1_


  - [x] 7.2 Create workflow step endpoints

    - Implement GET /api/v1/shipments/{id}/workflow endpoint to retrieve all steps for a shipment
    - Implement GET /api/v1/workflow-steps/{id} endpoint with authorization check
    - Implement PATCH /api/v1/workflow-steps/{id}/complete endpoint that validates user is PPR/APR and calls WorkflowService.complete_step
    - Implement GET /api/v1/workflow-steps/my-tasks endpoint filtered by current user's assignments
    - Add error handling for authorization errors (403)
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 9.3_

  - [x] 7.3 Create alert endpoints


    - Implement GET /api/v1/alerts endpoint filtered by current user or query parameters
    - Implement GET /api/v1/alerts/{id} endpoint with authorization check
    - Implement PATCH /api/v1/alerts/{id}/acknowledge endpoint
    - _Requirements: 6.1_


  - [x] 7.4 Create audit log endpoints

    - Implement GET /api/v1/audit-logs endpoint with filters for entity_type, entity_id, user_id, date_range and pagination
    - Implement GET /api/v1/audit-logs/shipment/{id} endpoint for shipment-specific audit trail
    - Restrict access to Admin and IA roles
    - _Requirements: 8.5_

  - [x] 7.5 Create metrics endpoints


    - Implement GET /api/v1/metrics/clearance-time endpoint with date_range and optional department filter
    - Implement GET /api/v1/metrics/on-time-rate endpoint with date_range filter
    - Implement GET /api/v1/metrics/demurrage-savings endpoint with date_range filter
    - Implement GET /api/v1/metrics/delayed-steps endpoint with date_range filter
    - Add response caching with 5-minute TTL
    - _Requirements: 10.1, 10.2, 10.3, 10.4, 10.5_


  - [x] 7.6 Create health check endpoints

    - Implement GET /api/v1/health endpoint that returns 200 with status, version, uptime
    - Implement GET /api/v1/health/db endpoint that tests database connection and returns 200 or 503
    - Implement GET /api/v1/health/redis endpoint that tests Redis connection and returns 200 or 503
    - Ensure health checks respond within 100ms
    - _Requirements: 15.1, 15.2, 15.3, 15.4, 15.5_


  - [x] 7.7 Implement global error handling

    - Create FastAPI exception handlers for validation errors, authentication errors, authorization errors, not found errors, conflict errors
    - Return consistent error response format with code, message, details
    - Log all errors with request context
    - _Requirements: 13.5_

- [x] 8. Implement Celery tasks for background processing





  - [x] 8.1 Set up Celery configuration


    - Configure Celery with Redis broker and result backend
    - Set up task routing and priorities
    - Configure task result expiration (24 hours)
    - Create Celery beat schedule for periodic tasks
    - _Requirements: 11.1, 11.4_

  - [x] 8.2 Create alert evaluation task


    - Implement scheduled task that runs daily at 08:00 UTC
    - Query active shipments with ETA in past 30 days
    - Call AlertService.evaluate_shipment_alerts for each shipment
    - Process shipments in batches of 100
    - Complete processing within 5 minutes for 1000 shipments
    - Log task execution status and duration
    - _Requirements: 11.1, 11.2, 11.3, 11.5_

  - [x] 8.3 Create email notification task


    - Implement task that runs every 5 minutes to process pending email notifications
    - Query alerts with email_sent=False
    - Send email via SMTP with alert details (shipment number, step name, target date, severity)
    - Retry failed sends up to 3 times with 5-minute intervals
    - Update alert email_sent status and timestamp
    - Log email delivery status
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5, 11.4_

- [x] 9. Implement concurrency and performance optimizations





  - [x] 9.1 Add database connection pooling


    - Configure SQLAlchemy connection pool with size=20, max_overflow=10
    - Implement connection health checks
    - _Requirements: 12.3_

  - [x] 9.2 Implement optimistic locking for shipment updates


    - Add version field to Shipment model
    - Check version on update and raise conflict error if mismatch
    - Return 409 status code for concurrent modification conflicts
    - _Requirements: 12.2, 12.4_

  - [x] 9.3 Add database transaction management


    - Use SQLAlchemy session transactions for multi-table operations
    - Implement rollback on errors
    - Ensure atomic updates for shipment + workflow step operations
    - _Requirements: 12.1, 12.3_

  - [x] 9.4 Optimize API response times


    - Use async/await for database queries
    - Implement eager loading for relationships to avoid N+1 queries
    - Add response compression (gzip)
    - Ensure 95% of requests complete within 500ms
    - _Requirements: 12.5_

  - [x] 9.5 Add pagination to list endpoints


    - Implement cursor-based or offset pagination with default page_size=50
    - Return total count and pagination metadata
    - _Requirements: 12.5_

- [x] 10. Create Docker deployment configuration




  - [x] 10.1 Create Dockerfile for FastAPI application


    - Use Python 3.11 slim base image
    - Install dependencies from requirements.txt
    - Set up non-root user for security
    - Expose port 8000
    - Configure health check command
    - _Requirements: 15.1_

  - [x] 10.2 Create docker-compose.yml for local development


    - Define services for api, worker, beat, db (PostgreSQL), redis
    - Configure environment variables
    - Set up volume mounts for data persistence
    - Configure service dependencies and health checks
    - _Requirements: 15.1_

  - [x] 10.3 Create environment configuration files


    - Create .env.example with all required environment variables
    - Document configuration options for DATABASE_URL, REDIS_URL, AUTH0 settings, SMTP settings
    - _Requirements: 9.1_

- [x] 11. Create database seed data and workflow step templates






  - [x] 11.1 Create workflow step template configuration

    - Define JSON or Python dict with 34 step definitions including step_number, step_name, description, department, offset_days, is_critical, default PPR/APR assignments
    - Include critical steps: Bayan submission (9.0, offset=0), Customs duty payment (10.0, offset=3), Bayan approval (11.0, offset=4), DO payment (13.0, offset=6), Goods collection (14.0, offset=7)
    - _Requirements: 3.1, 3.2, 3.3, 3.4, 3.5_

  - [x] 11.2 Create seed script for initial users


    - Create script to populate User table with default users for each department (Business Unit, Finance, C&C, Stores, IA)
    - Assign PPR and APR roles based on responsibility matrix from PRD
    - _Requirements: 9.2_

  - [x] 11.3 Create database migration for workflow step templates


    - Store workflow step templates in database table for easy modification
    - Create migration to populate initial templates
    - _Requirements: 3.1_

- [x] 12. Add logging and monitoring




  - [x] 12.1 Configure structured logging


    - Set up JSON logging format with timestamp, level, message, request_id, user_id, context
    - Log to stdout for container environments
    - Configure log levels per environment (DEBUG for dev, INFO for prod)
    - _Requirements: 11.5_

  - [x] 12.2 Add request ID tracking


    - Generate unique request ID for each API request
    - Include request ID in all log entries
    - Return request ID in response headers
    - _Requirements: 8.2_

  - [x] 12.3 Implement Prometheus metrics


    - Expose /metrics endpoint with Prometheus format
    - Track API request counts, latencies, error rates by endpoint
    - Track database connection pool usage
    - Track Celery task execution times and failure rates
    - Track alert evaluation and email sending success rates
    - _Requirements: 11.3, 11.5_

- [x] 13. Create API documentation




  - [x] 13.1 Configure OpenAPI/Swagger documentation


    - Enable FastAPI automatic OpenAPI schema generation
    - Add endpoint descriptions and examples to docstrings
    - Configure Swagger UI at /docs endpoint
    - Configure ReDoc at /redoc endpoint
    - _Requirements: 1.1_

  - [x] 13.2 Add request/response examples to schemas


    - Add Pydantic Config.schema_extra with example values for all schemas
    - Document validation rules and constraints
    - _Requirements: 13.1, 13.2, 13.3, 13.4_

- [x] 14. Write integration tests for critical flows





  - [x] 14.1 Test shipment creation and workflow generation


    - Create test that posts shipment, verifies 34 workflow steps are created with correct target dates
    - Verify financial fields are calculated correctly
    - _Requirements: 1.1, 1.3, 1.4, 1.5, 3.1, 3.2, 3.3_

  - [x] 14.2 Test ETA update and target date recalculation


    - Create test that updates ETA, verifies all workflow step target dates are recalculated
    - Verify ETA edit count is incremented
    - Verify edit limit enforcement (max 3 edits)
    - _Requirements: 2.2, 2.3, 5.1, 5.2, 5.3, 5.5_

  - [x] 14.3 Test workflow step completion with authorization



    - Create test that completes step as PPR user, verifies success
    - Create test that attempts completion as non-assigned user, verifies 403 error
    - Verify actual_date validation (not in future)
    - _Requirements: 4.1, 4.2, 4.3, 4.4_

  - [x] 14.4 Test alert evaluation and email sending


    - Create test shipment with ETA 5 days ago and incomplete critical step
    - Run alert evaluation task
    - Verify alert is created with correct severity and recipients
    - Verify email task is queued
    - _Requirements: 6.1, 6.2, 6.3, 6.4, 6.5, 7.1, 7.4_

  - [x] 14.5 Test audit logging


    - Create test that updates shipment field, verifies audit log entry is created with old/new values, user, timestamp
    - Query audit logs by entity and verify results
    - _Requirements: 8.1, 8.2, 8.3, 8.5_

  - [x] 14.6 Test metrics calculations


    - Create test shipments with various completion dates
    - Call metrics endpoints and verify calculations are correct
    - _Requirements: 10.1, 10.2, 10.3, 10.4_

- [x] 15. Create README and setup documentation






  - [x] 15.1 Write README.md

    - Document project overview and features
    - Provide setup instructions for local development
    - Document environment variables
    - Provide Docker Compose commands to start services
    - Document API endpoints and authentication
    - _Requirements: 1.1_


  - [x] 15.2 Create development setup guide

    - Document Python version requirement (3.11+)
    - Document how to install dependencies
    - Document how to run database migrations
    - Document how to run tests
    - Document how to start development server
    - _Requirements: 1.1_
