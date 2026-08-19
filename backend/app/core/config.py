from pathlib import Path

from pydantic import field_validator
from pydantic_settings import BaseSettings, SettingsConfigDict

ROOT = Path(__file__).resolve().parents[2]


class Settings(BaseSettings):
    model_config = SettingsConfigDict(
        env_file=str(ROOT / ".env"),
        env_file_encoding="utf-8",
        extra="ignore",
    )

    database_url: str = "postgresql+psycopg2://techleads:techleads@localhost:5433/techleads"
    cors_origins: str = "http://localhost:5173,http://127.0.0.1:5173"
    # OpenRouter — OpenAI gpt-oss-120b for scrape/enrich
    # https://openrouter.ai/openai/gpt-oss-120b
    openrouter_api_key: str = ""
    openrouter_model: str = "openai/gpt-oss-120b"
    openrouter_timeout_seconds: int = 90
    openrouter_http_referer: str = "https://techleads.ai"
    openrouter_app_title: str = "TechLeads.Ai"
    crawl_timeout_seconds: int = 15
    crawl_user_agent: str = "TechLeadsBot/1.0 (+https://techleads.ai)"

    @field_validator("database_url", mode="before")
    @classmethod
    def normalize_database_url(cls, value: str) -> str:
        if value.startswith("postgres://"):
            return f"postgresql+psycopg2://{value[len('postgres://'):]}"
        if value.startswith("postgresql://") and "+psycopg2" not in value:
            return value.replace("postgresql://", "postgresql+psycopg2://", 1)
        return value

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
