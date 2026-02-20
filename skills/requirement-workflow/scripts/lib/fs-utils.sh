#!/bin/bash
# =============================================================================
# fs-utils.sh - File system utility functions
# =============================================================================
#
# DESCRIPTION:
#   Provides file system helper functions for directory creation,
#   file operations, and path manipulation.
#
# USAGE:
#   source "$(dirname "$0")/lib/fs-utils.sh"
#
# FUNCTIONS:
#   ensure_dir <dir>         - Create directory if not exists
#   ensure_file <file>       - Create file (and parent dirs) if not exists
#   safe_copy <src> <dst>    - Copy file with backup if dst exists
#   get_relative_path <from> <to> - Get relative path between two paths
#
# =============================================================================

ensure_dir() {
  local dir="$1"
  if [[ ! -d "$dir" ]]; then
    mkdir -p "$dir"
  fi
}

ensure_file() {
  local file="$1"
  local dir
  dir=$(dirname "$file")
  ensure_dir "$dir"
  if [[ ! -f "$file" ]]; then
    touch "$file"
  fi
}

safe_copy() {
  local src="$1"
  local dst="$2"
  
  if [[ -f "$dst" ]]; then
    cp "$dst" "${dst}.bak"
  fi
  cp "$src" "$dst"
}

file_exists() {
  [[ -f "$1" ]]
}

dir_exists() {
  [[ -d "$1" ]]
}
