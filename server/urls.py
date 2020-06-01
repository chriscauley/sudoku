from django.conf import settings
from django.contrib import admin
from django.urls import path
from django.urls import path, re_path, include

from unrest.views import spa

urlpatterns = [
    path('admin/', admin.site.urls),
    re_path('', include('unrest.urls')),
]
