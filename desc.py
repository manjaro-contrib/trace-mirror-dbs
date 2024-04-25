import json
import re
import sys

path = sys.argv[1]

print(path)
data = {}

list_headings = ["provides", "depends", "makedepends", "checkdepends"]
heading_regex = r"%(.*?)%"
heading = ""

path_tokens = re.search(r"repo/(.*?)/(.*?)/(.*?)/.*", path)

branch = path_tokens.group(1).lower()
db = path_tokens.group(2).lower()
arch = path_tokens.group(3).lower()

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
                if heading in list_headings:
                    data[heading] = [value]
                else:
                    data[heading] = value

data['tokens'] = [
    f"{data['name']}",
    f"{data['name']}_{arch}",
    f"{data['name']}_{branch}",
    f"{data['name']}_{arch}_{branch}",
]

with open(path.replace('.desc', '.json'), "w") as outfile:
    json.dump(data, outfile)
