import django; import os;os.environ['DJANGO_SETTINGS_MODULE'] = 'server.settings';django.setup()

from puzzle.models import Puzzle, Video

limit = 100

REGIONS = [[[0, 0], [0, 1], [0, 2], [1, 0], [1, 1], [1, 2], [2, 0], [2, 1], [2, 2]], [[3, 0], [3, 1], [3, 2], [4, 0], [4, 1], [4, 2], [5, 0], [5, 1], [5, 2]], [[6, 0], [6, 1], [6, 2], [7, 0], [7, 1], [7, 2], [8, 0], [8, 1], [8, 2]], [[0, 3], [0, 4], [0, 5], [1, 3], [1, 4], [1, 5], [2, 3], [2, 4], [2, 5]], [[3, 3], [3, 4], [3, 5], [4, 3], [4, 4], [4, 5], [5, 3], [5, 4], [5, 5]], [[6, 3], [6, 4], [6, 5], [7, 3], [7, 4], [7, 5], [8, 3], [8, 4], [8, 5]], [[0, 6], [0, 7], [0, 8], [1, 6], [1, 7], [1, 8], [2, 6], [2, 7], [2, 8]], [[3, 6], [3, 7], [3, 8], [4, 6], [4, 7], [4, 8], [5, 6], [5, 7], [5, 8]], [[6, 6], [6, 7], [6, 8], [7, 6], [7, 7], [7, 8], [8, 6], [8, 7], [8, 8]]]

for p in Puzzle.objects.all()[:limit]:
    if not p.data:
        continue

    # my attempt at cleaning up unecessary ctc data
    # cells_s = p.data['ctc']['cells']
    # for cells in cells_s:
    #     for cell in cells:
    #         for s in ['candidates', 'pencilMarks']:
    #             v = cell.pop(s)
    #             if v:
    #                 pass # print('cell has value', s, v)
    #         cell.pop('value', None)
    #         if cell:
    #             print("cell exists", cell)
    # if p.data['ctc']['regions'] != REGIONS:
    #     print(p.data['ctc']['regions'])

    if p.data['ctc']['arrows']:
        print(p.external_id, p.data['ctc']['arrows'])