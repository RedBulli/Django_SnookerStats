from django.db import models
from positions import PositionField


class Player(models.Model):
    pass


class Frame(models.Model):
    pass


class Strike(models.Model):
    frame = models.ForeignKey(Frame)
    position = PositionField(collection='frame')
    points = models.IntegerField()
    player = models.ForeignKey(Player)
