# Functional Requirements - Pradeep Opticals E-commerce Platform

## Overview

This document outlines the functional requirements for the Pradeep Opticals e-commerce platform, defining the capabilities and features for three distinct user roles: Customer, Staff, and Admin.

## User Roles

The system supports three types of users:

1. **Customer** - End users who browse and purchase eyewear products
2. **Staff** - Employees who assist with operations and customer service
3. **Admin** - Administrators who manage the entire platform and business operations

---

## Customer Functional Requirements

### FR1: User Authentication
- **Requirement**: Customer can register and log in to the system
- **Description**: Customers must be able to create accounts and authenticate to access personalized features
- **Priority**: High

### FR2: Profile Management
- **Requirement**: Customer can update profile and reset password (reset by Admin)
- **Description**: Customers can manage their personal information and profile settings. Password resets are handled by administrators
- **Priority**: High

### FR3: Product Browsing
- **Requirement**: Customer can browse products (spectacles, frames, lenses)
- **Description**: Customers can view and search through the product catalog with filtering and sorting capabilities
- **Priority**: High

### FR4: Shopping Cart and Checkout
- **Requirement**: Customer can add items to cart and proceed to checkout
- **Description**: Standard e-commerce functionality for adding products to cart and completing purchases
- **Priority**: High

### FR5: Prescription Upload
- **Requirement**: Customer can upload prescriptions during order or quotation request
- **Description**: Customers can upload prescription files (PDF/image) when placing orders or requesting quotations. Staff/Admin can reply with price quotations
- **Priority**: Medium
- **Technical Notes**: 
  - Supports PDF and image file formats
  - One prescription per order/quotation request
  - Files stored securely for staff/admin review

### FR6: Quotation Request System
- **Requirement**: Separate quotation flow from regular checkout
- **Description**: Customers can request custom quotations with:
  - Prescription image upload (one at a time)
  - Lens details input
  - Frame details input
  - Price display for selected options
- **Priority**: Medium
- **Technical Notes**: 
  - Independent flow from standard e-commerce checkout
  - Staff can modify quotations before conversion to orders
  - Staff member actions are logged

### FR7: Appointment Booking System
- **Requirement**: Customer can book appointments with specific constraints
- **Description**: 
  - 30-minute slots between 9 AM–5 PM (except Sundays)
  - Bookable for the entire month in advance
  - One appointment per customer until current appointment is completed
  - Customers can change to other available slots
- **Priority**: Medium
- **Technical Notes**:
  - Slot availability managed by admin settings
  - Prevents double-booking
  - Allows rescheduling to available slots

### FR8: Appointment Management
- **Requirement**: Customer can view appointment status and history
- **Description**: Customers can track their appointment status (pending/confirmed) and view past appointments
- **Priority**: Medium

### FR9: Order History
- **Requirement**: Customer can view past and ongoing orders
- **Description**: Customers can access their complete order history with status tracking
- **Priority**: High

### FR10: Notification System
- **Requirement**: Customer receives notifications for appointments and order updates
- **Description**: In-app notification system including:
  - Notification panel
  - Toast notifications
  - Simple prescription tracking (no separate management system)
- **Priority**: Medium
- **Technical Notes**: In-app notifications only (no email services)

---

## Staff Functional Requirements

### FR11: Inventory Management
- **Requirement**: Staff can manage inventory (add, update, delete items)
- **Description**: Complete inventory management including:
  - Product images
  - Descriptions
  - Pricing
  - Stock quantities
- **Priority**: High
- **Technical Notes**: No approval workflow required - direct changes

### FR12: Appointment Management
- **Requirement**: Staff can view and manage appointments (approve/reject)
- **Description**: Staff can:
  - View appointment details and reasons
  - Approve or reject appointments
  - Reschedule appointments
  - Receive notifications for appointment updates
- **Priority**: High
- **Technical Notes**: Notifications sent to both staff and customers

### FR13: Quotation Management
- **Requirement**: Staff can manage quotation requests and convert them to orders
- **Description**: Staff can:
  - Review customer quotation requests
  - Modify quotations before conversion
  - Convert quotations to orders (creates new order automatically)
  - Notify customers of order creation
