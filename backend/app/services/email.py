import logging

import resend

from app.core.settings import get_settings

logger = logging.getLogger(__name__)

EMAIL_FONT_FAMILY = (
    "-apple-system, BlinkMacSystemFont,"
    " 'Segoe UI', Roboto, sans-serif"
)


def send_invitation_email(
    to_email: str,
    invite_token: str,
    org_name: str,
    invited_by_name: str,
) -> bool:
    """
    Send an invitation email to a new user.
    Returns True if sent successfully, False otherwise.
    """
    settings = get_settings()
    resend.api_key = settings.resend_api_key

    invite_url = f"{settings.frontend_url}/accept-invite?token={invite_token}"

    subject = f"You've been invited to join {org_name} on Survello"

    font = EMAIL_FONT_FAMILY
    expire_days = settings.invitation_expire_days
    html_body = f"""
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="utf-8">
        <style>
            body {{
                font-family: {font};
                line-height: 1.6; color: #333;
            }}
            .container {{
                max-width: 600px; margin: 0 auto;
                padding: 40px 20px;
            }}
            .header {{ text-align: center; margin-bottom: 40px; }}
            .logo {{
                font-size: 28px; font-style: italic;
                font-weight: 500; color: #0f172a;
            }}
            .content {{
                background: #f8fafc; border-radius: 12px;
                padding: 32px; margin-bottom: 24px;
            }}
            .button {{
                display: inline-block; background: #0f172a; color: white;
                padding: 14px 28px; text-decoration: none;
                border-radius: 8px; font-weight: 600;
            }}
            .footer {{ text-align: center; color: #64748b; font-size: 14px; }}
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <div class="logo">Survello</div>
            </div>
            <div class="content">
                <h2 style="margin-top: 0;">You've been invited!</h2>
                <p>
                    <strong>{invited_by_name}</strong> has invited you to
                    join <strong>{org_name}</strong> on Survello.
                </p>
                <p>Click the button below to accept your invitation:</p>
                <p style="text-align: center; margin: 32px 0;">
                    <a href="{invite_url}" class="button">
                        Accept Invitation
                    </a>
                </p>
                <p style="color: #64748b; font-size: 14px;">
                    This invitation expires in {expire_days} days.
                </p>
            </div>
            <div class="footer">
                <p>If you didn't expect this, you can safely ignore it.</p>
                <p>&copy; Survello</p>
            </div>
        </div>
    </body>
    </html>
    """

    try:
        params: resend.Emails.SendParams = {
            "from": f"{settings.email_from_name} <{settings.email_from}>",
            "to": [to_email],
            "subject": subject,
            "html": html_body,
        }
        resend.Emails.send(params)
        logger.info(f"Invitation email sent to {to_email}")
        return True
    except Exception as e:
        logger.error(f"Failed to send invitation email to {to_email}: {e}")
        return False
