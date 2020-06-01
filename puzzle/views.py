from django.http import JsonResponse


from puzzle.models import Puzzle


def list_puzzles(request):
    attrs = ['id', 'external_id', 'video_id', 'title']
    puzzles = [p.to_json(attrs) for p in Puzzle.objects.all()]
    return JsonResponse({'puzzles': puzzles})