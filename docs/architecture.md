# LTTMS v2 — Architecture

## Overview

LTTMS v2 is a microservices-based tourism marketplace platform built around Lake Tana, Ethiopia.

## Architecture Diagram

```
                         ┌───────────────────────────────┐
                         │          3 PORTALS             │
                         │                               │
                         │ Tourist │ Vendor │ Admin     │
                         └───────────────┬───────────────┘
                                         │
                                         ▼
                         ┌───────────────────────────────┐
                         │          API GATEWAY           │
                         │                               │
                         │ Routing / JWT / RBAC          │
                         │ Rate Limiting / CORS          │
                         │ Request Validation            │
                         │ Logging / Correlation ID      │
                         └───────────────┬───────────────┘
                                         │
                ┌────────────────────────┼────────────────────────┐
                │                        │                        │
                ▼                        ▼                        ▼
       ┌────────────────┐      ┌────────────────┐      ┌────────────────────┐
       │ AUTH SERVICE   │      │ TOURISM        │      │ BOOKING / PAYMENT  │
       │                │      │ SERVICE        │      │ SERVICE             │
       │ Users          │      │ Vendors        │      │ Bookings           │
       │ Authentication │      │ Services       │      │ Payments           │
       │ JWT / RBAC     │      │ Categories     │      │ Refunds            │
       │ 2FA            │      │ Reviews        │      │ Commissions        │
       └───────┬────────┘      └───────┬────────┘      └──────────┬─────────┘
               │                       │                          │
               ▼                       ▼                          ▼
          ┌──────────┐            ┌──────────┐              ┌──────────────┐
          │ auth_db  │            │tourism_db│              │transaction_db│
          └──────────┘            └──────────┘              └──────────────┘

                └────────────────────────┬────────────────────────┘
                                         │
                                         ▼
                              ┌─────────────────────┐
                              │      RABBITMQ        │
                              │                     │
                              │ Domain Events       │
                              │ Async Messaging     │
                              └──────────┬──────────┘
                                         │
                         ┌───────────────┼────────────────┐
                         │               │                │
                         ▼               ▼                ▼
                   Consumers       Realtime Layer   Future Services
                         │               │
                         │               ▼
                         │          ┌───────────┐
                         │          │ Socket.IO │
                         │          └─────┬─────┘
                         │                │
                         │       ┌────────┼────────┐
                         │       ▼        ▼        ▼
                         │    Tourist   Vendor    Admin
                         │
                         ▼
                 Notification Service

                              ┌─────────────┐
                              │    REDIS    │
                              │             │
                              │ Cache       │
                              │ Rate Limit  │
                              │ Sessions    │
                              └─────────────┘
```

## Services

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| API Gateway | 3000 | - | Centralized entry point |
| Auth Service | 3001 | auth_db | Authentication & user management |
| Tourism Service | 3002 | tourism_db | Vendors, services, reviews |
| Booking/Payment Service | 3003 | transaction_db | Bookings, payments, commissions |
| Notification Service | 3004 | - | Email & in-app notifications |
| Frontend | 3000 (nginx) | - | Next.js application |

## Infrastructure

| Component | Port | Purpose |
|-----------|------|---------|
| PostgreSQL | 5432 | Primary database (3 databases) |
| Redis | 6379 | Caching, rate limiting |
| RabbitMQ | 5672 | Event-driven messaging |
| Nginx | 80 | Reverse proxy, load balancer |

## Event-Driven Architecture

All inter-service communication uses RabbitMQ for asynchronous operations:

- **UserRegistered** → auth-service → notification-service
- **VendorApproved** → tourism-service → notification-service
- **BookingCreated** → booking-payment-service → tourism-service, notification-service
- **PaymentSuccessful** → booking-payment-service → notification-service, realtime
- **BookingConfirmed** → booking-payment-service → notification-service, realtime

## Development

```bash
# Install all dependencies
npm install

# Start with Docker
docker compose up -d

# Start development
npm run dev
```

## Environment Variables

See `.env.example` for required configuration.
