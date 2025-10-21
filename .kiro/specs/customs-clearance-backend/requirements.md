# Requirements Document

## Introduction

The Customs Clearance Automation System backend provides the core business logic, data management, and API services to digitize the manual Excel-based customs clearance workflow. The system aims to eliminate demurrage costs by ensuring vehicles are cleared within 7 days of port arrival (ETA) through automated tracking, role-based accountability, and real-time alerts.

## Glossary

- **System**: The Customs Clearance Automation System backend API
- **ETA**: Estimated Time of Arrival - the anchor date for all KPI calculations
- **Demurrage**: Storage fees charged when goods remain at port beyond the free period (starts Day 8 after ETA)
- **Workflow Step**: One of 34 sequential process steps required for customs clearance
- **PPR**: Primary Person Responsible - the main user assigned to complete a workflow step
- **APR**: Alternate Person Responsible - the backup user for a workflow step
- **Target Date**: System-calculated deadline for a workflow step based on ETA plus offset
- **Actual Date**: User-logged completion date for a workflow step
- **Business Unit**: Department responsible for pre-clearance activities (e.g., TBLE)
- **C&C**: Customs and Clearance department
- **Bayan**: Customs declaration document
- **DO**: Delivery Order
- **LC**: Letter of Credit
- **DAN**: Document Against Negotiation

## Requirements

### Requirement 1

**User Story:** As a system administrator, I want to manage shipment records with all required fields, so that the clearance process can be tracked from creation to completion

#### Acceptance Criteria

1. THE System SHALL store shipment records containing Shipment Number, Principal, Brand, LC Number, Invoice Amount, ETA, and related financial fields
2. THE System SHALL validate that Invoice Amount is a positive decimal value
3. THE System SHALL auto-calculate Customs Duty as 5% of Invoice Amount
4. THE System SHALL auto-calculate VAT as 5% of Invoice Amount
5. THE System SHALL auto-calculate Insurance as 1% of Invoice Amount

### Requirement 2

**User Story:** As a Business Unit user, I want to create and update shipment ETA information, so that the system can calculate accurate clearance deadlines

#### Acceptance Criteria

1. WHEN a Business Unit user creates a shipment, THE System SHALL accept ETA as a required date field
2. WHEN a Business Unit user updates ETA, THE System SHALL increment an edit counter for that shipment
3. IF ETA edit count reaches 3, THEN THE System SHALL prevent further ETA modifications
4. THE System SHALL restrict ETA modification permissions to Business Unit role only
5. THE System SHALL log all ETA changes with timestamp and user identifier

### Requirement 3

**User Story:** As a system, I want to automatically generate 34 workflow steps for each shipment, so that all clearance activities are tracked consistently

#### Acceptance Criteria

1. WHEN a shipment is created, THE System SHALL generate 34 workflow step records
2. THE System SHALL assign each workflow step a sequential step number from 1.0 to 34.0
3. THE System SHALL calculate Target Date for each step as ETA plus predefined offset days
4. THE System SHALL assign responsible department to each step based on predefined mapping
5. THE System SHALL assign PPR and APR users to each step based on department and predefined responsibility matrix

### Requirement 4

**User Story:** As a department user, I want to log completion dates for my assigned workflow steps, so that progress can be tracked

#### Acceptance Criteria

1. WHEN a user logs an Actual Date for their assigned step, THE System SHALL accept the date value
2. THE System SHALL validate that Actual Date is not in the future
3. THE System SHALL restrict step updates to users with PPR or APR role for that step
4. THE System SHALL update step status to completed when Actual Date is recorded
5. THE System SHALL log the user identifier and timestamp of the completion action

### Requirement 5

**User Story:** As a system, I want to recalculate all Target Dates when ETA changes, so that deadlines remain accurate

#### Acceptance Criteria

1. WHEN ETA is updated for a shipment, THE System SHALL recalculate Target Date for all 34 workflow steps
2. THE System SHALL apply the original offset days to the new ETA for each step
3. THE System SHALL preserve existing Actual Date values during recalculation
4. THE System SHALL complete recalculation within 2 seconds for a single shipment
5. THE System SHALL trigger alert evaluation after Target Date recalculation

### Requirement 6

**User Story:** As a C&C user, I want to receive alerts when critical steps are at risk, so that I can take action before demurrage occurs

#### Acceptance Criteria

1. WHEN current date is 3 days before Day 7 post-ETA, THE System SHALL evaluate incomplete critical steps
2. IF a critical step (Bayan approval, DO payment) is incomplete on Day 4 post-ETA, THEN THE System SHALL create an alert for the PPR
3. IF a critical step remains incomplete on Day 5 post-ETA, THEN THE System SHALL create an alert for the PPR
4. IF a critical step remains incomplete on Day 6 post-ETA, THEN THE System SHALL create an alert for the APR and department head
5. IF a critical step remains incomplete on Day 7 post-ETA, THEN THE System SHALL create an alert for IA and senior management

