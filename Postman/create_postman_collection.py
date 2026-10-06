import json
from pathlib import Path


collection = {
    "info": {
        "name": "Credit Card Payment System API",
        "description": (
            "Postman collection for the Credit Card Payment System. "
            "Includes Django authentication, card management, "
            "transactions, admin APIs, and FastAPI payment APIs."
        ),
        "schema": (
            "https://schema.getpostman.com/json/collection/"
            "v2.1.0/collection.json"
        )
    },

    "variable": [
        {
            "key": "django_url",
            "value": "http://127.0.0.1:8000"
        },
        {
            "key": "fastapi_url",
            "value": "http://127.0.0.1:8001"
        },
        {
            "key": "access_token",
            "value": ""
        },
        {
            "key": "refresh_token",
            "value": ""
        },
        {
            "key": "card_id",
            "value": "1"
        },
        {
            "key": "transaction_id",
            "value": "1"
        }
    ],

    "auth": {
        "type": "bearer",
        "bearer": [
            {
                "key": "token",
                "value": "{{access_token}}",
                "type": "string"
            }
        ]
    },

    "item": [

        # ============================================================
        # AUTHENTICATION
        # ============================================================

        {
            "name": "Authentication",
            "item": [

                {
                    "name": "Register",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "username": "testuser",
                                "email": "testuser@example.com",
                                "password": "TestPassword123!"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{django_url}}/api/auth/register/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "auth", "register", ""]
                        }
                    }
                },

                {
                    "name": "Login",
                    "event": [
                        {
                            "listen": "test",
                            "script": {
                                "exec": [
                                    "const json = pm.response.json();",
                                    "",
                                    "if (json.access) {",
                                    "    pm.collectionVariables.set('access_token', json.access);",
                                    "}",
                                    "",
                                    "if (json.refresh) {",
                                    "    pm.collectionVariables.set('refresh_token', json.refresh);",
                                    "}"
                                ]
                            }
                        }
                    ],
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "username": "testuser",
                                "password": "TestPassword123!"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{django_url}}/api/auth/login/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "auth", "login", ""]
                        }
                    }
                },

                {
                    "name": "Get Current User",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/auth/me/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "auth", "me", ""]
                        }
                    }
                },

                {
                    "name": "Logout",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "refresh": "{{refresh_token}}"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{django_url}}/api/auth/logout/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "auth", "logout", ""]
                        }
                    }
                }
            ]
        },

        # ============================================================
        # CARDS
        # ============================================================

        {
            "name": "Cards",
            "item": [

                {
                    "name": "List My Cards",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/cards/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "cards", ""]
                        }
                    }
                },

                {
                    "name": "Add Card",
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "card_number": "4111111111111111",
                                "cvv": "123",
                                "card_type": "VISA",
                                "expiry_month": 12,
                                "expiry_year": 2030
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{django_url}}/api/cards/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "cards", ""]
                        }
                    }
                },

                {
                    "name": "Delete Card",
                    "request": {
                        "method": "DELETE",
                        "url": {
                            "raw": "{{django_url}}/api/cards/{{card_id}}/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "cards", "{{card_id}}", ""]
                        }
                    }
                }
            ]
        },

        # ============================================================
        # PAYMENTS
        # ============================================================

        {
            "name": "Payments",
            "item": [

                {
                    "name": "Make Payment",
                    "event": [
                        {
                            "listen": "prerequest",
                            "script": {
                                "exec": [
                                    "pm.variables.set('idempotency_key',",
                                    "    pm.variables.replaceIn('{{$guid}}')",
                                    ");"
                                ]
                            }
                        }
                    ],
                    "request": {
                        "method": "POST",
                        "header": [
                            {
                                "key": "Content-Type",
                                "value": "application/json"
                            }
                        ],
                        "body": {
                            "mode": "raw",
                            "raw": json.dumps({
                                "card_id": 1,
                                "amount": 1000.00,
                                "idempotency_key": "POSTMAN-UNIQUE-KEY-001"
                            }, indent=2)
                        },
                        "url": {
                            "raw": "{{fastapi_url}}/api/payments/",
                            "host": ["{{fastapi_url}}"],
                            "path": ["api", "payments", ""]
                        }
                    }
                },

                {
                    "name": "Get Payment",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{fastapi_url}}/api/payments/{{transaction_id}}",
                            "host": ["{{fastapi_url}}"],
                            "path": [
                                "api",
                                "payments",
                                "{{transaction_id}}"
                            ]
                        }
                    }
                }
            ]
        },

        # ============================================================
        # TRANSACTIONS
        # ============================================================

        {
            "name": "Transactions",
            "item": [

                {
                    "name": "Transaction History",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/transactions/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "transactions", ""]
                        }
                    }
                },

                {
                    "name": "Transaction History - Filters",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": (
                                "{{django_url}}/api/transactions/"
                                "?status=SUCCESS"
                                "&min_amount=100"
                                "&max_amount=10000"
                                "&start_date=2026-01-01"
                                "&end_date=2026-12-31"
                            ),
                            "host": ["{{django_url}}"],
                            "path": ["api", "transactions", ""],
                            "query": [
                                {
                                    "key": "status",
                                    "value": "SUCCESS"
                                },
                                {
                                    "key": "min_amount",
                                    "value": "100"
                                },
                                {
                                    "key": "max_amount",
                                    "value": "10000"
                                },
                                {
                                    "key": "start_date",
                                    "value": "2026-01-01"
                                },
                                {
                                    "key": "end_date",
                                    "value": "2026-12-31"
                                }
                            ]
                        }
                    }
                },

                {
                    "name": "Export Transactions CSV",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/transactions/export/",
                            "host": ["{{django_url}}"],
                            "path": [
                                "api",
                                "transactions",
                                "export",
                                ""
                            ]
                        }
                    }
                },

                {
                    "name": "Daily Payment Summary",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": (
                                "{{django_url}}/api/transactions/"
                                "summary/?date=2026-10-01"
                            ),
                            "host": ["{{django_url}}"],
                            "path": [
                                "api",
                                "transactions",
                                "summary",
                                ""
                            ],
                            "query": [
                                {
                                    "key": "date",
                                    "value": "2026-10-01"
                                }
                            ]
                        }
                    }
                }
            ]
        },

        # ============================================================
        # ADMIN
        # ============================================================

        {
            "name": "Admin",
            "item": [

                {
                    "name": "View All Users",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/auth/admin/users/",
                            "host": ["{{django_url}}"],
                            "path": [
                                "api",
                                "auth",
                                "admin",
                                "users",
                                ""
                            ]
                        }
                    }
                },

                {
                    "name": "View All Cards",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/cards/admin/all/",
                            "host": ["{{django_url}}"],
                            "path": [
                                "api",
                                "cards",
                                "admin",
                                "all",
                                ""
                            ]
                        }
                    }
                },

                {
                    "name": "Admin Dashboard",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": (
                                "{{django_url}}/api/transactions/"
                                "admin-dashboard/"
                            ),
                            "host": ["{{django_url}}"],
                            "path": [
                                "api",
                                "transactions",
                                "admin-dashboard",
                                ""
                            ]
                        }
                    }
                },

                {
                    "name": "View All Transactions",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/transactions/admin/all/",
                            "host": ["{{django_url}}"],
                            "path": [
                                "api",
                                "transactions",
                                "admin",
                                "all",
                                ""
                            ]
                        }
                    }
                },

                {
                    "name": "View Admin Logs",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/admin-logs/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "admin-logs", ""]
                        }
                    }
                }
            ]
        },

        # ============================================================
        # API DOCUMENTATION
        # ============================================================

        {
            "name": "API Documentation",
            "item": [

                {
                    "name": "Django OpenAPI Schema",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/schema/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "schema", ""]
                        }
                    }
                },

                {
                    "name": "Django Swagger UI",
                    "request": {
                        "method": "GET",
                        "url": {
                            "raw": "{{django_url}}/api/docs/",
                            "host": ["{{django_url}}"],
                            "path": ["api", "docs", ""]
                        }
                    }
                }
            ]
        }
    ]
}


output_file = Path("credit-card-payment-system.postman_collection.json")

output_file.write_text(
    json.dumps(collection, indent=2),
    encoding="utf-8"
)

print(f"Postman collection created successfully: {output_file}")