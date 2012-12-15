from django.test import TestCase
from Snooker.models import Strike, Player, Frame


def basicSetUp(obj):
    obj.player1 = Player()
    obj.player1.save()
    obj.player2 = Player()
    obj.player2.save()
    obj.frame = Frame()
    obj.frame.player1 = obj.player1
    obj.frame.player2 = obj.player2
    obj.frame.save()


class StrikeModelTest(TestCase):
    def setUp(self):
        basicSetUp(self)
        self.strike = Strike()
        self.strike.points = 1
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
    pass


class FrameModelTest(TestCase):
    def setUp(self):
        basicSetUp(self)

    def get_strike(self, player):
        strike = Strike()
        strike.frame = self.frame
        strike.player = player
        return strike

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

    def test_get_last_strike(self):
        strike = self.frame.get_last_strike()
        self.assertEquals(strike, None)
        strike = self.get_strike(self.player1)
        self.assertEquals(strike.frame, self.frame)
        self.assertEquals(strike.player, self.player1)
        self.assertEquals(strike.points, None)
        strike.points = 0
        strike.save()
        self.assertEquals(self.frame.get_last_strike(), strike)
        strike2 = self.get_strike(self.player2)
        self.assertEquals(strike2.frame, self.frame)
        self.assertEquals(strike2.player, self.player2)
        self.assertEquals(strike2.points, None)

    def test_get_other_player(self):
        strike = self.get_strike(self.player1)
        self.assertEquals(self.frame.get_other_player(strike), self.player2)
        strike.player = self.player2
        self.assertEquals(self.frame.get_other_player(strike), self.player1)
