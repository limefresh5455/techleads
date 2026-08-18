from pathlib import Path

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
    gemini_api_key: str = ""
    gemini_model: str = "gemini-2.0-flash"
    crawl_timeout_seconds: int = 15
    crawl_user_agent: str = "TechLeadsBot/1.0 (+https://techleads.ai)"

    @property
    def cors_origin_list(self) -> list[str]:
        return [o.strip() for o in self.cors_origins.split(",") if o.strip()]


settings = Settings()
