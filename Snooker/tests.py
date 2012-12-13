from django.test import TestCase
from models import Strike, Player, Frame


class StrikeModelTest(TestCase):
    def setUp(self):
        self.strike = Strike()
        self.strike.points = 1
        self.player = Player()
        self.player.save()
        self.frame = Frame()
        self.frame.save()
        self.strike.player = self.player
        self.strike.frame = self.frame
        self.strike.save()

    def test_simple_get_from_db(self):
        db_strike = Strike.objects.get(id=self.strike.id)
        self.assertEquals(db_strike.points, 1)
        self.assertEquals(db_strike.player.id, self.player.id)
        self.assertEquals(db_strike.frame.id, self.frame.id)
        self.assertEquals(db_strike.position, 0)


class PlayerModelTest(TestCase):
    def test_creation_and_saving(self):
        player = Player()
        player.save()


class FrameModelTest(TestCase):
    def setUp(self):
        self.frame = Frame()
        self.frame.save()

    def test_simple_get_from_db(self):
        db_frame = Frame.objects.get(id=self.frame.id)
        self.assertEquals(db_frame.id, self.frame.id)
