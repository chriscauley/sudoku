from django.contrib import admin
from django.utils.safestring import mark_safe

from puzzle.models import Puzzle, Solve

@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    list_display = ["video_id", "external_id", "_link", "flag"]
    list_editable = ["flag"]
    list_filter = ["flag"]
    def _link(self, obj):
        video_url = f"https://www.youtube.com/watch?v={obj.video_id}"
        return mark_safe(f'<a href="{video_url}" target="_new">{obj.video_id}</a>')
    readonly_fields = ['_link', 'description', 'data']

    def description(self, obj):
        text = obj.data.get("description").replace("\n","<br/>")
        return mark_safe(text)

@admin.register(Solve)
class SolveAdmin(admin.ModelAdmin):
    list_display = ['puzzle_id', 'user_id']