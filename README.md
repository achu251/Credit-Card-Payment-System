# Credit Card Payment System

Full-stack credit card payment system built with React, Tailwind CSS, Django, FastAPI, and MySQL.

## Features

- JWT authentication
- User registration and login
- Secure card management
- Card masking and last-four storage
- No CVV storage
- Payment simulation with PENDING, SUCCESS and FAILED states
- Idempotent payments
- Transaction history and filters
- CSV export
- Daily payment summary
- Admin dashboard and admin logs
- Swagger API documentation
- Automated tests
- Docker and Docker Compose

## Technology Stack

- Frontend: React, Vite, Tailwind CSS
- Backend: Django REST Framework and FastAPI
- Database: MySQL 8
- Authentication: JWT
- Testing: Django Test Framework, Pytest, Pytest-Cov
- DevOps: Docker, Docker Compose

## Services

- Frontend: http://127.0.0.1:5173
- Django: http://127.0.0.1:8000
- Django Swagger: http://127.0.0.1:8000/api/docs/
- FastAPI: http://127.0.0.1:8001
- FastAPI Swagger: http://127.0.0.1:8001/docs

## Docker

```text
Frontend -> Django / FastAPI -> MySQL
```

Run from the project root:

```cmd
docker compose build
docker compose up -d
docker compose ps
```

Stop containers:

```cmd
docker compose down
```

## Testing

Django:

```cmd
python manage.py test
```

FastAPI:

```cmd
python -m pytest tests/test_payments.py -v
```

Coverage:

```cmd
python -m pytest --cov=app --cov-report=term-missing -v
```

FastAPI payment tests currently achieve approximately 90% coverage.

## Security

- Passwords are hashed using Django authentication.
- APIs use JWT authentication.
- Card numbers are never stored in full.
- CVV is never stored.
- Users can access only their own cards and transactions.
- Admin APIs require administrator permissions.
- Sensitive values are stored in local `.env` files and excluded from Git.
- Payment requests use idempotency keys to prevent duplicate transactions.

## Postman

A complete Postman collection is available at:

`Postman/credit-card-payment-system.postman_collection.json`

It covers authentication, cards, payments, idempotency, transactions, filters, CSV export, daily summary, admin APIs, admin logs, logout, and token refresh.

## Project Status

Core development, testing, Docker setup, and GitHub publishing are completed.

Repository: https://github.com/achu251/Credit-Card-Payment-System
