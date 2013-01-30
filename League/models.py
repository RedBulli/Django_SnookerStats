from django.db import models

class Player(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __unicode__(self):
        return u'%s' % (self.name)

    def save(self):
        self.full_clean()
        super(Player, self).save()