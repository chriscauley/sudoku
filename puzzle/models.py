from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import JSONField
from unrest.models import BaseModel, _choices

from puzzle.ctc import fetch_ctc, update_ctc
from server.utils import curl

class Video(BaseModel):
    source = models.CharField(max_length=16, default="youtube")
    title = models.CharField(max_length=256)
    external_id = models.CharField(max_length=32)
    puzzle = models.ForeignKey('Puzzle', on_delete=models.SET_NULL, null=True, blank=True)
    description = models.TextField(blank=True, default='')
    publish_date = models.DateField(null=True, blank=True)

    def __str__(self):
        return self.title

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
    external_id = models.CharField(max_length=32, null=True, blank=True)
    publish_date = models.DateField(null=True, blank=True)
    data = JSONField(default=dict)
    flag = models.CharField(max_length=16, default="new", choices=FLAG_CHOICES)

    has_constraints = property(lambda s: bool(s.data.get('required_constraints')))

    def save(self, *args, **kwargs):
        if not self.data.get('ctc') and self.source == "ctc" and self.external_id:
            update_ctc(self)
        super().save(*args, **kwargs)

    def validate(self, answer):
        # trust everyone until we can hook this up to server side node
        return True

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

    class Meta:
        ordering = ['-publish_date']

class Solve(BaseModel):
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    puzzle = models.ForeignKey('Puzzle', on_delete=models.CASCADE)
    data = JSONField(default=dict)
    valid = models.BooleanField(default=False)
