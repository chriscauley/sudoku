from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.urls import path, re_path, include

from unrest.views import spa
from puzzle.views import list_puzzles

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/puzzle/', list_puzzles),
    re_path('', include('unrest.urls')),
]
