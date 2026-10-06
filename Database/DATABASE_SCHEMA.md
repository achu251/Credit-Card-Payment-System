# Database Schema Documentation

## 1. Database Overview

Database: `credit_card_db`

Database engine: MySQL 8.0

The application uses MySQL as the shared database for the Django authentication and business services and the FastAPI payment service.

## 2. Architecture

```text
Users
  |
  +---- Cards
  |
  +---- Transactions

Admin Users
  |
  +---- Admin Logs

FastAPI Payment Service
  |
  +---- Transactions
```

## 3. Main Tables

### 3.1 users_user

Stores registered application users and Django authentication information.

Important fields:

| Field | Description |
|---|---|
| id | Primary key |
| username | Unique login username |
| email | User email address |
| password | Django hashed password |
| is_staff | Indicates administrator/staff access |
| is_superuser | Indicates superuser access |
| is_active | Indicates whether the account is active |
| date_joined | Account creation date |

Security: passwords are stored using Django password hashing. Plain-text passwords are never stored.

### 3.2 cards_card

Stores saved card information for users.

Important fields:

| Field | Description |
|---|---|
| id | Primary key |
| user_id | Owner of the card |
| masked_card | Masked card number |
| last_four | Last four digits |
| card_type | VISA, MASTERCARD, AMEX or RUPAY |
| expiry_month | Card expiry month |
| expiry_year | Card expiry year |
| created_at | Card creation time |

Security:

- Full card numbers are never stored.
- Only the masked number and last four digits are stored.
- CVV is never stored.

### 3.3 transactions

Stores payment transaction records. This table is shared between Django and FastAPI.

Important fields:

| Field | Description |
|---|---|
| id | Primary key |
| user_id | User who made the payment |
| card_id | Card used for the payment |
| amount | Payment amount |
| status | PENDING, SUCCESS or FAILED |
| reference | Unique payment reference |
| idempotency_key | Prevents duplicate payment processing |
| created_at | Transaction creation time |
| updated_at | Last transaction update time |

The Django transaction model uses `managed = False` because FastAPI also manages the same database table through SQLAlchemy.

### 3.4 admin_logs_adminlog

Stores actions performed through administrator APIs.

Important fields:

| Field | Description |
|---|---|
| id | Primary key |
| admin_id | Administrator who performed the action |
| action | Action name |
| description | Description of the action |
| created_at | Action timestamp |

Examples of recorded actions include viewing users, cards and transactions.

## 4. Relationships

### User to Cards

One user can have multiple saved cards.

```text
users_user.id  --->  cards_card.user_id
```

### User to Transactions

A user can have multiple transactions.

```text
users_user.id  --->  transactions.user_id
```

### User to Admin Logs

An administrator can generate multiple audit log entries.

```text
users_user.id  --->  admin_logs_adminlog.admin_id
```

### Card to Transactions

A card can be associated with multiple payment transactions.

```text
cards_card.id  --->  transactions.card_id
```

## 5. Payment Status Flow

```text
Payment Request
      |
      v
   PENDING
      |
      +----> SUCCESS
      |
      +----> FAILED
```

FastAPI creates the transaction as `PENDING` and then simulates the payment result as either `SUCCESS` or `FAILED`.

## 6. Idempotency

Each payment request contains an `idempotency_key`.

The key is stored as unique in the `transactions` table. If the same request is submitted again with the same key, the existing transaction is returned instead of creating a duplicate payment.

## 7. Security Design

The database design follows these security principles:

- Passwords are hashed using Django authentication.
- Full card numbers are never stored.
- CVV values are never stored.
- APIs use JWT authentication.
- Users can access only their own cards and transactions.
- Administrator APIs require administrator permissions.
- Database credentials are stored in local `.env` files and are not committed to Git.

## 8. Database Dump

A database dump is provided with the project:

`Database/credit_card_db_dump.sql`

The dump contains the current database schema and application data used by the project.

## 9. Restore Instructions

Create the database first if required:

```sql
CREATE DATABASE credit_card_db;
```

Then restore the dump using MySQL:

```cmd
mysql -h 127.0.0.1 -P 3307 -u credit_app -p credit_card_db < Database\\credit_card_db_dump.sql
```

The database credentials should never be stored inside this documentation or committed to Git.
