from datetime import datetime
from typing import Literal
from uuid import UUID

from pydantic import BaseModel, ConfigDict, Field

from pixtall.models import ImageQuality, JobStatus, TransactionType


class GenerationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    product_image_base64: str = Field(min_length=1, max_length=15_000_000)
    model_image_base64: str | None = Field(default=None, max_length=15_000_000)
    product_category: str = Field(min_length=1, max_length=80)
    product_subcategory: str = Field(min_length=1, max_length=80)
    scene: str = Field(min_length=1, max_length=80)
    size: Literal["9:16", "3:4", "1:1", "4:5", "16:9"]
    model: Literal["male", "female", "none"]
    intended_use: Literal["marketplace", "website"]
    image_count: int = Field(ge=1, le=4)
    quality: ImageQuality


class OutputResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    output_index: int
    result_reference: str | None
    error: str | None


class JobResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    status: JobStatus
    quality: ImageQuality
    image_count: int
    credit_cost: int
    reserved_credits: int
    consumed_credits: int
    released_credits: int
    attempt_count: int
    safe_error: str | None
    created_at: datetime
    updated_at: datetime
    outputs: list[OutputResponse] = Field(default_factory=list)


class WalletResponse(BaseModel):
    available_credits: int
    reserved_credits: int
    lifetime_consumed_credits: int


class TransactionResponse(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    id: UUID
    job_id: UUID | None
    type: TransactionType
    credits: int
    available_balance_after: int
    reserved_balance_after: int
    created_at: datetime


class TransactionPage(BaseModel):
    items: list[TransactionResponse]
    limit: int
    offset: int


class ErrorResponse(BaseModel):
    detail: str


class HealthResponse(BaseModel):
    status: Literal["ok"] = "ok"
