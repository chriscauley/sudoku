import django; import os;os.environ['DJANGO_SETTINGS_MODULE'] = 'server.settings';django.setup()

from bs4 import BeautifulSoup
import os
import re
import requests

from puzzle.models import Puzzle, update_ctc

for puzzle in Puzzle.objects.all():
    update_ctc(puzzle)