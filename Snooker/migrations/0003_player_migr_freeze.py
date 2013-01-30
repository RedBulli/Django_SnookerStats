# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import DataMigration
from django.db import models

class Migration(DataMigration):

    def forwards(self, orm):
        "Write your forwards methods here."
        # Note: Remember to use orm['appname.ModelName'] rather than "from appname.models..."

    def backwards(self, orm):
        "Write your backwards methods here."

    models = {
        'League.player': {
            'Meta': {'object_name': 'Player'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        },
        'Snooker.frame': {
            'Meta': {'object_name': 'Frame'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'match': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Match']"}),
            'position': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'winner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['League.Player']", 'null': 'True', 'blank': 'True'})
        },
        'Snooker.match': {
            'Meta': {'object_name': 'Match'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player1': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'frames_1'", 'to': "orm['League.Player']"}),
            'player2': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'frames_2'", 'to': "orm['League.Player']"})
        },
        'Snooker.strike': {
            'Meta': {'object_name': 'Strike'},
            'foul': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'frame': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Frame']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['League.Player']"}),
            'points': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'position': ('django.db.models.fields.IntegerField', [], {'default': '-1'})
        }
    }

    complete_apps = ['League', 'Snooker']
    symmetrical = True
