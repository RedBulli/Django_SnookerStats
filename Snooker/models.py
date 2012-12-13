from django.db import models
from positions import PositionField
from django.db.models import Sum

class Player(models.Model):
    pass


class Frame(models.Model):
    player1 = models.ForeignKey(Player, related_name='frames_1')
    player2 = models.ForeignKey(Player, related_name='frames_2')

    def get_score(self):    
        strikes = self.strike_set
        p1 = self.player1
        p2 = self.player2
        p1_sum = strikes.filter(player=p1).aggregate(Sum('points')).get('points__sum')
        p2_sum = strikes.filter(player=p2).aggregate(Sum('points')).get('points__sum')
        return [p1_sum, p2_sum]


class Strike(models.Model):
    frame = models.ForeignKey(Frame)
    position = PositionField(collection='frame')
    points = models.IntegerField()
    player = models.ForeignKey(Player)
