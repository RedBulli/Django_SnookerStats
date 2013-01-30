# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        # Adding model 'Player'
        db.create_table('Snooker_player', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('name', self.gf('django.db.models.fields.CharField')(unique=True, max_length=100)),
        ))
        db.send_create_signal('Snooker', ['Player'])

        # Adding model 'Match'
        db.create_table('Snooker_match', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('player1', self.gf('django.db.models.fields.related.ForeignKey')(related_name='frames_1', to=orm['Snooker.Player'])),
            ('player2', self.gf('django.db.models.fields.related.ForeignKey')(related_name='frames_2', to=orm['Snooker.Player'])),
        ))
        db.send_create_signal('Snooker', ['Match'])

        # Adding model 'Frame'
        db.create_table('Snooker_frame', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('match', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['Snooker.Match'])),
            ('position', self.gf('django.db.models.fields.IntegerField')(default=-1)),
            ('winner', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['Snooker.Player'], null=True, blank=True)),
        ))
        db.send_create_signal('Snooker', ['Frame'])

        # Adding model 'Strike'
        db.create_table('Snooker_strike', (
            ('id', self.gf('django.db.models.fields.AutoField')(primary_key=True)),
            ('frame', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['Snooker.Frame'])),
            ('position', self.gf('django.db.models.fields.IntegerField')(default=-1)),
            ('points', self.gf('django.db.models.fields.PositiveSmallIntegerField')()),
            ('player', self.gf('django.db.models.fields.related.ForeignKey')(to=orm['Snooker.Player'])),
            ('foul', self.gf('django.db.models.fields.BooleanField')(default=False)),
        ))
        db.send_create_signal('Snooker', ['Strike'])


    def backwards(self, orm):
        # Deleting model 'Player'
        db.delete_table('Snooker_player')

        # Deleting model 'Match'
        db.delete_table('Snooker_match')

        # Deleting model 'Frame'
        db.delete_table('Snooker_frame')

        # Deleting model 'Strike'
        db.delete_table('Snooker_strike')


    models = {
        'Snooker.frame': {
            'Meta': {'object_name': 'Frame'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'match': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Match']"}),
            'position': ('django.db.models.fields.IntegerField', [], {'default': '-1'}),
            'winner': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Player']", 'null': 'True', 'blank': 'True'})
        },
        'Snooker.match': {
            'Meta': {'object_name': 'Match'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player1': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'frames_1'", 'to': "orm['Snooker.Player']"}),
            'player2': ('django.db.models.fields.related.ForeignKey', [], {'related_name': "'frames_2'", 'to': "orm['Snooker.Player']"})
        },
        'Snooker.player': {
            'Meta': {'object_name': 'Player'},
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'name': ('django.db.models.fields.CharField', [], {'unique': 'True', 'max_length': '100'})
        },
        'Snooker.strike': {
            'Meta': {'object_name': 'Strike'},
            'foul': ('django.db.models.fields.BooleanField', [], {'default': 'False'}),
            'frame': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Frame']"}),
            'id': ('django.db.models.fields.AutoField', [], {'primary_key': 'True'}),
            'player': ('django.db.models.fields.related.ForeignKey', [], {'to': "orm['Snooker.Player']"}),
            'points': ('django.db.models.fields.PositiveSmallIntegerField', [], {}),
            'position': ('django.db.models.fields.IntegerField', [], {'default': '-1'})
        }
    }

    complete_apps = ['Snooker']