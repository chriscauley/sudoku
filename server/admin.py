from django.contrib import admin

from server.models import Puzzle

@admin.register(Puzzle)
class PuzzleAdmin(admin.ModelAdmin):
    pass