import argparse
import sys
from backend.database import SessionLocal, check_db_connection
from backend.models.user import User
from backend.security.hashing import hash_password, validate_password_strength


def create_admin(name: str, email: str, password: str, department: str = "Administration"):
    """Creates or promotes an admin account securely via backend CLI."""
    connected, detail = check_db_connection()
    if not connected:
        print(f"[ERROR] Cannot connect to database: {detail}")
        print("Please check your PostgreSQL instance and .env configuration.")
        sys.exit(1)

    clean_email = email.strip().lower()
    valid_pwd, pwd_err = validate_password_strength(password)
    if not valid_pwd:
        print(f"[ERROR] Invalid password: {pwd_err}")
        sys.exit(1)

    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == clean_email).first()
        hashed = hash_password(password)

        if user:
            user.role = "admin"
            user.status = "active"
            user.password_hash = hashed
            if name:
                user.name = name.strip()
            db.commit()
            print(f"[SUCCESS] Existing user {clean_email} has been promoted to Admin role.")
            print(f"User ID: {user.id}")
            print(f"Role: {user.role}")
        else:
            new_admin = User(
                name=name.strip(),
                email=clean_email,
                password_hash=hashed,
                role="admin",
                status="active",
                department=department.strip(),
                college="CareerCurve Administration",
                degree="System",
            )
            db.add(new_admin)
            db.commit()
            db.refresh(new_admin)
            print(f"[SUCCESS] Admin account created successfully!")
            print(f"User ID: {new_admin.id}")
            print(f"Name: {new_admin.name}")
            print(f"Email: {new_admin.email}")
            print(f"Role: {new_admin.role}")
    finally:
        db.close()


def check_database():
    """Validates database connectivity."""
    print("Testing database connection...")
    connected, detail = check_db_connection()
    if connected:
        print("[SUCCESS] Connected to database.")
    else:
        print(f"[FAILURE] Failed to connect: {detail}")
        print("Verify PostgreSQL is running and credentials in .env are correct.")


def main():
    parser = argparse.ArgumentParser(description="CareerCurve AI Backend Management CLI")
    subparsers = parser.add_subparsers(dest="command", required=True)

    # create-admin
    admin_parser = subparsers.add_parser("create-admin", help="Create or promote an administrator account")
    admin_parser.add_argument("--name", default="Platform Admin", help="Admin Full Name")
    admin_parser.add_argument("--email", required=True, help="Admin Email Address")
    admin_parser.add_argument("--password", required=True, help="Admin Password (min 8 chars)")
    admin_parser.add_argument("--department", default="Administration", help="Department")

    # check-db
    subparsers.add_parser("check-db", help="Verify database connectivity")

    args = parser.parse_args()

    if args.command == "create-admin":
        create_admin(args.name, args.email, args.password, args.department)
    elif args.command == "check-db":
        check_database()


if __name__ == "__main__":
    main()
