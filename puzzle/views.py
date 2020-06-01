from django.http import JsonResponse

from puzzle.models import Puzzle


list_attrs = ['id', 'external_id', 'video_id', 'title']
detail_attrs = list_attrs + ['data']

def list_puzzles(request):
    puzzles = [p.to_json(list_attrs) for p in Puzzle.objects.all()]
    return JsonResponse({'puzzles': puzzles})

def puzzle_detail(request, source, slug):
    puzzle = Puzzle.get_by_any(source=source, slug=slug)
    return JsonResponse({ 'puzzle': puzzle.to_json(detail_attrs)})