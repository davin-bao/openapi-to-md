# openapi-to-md

## description

OpenAPI(v3) => Markdown

- It supports 'v2' and 'v3' formats of OpenAPI.
- You can use 'yaml' as input files.
- The reference does not resolve the second reference because it avoids recursion.

## install
> npm install -g

If exception, run:
> npm cache verify 

## usage

Usage: api-to-md [-t tag] ＜source＞ [destination]

Example:
```sh
api-to-md openapi.yaml README.md
or
api-to-md -t atag,btag openapi.yaml README.md
```
