from django.db import models
from positions import PositionField
from django.db.models import Sum, Max
from utils import none_to_zero
from django.core.exceptions import ValidationError
from django.core.validators import MaxValueValidator, MinValueValidator
from League.models import Player, League, Tournament


class Match(models.Model):
    player1 = models.ForeignKey(Player, related_name='frames_1', editable=False)
    player2 = models.ForeignKey(Player, related_name='frames_2', editable=False)
    date = models.DateTimeField(auto_now_add=True)
    league = models.ForeignKey(League, editable=False)
    tournament = models.ForeignKey(Tournament, editable=False, null=True, blank=True)

    def __unicode__(self):
        return u'%s - %s' % (self.player1, self.player2)

    def save(self):
        self.full_clean()
        super(Match, self).save()

    def clean(self):
        if (self.player1 == self.player2):
            raise ValidationError('Player can not play against himself.')

    def get_player1_frames(self):
        return self.frame_set.filter(winner = self.player1).count()

    def get_player2_frames(self):
        return self.frame_set.filter(winner = self.player2).count()


class Frame(models.Model):
    match = models.ForeignKey(Match)
    position = PositionField(collection='match')
    winner = models.ForeignKey(Player, null=True, blank=True)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return u'%s - %s: %s' % (self.match.player1, self.match.player2, self.position)

    def save(self):
        self.full_clean()
        super(Frame, self).save()

    def clean(self):
        if (self.winner):
            if ((self.winner != self.match.player1) and (self.winner != self.match.player2)):
                raise ValidationError('Frame has to be in the match where the frame belongs.')
        else:
            if (Frame.objects.filter(match=self.match).filter(winner=None).exclude(id=self.id).count() > 0):
                raise ValidationError('All the frames in the match must be finished before starting a new frame.')

    def get_player1_score(self):
        return self.get_score_for(self.match.player1)
 
    def get_player2_score(self):
        return self.get_score_for(self.match.player2)

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
        if player == self.match.player1:
            return self.match.player2
        else:
            return self.match.player1

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
    points = models.PositiveSmallIntegerField(validators=[MaxValueValidator(7), MinValueValidator(0)])
    player = models.ForeignKey(Player)
    foul = models.BooleanField(default=False)
    date = models.DateTimeField(auto_now_add=True)

    def __unicode__(self):
        return u'%s[%s]: %s: %s' % (self.frame, self.position, self.player, 
            self.points)

    def save(self):
        self.full_clean()
        super(Strike, self).save()

    def clean(self):
        if ((self.player != self.frame.match.player1) and (self.player != self.frame.match.player2)):
            raise ValidationError('Player has to be in the match where the frame belongs.')

    def is_pot(self):
        return (self.points > 0) and (not self.foul)

    def get_previous(self):
        return Strike.objects.get(frame=self.frame, position=self.position - 1)


class Break(models.Model):
    pass