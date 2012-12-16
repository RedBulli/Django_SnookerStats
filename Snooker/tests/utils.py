from django.test import TestCase
from Snooker.utils import none_to_zero


class UtilsTest(TestCase):
    def test_none_to_zero(self):
        self.assertEquals(none_to_zero(1), 1)
        self.assertEquals(none_to_zero(None), 0)
