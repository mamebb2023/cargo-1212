import re
from django.core.exceptions import ValidationError


def validate_phone_number(phone_number):
    """
    Validate phone number format

    Args:
        phone_number: Phone number string

    Returns:
        bool: True if valid
    """
    pattern = r'^\+?1?\d{9,15}$'
    return bool(re.match(pattern, phone_number))


def validate_email_domain(email):
    """
    Validate email domain (basic check)

    Args:
        email: Email string

    Returns:
        bool: True if valid domain
    """
    # Basic email validation
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return bool(re.match(pattern, email))


def clean_string(value):
    """
    Clean and strip whitespace from string

    Args:
        value: String to clean

    Returns:
        str: Cleaned string
    """
    if value:
        return str(value).strip()
    return value


def truncate_text(text, max_length=100, suffix="..."):
    """
    Truncate text to specified length

    Args:
        text: Text to truncate
        max_length: Maximum length
        suffix: Suffix to add if truncated

    Returns:
        str: Truncated text
    """
    if not text:
        return ""

    text = str(text)
    if len(text) <= max_length:
        return text

    return text[:max_length - len(suffix)] + suffix


def format_currency(amount, currency="ETB"):
    """
    Format currency amount

    Args:
        amount: Numeric amount
        currency: Currency code

    Returns:
        str: Formatted currency string
    """
    try:
        amount = float(amount)
        return f"{currency} {amount:,.2f}"
    except (ValueError, TypeError):
        return f"{currency} 0.00"


def get_client_ip(request):
    """
    Get client IP address from request

    Args:
        request: Django request object

    Returns:
        str: Client IP address
    """
    x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
    if x_forwarded_for:
        ip = x_forwarded_for.split(',')[0]
    else:
        ip = request.META.get('REMOTE_ADDR')
    return ip


def calculate_percentage(part, total):
    """
    Calculate percentage

    Args:
        part: Part value
        total: Total value

    Returns:
        float: Percentage
    """
    try:
        if total == 0:
            return 0
        return (part / total) * 100
    except (ZeroDivisionError, TypeError):
        return 0
