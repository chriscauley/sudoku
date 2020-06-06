import django; import os;os.environ['DJANGO_SETTINGS_MODULE'] = 'server.settings';django.setup()

from bs4 import BeautifulSoup
import json
import os
import re
import requests

from puzzle.ctc import update_ctc, refresh_ctc, update_video
from puzzle.models import Puzzle, Video

def print_counts():
    print("Puzzles:", Puzzle.objects.count())
    print("Videos:", Video.objects.count())

print("start")

# for video in Video.objects.all():
#     update_video(video, Puzzle)
#     video.save()

# with open('.ctc.json', 'r') as f:
#     video_urls = json.loads(f.read())

# video_ids = sorted(list(set([url.split('?v=')[1].split('&')[0] for url in video_urls])))
# for v in video_ids:
#     p, new = Puzzle.objects.get_or_create(video_id=v)

# for puzzle in Puzzle.objects.filter(external_id__contains="..."):
#     puzzle.external_id = None
#     update_ctc(puzzle)
#     puzzle.save()

# for puzzle in Puzzle.objects.all().order_by("-id"):
#     update_ctc(puzzle)
#     if puzzle.flag == 'new' and not puzzle.external_id:
#         puzzle.flag = 'needs_id'
#     puzzle.save()
# print(Puzzle.objects.filter(external_id=None).count())


refresh_ctc(Video, Puzzle)
print("done")
print_counts()
