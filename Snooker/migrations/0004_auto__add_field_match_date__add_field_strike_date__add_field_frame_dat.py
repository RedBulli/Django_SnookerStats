# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models
from django.utils import timezone

class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding field 'Match.date'
        db.add_column('Snooker_match', 'date',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, default=timezone.make_aware(datetime.datetime(2013, 1, 30, 0, 0), timezone.get_current_timezone()), blank=True),
                      keep_default=False)

        # Adding field 'Strike.date'
        db.add_column('Snooker_strike', 'date',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, default=timezone.make_aware(datetime.datetime(2013, 1, 30, 0, 0), timezone.get_current_timezone()), blank=True),
                      keep_default=False)

        # Adding field 'Frame.date'
        db.add_column('Snooker_frame', 'date',
                      self.gf('django.db.models.fields.DateTimeField')(auto_now_add=True, default=timezone.make_aware(datetime.datetime(2013, 1, 30, 0, 0), timezone.get_current_timezone()), blank=True),
                      keep_default=False)


    def backwards(self, orm):
        # Deleting field 'Match.date'
        db.delete_column('Snooker_match', 'date')

        # Deleting field 'Strike.date'
        db.delete_column('Snooker_strike', 'date')

        # Deleting field 'Frame.date'
        db.delete_column('Snooker_frame', 'date')


    models = {
        'League.player': {
            'Meta': {'object_name': 'Player'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        },
        'Snooker.frame': {
            'Meta': {'object_name': 'Frame'},
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'match': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Match']"}),
            'position': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'winner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['League.Player']", 'null': 'True', 'blank': 'True'})
        },
        'Snooker.match': {
            'Meta': {'object_name': 'Match'},
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player1': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'frames_1'", 'to': "orm['League.Player']"}),
            'player2': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'frames_2'", 'to': "orm['League.Player']"})
        },
        'Snooker.strike': {
            'Meta': {'object_name': 'Strike'},
            'date': ('django.db.models.fields.DateTimeField', [], {'auto_now_add': 'True', 'blank': 'True'}),
            'foul': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'frame': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Frame']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['League.Player']"}),
            'points': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'position': ('django.db.models.fields.IntegerField', [], {'default': '-1'})
        }
    }

    complete_apps = ['Snooker']