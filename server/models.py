from django.conf import settings
from django.db import models
from django.contrib.postgres.fields import JSONField
from unrest.models import BaseModel, _choices

class Puzzle(BaseModel):
    source = models.CharField(max_length=16, default="ctc")
    external_id = models.CharField(max_length=32, null=True, blank=True)
    video_id = models.CharField(max_length=32, null=True, blank=True)
    data = JSONField(default=dict)
    def save(self, *args, **kwargs):
        if not self.data:
            if not self.source == "ctc":
                raise NotImplementedError()
            self.data = fetch_ctc(self.external_id)
        super().save(*args, **kwargs)


import requests

CTC_URL = "https://firebasestorage.googleapis.com/v0/b/sudoku-sandbox.appspot.com/o/"
def fetch_ctc(slug):
    data = requests.get(f"{CTC_URL}{slug}").json()
    return requests.get(f"{CTC_URL}{slug}?alt=media&token={data['downloadTokens']}").json()