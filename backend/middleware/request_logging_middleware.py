import logging
import time
from django.utils.deprecation import MiddlewareMixin


logger = logging.getLogger(__name__)


class RequestLoggingMiddleware(MiddlewareMixin):
    """
    Middleware to log HTTP requests
    """

    def process_request(self, request):
        """
        Log incoming requests
        """
        request.start_time = time.time()

        # Log request details
        user_info = ""
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            user_info = f" [User: {request.user.email} ({request.user.role})]"

        logger.info(
            f"REQUEST: {request.method} {request.path} "
            f"from {request.META.get('REMOTE_ADDR', 'unknown')}{user_info}"
        )

        return None

    def process_response(self, request, response):
        """
        Log response details
        """
        if hasattr(request, 'start_time'):
            duration = time.time() - request.start_time
        else:
            duration = 0

        user_info = ""
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            user_info = f" [User: {request.user.email}]"

        logger.info(
            f"RESPONSE: {request.method} {request.path} "
            f"-> {response.status_code} ({duration:.2f}s){user_info}"
        )

        return response

    def process_exception(self, request, exception):
        """
        Log exceptions
        """
        user_info = ""
        if hasattr(request, 'user') and request.user and request.user.is_authenticated:
            user_info = f" [User: {request.user.email}]"

        logger.error(
            f"EXCEPTION: {request.method} {request.path} "
            f"-> {str(exception)}{user_info}",
            exc_info=True
        )

        return None
