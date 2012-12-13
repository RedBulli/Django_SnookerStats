from django.test import TestCase
from models import Strike, Player, Frame

class StrikeModelTest(TestCase):
  def test_creation_and_saving(self):
    strike = Strike()
    strike.points = 1
    player = Player()
    player.save()
    frame = Frame()
    frame.save()
    strike.player = player
    strike.frame = frame
    strike.order = 1
    strike.save()
    db_strike = Strike.objects.get(id=strike.id)
    self.assertEquals(db_strike.points, 1)
    self.assertEquals(db_strike.player.id, player.id)
    self.assertEquals(db_strike.frame.id, frame.id)
    self.assertEquals(db_strike.order, 1)

class PlayerModelTest(TestCase):
  def test_creation_and_saving(self):
    player = Player()
    player.save()

class FrameModelTest(TestCase):
  def test_creation_and_saving(self):
    frame = Frame()
    frame.save()

  def test_next_order_no(self):
    pass
