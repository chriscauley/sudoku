from django.contrib import admin
from django.utils.safestring import mark_safe

from puzzle.models import Puzzle, Solve, Video

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    search_fields = ['title', 'external_id']


@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    list_display = ["external_id", "_links", "flag"]
    search_fields = ['video__title', 'video__external_id', 'external_id']
    list_editable = ["flag"]
    list_filter = ["flag"]
    def _links(self, obj):
        videos = obj.video_set.all()
        link = '<a href="https://www.youtube.com/watch?v={}" target="_new">{}</a>'
        links = [link.format(v.external_id, v.title) for v in videos]
        return mark_safe('<br/>'.join(links))
    readonly_fields = ['_links', 'description', 'data']

    def description(self, obj):
        text = obj.data.get("description").replace("\n","<br/>")
        return mark_safe(text)

@admin.register(Solve)
class SolveAdmin(admin.ModelAdmin):
    list_display = ['puzzle_name', 'puzzle_id', 'user_id']
    def puzzle_name(self, obj):
        video = obj.puzzle.video_set.all().first()
        return video and video.title
    readonly_fields = ['created']