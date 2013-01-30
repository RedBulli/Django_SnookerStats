from django.contrib import admin
from Snooker.models import Frame, Strike, Match
from League.models import Player

admin.site.register(Player)
admin.site.register(Frame)
admin.site.register(Strike)
admin.site.register(Match)
