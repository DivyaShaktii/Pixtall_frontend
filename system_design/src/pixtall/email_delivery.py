import html
import smtplib
import ssl
from email.message import EmailMessage

import structlog

from pixtall.core import Settings

logger = structlog.get_logger()


class EmailConfigurationError(RuntimeError):
    pass


def _send_email(
    settings: Settings,
    *,
    recipient: str,
    subject: str,
    text_body: str,
    html_body: str,
) -> None:
    smtp_host = settings.smtp_host
    smtp_username = settings.smtp_username
    smtp_password = settings.smtp_password
    if not (
        smtp_host
        and smtp_username
        and smtp_password
        and settings.smtp_from_email
    ):
        raise EmailConfigurationError("Password reset email is not configured")

    message = EmailMessage()
    message["Subject"] = subject
    message["From"] = f"{settings.smtp_from_name} <{settings.smtp_from_email}>"
    message["To"] = recipient
    message.set_content(text_body)
    message.add_alternative(html_body, subtype="html")

    context = ssl.create_default_context()
    if settings.smtp_use_ssl:
        with smtplib.SMTP_SSL(
            smtp_host,
            settings.smtp_port,
            timeout=settings.smtp_timeout_seconds,
            context=context,
        ) as server:
            server.login(smtp_username, smtp_password)
            server.send_message(message)
    else:
        with smtplib.SMTP(
            smtp_host,
            settings.smtp_port,
            timeout=settings.smtp_timeout_seconds,
        ) as server:
            server.ehlo()
            server.starttls(context=context)
            server.ehlo()
            server.login(smtp_username, smtp_password)
            server.send_message(message)


def send_email_verification_code(
    settings: Settings,
    *,
    recipient: str,
    name: str | None,
    code: str,
) -> None:
    display_name = html.escape(name or "there")
    safe_code = html.escape(code)
    minutes = settings.email_verification_code_minutes
    _send_email(
        settings,
        recipient=recipient,
        subject="Verify your Pixtall email",
        text_body=(
            f"Hi {name or 'there'},\n\n"
            f"Your Pixtall verification code is: {code}\n\n"
            f"This code expires in {minutes} minutes. Do not share it with anyone."
        ),
        html_body=(
            f"<p>Hi {display_name},</p>"
            "<p>Enter this code in Pixtall to verify your email:</p>"
            f'<p style="font-size:28px;font-weight:700;letter-spacing:8px">{safe_code}</p>'
            f"<p>This code expires in {minutes} minutes. Do not share it with anyone.</p>"
        ),
    )


def send_password_reset_email(
    settings: Settings,
    *,
    recipient: str,
    name: str | None,
    reset_url: str,
) -> None:
    display_name = html.escape(name or "there")
    safe_url = html.escape(reset_url, quote=True)
    minutes = settings.password_reset_token_minutes
    _send_email(
        settings,
        recipient=recipient,
        subject="Reset your Pixtall password",
        text_body=(
            f"Hi {name or 'there'},\n\n"
            f"Use this link to reset your Pixtall password:\n{reset_url}\n\n"
            f"This link expires in {minutes} minutes and can be used once. "
            "If you did not request it, you can ignore this email."
        ),
        html_body=(
            f"<p>Hi {display_name},</p>"
            "<p>Use the link below to reset your Pixtall password.</p>"
            f'<p><a href="{safe_url}">Reset password</a></p>'
            f"<p>This link expires in {minutes} minutes and can be used once.</p>"
            "<p>If you did not request it, you can ignore this email.</p>"
        ),
    )


def send_google_signin_reminder(
    settings: Settings,
    *,
    recipient: str,
    name: str | None,
) -> None:
    display_name = html.escape(name or "there")
    signin_url = f"{str(settings.frontend_url).rstrip('/')}/studio"
    safe_url = html.escape(signin_url, quote=True)
    _send_email(
        settings,
        recipient=recipient,
        subject="Sign in to Pixtall with Google",
        text_body=(
            f"Hi {name or 'there'},\n\n"
            "Your Pixtall account uses Google sign-in and does not have a separate password. "
            f"Continue with Google here:\n{signin_url}"
        ),
        html_body=(
            f"<p>Hi {display_name},</p>"
            "<p>Your Pixtall account uses Google sign-in and does not have a separate password.</p>"
            f'<p><a href="{safe_url}">Continue with Google</a></p>'
        ),
    )


def send_password_changed_email(
    settings: Settings,
    *,
    recipient: str,
    name: str | None,
) -> None:
    display_name = html.escape(name or "there")
    _send_email(
        settings,
        recipient=recipient,
        subject="Your Pixtall password was changed",
        text_body=(
            f"Hi {name or 'there'},\n\n"
            "Your Pixtall password was changed. If you did not make this change, "
            "contact Pixtall support immediately."
        ),
        html_body=(
            f"<p>Hi {display_name},</p>"
            "<p>Your Pixtall password was changed.</p>"
            "<p>If you did not make this change, contact Pixtall support immediately.</p>"
        ),
    )


def safely_send(task_name: str, send: object, /, *args: object, **kwargs: object) -> None:
    try:
        if not callable(send):
            raise TypeError("Email task is not callable")
        send(*args, **kwargs)
    except Exception as exc:
        logger.error("email_delivery_failed", task=task_name, error=str(exc))
