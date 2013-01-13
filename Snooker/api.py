from tastypie.resources import ModelResource, ALL, ALL_WITH_RELATIONS
from models import Strike, Frame, Player
from tastypie import fields
from django.conf.urls import url
from django.shortcuts import get_object_or_404
from tastypie.authorization import Authorization


class PlayerResource(ModelResource):
    class Meta:
        queryset = Player.objects.all()
        resource_name = 'players'
        authorization = Authorization()


class FrameResource(ModelResource):
    player1 = fields.ToOneField(PlayerResource, 'player1')
    player2 = fields.ToOneField(PlayerResource, 'player2')
    player1_score = fields.IntegerField('get_player1_score', readonly=True)
    player2_score = fields.IntegerField('get_player2_score', readonly=True)
    current_break = fields.IntegerField('get_break_points', readonly=True)

    class Meta:
        queryset = Frame.objects.all()
        resource_name = 'frames'
        authorization = Authorization()


class StrikeResource(ModelResource):
    frame = fields.ToOneField(FrameResource, 'frame')
    player = fields.ToOneField(PlayerResource, 'player')

    class Meta:
        queryset = Strike.objects.all()
        resource_name = 'strikes'
        filtering = {
            'frame': ALL
        }
        authorization = Authorization()
