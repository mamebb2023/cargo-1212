#!/usr/bin/env python
"""
Script to create admin user for CargoBid
"""
import os
import sys
import django

# Add the current directory to Python path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Setup Django
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "config.settings")
django.setup()

from django.contrib.auth import get_user_model


def create_admin_user():
    User = get_user_model()

    # Check if admin user already exists
    if User.objects.filter(email="admin@admin.com").exists():
        print("Admin user already exists")
        return

    try:
        # Create admin user
        admin_user = User.objects.create_user(
            email="admin@admin.com",
            password="12345678Wertyui",
            full_name="Admin User",
            phone="+251911234567",
            role="admin",
            is_verified=True,
            is_staff=True,
            is_superuser=True,
        )
        print("Admin user created successfully")
        print("Email: admin@admin.com")
        print("Password: 12345678Wertyui")
        print("Phone: +251911234567")
    except Exception as e:
        print(f"Error creating admin user: {e}")
        import traceback

        traceback.print_exc()


if __name__ == "__main__":
    create_admin_user()
