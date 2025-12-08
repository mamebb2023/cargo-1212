import os
import uuid
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.conf import settings


def upload_file(file, folder_path):
    """
    Upload a file to the specified folder

    Args:
        file: File object to upload
        folder_path: Path within MEDIA_ROOT to store the file

    Returns:
        str: Path to the uploaded file
    """
    if not file:
        return None

    # Generate unique filename
    file_extension = os.path.splitext(file.name)[1]
    unique_filename = f"{uuid.uuid4().hex}{file_extension}"

    # Create full path
    file_path = os.path.join(folder_path, unique_filename)

    # Save file
    path = default_storage.save(file_path, ContentFile(file.read()))

    return path


def delete_file(file_path):
    """
    Delete a file from storage

    Args:
        file_path: Path to the file to delete
    """
    if file_path and default_storage.exists(file_path):
        default_storage.delete(file_path)


def get_file_url(file_path):
    """
    Get the URL for a file

    Args:
        file_path: Path to the file

    Returns:
        str: Full URL to the file
    """
    if file_path:
        return f"{settings.MEDIA_URL}{file_path}"
    return None


def validate_file_type(file, allowed_types):
    """
    Validate file type against allowed types

    Args:
        file: File object
        allowed_types: List of allowed file extensions (e.g., ['.pdf', '.jpg'])

    Returns:
        bool: True if file type is allowed
    """
    if not file:
        return False

    file_extension = os.path.splitext(file.name)[1].lower()
    return file_extension in [ext.lower() for ext in allowed_types]


def validate_file_size(file, max_size_mb):
    """
    Validate file size

    Args:
        file: File object
        max_size_mb: Maximum file size in MB

    Returns:
        bool: True if file size is within limit
    """
    if not file:
        return False

    max_size_bytes = max_size_mb * 1024 * 1024
    return file.size <= max_size_bytes
