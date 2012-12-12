from django.test import TestCase
from models import Strike

class StrikeModelTest(TestCase):
  def test_creation_and_saving(self):
    strike = Strike()
    strike.points = 1
    strike.save()
    db_strike = Strike.objects.get(id=strike.id)
    self.assertEquals(db_strike.points, 1)