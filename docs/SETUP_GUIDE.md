\# Setup Guide



\## 1. Project Overview



The Credit Card Payment System is a full-stack application built using React, Django REST Framework, FastAPI and MySQL.



Architecture:



React Frontend

&#x20;       |

&#x20;       +---- Django REST API

&#x20;       |       |

&#x20;       |       +---- Authentication

&#x20;       |       +---- Card Management

&#x20;       |       +---- Transactions

&#x20;       |       +---- Admin APIs

&#x20;       |

&#x20;       +---- FastAPI

&#x20;               |

&#x20;               +---- Payment Simulation

&#x20;               +---- PENDING / SUCCESS / FAILED



Both backend services use the same MySQL database.



\---



\## 2. Prerequisites



Install the following:



\- Python 3.14+

\- Node.js 22+

\- npm

\- MySQL 8+

\- Git

\- Docker Desktop

\- Docker Compose



\---



\## 3. Clone the Repository



Clone the project from GitHub and enter the project directory.



```bash

git clone <repository-url>

cd Credit-Card-Payment-System

4. Database Setup

Create a MySQL database:
CREATE DATABASE credit_card_db;

Create a dedicated MySQL user and grant access to the database.

The application uses:

Host: 127.0.0.1
Port: 3307
Database: credit_card_db

5. Database Restore

A database dump is available at:

Database/credit_card_db_dump.sql

Restore it using:

mysql -h 127.0.0.1 -P 3307 -u credit_app -p credit_card_db < Database/credit_card_db_dump.sql

The database schema documentation is available at:

Database/DATABASE_SCHEMA.md
6. Django Backend Setup

Navigate to:

Backend/django_backend

Create and activate a virtual environment:

python -m venv venv
source venv/Scripts/activate

Install dependencies:

pip install -r requirements.txt

Create a .env file with:

DB_NAME=credit_card_db
DB_USER=credit_app
DB_PASSWORD=<your-password>
DB_HOST=127.0.0.1
DB_PORT=3307

Run migrations:

python manage.py migrate

Run the Django server:

python manage.py runserver

Django runs at:

http://127.0.0.1:8000

Swagger documentation:

http://127.0.0.1:8000/api/docs/
7. FastAPI Backend Setup

Navigate to:

fastapi_backend

Create and activate a virtual environment:

python -m venv venv
source venv/Scripts/activate

Install dependencies:

pip install -r requirements.txt

Create a .env file with:

DB_NAME=credit_card_db
DB_USER=credit_app
DB_PASSWORD=<your-password>
DB_HOST=127.0.0.1
DB_PORT=3307
JWT_SECRET_KEY=<same-secret-used-by-django>

Run FastAPI:

uvicorn app.main:app --reload --port 8001

FastAPI runs at:

http://127.0.0.1:8001

Swagger documentation:

http://127.0.0.1:8001/docs
8. Frontend Setup

Navigate to:

Frontend

Install dependencies:

npm install

Start the development server:

npm run dev

Frontend runs at:

http://127.0.0.1:5173
9. Running with Docker

Make sure Docker Desktop is running.

From the project root:

docker compose build

Start all services:

docker compose up -d

Check containers:

docker compose ps

The services are available at:

Frontend: http://127.0.0.1:5173
Django:   http://127.0.0.1:8000
FastAPI:  http://127.0.0.1:8001

Stop the containers:

docker compose down

The current Docker configuration connects the backend containers to the existing MySQL server running on the Windows host.

10. Authentication

Register a user through:

POST /api/auth/register/

Login through:

POST /api/auth/login/

The login response provides:

Access token
Refresh token

Protected APIs require:

Authorization: Bearer <access_token>
11. Testing

Run Django tests:

python manage.py test

Run FastAPI tests:

python -m pytest tests/test_payments.py -v

Run FastAPI coverage:

python -m pytest --cov=app --cov-report=term-missing -v

The FastAPI payment service currently achieves approximately 90% test coverage.

12. Postman

The complete Postman collection is available at:

Postman/credit-card-payment-system.postman_collection.json

The collection covers:

Registration
Login
Current user
Card management
Payments
Payment idempotency
Transaction history
Transaction filters
CSV export
Daily summary
Admin APIs
Admin logs
Logout
Token refresh
13. API Documentation

Detailed API documentation is available at:

docs/API_DOCUMENTATION.md

Interactive Swagger documentation:

Django:  http://127.0.0.1:8000/api/docs/
FastAPI: http://127.0.0.1:8001/docs
14. Security

The application follows these security practices:

Passwords are hashed using Django authentication.
JWT authentication protects private APIs.
Full card numbers are never stored.
CVV values are never stored.
Only masked card numbers and last four digits are retained.
Users can access only their own cards and transactions.
Admin APIs require administrator permissions.
Payment requests use idempotency keys.
Database credentials are stored in .env files.
.env files are excluded from Git.
15. Project Structure
Credit-Card-Payment-System/
│
├── Backend/
│   └── django_backend/
│
├── fastapi_backend/
│
├── Frontend/
│
├── Database/
│   ├── credit_card_db_dump.sql
│   └── DATABASE_SCHEMA.md
│
├── Postman/
│   └── credit-card-payment-system.postman_collection.json
│
├── Screenshots/
│
├── docs/
│   ├── API_DOCUMENTATION.md
│   └── SETUP_GUIDE.md
│
└── docker-compose.yml
16. Recommended Startup Order

For local development:

Start MySQL.
Start Django.
Start FastAPI.
Start React.
Open the frontend.
Login or register.
Add a card.
Make a payment.
View transaction history.

For Docker:

Start Docker Desktop.
Run docker compose build.
Run docker compose up -d.
Run docker compose ps.
Open the frontend.


