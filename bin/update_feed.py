import django; import os;os.environ['DJANGO_SETTINGS_MODULE'] = 'server.settings';django.setup()

from bs4 import BeautifulSoup
import os
import re
import requests

from server.models import Puzzle


match_slug = re.compile(r'.*cracking-the-cryptic.web.app/sudoku/(\w+)')

def curl(url, chrome=False):
    name = url.split("=")[-1]
    try:
        os.mkdir(".ytcache")
    except FileExistsError:
        pass
    fname = os.path.join(".ytcache", "{}.html".format(name))
    if not os.path.exists(fname):
        headers = {}
        if chrome:
            headers['User-Agent'] = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_10_1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/39.0.2171.95 Safari/537.36'
        text = requests.get(url).text
        with open(fname, "w") as _file:
            _file.write(text)
        print("downloading!", url)
        return text
    with open(fname, "r") as _file:
        return _file.read()

# This needs to update based off of last download time
feed = curl('https://www.youtube.com/feeds/videos.xml?channel_id=UCC-UOdK8-mIjxBQm_ot1T-Q')

soup = BeautifulSoup(feed, features="html.parser")

for entry in soup.find_all('entry'):
    links = entry.find_all('link')
    if len(links) != 1:
        print("SKIPPING: Only expected one link but got:", links)
        continue
    video_id = links[0]['href'].split('v=')[-1]
    print(type(video_id))
    if Puzzle.objects.filter(video_id=video_id):
        continue
    puzzle = Puzzle(video_id=video_id)
    slug = match_slug.findall(str(entry.find_all("media:description")))
    if slug:
        puzzle.external_id = slug[0]
    puzzle.save()
    print("New Puzzle:",slug)

    # url = links[0]['href']
    # html = curl(url, chrome=True)
    # if not 'sudoku/' in html:
    #     print(url)
    #     print(re.findall('sudoku/([a-zA-Z0-9]+)', html))
    # soup = BeautifulSoup(html, features="html.parser")
    # description = soup.find_all("meta", {"property": "og:description"})[0]
    # print(match_slug.match(description['content']))