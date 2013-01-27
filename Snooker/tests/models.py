from django.test import TestCase
from Snooker.models import Strike, Player, Frame, Match
from django.core.exceptions import ValidationError

def basicSetUp(obj):
    obj.player1 = Player()
    obj.player1.name = "P1"
    obj.player1.save()
    obj.player2 = Player()
    obj.player2.name = "P2"
    obj.player2.save()
    obj.match = Match()
    obj.match.player1 = obj.player1
    obj.match.player2 = obj.player2
    obj.match.save()
    obj.frame = Frame()
    obj.frame.match = obj.match
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
        self.assertEquals(db_strike, self.strike)

    def test_strike_player_not_in_match(self):
        player3 = Player()
        player3.name = 'third'
        player3.save()
        strike = Strike()
        strike.points = 1
        strike.frame = self.frame
        strike.player = player3
        self.assertRaises(ValidationError, strike.save)


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
        self.assertEquals(db_frame, self.frame)

    def test_get_frame_scores(self):
        self.assertEquals(self.frame.get_player1_score(), 0)
        self.assertEquals(self.frame.get_player2_score(), 0)
        self.strike(self.player1, 5)
        self.assertEquals(self.frame.get_player1_score(), 5)
        self.assertEquals(self.frame.get_player2_score(), 0)
        self.strike(self.player2, 4, True)
        self.assertEquals(self.frame.get_player1_score(), 9)
        self.assertEquals(self.frame.get_player2_score(), 0)

    def test_get_last_strike(self):
        strike = self.frame.get_last_strike()
        self.assertEquals(strike, None)
        strike = self.strike(self.player1, 0)
        self.assertEquals(self.frame.get_last_strike(), strike)
        strike2 = self.strike(self.player2, 5)
        self.assertEquals(self.frame.get_last_strike(), strike2)

    def test_get_other_player(self):
        self.assertEquals(self.frame.get_other_player(self.player1), self.player2)
        self.assertEquals(self.frame.get_other_player(self.player2), self.player1)

    def test_get_break_points(self):
        self.assertEquals(self.frame.get_break_points(), 0)
        self.strike(self.player1, 1)
        self.assertEquals(self.frame.get_break_points(), 1)
        self.strike(self.player1, 5)
        self.assertEquals(self.frame.get_break_points(), 6)
        self.strike(self.player1, 1)
        self.assertEquals(self.frame.get_break_points(), 7)
        self.strike(self.player1, 0)
        self.assertEquals(self.frame.get_break_points(), 0)

    def test_undo(self):
        self.strike(self.player1, 1)
        self.strike(self.player1, 5)
        self.frame.undo_last_strike()
        self.assertEquals(self.frame.get_break_points(), 1)

    def test_set_winner_not_in_match(self):
        player3 = Player()
        player3.name = 'third'
        player3.save()
        self.frame.winner = player3
        self.assertRaises(ValidationError, self.frame.save)


class MatchModelTest(TestCase):
    def setUp(self):
        basicSetUp(self)

    def test_get_from_db(self):
        db_match = Match.objects.get(id=self.match.id)

    def test_same_players(self):
        match = Match()
        match.player1 = self.player1
        match.player2 = self.player1
        self.assertRaises(ValidationError, match.save)

    def test_get_frame_scores(self):
        self.frame.winner = self.player1
        self.frame.save()
        self.assertEquals(self.match.get_player1_frames(), 1)
        self.assertEquals(self.match.get_player2_frames(), 0)
        frame2 = Frame()
        frame2.match = self.match
        frame2.winner = self.player2
        frame2.save()
        self.assertEquals(self.match.get_player1_frames(), 1)
        self.assertEquals(self.match.get_player2_frames(), 1)

    def test_two_unfinished_frames(self):
        frame2 = Frame()
        frame2.match = self.match
        self.assertRaises(ValidationError, frame2.save)
