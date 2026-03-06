#!/usr/bin/env python3
import argparse
import json
import os
import pathlib
import re
import shutil
import sys
import urllib.parse
import urllib.request


API_BASE = "https://api.figma.com/v1"
TOKEN_ENV = "FIGMA_ACCESS_TOKEN"


def find_token(project_root: pathlib.Path) -> dict:
    env_token = os.getenv(TOKEN_ENV, "").strip()
    if env_token:
        return {"configured": True, "source": "environment", "token_preview": mask_token(env_token)}
    env_files = [".env", ".env.local", ".figma.env"]
    for name in env_files:
        p = project_root / name
        if not p.exists():
            continue
        content = p.read_text(encoding="utf-8", errors="ignore")
        m = re.search(rf"^\s*{TOKEN_ENV}\s*=\s*(.+?)\s*$", content, re.MULTILINE)
        if m:
            token = m.group(1).strip().strip('"').strip("'")
            if token:
                return {"configured": True, "source": str(p), "token_preview": mask_token(token), "token": token}
    return {
        "configured": False,
        "source": None,
        "setup_guide": {
            "recommended_file": str(project_root / ".env.local"),
            "line": f"{TOKEN_ENV}=<your_figma_personal_access_token>"
        }
    }


def mask_token(token: str) -> str:
    if len(token) <= 8:
        return "*" * len(token)
    return token[:4] + "*" * (len(token) - 8) + token[-4:]


def parse_figma_url(url: str) -> dict:
    parsed = urllib.parse.urlparse(url)
    qs = urllib.parse.parse_qs(parsed.query)
    node_raw = qs.get("node-id", [""])[0]
    if not node_raw:
        raise ValueError("Figma URL must contain query parameter node-id")
    node_id = urllib.parse.unquote(node_raw)
    parts = [p for p in parsed.path.split("/") if p]
    file_key = None
    if len(parts) >= 3 and parts[0] in {"file", "design"}:
        file_key = parts[1]
    if not file_key:
        raise ValueError("Cannot parse file key from Figma URL")
    return {
        "file_key": file_key,
        "node_id": node_id,
        "host": parsed.netloc,
        "path": parsed.path
    }


def api_get_json(url: str, token: str) -> dict:
    req = urllib.request.Request(url)
    req.add_header("X-Figma-Token", token)
    with urllib.request.urlopen(req, timeout=30) as resp:
        payload = resp.read().decode("utf-8")
    return json.loads(payload)


def fetch_node(file_key: str, node_id: str, token: str, depth: int) -> dict:
    q = urllib.parse.urlencode({"ids": node_id, "depth": str(depth)})
    url = f"{API_BASE}/files/{file_key}/nodes?{q}"
    return api_get_json(url, token)


def fetch_image(file_key: str, node_id: str, token: str, fmt: str, scale: float) -> dict:
    q = urllib.parse.urlencode({"ids": node_id, "format": fmt, "scale": str(scale)})
    meta = api_get_json(f"{API_BASE}/images/{file_key}?{q}", token)
    image_url = ((meta.get("images") or {}).get(node_id) or "").strip()
    if not image_url:
        raise RuntimeError("No image URL returned by Figma API for node")
    with urllib.request.urlopen(image_url, timeout=60) as resp:
        binary = resp.read()
    return {"meta": meta, "binary": binary}


def safe_node_name(node_id: str) -> str:
    return re.sub(r"[^a-zA-Z0-9._-]+", "-", node_id).strip("-") or "node"


def read_urls_from_file(path: str) -> list[str]:
    p = pathlib.Path(path).resolve()
    lines = p.read_text(encoding="utf-8", errors="ignore").splitlines()
    urls = []
    for line in lines:
        val = line.strip()
        if not val or val.startswith("#"):
            continue
        urls.append(val)
    return urls


def write_node_output(out_dir: pathlib.Path, figma: dict, data: dict) -> dict:
    node_name = safe_node_name(figma["node_id"])
    node_dir = out_dir / node_name
    node_dir.mkdir(parents=True, exist_ok=True)
    out_json = node_dir / "node.json"
    out_json.write_text(json.dumps(data, ensure_ascii=False, indent=2), encoding="utf-8")
    return {"node_id": figma["node_id"], "node_json": str(out_json)}


def write_image_output(out_dir: pathlib.Path, figma: dict, data: dict, fmt: str) -> dict:
    node_name = safe_node_name(figma["node_id"])
    node_dir = out_dir / node_name
    node_dir.mkdir(parents=True, exist_ok=True)
    ext = "png" if fmt == "png" else fmt
    out_img = node_dir / f"node.{ext}"
    out_img.write_bytes(data["binary"])
    out_meta = node_dir / "image-meta.json"
    out_meta.write_text(json.dumps(data["meta"], ensure_ascii=False, indent=2), encoding="utf-8")
    return {"node_id": figma["node_id"], "image": str(out_img), "meta_json": str(out_meta)}


def cmd_check_config(args: argparse.Namespace) -> int:
    root = pathlib.Path(args.project_root).resolve()
    cfg = find_token(root)
    print(json.dumps({"ok": True, "mode": "check-config", "config": cfg}, ensure_ascii=False, indent=2))
    return 0


def cmd_validate_link(args: argparse.Namespace) -> int:
    info = parse_figma_url(args.url)
    print(json.dumps({"ok": True, "mode": "validate-link", "figma": info}, ensure_ascii=False, indent=2))
    return 0


