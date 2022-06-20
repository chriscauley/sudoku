from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.urls import path, re_path, include

from puzzle.views import list_puzzles, puzzle_detail, admin_list
from unrest.views import index

# /api/schema/SolveForm
from puzzle import forms

app_paths = ['app', 'auth', 'help', 'puzzle']

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/puzzle/', list_puzzles),
    re_path('api/puzzle/([^/]+)/([^/]+)/', puzzle_detail),
    re_path('api/admin/puzzle', admin_list),
    re_path(f'^({"|".join(app_paths)})', index),
    re_path('', include('unrest.urls')),
]
