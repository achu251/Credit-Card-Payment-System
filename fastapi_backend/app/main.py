from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.routers.payments import router as payment_router


app = FastAPI(
    title="Credit Card Payment Service",
    version="1.0.0"
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


app.include_router(payment_router)


@app.get("/")
def root():
    return {
        "message": "Credit Card Payment Service is running"
    }