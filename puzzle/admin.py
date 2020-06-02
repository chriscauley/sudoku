from django.contrib import admin
from django.utils.safestring import mark_safe

from puzzle.models import Puzzle

@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    list_display = ["video_id", "external_id", "_link", "flag"]
    list_editable = ["flag"]
    def _link(self, obj):
        video_url = f"https://www.youtube.com/watch?v={obj.video_id}"
        return mark_safe(f'<a href="{video_url}">{obj.video_id}</a>')