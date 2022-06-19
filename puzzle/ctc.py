import datetime
from server.utils import curl
from bs4 import BeautifulSoup

import re
import requests
import json

_exid = 'cracking-the-cryptic.web.app/sudoku/'
match_external_id = re.compile(r'.*cracking-the-cryptic.web.app/sudoku/(\w+)')

CTC_URL = "https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/"
def _get_ctc(url):
    request = requests.get(url)
    request.raise_for_status()
    token = request.json()['downloadTokens']
    return requests.get(f"{url}?alt=media&token={token}").text

def fetch_ctc(slug):
    data = json.loads(curl(CTC_URL + slug, getter=_get_ctc, name=slug, force=True))
    for row in data.get('cells', []):
        for cell in row:
            if not cell.get('pencilMarks', None):
                cell.pop('pencilMarks', None)
            if not cell.get('candidates', None):
                cell.pop('candidates', None)
    return data

def update_video(video, Puzzle):
    values = {}
    video_url = f"https://www.youtube.com/watch?v={video.external_id}"
    html = curl(video_url)
    soup = BeautifulSoup(html, features="html.parser")
    title = soup.find("meta", {'property': 'og:title'})
    title = title and title['content']

    description = html.split('"shortDescription":"')[1].split('",')[0]
    description = json.loads(f'"{description}"').replace('\\n','\n').replace('\"','"')
    publish_date = html.split('publishDate":"')[-1].split(r'"')[0]

    puzzle_id = video.puzzle_id
    if _exid in description and not puzzle_id:
        puzzle_external_id = description.split(_exid)[1].split(' ')[0].split('\n')[0].split('\\')[0]
        puzzle = Puzzle.objects.filter(external_id=puzzle_external_id).first()
        if not puzzle:
            puzzle = Puzzle(external_id=puzzle_external_id)
            puzzle.publish_date = video.publish_date
            puzzle.save()
            print('Puzzle created for ', video.title, repr(puzzle.external_id))
        puzzle_id = puzzle.id
    publish_date = datetime.datetime.strptime(publish_date, "%Y-%m-%d").date()
    values = dict(
        description=description,
        title=title,
        publish_date=publish_date,
        puzzle_id=puzzle_id,
    )
    for key, value in values.items():
        old = getattr(video, key)
        if value != old:
            if key == 'description':
                print('updating description', len(video.description or ''), len(description))
            else:
                print("updating", key, getattr(video, key), value)
            setattr(video, key, value)

def update_ctc(puzzle):
    if puzzle.external_id and not puzzle.data.get('ctc'):
        try:
            puzzle.data['ctc'] = fetch_ctc(puzzle.external_id)
        except:
            if puzzle.flag == 'new':
                puzzle.flag = "bad_id"

def refresh_ctc(Video, Puzzle):
    response = requests.get('https://www.youtube.com/feeds/videos.xml?channel_id=UCC-UOdK8-mIjxBQm_ot1T-Q')
    text = response.text
    soup = BeautifulSoup(text, features="html.parser")
    for entry in soup.find_all('entry'):
        links = entry.find_all('link')
        if len(links) != 1:
            print("SKIPPING: Only expected one link but got:", links)
            continue
        video_id = links[0]['href'].split('v=')[-1]
        if Video.objects.filter(external_id=video_id):
            continue
        video = Video(external_id=video_id)
        update_video(video, Puzzle)
        video.save()
        print("New video:",video_id)

