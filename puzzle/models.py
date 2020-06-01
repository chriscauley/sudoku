from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import JSONField
from unrest.models import BaseModel, _choices

class Puzzle(BaseModel):
    source = models.CharField(max_length=16, default="ctc")
    title = models.CharField(max_length=256, null=True, blank=True)
    external_id = models.CharField(max_length=32, null=True, blank=True)
    video_id = models.CharField(max_length=32, null=True, blank=True)
    data = JSONField(default=dict)
    def save(self, *args, **kwargs):
        if not self.data and self.source == "ctc":
            update_ctc(self)
        super().save(*args, **kwargs)

    @staticmethod
    def get_by_any(slug, source):
        q = models.Q(external_id=slug) | models.Q(video_id=slug)
        if slug.isdigit():
            q = q | models.Q(id=slug)

        puzzle = Puzzle.objects.filter(q).first()
        if puzzle:
            return puzzle
        if not puzzle and source != 'ctc':
            raise NotImplementedError()
        video_url = f"https://www.youtube.com/watch?v={slug}"
        try:
            fetch_ctc(slug)
        except Exception as e:
            pass
        else:
            return Puzzle.objects.create(external_id=slug, source=source)
        try:
            curl(video_url)
        except Exception as e:
            raise e
        else:
            return Puzzle.objects.create(video_id=slug, source=source)

import requests
from server.utils import curl
from bs4 import BeautifulSoup

CTC_URL = "https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/"
def fetch_ctc(slug):
    request = requests.get(f"{CTC_URL}{slug}")
    request.raise_for_status()
    token = request.json()['downloadTokens']
    return requests.get(f"{CTC_URL}{slug}?alt=media&token={token}").json()

def update_ctc(puzzle):
    puzzle.data['ctc'] = fetch_ctc(puzzle.external_id)
    if puzzle.video_id:
        video_url = f"https://www.youtube.com/watch?v={puzzle.video_id}"
        html = curl(video_url)
        soup = BeautifulSoup(html, features="html.parser")
        title = soup.find("meta", {'property': 'og:title'})
        puzzle.title = title = title and title['content']
        puzzle.save()

def refresh_ctc():
    match_slug = re.compile(r'.*cracking-the-cryptic.web.app/sudoku/(\w+)')

    # This needs to update based off of last download time
    feed = curl('https://www.youtube.com/feeds/videos.xml?channel_id=UCC-UOdK8-mIjxBQm_ot1T-Q')
    soup = BeautifulSoup(feed, features="html.parser")
    for entry in soup.find_all('entry'):
        links = entry.find_all('link')
        if len(links) != 1:
            print("SKIPPING: Only expected one link but got:", links)
            continue
        video_id = links[0]['href'].split('v=')[-1]
        if Puzzle.objects.filter(video_id=video_id):
            continue
        puzzle = Puzzle(video_id=video_id)
        slug = match_slug.findall(str(entry.find_all("media:description")))
        if slug:
            puzzle.external_id = slug[0]
        puzzle.save()
        print("New Puzzle:",slug)