# API Documentation

## 1. Overview

The Credit Card Payment System uses two backend services:

- Django REST Framework — authentication, cards, transactions and administration
- FastAPI — payment processing simulation

## 2. Service URLs

| Service | URL |
|---|---|
| Django API | http://127.0.0.1:8000 |
| Django Swagger | http://127.0.0.1:8000/api/docs/ |
| FastAPI | http://127.0.0.1:8001 |
| FastAPI Swagger | http://127.0.0.1:8001/docs |
| React Frontend | http://127.0.0.1:5173 |

## 3. Authentication

### Register

POST /api/auth/register/

Creates a new user account.

### Login

POST /api/auth/login/

Returns an access token and refresh token.

Protected APIs require:

Authorization: Bearer <access_token>

### Current User

GET /api/auth/me/

Returns the authenticated user's profile and administrator status.

### Logout

POST /api/auth/logout/

Blacklists the supplied refresh token.

## 4. Card APIs

### List My Cards

GET /api/cards/

Returns cards belonging to the authenticated user.

### Add Card

POST /api/cards/

Accepts card number, CVV, card type and expiry information.

The complete card number and CVV are never stored. Only the masked card number and last four digits are retained.

### Delete Card

DELETE /api/cards/{card_id}/

Deletes a card belonging to the authenticated user.

## 5. Payment API

FastAPI base path:

/api/payments/

### Make Payment

POST /api/payments/

Example request:

{
  "card_id": 1,
  "amount": 500.00,
  "idempotency_key": "payment-example-001"
}

Possible statuses:

- PENDING
- SUCCESS
- FAILED

### Get Payment

GET /api/payments/{transaction_id}

Returns a transaction belonging to the authenticated user.

## 6. Idempotency

Payment requests require an idempotency key.

Reusing the same key for the same user returns the existing transaction instead of creating a duplicate payment.

## 7. Transaction APIs

### Transaction History

GET /api/transactions/

Supported filters:

- status
- min_amount
- max_amount
- start_date
- end_date

Example:

/api/transactions/?status=SUCCESS&min_amount=100&max_amount=5000

### CSV Export

GET /api/transactions/export/

Downloads the authenticated user's transaction history as CSV.

### Daily Payment Summary

GET /api/transactions/summary/?date=2026-10-05

Returns payment statistics for the requested date.

## 8. Admin APIs

Admin APIs require a JWT belonging to a staff/superuser account.

### Users

GET /api/auth/admin/users/

### Cards

GET /api/cards/admin/all/

### Transactions

GET /api/transactions/admin/all/

### Admin Dashboard

GET /api/transactions/admin-dashboard/

### Admin Logs

GET /api/admin-logs/

## 9. Error Responses

| Status | Meaning |
|---|---|
| 200 | Successful request |
| 201 | Resource created |
| 400 | Invalid request data |
| 401 | Authentication required or invalid token |
| 403 | Insufficient permissions |
| 404 | Resource not found |
| 500 | Server error |

## 10. API Security

- JWT authentication protects private APIs.
- Users can access only their own cards and transactions.
- Admin APIs require administrator permissions.
- Passwords are hashed by Django.
- Full card numbers are never stored.
- CVV is never stored.
- Payment requests use idempotency keys.
- Database credentials are stored in .env files and excluded from Git.

## 11. Interactive Documentation

Detailed interactive API documentation is available through Swagger:

- Django: http://127.0.0.1:8000/api/docs/
- FastAPI: http://127.0.0.1:8001/docs

## 12. Postman

A complete Postman collection is available at:

Postman/credit-card-payment-system.postman_collection.json

It covers authentication, cards, payments, idempotency, transactions, filters, CSV export, daily summary and administrator APIs.