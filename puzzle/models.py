from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import JSONField
from unrest.models import BaseModel, _choices

from puzzle.ctc import fetch_ctc, update_ctc
from server.utils import curl

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
            puzzle = Puzzle.objects.create(external_id=slug, source=source)

        try:
            curl(video_url)
        except Exception as e:
            raise e
        else:
            puzzle = Puzzle.objects.create(video_id=slug, source=source)

        if not puzzle:
            raise NotImplementedError("unable to find puzzle for video or puzzle: "+slug)

        puzzle.save()
        return puzzle

