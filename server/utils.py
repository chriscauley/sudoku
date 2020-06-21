import os
import requests

def _get_url(url):
    response = requests.get(url)
    response.raise_for_status()
    return response.text

def curl(url, force=False, getter=_get_url, name=None):
    name = name or url.split("=")[-1]
    try:
        os.mkdir(".ytcache")
    except FileExistsError:
        pass
    fname = os.path.join(".ytcache", "{}.html".format(name))
    if force or not os.path.exists(fname):
        text = getter(url)
        with open(fname, "w") as _file:
            _file.write(text)
        print("downloading!", url)
        return text
    with open(fname, "r") as _file:
        return _file.read()
