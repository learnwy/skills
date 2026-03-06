#!/usr/bin/env python3
import argparse
import pathlib


TOKEN_ENV = "FIGMA_ACCESS_TOKEN"


def main() -> int:
    p = argparse.ArgumentParser(prog="init_figma_config")
    p.add_argument("--project-root", default=".")
    p.add_argument("--file", default=".env.local")
    args = p.parse_args()

    root = pathlib.Path(args.project_root).resolve()
    env_file = root / args.file
    env_file.parent.mkdir(parents=True, exist_ok=True)
    if env_file.exists():
        text = env_file.read_text(encoding="utf-8", errors="ignore")
    else:
        text = ""
    if TOKEN_ENV in text:
        print(f"{env_file} already contains {TOKEN_ENV}")
        return 0
    block = f"\n# Figma API\n{TOKEN_ENV}=<your_figma_personal_access_token>\n"
    env_file.write_text((text.rstrip() + block + "\n"), encoding="utf-8")
    print(f"Created config at: {env_file}")
    print(f"Next step: replace <your_figma_personal_access_token> with real token")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
