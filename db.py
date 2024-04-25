import os
import json
import re

repos = ["core", "extra", "multilib"]
branches = ["stable", "testing", "unstable"]
archs = ["x86_64", "aarch64"]

def update(repo, branch, arch):
    try:
        files = [file for file in os.listdir(f"./repo/{branch}/{repo}/{arch}") if re.match(r".*\.json", file)]

        contents = []
        for file in files:
            with open(f"./repo/{branch}/{repo}/{arch}/{file}", "r") as f:
                content = json.load(f)
                contents.append(content)

        content = json.dumps(contents)

        with open(f"./db/{branch}_{repo}_{arch}.json", "w") as f:
            f.write(content)

        print(f"Updating {len(contents)} packages in {repo}/{branch}/{arch}...")
    except Exception as error:
        print(f"Error updating {repo}/{branch}/{arch}: {error}")

for repo in repos:
    for branch in branches:
        for arch in archs:
            update(repo, branch, arch)
