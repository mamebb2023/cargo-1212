from rest_framework_simplejwt.tokens import RefreshToken


def get_tokens_for_user(user):
    """
    Generate access and refresh tokens for a user

    Args:
        user: User instance

    Returns:
        dict: Dictionary containing access_token and refresh_token
    """
    refresh = RefreshToken.for_user(user)

    return {
        'access_token': str(refresh.access_token),
        'refresh_token': str(refresh)
    }


def refresh_access_token(refresh_token):
    """
    Generate new access token from refresh token

    Args:
        refresh_token: Refresh token string

    Returns:
        dict: Dictionary containing new access_token
    """
    try:
        refresh = RefreshToken(refresh_token)
        return {
            'access_token': str(refresh.access_token)
        }
    except Exception as e:
        raise ValueError("Invalid refresh token")


def blacklist_token(token):
    """
    Blacklist a token (for logout)

    Args:
        token: Token to blacklist
    """
    try:
        refresh = RefreshToken(token)
        refresh.blacklist()
    except Exception:
        pass  # Token might already be blacklisted or invalid
