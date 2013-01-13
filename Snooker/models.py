from django.db import models
from positions import PositionField
from django.db.models import Sum, Max
from utils import none_to_zero


class Player(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __unicode__(self):
        return u'%s' % (self.name)


class Frame(models.Model):
    player1 = models.ForeignKey(Player, related_name='frames_1')
    player2 = models.ForeignKey(Player, related_name='frames_2')

    def __unicode__(self):
        return u'%s - %s' % (self.player1, self.player2)

    def get_player1_score(self):
        return self.get_score_for(self.player1)

    def get_player2_score(self):
        return self.get_score_for(self.player2)

    def get_score_for(self, player):
        own_scores = none_to_zero(self.strike_set.filter(player=player).filter(
            foul=False).aggregate(Sum('points')).get('points__sum'))
        opp_fouls = none_to_zero(self.strike_set.filter(
            player=self.get_other_player(player)).filter(foul=True).aggregate(
            Sum('points')).get('points__sum'))
        return own_scores + opp_fouls

    def get_last_strike(self):
        last_position = self.strike_set.aggregate(Max('position')).get('position__max')
        if last_position != None:
            return self.strike_set.get(position=last_position)
        else:
            return None

    def get_other_player(self, player):
        if player == self.player1:
            return self.player2
        else:
            return self.player1

    def get_break_points(self):
        sum = 0
        strike = self.get_last_strike()
        if (strike != None):
            player = strike.player
        while ((strike != None) and strike.is_pot() and (strike.player == player)):
            sum += strike.points
            try:
                strike = strike.get_previous()
            except Strike.DoesNotExist:
                strike = None
        return sum

    def undo_last_strike(self):
        strike = self.get_last_strike()
        strike.delete()


class Strike(models.Model):
    frame = models.ForeignKey(Frame)
    position = PositionField(collection='frame')
    points = models.IntegerField()
    player = models.ForeignKey(Player)
    foul = models.BooleanField(default=False)

    def __unicode__(self):
        return u'%s[%s]: %s: %s' % (self.frame, self.position, self.player, 
            self.points)

    def is_pot(self):
        return (self.points > 0) and (not self.foul)

    def get_previous(self):
        return Strike.objects.get(position=self.position - 1)
