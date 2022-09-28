# openapi-to-md

## description

OpenAPI(v3) => Markdown

- It supports 'v2' and 'v3' formats of OpenAPI.
- You can use 'yaml' as input files.
- The reference does not resolve the second reference because it avoids recursion.

## usage

Usage: openapi-to-md <source> [destination]

Example:
```sh
openapi-to-md openapi.yaml README.md
```
