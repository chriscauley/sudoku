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
        'no_rules',
        'valid',
        'bad_id',
        'not_sudoku',
        'external_ctc',
        'not_9x9',
        'bad_render',
        'vanilla',
        'maybe_not_9x9',
    ])
    source = models.CharField(max_length=16, default="ctc")
    external_id = models.CharField(max_length=32, null=True, blank=True)
    publish_date = models.DateField(null=True, blank=True)
    data = JSONField(default=dict)
    flag = models.CharField(max_length=16, default="new", choices=FLAG_CHOICES)

    constraints = property(lambda s: s.data.get('required_constraints', []))
    screenshot = property(lambda s: s.data.get('screenshot'))

    def update_status(self):
        _auto = ['new', 'valid', 'no_rules', 'vanilla', 'maybe_not_9x9']
        if self.flag not in _auto:
            return
        ctc = self.data.get('ctc')
        if not ctc:
            self.flag = 'bad_id'
        if self.data.get('required_constraints'):
            self.flag = 'valid'
        else:
            self.flag = 'no_rules'
            vanilla = True
            for attr in ['arrows', 'cages', 'lines', 'overlays', 'underlays']:
                if self.data.get('ctc', {}).get(attr):
                    vanilla = False
            if vanilla:
                self.flag = 'vanilla'
            cell_count = sum([len(r) for r in ctc['cells']])
            region_count = sum([len(r) for r in ctc['regions']])
            if cell_count != 81 or region_count != 81:
                self.flag = 'maybe_not_9x9'

    def save(self, *args, **kwargs):
        self.update_status()
        if not self.publish_date:
            for video in self.video_set.all():
                self.publish_date = self.publish_date or video.publish_date
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
