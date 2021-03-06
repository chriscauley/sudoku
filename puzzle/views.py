from django.http import JsonResponse
from django.views.decorators.cache import cache_page
from collections import defaultdict

from puzzle.models import Puzzle, Video
from unrest.user.views import user_json

list_attrs = ['id', 'external_id', 'publish_date', 'constraints', 'flag', 'screenshot', 'meta', 'source']

video_attrs = ['external_id', 'title']

def list_puzzles(request):
    videos = Video.objects.all().values('external_id', 'title', 'puzzle_id')
    video_map = defaultdict(list)
    for video in videos:
        video_map[video.pop('puzzle_id')].append(video)
    puzzles = Puzzle.objects.all()
    if False: #TODO superusers should have access to all
        puzzles = puzzles.filter(flag__in=['new', 'valid'])
    puzzles = [p.to_json(list_attrs) for p in puzzles]
    for puzzle in puzzles:
        puzzle['videos'] = video_map[puzzle['id']]
    return JsonResponse({'puzzles': puzzles})

def puzzle_detail(request, source, slug):
    puzzle = Puzzle.objects.filter(source=source, external_id=slug).first()
    videos = [v.to_json(video_attrs + ['description']) for v in puzzle.video_set.all()]
    puzzle = puzzle.to_json(list_attrs + ['data'])
    puzzle['videos'] = videos
    return JsonResponse({ 'puzzle': puzzle })

def user_solves(request):
    attrs = ['puzzle_id', 'created']
    return {'solves': [s.to_json(attrs) for s in request.user.solve_set.all()]}

user_json.extras.append(user_solves)

@cache_page(60*60)
def admin_list(request):
    puzzles = Puzzle.objects.all()
    return JsonResponse({ 'puzzles': [p.to_json(list_attrs + ['data']) for p in puzzles]})