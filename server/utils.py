import os
import requests

def curl(url, force=False):
    name = url.split("=")[-1]
    try:
        os.mkdir(".ytcache")
    except FileExistsError:
        pass
    fname = os.path.join(".ytcache", "{}.html".format(name))
    if force or not os.path.exists(fname):
        response = requests.get(url)
        response.raise_for_status()
        text = response.text
        with open(fname, "w") as _file:
            _file.write(text)
        print("downloading!", url)
        return text
    with open(fname, "r") as _file:
        return _file.read()
