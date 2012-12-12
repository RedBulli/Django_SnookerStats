from django.db import models

class Strike(models.Model):
  points = models.IntegerField()