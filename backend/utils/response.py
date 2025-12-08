from rest_framework.response import Response


def api_response(success=True, message="", data=None, status_code=None):
    """
    Standardized API response format

    Args:
        success (bool): Whether the operation was successful
        message (str): Response message
        data: Response data (can be dict, list, or any serializable object)
        status_code: HTTP status code (optional)

    Returns:
        dict: Standardized response dictionary
    """
    response = {
        "success": success,
        "message": message,
    }

    if data is not None:
        response["data"] = data

    return response
