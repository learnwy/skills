# Figma REST API Notes

## Base URL

- `https://api.figma.com`
- Core auth header: `X-Figma-Token: <token>`

## Relevant Endpoints

### 1) Get node structure

- `GET /v1/files/{file_key}/nodes?ids={node_id}&depth={n}`
- Use when user needs JSON structure, layer metadata, text/style info.

### 2) Render node image

- `GET /v1/images/{file_key}?ids={node_id}&format=png|jpg|svg|pdf&scale=2`
- Response returns image URL in `images[{node_id}]`.
- Download binary from returned URL.

## Required Input Constraints

1. Must provide Figma URL.
2. URL must include `node-id` query.
3. Parse `file_key` from `/file/{key}/` or `/design/{key}/`.

## Output Contract

### Node mode

```json
{
  "ok": true,
  "mode": "fetch",
  "type": "node",
  "figma": { "file_key": "...", "node_id": "..." },
  "output": { "node_json": "/abs/path/node.json" }
}
```

### Image mode

```json
{
  "ok": true,
  "mode": "fetch",
  "type": "image",
  "figma": { "file_key": "...", "node_id": "..." },
  "output": { "image": "/abs/path/node.png", "meta_json": "/abs/path/image-meta.json" }
}
```

### Batch mode

```json
{
  "ok": false,
  "mode": "fetch-batch",
  "type": "node",
  "success_count": 2,
  "failure_count": 1,
  "output_dir": "/abs/path/.figma-output/batch",
  "items": [
    { "node_id": "1:2", "node_json": "/abs/path/.figma-output/batch/1-2/node.json", "url": "..." }
  ],
  "failures": [
    { "url": "...", "error": "Figma URL must contain query parameter node-id" }
  ]
}
```

Batch mode is implemented at script level by iterating URLs. It still uses the same two REST endpoints above.
