"""
Waitlist API routes for early access signups.
"""

from __future__ import annotations

import logging

import resend
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import SessionDep
from app.core.settings import get_settings
from app.models.waitlist_model import Waitlist, WaitlistCreate, WaitlistRead

router = APIRouter()
logger = logging.getLogger(__name__)


def send_waitlist_confirmation_email(to_email: str, name: str | None) -> bool:
    """Send confirmation email to the user who joined the waitlist."""
    settings = get_settings()
    resend.api_key = settings.resend_api_key

    greeting = f"Hi {name}" if name else "Hello"

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 40px; }}
            .logo {{ font-size: 28px; font-style: italic; font-weight: 500; color: #154c7a; }}
            .content {{ background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 24px; border-left: 4px solid #53a255; }}
            .footer {{ text-align: center; color: #64748b; font-size: 14px; }}
            .highlight {{ color: #53a255; font-weight: 600; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Survello</div>
            </div>
            <div class="content">
                <h2 style="margin-top: 0; color: #154c7a;">{greeting},</h2>
                <p>Thank you for joining the Survello waitlist. We're building something special for surveyors and property professionals who value efficiency and simplicity.</p>
                <p>You're now on the list to be among the first to experience <span class="highlight">AI-powered document generation</span> that turns your site notes into professional schedules in minutes, not hours.</p>
                <p>We'll be in touch soon with early access details.</p>
                <p style="margin-top: 24px;">Best regards,<br><strong>The Survello Team</strong></p>
            </div>
            <div class="footer">
                <p>© Survello – Surveying, simplified.</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params: resend.Emails.SendParams = {
            "from": f"{settings.email_from_name} <{settings.email_from}>",
            "to": [to_email],
            "subject": "You're on the Survello waitlist",
            "html": html_body,
        }
        resend.Emails.send(params)
        logger.info(f"Waitlist confirmation email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send waitlist confirmation to {to_email}: {e}")
        return False


def send_admin_notification_email(
    admin_email: str, user_email: str, name: str | None, company: str | None
) -> bool:
    """Send notification email to admin about new waitlist signup."""
    settings = get_settings()
    resend.api_key = settings.resend_api_key

    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{ font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }}
            .container {{ max-width: 600px; margin: 0 auto; padding: 40px 20px; }}
            .header {{ text-align: center; margin-bottom: 40px; }}
            .logo {{ font-size: 28px; font-style: italic; font-weight: 500; color: #154c7a; }}
            .content {{ background: #f8fafc; border-radius: 12px; padding: 32px; margin-bottom: 24px; border-left: 4px solid #efcc57; }}
            .detail {{ margin: 8px 0; }}
            .label {{ font-weight: 600; color: #154c7a; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Survello</div>
            </div>
            <div class="content">
                <h2 style="margin-top: 0; color: #154c7a;">New Waitlist Signup 🎉</h2>
                <div class="detail">
                    <span class="label">Email:</span> {user_email}
                </div>
                <div class="detail">
                    <span class="label">Name:</span> {name or "Not provided"}
                </div>
                <div class="detail">
                    <span class="label">Company:</span> {company or "Not provided"}
                </div>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params: resend.Emails.SendParams = {
            "from": f"{settings.email_from_name} <{settings.email_from}>",
            "to": [admin_email],
            "subject": f"New waitlist signup: {user_email}",
            "html": html_body,
        }
        resend.Emails.send(params)
        logger.info(f"Admin notification sent for waitlist signup: {user_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send admin notification for {user_email}: {e}")
        return False


@router.post("", response_model=WaitlistRead, operation_id="joinWaitlist")
def join_waitlist(waitlist_in: WaitlistCreate, db: SessionDep):
    """
    Join the waitlist for early access.
    Sends confirmation email to user and notification to admin.
    """
    settings = get_settings()

    # Check if email already exists
    existing = db.exec(
        select(Waitlist).where(Waitlist.email == waitlist_in.email)
    ).first()
    if existing:
        raise HTTPException(
            status_code=400, detail="This email is already on the waitlist"
        )

    # Create waitlist entry
    waitlist_entry = Waitlist(
        email=waitlist_in.email,
        name=waitlist_in.name,
        company=waitlist_in.company,
    )
    db.add(waitlist_entry)
    db.commit()
    db.refresh(waitlist_entry)

    # Send emails (non-blocking - don't fail if emails fail)
    send_waitlist_confirmation_email(waitlist_in.email, waitlist_in.name)
    send_admin_notification_email(
        settings.admin_notification_email,
        waitlist_in.email,
        waitlist_in.name,
        waitlist_in.company,
    )

    return waitlist_entry
