from sqlalchemy import Column, DateTime, Integer, String, ForeignKey

from app.database import Base


class Card(Base):
    __tablename__ = "cards_card"

    id = Column(
        Integer,
        primary_key=True
    )

    user_id = Column(
        Integer,
        ForeignKey("users_user.id"),
        nullable=False
    )

    masked_card = Column(
        String(19),
        nullable=False
    )

    last_four = Column(
        String(4),
        nullable=False
    )

    card_type = Column(
        String(20),
        nullable=False
    )

    expiry_month = Column(
        Integer,
        nullable=False
    )

    expiry_year = Column(
        Integer,
        nullable=False
    )

    created_at = Column(
        DateTime,
        nullable=False
    )