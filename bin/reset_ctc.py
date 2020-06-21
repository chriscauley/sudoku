import django; import os;os.environ['DJANGO_SETTINGS_MODULE'] = 'server.settings';django.setup()

from puzzle.models import fetch_ctc, Puzzle

for puzzle in Puzzle.objects.all():
    puzzle.data.pop('ctc', None)
    puzzle.save()