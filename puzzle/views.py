from django.http import JsonResponse

from puzzle.models import Puzzle
from unrest.user.views import user_json

list_attrs = ['id', 'external_id', 'video_id', 'title', 'publish_date']
detail_attrs = list_attrs + ['data']

def list_puzzles(request):
    puzzles = Puzzle.objects.exclude(flag='no_puzzle')
    puzzles = [p.to_json(list_attrs) for p in puzzles]
    return JsonResponse({'puzzles': puzzles})

def puzzle_detail(request, source, slug):
    puzzle = Puzzle.get_by_any(source=source, slug=slug)
    return JsonResponse({ 'puzzle': puzzle.to_json(detail_attrs)})

def user_solves(request):
    attrs = ['puzzle_id', 'created']
    return {'solves': [s.to_json(attrs) for s in request.user.solve_set.all()]}

user_json.extras.append(user_solves)