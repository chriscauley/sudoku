from django.contrib import admin
from django.utils.safestring import mark_safe

from puzzle.models import Puzzle, Solve, Video

@admin.register(Video)
class VideoAdmin(admin.ModelAdmin):
    search_fields = ['title', 'external_id']


@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    list_display = ["external_id", "publish_date", "_links", "flag"]
    search_fields = ['video__title', 'video__external_id', 'external_id']
    list_editable = ["flag"]
    list_filter = ["flag"]
    def _links(self, obj):
        videos = obj.video_set.all()
        link = '<a href="https://www.youtube.com/watch?v={}" target="_new">{}</a>'
        links = [f'<b><a href="{obj.get_absolute_url()}" target="_new">View on Site</a></b>']
        links += [link.format(v.external_id, v.title) for v in videos]
        links = ''.join([f'<li>{l}</li>' for l in links])
        return mark_safe(f'<ul>{links}</ul>')
    readonly_fields = ['_links',]

@admin.register(Solve)
class SolveAdmin(admin.ModelAdmin):
    list_display = ['puzzle_name', '_constraints', 'puzzle_id', 'user_id']
    def puzzle_name(self, obj):
        video = obj.puzzle.video_set.all().first()
        return video and video.title
    readonly_fields = ['created']

    def _constraints(self, obj):
        constraints = obj.data.get('constraints', [])
        return ', '.join([str(c) for c in constraints])