def cmd_fetch(args: argparse.Namespace) -> int:
    root = pathlib.Path(args.project_root).resolve()
    cfg = find_token(root)
    token = os.getenv(TOKEN_ENV, "").strip() or cfg.get("token", "")
    if not token:
        print(json.dumps({"ok": False, "error": "missing_token", "config": cfg}, ensure_ascii=False, indent=2))
        return 2
    figma = parse_figma_url(args.url)
    out_dir = pathlib.Path(args.output_dir).resolve()
    out_dir.mkdir(parents=True, exist_ok=True)
    if args.type == "node":
        data = fetch_node(figma["file_key"], figma["node_id"], token, args.depth)
        item = write_node_output(out_dir, figma, data)
        print(json.dumps({
            "ok": True,
            "mode": "fetch",
            "type": "node",
            "figma": figma,
            "output": {"node_json": item["node_json"]}
        }, ensure_ascii=False, indent=2))
        return 0
    data = fetch_image(figma["file_key"], figma["node_id"], token, args.format, args.scale)
    item = write_image_output(out_dir, figma, data, args.format)
    print(json.dumps({
        "ok": True,
        "mode": "fetch",
        "type": "image",
        "figma": figma,
        "output": {"image": item["image"], "meta_json": item["meta_json"]}
    }, ensure_ascii=False, indent=2))
    return 0


def cmd_fetch_batch(args: argparse.Namespace) -> int:
    root = pathlib.Path(args.project_root).resolve()
    cfg = find_token(root)
    token = os.getenv(TOKEN_ENV, "").strip() or cfg.get("token", "")
    if not token:
        print(json.dumps({"ok": False, "error": "missing_token", "config": cfg}, ensure_ascii=False, indent=2))
        return 2

    urls: list[str] = []
    urls.extend(args.url or [])
    if args.urls_file:
        urls.extend(read_urls_from_file(args.urls_file))
    if not urls:
        print(json.dumps({"ok": False, "error": "no_urls", "message": "Provide --url or --urls-file"}, ensure_ascii=False, indent=2))
        return 2

    out_dir = pathlib.Path(args.output_dir).resolve()
    if out_dir.exists() and args.clean_output:
        shutil.rmtree(out_dir)
    out_dir.mkdir(parents=True, exist_ok=True)

    items = []
    failures = []
    for raw_url in urls:
        try:
            figma = parse_figma_url(raw_url)
            if args.type == "node":
                data = fetch_node(figma["file_key"], figma["node_id"], token, args.depth)
                item = write_node_output(out_dir, figma, data)
            else:
                data = fetch_image(figma["file_key"], figma["node_id"], token, args.format, args.scale)
                item = write_image_output(out_dir, figma, data, args.format)
            item["url"] = raw_url
            items.append(item)
        except Exception as e:
            failures.append({"url": raw_url, "error": str(e)})

    summary = {
        "ok": len(items) > 0 and len(failures) == 0,
        "mode": "fetch-batch",
        "type": args.type,
        "success_count": len(items),
        "failure_count": len(failures),
        "output_dir": str(out_dir),
        "items": items,
        "failures": failures
    }
    print(json.dumps(summary, ensure_ascii=False, indent=2))
    return 0 if not failures else 1


def build_parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(prog="figma_fetch")
    sub = p.add_subparsers(dest="cmd", required=True)

    p_cfg = sub.add_parser("check-config")
    p_cfg.add_argument("--project-root", default=".")
    p_cfg.set_defaults(func=cmd_check_config)

    p_val = sub.add_parser("validate-link")
    p_val.add_argument("--url", required=True)
    p_val.set_defaults(func=cmd_validate_link)

    p_fetch = sub.add_parser("fetch")
    p_fetch.add_argument("--project-root", default=".")
    p_fetch.add_argument("--url", required=True)
    p_fetch.add_argument("--type", choices=["node", "image"], required=True)
    p_fetch.add_argument("--output-dir", required=True)
    p_fetch.add_argument("--depth", type=int, default=2)
    p_fetch.add_argument("--format", choices=["png", "jpg", "svg", "pdf"], default="png")
    p_fetch.add_argument("--scale", type=float, default=2.0)
    p_fetch.set_defaults(func=cmd_fetch)

    p_batch = sub.add_parser("fetch-batch")
    p_batch.add_argument("--project-root", default=".")
    p_batch.add_argument("--url", action="append", help="Repeatable Figma URL with node-id")
    p_batch.add_argument("--urls-file", help="Text file with one Figma URL per line")
    p_batch.add_argument("--type", choices=["node", "image"], required=True)
    p_batch.add_argument("--output-dir", required=True)
    p_batch.add_argument("--depth", type=int, default=2)
    p_batch.add_argument("--format", choices=["png", "jpg", "svg", "pdf"], default="png")
    p_batch.add_argument("--scale", type=float, default=2.0)
    p_batch.add_argument("--clean-output", action="store_true")
    p_batch.set_defaults(func=cmd_fetch_batch)

    return p


def main() -> int:
    parser = build_parser()
    args = parser.parse_args()
    try:
        return args.func(args)
    except Exception as e:
        print(json.dumps({"ok": False, "error": str(e)}, ensure_ascii=False, indent=2))
        return 1


if __name__ == "__main__":
    sys.exit(main())
