from django.contrib import admin
from Snooker.models import Frame, Strike, Match
from League.models import Player, League, Tournament

admin.site.register(Player)
admin.site.register(Frame)
admin.site.register(Strike)
admin.site.register(Match)
admin.site.register(League)
admin.site.register(Tournament)
