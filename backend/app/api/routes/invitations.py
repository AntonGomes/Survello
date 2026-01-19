from datetime import datetime, timezone, timedelta
from fastapi import APIRouter, HTTPException
from sqlmodel import select

from app.api.deps import DBDep, CurrentUserDep
from app.models.user_model import (
    User,
    UserRead,
    UserRole,
    Invitation,
    InvitationCreate,
    InvitationRead,
    InvitationPublic,
    InvitationAccept,
    InvitationStatus,
)
from app.core.security import hash_password, create_token
from app.core.settings import get_settings
from app.services.email import send_invitation_email

router = APIRouter()


@router.post("/", response_model=InvitationRead, operation_id="createInvitation")
def create_invitation(
    invite_in: InvitationCreate,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """
    Invite a new user to the organization. Admin only.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can invite users")

    settings = get_settings()

    # Check if user already exists in the system (skip for whitelisted test emails)
    is_whitelisted = invite_in.email in settings.test_email_whitelist
    existing_user = db.exec(select(User).where(User.email == invite_in.email)).first()
    if existing_user and not is_whitelisted:
        raise HTTPException(
            status_code=400, detail="A user with this email already exists"
        )

    # Check for existing pending invitation to this org
    existing_invite = db.exec(
        select(Invitation).where(
            Invitation.email == invite_in.email,
            Invitation.status == InvitationStatus.PENDING,
            Invitation.org_id == current_user.org_id,
        )
    ).first()
    if existing_invite:
        raise HTTPException(
            status_code=400, detail="An invitation has already been sent to this email"
        )

    token = create_token()

    invitation = Invitation(
        email=invite_in.email,
        token=token,
        org_id=current_user.org_id,
        invited_by_user_id=current_user.id,
        role=invite_in.role,
        expires_at=datetime.now(timezone.utc)
        + timedelta(days=settings.invitation_expire_days),
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation)

    # Send invitation email
    send_invitation_email(
        to_email=invite_in.email,
        invite_token=token,
        org_name=current_user.org.name,
        invited_by_name=current_user.name,
    )

    return invitation


@router.get("/", response_model=list[InvitationRead], operation_id="readInvitations")
def read_invitations(current_user: CurrentUserDep, db: DBDep):
    """
    Get all invitations for the organization. Admin only.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="Only admins can view invitations")

    invitations = db.exec(
        select(Invitation)
        .where(Invitation.org_id == current_user.org_id)
        .order_by(Invitation.created_at.desc())
    ).all()
    return list(invitations)


@router.get(
    "/verify/{token}", response_model=InvitationPublic, operation_id="verifyInvitation"
)
def verify_invitation(token: str, db: DBDep):
    """
    Verify an invitation token and return public info (org name, etc.).
    This is called by the frontend before showing the accept form.
    """
    invitation = db.exec(select(Invitation).where(Invitation.token == token)).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=400, detail="This invitation has already been used"
        )

    if invitation.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        invitation.status = InvitationStatus.EXPIRED
        db.add(invitation)
        db.commit()
        raise HTTPException(status_code=400, detail="This invitation has expired")

    # Load relationships
    db.refresh(invitation, ["org", "invited_by"])

    return InvitationPublic(
        email=invitation.email,
        org_name=invitation.org.name,
        invited_by_name=invitation.invited_by.name,
        expires_at=invitation.expires_at,
    )


@router.post("/accept", response_model=UserRead, operation_id="acceptInvitation")
def accept_invitation(accept_in: InvitationAccept, db: DBDep):
    """
    Accept an invitation and create the user account.
    """
    invitation = db.exec(
        select(Invitation).where(Invitation.token == accept_in.token)
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invalid invitation token")

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=400, detail="This invitation has already been used"
        )

    if invitation.expires_at.replace(tzinfo=timezone.utc) < datetime.now(timezone.utc):
        invitation.status = InvitationStatus.EXPIRED
        db.add(invitation)
        db.commit()
        raise HTTPException(status_code=400, detail="This invitation has expired")

    # Check if user already exists (edge case: registered between invite and accept)
    # Skip for whitelisted test emails
    settings = get_settings()
    is_whitelisted = invitation.email in settings.test_email_whitelist
    existing_user = db.exec(select(User).where(User.email == invitation.email)).first()
    if existing_user:
        if is_whitelisted:
            # For test emails, delete existing user to allow re-registration
            db.delete(existing_user)
            db.commit()
        else:
            raise HTTPException(
                status_code=400, detail="A user with this email already exists"
            )

    # Create the user
    hashed_password = hash_password(accept_in.password)
    user = User(
        name=accept_in.name,
        email=invitation.email,
        password_hash=hashed_password,
        org_id=invitation.org_id,
        role=invitation.role,
    )
    db.add(user)

    # Mark invitation as accepted
    invitation.status = InvitationStatus.ACCEPTED
    db.add(invitation)

    db.commit()
    db.refresh(user)

    return user


@router.post(
    "/{invitation_id}/resend",
    response_model=InvitationRead,
    operation_id="resendInvitation",
)
def resend_invitation(
    invitation_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """
    Resend an invitation email. Admin only.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admins can resend invitations"
        )

    invitation = db.exec(
        select(Invitation).where(
            Invitation.id == invitation_id,
            Invitation.org_id == current_user.org_id,
        )
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    if invitation.status != InvitationStatus.PENDING:
        raise HTTPException(
            status_code=400, detail="Can only resend pending invitations"
        )

    # Extend expiration and resend
    settings = get_settings()
    invitation.expires_at = datetime.now(timezone.utc) + timedelta(
        days=settings.invitation_expire_days
    )
    db.add(invitation)
    db.commit()
    db.refresh(invitation, ["org"])

    send_invitation_email(
        to_email=invitation.email,
        invite_token=invitation.token,
        org_name=invitation.org.name,
        invited_by_name=current_user.name,
    )

    return invitation


@router.delete("/{invitation_id}", operation_id="deleteInvitation")
def delete_invitation(
    invitation_id: int,
    current_user: CurrentUserDep,
    db: DBDep,
):
    """
    Cancel/delete an invitation. Admin only.
    """
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(
            status_code=403, detail="Only admins can delete invitations"
        )

    invitation = db.exec(
        select(Invitation).where(
            Invitation.id == invitation_id,
            Invitation.org_id == current_user.org_id,
        )
    ).first()

    if not invitation:
        raise HTTPException(status_code=404, detail="Invitation not found")

    db.delete(invitation)
    db.commit()

    return {"message": "Invitation deleted"}
