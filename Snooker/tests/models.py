from django.test import TestCase
from Snooker.models import Strike, Player, Frame


def basicSetUp(obj):
    player1 = Player()
    player1.name = "P1"
    player1.save()
    player2 = Player()
    player2.name = "P2"
    player2.save()
    obj.frame = Frame()
    obj.frame.player1 = player1
    obj.frame.player2 = player2
    obj.frame.save()


class StrikeModelTest(TestCase):
    def setUp(self):
        basicSetUp(self)
        self.strike = Strike()
        self.strike.points = 1
        self.strike.player = self.frame.player1
        self.strike.frame = self.frame
        self.strike.save()

    def test_unicode(self):
        string_rep = 'P1 - P2[0]: P1: 1'
        self.assertEquals(self.strike.__unicode__(), string_rep)

    def test_simple_get_from_db(self):
        db_strike = Strike.objects.get(id=self.strike.id)
        self.assertEquals(db_strike, self.strike)


class PlayerModelTest(TestCase):
    pass


class FrameModelTest(TestCase):
    def setUp(self):
        basicSetUp(self)

    def strike(self, player, points, foul=False):
        strike = Strike()
        strike.frame = self.frame
        strike.player = player
        strike.points = points
        strike.foul = foul
        strike.save()
        return strike

    def test_simple_get_from_db(self):
        db_frame = Frame.objects.get(id=self.frame.id)
        self.assertEquals(db_frame.id, self.frame.id)
        self.assertEquals(db_frame.player1.id, self.frame.player1.id)
        self.assertEquals(db_frame.player2.id, self.frame.player2.id)

    def test_same_players(self):
        frame = Frame()
        frame.player1 = self.frame.player1
        frame.player2 = self.frame.player1
        self.assertRaises(Frame.SamePlayerException, frame.save)

    def test_get_frame_scores(self):
        self.assertEquals(self.frame.get_player1_score(), 0)
        self.assertEquals(self.frame.get_player2_score(), 0)
        self.strike(self.frame.player1, 5)
        self.assertEquals(self.frame.get_player1_score(), 5)
        self.assertEquals(self.frame.get_player2_score(), 0)
        self.strike(self.frame.player2, 4, True)
        self.assertEquals(self.frame.get_player1_score(), 9)
        self.assertEquals(self.frame.get_player2_score(), 0)

    def test_get_last_strike(self):
        strike = self.frame.get_last_strike()
        self.assertEquals(strike, None)
        strike = self.strike(self.frame.player1, 0)
        self.assertEquals(self.frame.get_last_strike(), strike)
        strike2 = self.strike(self.frame.player2, 5)
        self.assertEquals(self.frame.get_last_strike(), strike2)

    def test_get_other_player(self):
        self.assertEquals(self.frame.get_other_player(self.frame.player1), self.frame.player2)
        self.assertEquals(self.frame.get_other_player(self.frame.player2), self.frame.player1)

    def test_get_break_points(self):
        self.assertEquals(self.frame.get_break_points(), 0)
        self.strike(self.frame.player1, 1)
        self.assertEquals(self.frame.get_break_points(), 1)
        self.strike(self.frame.player1, 5)
        self.assertEquals(self.frame.get_break_points(), 6)
        self.strike(self.frame.player1, 1)
        self.assertEquals(self.frame.get_break_points(), 7)
        self.strike(self.frame.player1, 0)
        self.assertEquals(self.frame.get_break_points(), 0)

    def test_undo(self):
        self.strike(self.frame.player1, 1)
        self.strike(self.frame.player1, 5)
        self.frame.undo_last_strike()
        self.assertEquals(self.frame.get_break_points(), 1)