- **Priority**: Medium
- **Technical Notes**: 
  - Staff member actions are logged
  - Automatic order creation upon conversion

### FR14: Order Management
- **Requirement**: Staff can create and update customer orders
- **Description**: Staff can:
  - Create orders for walk-in customers
  - Update existing online customer orders
  - Apply discounts and special pricing
- **Priority**: High

### FR15: Order Status Management
- **Requirement**: Staff can view and update order statuses
- **Description**: Staff can track and update the status of all orders in the system
- **Priority**: High

---

## Admin Functional Requirements

### FR17: Staff Account Management
- **Requirement**: Admin can create, update, and delete staff accounts
- **Description**: Admins can:
  - Create new staff accounts
  - Update existing staff information
  - Delete staff accounts
  - Disable staff accounts
- **Priority**: High
- **Technical Notes**: No complex permission levels required

### FR18: Customer Account Management
- **Requirement**: Admin can manage customer accounts and view user activity
- **Description**: Admins can:
  - View customer accounts
  - Manage customer information
  - Monitor user activity
- **Priority**: Medium

### FR19: Shop Settings Configuration
- **Requirement**: Admin can configure shop settings (appointment duration, working hours)
- **Description**: Admins can manage:
  - Appointment duration settings
  - Working hours configuration
  - General appointment availability
- **Priority**: Medium
- **Technical Notes**: General appointment settings only

### FR20: Master Data Management
- **Requirement**: Admin can manage master data (categories, units, system values)
- **Description**: Admins can manage:
  - Product categories
  - Measurement units
  - System configuration values
  - Basic product management (frames, lenses, etc.)
- **Priority**: Medium

### FR21: Reports and Analytics (ON HOLD)
- **Requirement**: ~~Admin can view reports and analytics (sales, inventory, appointments)~~
- **Status**: On Hold - Not needed for initial implementation
- **Priority**: Low

### FR22: Report Downloads (ON HOLD)
- **Requirement**: ~~Admin can download reports and stats~~
- **Status**: On Hold - Not needed for initial implementation
- **Priority**: Low

---

## Security and Access Control

### Customer Data Protection
- Staff cannot access customer personal data (FR16 - REMOVED)
- Customer prescription and contact information is protected
- Only admins can access customer account management

### Staff Activity Logging
- Staff actions are logged for quotation modifications
- Staff member details are tracked for audit purposes
- No complex permission systems required

### Authentication and Authorization
- JWT-based authentication for all user types
- Role-based access control (Customer, Staff, Admin)
- Password reset functionality handled by admins

---

## Technical Implementation Notes

### File Upload Requirements
- Prescription uploads support PDF and image formats
- File size limits and validation required
- Secure storage for sensitive documents

### Notification System
- In-app notifications only (no email services)
- Toast notifications for immediate feedback
- Notification panel for message history

### Appointment System
- 30-minute slot management
- Monthly advance booking capability
- Slot availability validation
- Rescheduling functionality

### Order Management
- Support for both online and walk-in customers
- Discount and special pricing capabilities
- Order status tracking and updates

---

## Priority Matrix

### High Priority (Must Have)
- FR1, FR2, FR3, FR4, FR9 (Customer core features)
- FR11, FR12, FR14, FR15 (Staff core operations)
- FR17 (Admin account management)

### Medium Priority (Should Have)
- FR5, FR6, FR7, FR8, FR10 (Customer advanced features)
- FR13 (Staff quotation management)
- FR18, FR19, FR20 (Admin management features)

### Low Priority (Could Have)
- FR21, FR22 (Reports and analytics - On Hold)

---

## Future Considerations

### Phase 2 Features (Not in Initial Implementation)
- Advanced reporting and analytics
- Email notification services
- Complex permission systems
- Advanced prescription management
- Customer data access for staff

### Scalability Considerations
- Microservices architecture ready
- Containerized deployment
- Database optimization for high traffic
- Caching strategies for performance

---

*This document serves as the definitive guide for implementing the Pradeep Opticals e-commerce platform functionality. All features should be implemented according to these specifications unless explicitly modified through change requests.*
