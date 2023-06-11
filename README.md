# trace mirror dbs

this clones all packages descriptions from repo, and transforms them into a nicely readable json.

## setup

initialize the jsons:

```bash
find ./repo/ -type f -name '*.desc' -print0 | parallel -0 python desc.py
```
