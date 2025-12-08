from rest_framework_simplejwt.authentication import JWTAuthentication
from rest_framework_simplejwt.exceptions import InvalidToken, TokenError
from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from django.conf import settings


class AuthMiddleware(MiddlewareMixin):
    """
    Middleware to attach user to request from JWT token
    """

    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Process the request before it reaches the view.
        Attach authenticated user to request if JWT token is present.
        """
        # Skip authentication for certain paths
        exempted_paths = [
            '/admin/',
            '/api/users/register/',
            '/api/users/login/',
        ]

        if any(request.path.startswith(path) for path in exempted_paths):
            return None

        # Try to authenticate with JWT
        auth = JWTAuthentication()
        try:
            # Get token from Authorization header
            header = self.get_authorization_header(request)
            if header is None:
                return None

            # Authenticate user
            result = auth.authenticate(request)
            if result is not None:
                user, token = result
                request.user = user
                request.auth = token

        except (InvalidToken, TokenError) as e:
            # Token is invalid, but we don't block the request
            # Views that require authentication will handle this
            pass

        return None

    def get_authorization_header(self, request):
        """
        Return request's 'Authorization:' header, as a bytestring.
        """
        auth = request.META.get('HTTP_AUTHORIZATION', b'')
        if isinstance(auth, str):
            # Work around django test client oddness
            auth = auth.encode('iso-8859-1')
        return auth
