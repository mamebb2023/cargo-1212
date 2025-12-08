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
        role_requirements = {
            # User endpoints
            "/api/users/register/": None,  # Anyone can register
            "/api/users/login/": None,  # Anyone can login
            "/api/users/profile/": ["shipper", "carrier", "admin"],
            "/api/users/top-rated/": ["shipper", "carrier", "admin"],
            # Bid endpoints
            "/api/bids/": [
                "shipper",
                # "carrier",
                "admin",
            ],  # Shippers create/list, carriers can list
            "/api/bids/create/": ["shipper"],
            "/api/bids/my-bids/": ["shipper"],
            # Offer endpoints
            "/api/offers/": ["carrier"],  # Only carriers can create/list offers
            "/api/offers/submit/": ["carrier"],
            # Payment endpoints
            "/api/payments/": ["shipper", "carrier", "admin"],
            # Verification endpoints
            "/api/verification/": ["shipper", "carrier", "admin"],
            # Rating endpoints
            "/api/ratings/": ["shipper", "carrier", "admin"],
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

                # Check if user's role is allowed
                if request.user.role not in allowed_roles:
                    return JsonResponse(
                        api_response(
                            success=False,
                            message=f"Access denied. Required role: {', '.join(allowed_roles)}",
                        ),
                        status=status.HTTP_403_FORBIDDEN,
                    )

                break

        return None
