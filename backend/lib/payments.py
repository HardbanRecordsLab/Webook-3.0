from pydantic import BaseModel
from typing import Optional, Dict, Any
import uuid

class CheckoutSessionRequest(BaseModel):
    amount: float
    currency: str
    success_url: str
    cancel_url: str
    metadata: Optional[Dict[str, Any]] = None

class CheckoutSessionResponse(BaseModel):
    session_id: str
    url: str
    payment_status: str = "pending"
    status: str = "open"
    amount_total: int = 0

class StripeCheckout:
    def __init__(self, api_key: str, webhook_url: str):
        self.api_key = api_key
        self.webhook_url = webhook_url

    async def create_checkout_session(self, request: CheckoutSessionRequest) -> CheckoutSessionResponse:
        session_id = f"mock_sess_{uuid.uuid4().hex}"
        # For local development, we just return a success URL
        url = request.success_url.replace("{CHECKOUT_SESSION_ID}", session_id)
        return CheckoutSessionResponse(
            session_id=session_id,
            url=url,
            amount_total=int(request.amount * 100)
        )

    async def get_checkout_status(self, session_id: str) -> CheckoutSessionResponse:
        # For local development, we always mark as paid
        return CheckoutSessionResponse(
            session_id=session_id,
            url="",
            payment_status="paid",
            status="complete",
            amount_total=2500
        )

    async def handle_webhook(self, body: bytes, signature: str) -> CheckoutSessionResponse:
        # Mock webhook handling
        return CheckoutSessionResponse(
            session_id="mock_webhook_sess",
            url="",
            payment_status="paid"
        )
