import json
import os
import pathlib
import re
import sys

path = sys.argv[1]
data = {}

repo_regex = r"repo\/(.*?)\/"
repo = re.search(repo_regex, path).group(1).lower()
data['repo'] = repo

output_file = path.replace('/desc', '.json')

heading_regex = r"%(.*?)%"
with open(path, 'r') as file:
    for line in file.readlines():
        value = line.strip()
        if re.match(heading_regex, value):
            heading = re.search(heading_regex, value).group(1).lower()
        elif value != "":
            if heading in data:
                if isinstance(data[heading], str):
                    data[heading] = [value, data[heading]]
                else:
                    data[heading] += [value]
            else:
                data[heading] = value

pathlib.Path(path).unlink()

with open(output_file, "w") as outfile:
    json.dump(data, outfile)
