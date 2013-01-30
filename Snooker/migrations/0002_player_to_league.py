# -*- coding: utf-8 -*-
import datetime
from south.db import db
from south.v2 import SchemaMigration
from django.db import models


class Migration(SchemaMigration):

    def forwards(self, orm):
        db.rename_table('Snooker_player', 'League_player')

    def backwards(self, orm):
        db.rename_table('League_player', 'Snooker_player') 
