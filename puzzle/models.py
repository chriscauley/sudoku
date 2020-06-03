from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import JSONField
from unrest.models import BaseModel, _choices

class Puzzle(BaseModel):
    FLAG_CHOICES = _choices([
        'new',
        'needs_constraints',
        'no_puzzle',
        'valid',
        'bad_id',
        'needs_id',
        'not_sudoku',
        'external_ctc'
    ])
    source = models.CharField(max_length=16, default="ctc")
    title = models.CharField(max_length=256, null=True, blank=True)
    external_id = models.CharField(max_length=32, null=True, blank=True)
    video_id = models.CharField(max_length=32, null=True, blank=True)
    publish_date = models.DateField(null=True, blank=True)
    data = JSONField(default=dict)
    flag = models.CharField(max_length=16, default="new", choices=FLAG_CHOICES)
    def save(self, *args, **kwargs):
        if not self.data.get('ctc') and self.source == "ctc" and self.external_id:
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

import re
import requests
from server.utils import curl
from bs4 import BeautifulSoup

external_id_path = 'cracking-the-cryptic.web.app/sudoku/'
match_external_id = re.compile(r'.*cracking-the-cryptic.web.app/sudoku/(\w+)')

CTC_URL = "https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/"
def fetch_ctc(slug):
    request = requests.get(f"{CTC_URL}{slug}")
    request.raise_for_status()
    token = request.json()['downloadTokens']
    return requests.get(f"{CTC_URL}{slug}?alt=media&token={token}").json()

def update_ctc(puzzle):
    if not puzzle.video_id:
        return
    video_url = f"https://www.youtube.com/watch?v={puzzle.video_id}"
    html = curl(video_url)
    soup = BeautifulSoup(html, features="html.parser")
    title = soup.find("meta", {'property': 'og:title'})
    puzzle.title = title and title['content']

    description = puzzle.data.get('description', '')
    if not puzzle.data.get('description') or True:
        description = html.split(r'"shortDescription\":\"')[1].split(r'\",')[0]
        description = description.replace(r'\/', '/').replace(r'\\\\', r'\\').replace('\\n', '\n')
        puzzle.data['description'] = description

    if not puzzle.external_id:
        if external_id_path in description:
            print(description.split(external_id_path)[1].split(' ')[0].split(r'\n')[0].split('\\')[0])
            puzzle.external_id = description.split(external_id_path)[1].split(' ')[0].split(r'\n')[0].split('\\')[0]
            puzzle.flag = 'new'
        elif puzzle.flag == 'new':
            puzzle.flag = 'needs_id'

    if not puzzle.publish_date:
        puzzle.publish_date = html.split(r'publishDate\":\"')[-1].split(r'\"')[0]

    if puzzle.external_id and not puzzle.data.get('ctc'):
        try:
            puzzle.data['ctc'] = fetch_ctc(puzzle.external_id)
        except:
            if puzzle.flag == 'new':
                puzzle.flag = "bad_id"

def refresh_ctc():
    response = requests.get('https://www.youtube.com/feeds/videos.xml?channel_id=UCC-UOdK8-mIjxBQm_ot1T-Q')
    text = response.text
    soup = BeautifulSoup(text, features="html.parser")
    for entry in soup.find_all('entry'):
        links = entry.find_all('link')
        if len(links) != 1:
            print("SKIPPING: Only expected one link but got:", links)
            continue
        video_id = links[0]['href'].split('v=')[-1]
        if Puzzle.objects.filter(video_id=video_id):
            continue
        puzzle = Puzzle(video_id=video_id)
        if not puzzle.external_id:
            slug = match_external_id.findall(str(entry.find_all("media:description")))
            if slug:
                puzzle.external_id = slug[0]
        puzzle.save()
        print("New Puzzle:",slug)