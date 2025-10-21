# **Product Requirements Document: Customs Clearance Automation System**

## **1. Objective**
Digitize the manual Excel-based customs clearance workflow to **eliminate demurrage costs** by ensuring vehicles are cleared within **7 days of port arrival (ETA)**. The system will enforce **role-based accountability**, provide **real-time visibility**, and automate **alerts and escalations** when deadlines are at risk.

---

## **2. Core Business Rules (from SOP & Excel Tracker)**

### **Key Timeline Constraints**
- **ETA (Estimated Time of Arrival)** is the anchor date for all KPIs.
- **Demurrage starts on Day 8** after ETA.
- **Critical clearance steps must be completed by Day 7**, including:
  - Bayan submission (Step 9.0 – on ETA day)
  - Customs duty payment (Step 10.0 – by Day 3)
  - Bayan approval (Step 11.0 – by Day 4)
  - DO payment & goods collection (Steps 13.0–14.0 – by Day 6–7)

### **Responsibility Assignment**
- Each of the **34 process steps** has a **Responsible Department** (Business Unit, Finance, C&C, Stores).
- Each step is assigned to a **Primary Person Responsible (PPR)** and **Alternate (APR)** (e.g., Salim for C&C, Bala for Finance, Rajendran for TBLE).
- Only the **Business Unit** can update the **ETA** (with a max of 3 edits per SOP).

### **Data Validation Rules**
- Actual completion dates **cannot be in the future**.
- Target (KPI) dates are **system-calculated** as `ETA + [offset]` and **cannot be edited**.
- Fields like **Customs Duty (5%)**, **VAT (5%)**, and **Insurance (1%)** are auto-calculated from invoice amount.

---

## **3. System Features**

### **3.1 Shipment Lifecycle Management**
- **Create/Edit Shipment**: Capture all fields from AHC-TBLE sheet (Shipment #, Principal, Brand, LC No., Invoice Amount, ETA, etc.).
- **Dynamic Timeline Engine**: Auto-generate **34-step workflow** with **Target Dates** based on ETA and SOP offsets (e.g., Step 9.0 = ETA + 0, Step 14.0 = ETA + 7).
- **Actual Date Tracking**: Allow PPR/APR to log completion dates for their assigned steps.

### **3.2 Role-Based Access Control (from Responsibility List)**
| Role | Permissions | Users (PPR/APR) |
|------|-------------|-----------------|
| **Business Unit (TBLE)** | Edit pre-clearance fields (ETA, Principal, Brand, Invoice details) | Rajendran P. / Raj Nair |
| **Finance** | Edit LC, DAN, fund transfer, and bank doc steps | Bala / Mario |
| **C&C** | Edit Bayan, customs payment, DO, and port collection steps | Salim / Moataz |
| **Stores** | Edit post-clearance steps (warehouse receipt, defect reporting) | Varies by BU |
| **IA / Management** | Read-only access to all data | Simon Turner, Rajeev Sharma |

### **3.3 Automated Alerts & Escalations**
- **Pre-Demurrage Alerts**: System flags shipments **3 days before Day 7** (i.e., on Day 4 post-ETA) if critical steps (e.g., Bayan approval, DO payment) are incomplete.
- **Escalation Workflow**:
  1. **Day 5**: Alert PPR (e.g., Salim) via email/in-app notification.
  2. **Day 6**: Escalate to APR (e.g., Moataz) and department head.
  3. **Day 7**: Notify IA (Simon Turner) and senior management (Rajeev Sharma).

### **3.4 Audit Trail & Accountability**
- Log all actions: **Who** updated **what field**, **when**, and **from which IP/device**.
- Immutable history for ETA changes (max 3 edits enforced).
- Dashboard view showing **delays by department** (e.g., "Finance delayed Step 13.0 for 5 shipments").

### **3.5 Dashboards & Reporting**
- **Business Unit Dashboard**: ETA health, pending pre-clearance tasks, demurrage risk heatmap.
- **Finance Dashboard**: LC status, fund requirements, DAN signing delays.
- **C&C Dashboard**: Bayan submission status, customs payment deadlines, port collection schedule.
- **Management Dashboard**: End-to-end clearance cycle time, demurrage cost avoidance, departmental SLA compliance.

---

## **4. Technical Implementation (Aligned with Your Stack)**

| Component | Implementation Details |
|----------|------------------------|
| **Frontend** | Next.js + Ant Design. Role-based dashboards with real-time ETA countdowns and alert banners. |
| **Backend** | FastAPI with SQLAlchemy ORM. RESTful endpoints for shipment CRUD, workflow engine, and audit logging. |
| **Database** | PostgreSQL. Tables: `Shipments`, `WorkflowSteps`, `Users`, `AuditLogs`. |
| **Task Queue** | Celery + Redis. Handle email alerts, ETA-based deadline checks (scheduled daily). |
| **Auth** | Auth0. Map roles from Responsibility List (e.g., `finance@alhashargroup.com` → Finance role). |
| **Deployment** | Dockerized app on GCP (Cloud Run or GKE). PostgreSQL on Cloud SQL. Redis on Memorystore. |

---

## **5. Data Migration Plan**
1. **Extract**: Parse AHC-TBLE.xls to migrate active shipments (ETA within last 30 days or future).
2. **Transform**: Map Excel columns to system fields (e.g., "Inv Amount" → `invoice_amount_omr`).
3. **Load**: Seed PostgreSQL with shipments, pre-fill Target Dates using ETA offsets from SOP.
4. **Validate**: Reconcile 10 sample shipments to ensure KPI dates match Excel logic.

---

## **6. Success Metrics**
- **Demurrage costs reduced by ≥90%** within 6 months of launch.
- **100% of shipments cleared by Day 7** post-ETA.
- **<24-hour resolution** for escalated alerts.
