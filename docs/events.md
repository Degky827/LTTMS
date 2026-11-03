# LTTMS v2 — Domain Events

## Event Structure

All events follow this structure:

```json
{
  "eventId": "uuid-v4",
  "eventType": "BookingConfirmed",
  "timestamp": "2026-09-09T12:00:00.000Z",
  "version": 1,
  "source": "booking-payment-service",
  "correlationId": "uuid-v4",
  "data": {}
}
```

## Auth Events

| Event | Source | Data |
|-------|--------|------|
| UserRegistered | auth-service | userId, email, name, role |
| UserVerified | auth-service | userId, email |

## Tourism Events

| Event | Source | Data |
|-------|--------|------|
| VendorRegistered | tourism-service | vendorId, userId, businessName |
| VendorApproved | tourism-service | vendorId, userId, email |
| VendorRejected | tourism-service | vendorId, userId, reason |
| ServiceCreated | tourism-service | serviceId, vendorId, title, category |
| ReviewCreated | tourism-service | reviewId, serviceId, userId, rating |

## Booking Events

| Event | Source | Data |
|-------|--------|------|
| BookingCreated | booking-payment-service | bookingId, userId, serviceId, date, guests |
| BookingConfirmed | booking-payment-service | bookingId, userId, serviceId |
| BookingCancelled | booking-payment-service | bookingId, userId, serviceId |

## Payment Events

| Event | Source | Data |
|-------|--------|------|
| PaymentInitiated | booking-payment-service | bookingId, amount, method, txRef |
| PaymentSuccessful | booking-payment-service | bookingId, amount, txRef |
| PaymentFailed | booking-payment-service | bookingId, reason |
| RefundRequested | booking-payment-service | bookingId, reason |
| RefundCompleted | booking-payment-service | bookingId |
| CommissionCalculated | booking-payment-service | bookingId, vendorId, amount, rate |

## RabbitMQ Exchanges

| Exchange | Type | Purpose |
|----------|------|---------|
| domain_events | topic | All domain events |
| notification_events | topic | Notification-specific events |

## Queues

| Queue | Binding | Purpose |
|-------|---------|---------|
| auth.user.registered | auth.* | User registration events |
| tourism.vendor.registered | tourism.vendor.* | Vendor events |
| tourism.service.created | tourism.service.* | Service events |
| booking.created | booking.* | Booking events |
| payment.successful | payment.* | Payment events |
| notification.requested | notification.* | Notification requests |