### Requirement 7

**User Story:** As a system, I want to send email notifications for alerts, so that users are notified outside the application

#### Acceptance Criteria

1. WHEN an alert is created, THE System SHALL queue an email notification task
2. THE System SHALL include alert details (shipment number, step name, target date) in email body
3. THE System SHALL send email to the recipient's registered email address
4. THE System SHALL retry failed email sends up to 3 times with 5-minute intervals
5. THE System SHALL log email delivery status for each alert

### Requirement 8

**User Story:** As an auditor, I want to view complete history of all data changes, so that accountability can be verified

#### Acceptance Criteria

1. WHEN any shipment field is modified, THE System SHALL create an audit log entry
2. WHEN any workflow step is updated, THE System SHALL create an audit log entry
3. THE System SHALL record field name, old value, new value, user identifier, timestamp, and IP address in audit logs
4. THE System SHALL retain audit logs for minimum 7 years
5. THE System SHALL provide API endpoint to query audit logs by shipment, user, or date range

### Requirement 9

**User Story:** As a Finance user, I want to access only Finance-related workflow steps, so that I can focus on my responsibilities

#### Acceptance Criteria

1. THE System SHALL authenticate users via Auth0 integration
2. THE System SHALL map user email domain to department role (Business Unit, Finance, C&C, Stores, IA)
3. WHEN a Finance user requests workflow steps, THE System SHALL return only steps assigned to Finance department
4. WHEN an IA user requests workflow steps, THE System SHALL return all steps with read-only access
5. THE System SHALL reject API requests from unauthenticated users with 401 status code

### Requirement 10

**User Story:** As a management user, I want to retrieve aggregated clearance metrics, so that I can monitor departmental performance

#### Acceptance Criteria

1. THE System SHALL provide API endpoint to calculate average clearance cycle time by department
2. THE System SHALL provide API endpoint to count shipments cleared within 7 days versus total shipments
3. THE System SHALL provide API endpoint to calculate demurrage cost avoidance based on on-time clearances
4. THE System SHALL provide API endpoint to list delayed steps grouped by responsible department
5. THE System SHALL compute metrics for user-specified date range with maximum range of 1 year

### Requirement 11

**User Story:** As a system, I want to process scheduled tasks daily, so that alerts are evaluated and sent automatically

#### Acceptance Criteria

1. THE System SHALL execute alert evaluation task daily at 08:00 UTC
2. THE System SHALL process all active shipments with ETA within past 30 days during evaluation
3. THE System SHALL complete alert evaluation for 1000 shipments within 5 minutes
4. THE System SHALL execute email sending task every 5 minutes to process queued notifications
5. THE System SHALL log task execution status and duration for monitoring

### Requirement 12

**User Story:** As a developer, I want the system to handle concurrent requests safely, so that data integrity is maintained

#### Acceptance Criteria

1. WHEN multiple users update different workflow steps for same shipment concurrently, THE System SHALL process all updates without data loss
2. WHEN multiple users attempt to update same workflow step concurrently, THE System SHALL process first request and reject subsequent requests with 409 status code
3. THE System SHALL use database transactions to ensure atomic updates across related tables
4. THE System SHALL implement optimistic locking for shipment ETA updates
5. THE System SHALL complete 95% of API requests within 500 milliseconds under normal load

### Requirement 13

**User Story:** As a system operator, I want the system to validate all input data, so that data quality is maintained

#### Acceptance Criteria

1. WHEN API receives shipment creation request, THE System SHALL validate all required fields are present
2. THE System SHALL validate date fields are in ISO 8601 format
3. THE System SHALL validate numeric fields are within acceptable ranges (e.g., Invoice Amount > 0)
4. THE System SHALL validate enum fields match predefined values (e.g., department names)
5. IF validation fails, THEN THE System SHALL return 400 status code with detailed error messages

### Requirement 14

**User Story:** As a data migration specialist, I want to import existing shipment data from Excel, so that historical records are preserved

#### Acceptance Criteria

1. THE System SHALL provide API endpoint to accept shipment data in JSON format
2. THE System SHALL validate imported data against same rules as manual entry
3. THE System SHALL map Excel column names to system field names based on predefined mapping
4. THE System SHALL generate workflow steps for imported shipments based on ETA
5. THE System SHALL return import summary with count of successful and failed records

### Requirement 15

**User Story:** As a system, I want to expose health check endpoints, so that monitoring systems can verify service availability

#### Acceptance Criteria

1. THE System SHALL provide /health endpoint returning 200 status when service is operational
2. THE System SHALL provide /health/db endpoint returning 200 status when database connection is active
3. THE System SHALL provide /health/redis endpoint returning 200 status when Redis connection is active
4. THE System SHALL respond to health check requests within 100 milliseconds
5. THE System SHALL include service version and uptime in health check response body
