from django.db import models

class Player(models.Model):
  pass

class Frame(models.Model):
  pass

class Strike(models.Model):
  order = models.IntegerField()
  points = models.IntegerField()
  frame = models.ForeignKey(Frame)
  player = models.ForeignKey(Player)
