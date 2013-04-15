from django.conf.urls import patterns, include, url
from tastypie.api import Api
from Snooker.api import StrikeResource, FrameResource, PlayerResource, MatchResource, LeagueResource, TournamentResource
from django.contrib import admin
from Snooker.views import index, client

v1_api = Api(api_name='v1')
v1_api.register(StrikeResource())
v1_api.register(FrameResource())
v1_api.register(PlayerResource())
v1_api.register(MatchResource())
v1_api.register(LeagueResource())
v1_api.register(TournamentResource())

admin.autodiscover()

urlpatterns = patterns('',
    # Examples:
    url(r'^$', index),
    url(r'^client/$', client),
    (r'^api/', include(v1_api.urls)),

    # url(r'^SnookerStats/', include('SnookerStats.foo.urls')),

    # Uncomment the admin/doc line below to enable admin documentation:
    # url(r'^admin/doc/', include('django.contrib.admindocs.urls')),

    # Uncomment the next line to enable the admin:
    url(r'^admin/', include(admin.site.urls)),
)
