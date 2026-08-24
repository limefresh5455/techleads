from fastapi_mail import ConnectionConfig, FastMail, MessageSchema, MessageType
from pydantic import EmailStr

from app.core.config import settings

conf = ConnectionConfig(
    MAIL_USERNAME=settings.mail_username,
    MAIL_PASSWORD=settings.mail_password,
    MAIL_FROM=settings.mail_from,
    MAIL_PORT=settings.mail_port,
    MAIL_SERVER=settings.mail_server,
    MAIL_STARTTLS=settings.mail_starttls,
    MAIL_SSL_TLS=settings.mail_ssl_tls,
    USE_CREDENTIALS=True,
    VALIDATE_CERTS=True,
)


async def send_otp_email(email_to: EmailStr, otp: str):
    subject = "TechLeads - Your OTP Code"
    title = "Your OTP Code"
    desc = "Please use the code below to verify your request."

    html = f"""
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <h2 style="color: #333;">{title}</h2>
        <p>{desc}</p>
        <p>Your OTP is:</p>
        <div style="background-color: #f4f4f4; padding: 15px; font-size: 24px; font-weight: bold; text-align: center; letter-spacing: 5px; margin: 20px 0; border-radius: 4px;">
            {otp}
        </div>
        <p>This OTP will expire in 10 minutes.</p>
        <p style="font-size: 12px; color: #777; margin-top: 30px;">If you did not make this request, you can safely ignore this email.</p>
    </div>
    """

    message = MessageSchema(
        subject=subject,
        recipients=[email_to],
        body=html,
        subtype=MessageType.html
    )

    fm = FastMail(conf)
    await fm.send_message(message)

