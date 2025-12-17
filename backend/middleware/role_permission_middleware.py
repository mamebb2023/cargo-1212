from django.http import JsonResponse
from django.utils.deprecation import MiddlewareMixin
from rest_framework import status
from utils.response import api_response


class RolePermissionMiddleware(MiddlewareMixin):
    """
    Middleware to enforce role-based permissions
    """

    def process_view(self, request, view_func, view_args, view_kwargs):
        """
        Check role-based permissions for different endpoints
        """

        # Define role requirements for different endpoints
        # Can be a list of roles or a dict with method-specific roles
        role_requirements = {
            # User endpoints
            "/api/users/register/": None,  # Anyone can register
            "/api/users/login/": None,  # Anyone can login
            "/api/users/profile/": ["shipper", "carrier", "admin"],
            "/api/users/top-rated/": ["shipper", "carrier", "admin"],
            # Bid endpoints - specific paths first
            "/api/bids/create/": ["shipper"],
            "/api/bids/my-bids/": ["shipper", "admin"],
            "/api/bids/": {
                "GET": ["shipper", "carrier", "admin"],  # All authenticated users can view bids
                "POST": ["shipper", "carrier", "admin"],  # Shippers can create bids
            },
            # Offer endpoints
            "/api/offers/": ["shipper", "carrier", "admin"],  # Shippers can view offers on their bids, carriers can create/view their offers
            "/api/offers/submit/": ["carrier"],
            # Payment endpoints
            "/api/payments/": ["shipper", "carrier", "admin"],
            # Verification endpoints
            "/api/verification/": ["shipper", "carrier", "admin"],
            # Rating endpoints
            "/api/ratings/": ["shipper", "carrier", "admin"],
            "/api/ratings/reviews/create/": ["shipper", "carrier", "admin"],
            # Admin endpoints
            "/api/admin/": ["admin"],
        }

        # Check if the current path requires specific roles
        for path, allowed_roles in role_requirements.items():
            if request.path.startswith(path):
                if allowed_roles is None:
                    # No role restriction
                    break

                # Check if user is authenticated
                if (
                    not hasattr(request, "user")
                    or not request.user
                    or not request.user.is_authenticated
                ):
                    return JsonResponse(
                        api_response(success=False, message="Authentication required"),
                        status=status.HTTP_401_UNAUTHORIZED,
                    )

                # Get the actual allowed roles (could be list or dict with methods)
                actual_allowed_roles = allowed_roles
                if isinstance(allowed_roles, dict):
                    # Method-specific roles
                    method_roles = allowed_roles.get(request.method)
                    if method_roles is not None:
                        actual_allowed_roles = method_roles
                    else:
                        # No specific rule for this method, fall back to general rule
                        actual_allowed_roles = allowed_roles.get("GET", [])

                # Check if user's role is allowed
                if request.user.role not in actual_allowed_roles:
                    return JsonResponse(
                        api_response(
                            success=False,
                            message=f"Access denied. Required role: {', '.join(actual_allowed_roles)}",
                        ),
                        status=status.HTTP_403_FORBIDDEN,
                    )

                break

        return None
