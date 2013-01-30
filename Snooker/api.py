from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from models import Strike, Frame, Player, Match
from tastypie import fields
from tastypie.exceptions import BadRequest
from tastypie.validation import Validation
from django.conf.urls import url
from django.shortcuts import get_object_or_404
from tastypie.authorization import Authorization
from django.core import exceptions
from tastypie.serializers import Serializer

class PlayerResource(ModelResource):
    class Meta:
        queryset = Player.objects.all()
        resource_name = 'players'
        authorization = Authorization()


class MatchResource(ModelResource):
    player1 = fields.ToOneField(PlayerResource, 'player1')
    player2 = fields.ToOneField(PlayerResource, 'player2')
    player1_frames = fields.IntegerField('get_player1_frames', readonly=True)
    player2_frames = fields.IntegerField('get_player2_frames', readonly=True)

    class Meta:
        queryset = Match.objects.all()
        resource_name = 'matches'
        authorization = Authorization()


class FrameResource(ModelResource):
    match = fields.ToOneField(MatchResource, 'match')
    winner = fields.ToOneField(PlayerResource, 'winner', null=True)
    player1_score = fields.IntegerField('get_player1_score', readonly=True)
    player2_score = fields.IntegerField('get_player2_score', readonly=True)
    
    class Meta:
        queryset = Frame.objects.all()
        resource_name = 'frames'
        filtering = {
            'match': ALL
        }
        authorization = Authorization()

class StrikeResource(ModelResource):
    frame = fields.ToOneField(FrameResource, 'frame')
    player = fields.ToOneField(PlayerResource, 'player')
    position = fields.IntegerField(attribute='position')

    class Meta:
        queryset = Strike.objects.all()
        resource_name = 'strikes'
        filtering = {
            'frame': ALL,
            'player': ALL
        }
        authorization = Authorization()
        ordering = ['position']
