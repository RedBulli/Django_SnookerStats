from django.test import TestCase
from models import Strike, Player, Frame


class StrikeModelTest(TestCase):
    def setUp(self):
        self.strike = Strike()
        self.strike.points = 1
        self.player1 = Player()
        self.player1.save()
        self.player2 = Player()
        self.player2.save()
        self.frame = Frame()
        self.frame.player1 = self.player1
        self.frame.player2 = self.player2
        self.frame.save()
        self.strike.player = self.player1
        self.strike.frame = self.frame
        self.strike.save()

    def test_simple_get_from_db(self):
        db_strike = Strike.objects.get(id=self.strike.id)
        self.assertEquals(db_strike.points, 1)
        self.assertEquals(db_strike.player.id, self.player1.id)
        self.assertEquals(db_strike.frame.id, self.frame.id)
        self.assertEquals(db_strike.position, 0)


class PlayerModelTest(TestCase):
    def test_creation_and_saving(self):
        player = Player()
        player.save()


class FrameModelTest(TestCase):
    def setUp(self):
        self.frame = Frame()
        player1 = Player()
        player1.save()
        player2 = Player()
        player2.save()
        self.frame.player1 = player1
        self.frame.player2 = player2
        self.frame.save()

    def test_simple_get_from_db(self):
        db_frame = Frame.objects.get(id=self.frame.id)
        self.assertEquals(db_frame.id, self.frame.id)
        self.assertEquals(db_frame.player1.id, self.frame.player1.id)
        self.assertEquals(db_frame.player2.id, self.frame.player2.id)

    def test_get_frame_score(self):
        s1 = Strike()
        s1.frame = self.frame
        s1.player = self.frame.player1
        s1.points = 5
        s1.save()
        score = self.frame.get_score()
        self.assertEquals(score[0], 5)
