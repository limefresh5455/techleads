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
    # Stripe credit purchases
    stripe_secret_key: str = ""
    stripe_webhook_secret: str = ""
    stripe_publishable_key: str = ""
    frontend_url: str = "http://localhost:5173"
    # Google OAuth
    google_client_id: str = ""
    google_client_secret: str = ""
    google_redirect_uri: str = "http://127.0.0.1:8000/api/auth/google/callback"
    # TechLeads.fyi customer API (web lookup) — https://techleads.fyi/docs
    techleads_api_key: str = ""
    techleads_api_enabled: bool = True
    crawl_timeout_seconds: int = 15
    crawl_user_agent: str = "TechLeadsBot/1.0 (+https://techleads.ai)"

    # Email (FastAPI-Mail)
    mail_username: str = ""
    mail_password: str = ""
    mail_from: str = "noreply@techleads.ai"
    mail_port: int = 587
    mail_server: str = "smtp.gmail.com"
    mail_starttls: bool = True
    mail_ssl_tls: bool = False

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
