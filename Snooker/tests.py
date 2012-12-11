from django.test import TestCase
from models import Strike

class StrikeModelTest(TestCase):
  def test_creation_and_saving(self):
    strike = Strike()
    strike.save()
