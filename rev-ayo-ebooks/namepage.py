import os
import re

pages = os.path.join("src", "app", "pages")
folders = os.listdir(pages)

print(folders)

regex = r"(.*?)\.component\.(.*)"
for folder in folders:
    path = os.path.join(pages, folder)
    for root, dirs, files in os.walk(path):
        print(root)
        print(dirs)
        print(files)
        for f in files:
            fpath = os.path.join(root, f)
            result = re.sub(regex, r"\1.page.\2", f)
            rpath = os.path.join(root, result)
            print(result)
            print(rpath)
            os.rename(fpath, rpath)

