INSTALLED_APPS = [
    # django
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.sites',
    'django.contrib.gis',

    # this project
    'server',
    'puzzle',

    # unrest
    'unrest',
    'unrest.user',
]

AUTH_USER_MODEL = 'user.User'
