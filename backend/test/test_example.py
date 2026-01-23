"""
Simple test file for Cargo1212 backend
"""

import unittest
from django.test import TestCase
from django.contrib.auth import get_user_model


class ExampleTestCase(TestCase):
    """Basic test case example"""

    def setUp(self):
        """Set up test data"""
        self.User = get_user_model()
        self.test_user = self.User.objects.create_user(
            email="test@example.com",
            full_name="Test User",
            phone="+1234567890",
            password="testpass123"
        )

    def test_user_creation(self):
        """Test that a user can be created"""
        self.assertEqual(self.test_user.email, "test@example.com")
        self.assertEqual(self.test_user.full_name, "Test User")
        self.assertEqual(self.test_user.role, "shipper")  # default role
        self.assertFalse(self.test_user.is_verified)

    def test_user_str_method(self):
        """Test the string representation of User model"""
        expected = "Test User (test@example.com) - shipper"
        self.assertEqual(str(self.test_user), expected)

    def test_user_properties(self):
        """Test user role properties"""
        self.assertTrue(self.test_user.is_shipper)
        self.assertFalse(self.test_user.is_carrier)
        self.assertFalse(self.test_user.is_admin)


if __name__ == '__main__':
    unittest.main()