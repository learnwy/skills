#!/bin/bash
# =============================================================================
# generate-docs.sh - Generate documentation from script headers
# =============================================================================
#
# DESCRIPTION:
#   Extracts documentation from shell script header comments and generates
#   markdown documentation for SKILL.md.
#
# USAGE:
#   ./scripts/lib/generate-docs.sh [--output FILE]
#
# =============================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SCRIPTS_DIR="$(dirname "$SCRIPT_DIR")"

extract_script_doc() {
  local script_file="$1"
  local script_name
  script_name=$(basename "$script_file")
  
  local in_header=0
  local section=""
  local description=""
  local usage=""
  local options=""
  local input=""
  local output=""
  local examples=""
  
  while IFS= read -r line; do
    if [[ "$line" == "#!/bin/bash" ]]; then
      in_header=1
      continue
    fi
    
    if [[ $in_header -eq 1 && ! "$line" =~ ^# ]]; then
      break
    fi
    
    if [[ $in_header -eq 1 ]]; then
      line="${line#\# }"
      line="${line#\#}"
      
      case "$line" in
        "DESCRIPTION:")
          section="description"
          ;;
        "USAGE:")
          section="usage"
          ;;
        "OPTIONS:")
          section="options"
          ;;
        "INPUT:")
          section="input"
          ;;
        "OUTPUT"*|"OUTPUT:")
          section="output"
          ;;
        "EXAMPLES:")
          section="examples"
          ;;
        "="*)
          continue
          ;;
        *)
          case "$section" in
            description) description+="$line"$'\n' ;;
            usage) usage+="$line"$'\n' ;;
            options) options+="$line"$'\n' ;;
            input) input+="$line"$'\n' ;;
            output) output+="$line"$'\n' ;;
            examples) examples+="$line"$'\n' ;;
          esac
          ;;
      esac
    fi
  done < "$script_file"
  
  echo "### \`$script_name\`"
  echo ""
  echo "$description" | sed '/^$/d' | head -3
  echo ""
  
  if [[ -n "$usage" ]]; then
    echo "**Usage:**"
    echo '```bash'
    echo "$usage" | grep -v '^$' | head -1
    echo '```'
    echo ""
  fi
  
  if [[ -n "$options" ]]; then
    echo "**Options:**"
    echo ""
    echo "| Option | Description |"
    echo "|--------|-------------|"
    echo "$options" | grep -E '^\s*-' | while read -r opt_line; do
      opt_line=$(echo "$opt_line" | sed 's/^[[:space:]]*//')
      if [[ "$opt_line" =~ ^(-[a-zA-Z,[:space:]-]+)[[:space:]]+(.+)$ ]]; then
        opt="${BASH_REMATCH[1]}"
        desc="${BASH_REMATCH[2]}"
        echo "| \`$opt\` | $desc |"
      fi
    done
    echo ""
  fi
  
  if [[ -n "$output" ]]; then
    echo "**Output:**"
    echo "$output" | grep -v '^$' | head -5
    echo ""
  fi
  
  echo "---"
  echo ""
}

extract_function_doc() {
  local lib_file="$1"
  local lib_name
  lib_name=$(basename "$lib_file")
  
  echo "### \`lib/$lib_name\`"
  echo ""
  echo "Utility functions for YAML operations."
  echo ""
  echo "**Functions:**"
  echo ""
  echo "| Function | Description |"
  echo "|----------|-------------|"
  
  grep -E '^#\s+[a-z_]+\s+<' "$lib_file" 2>/dev/null | while read -r line; do
    line="${line#\# }"
    func=$(echo "$line" | cut -d' ' -f1)
    desc=$(echo "$line" | sed 's/^[^ ]* //')
    echo "| \`$func\` | $desc |"
  done
  
  grep -E '^[a-z_]+\(\)' "$lib_file" 2>/dev/null | while read -r line; do
    func="${line%%\(*}"
    echo "| \`$func()\` | - |"
  done | sort -u
  
  echo ""
  echo "---"
  echo ""
}

generate_full_docs() {
  echo "## Scripts Reference"
  echo ""
  echo "Complete reference for all workflow scripts. Each script includes:"
  echo "- **Description**: What the script does"
  echo "- **Usage**: Command syntax"
  echo "- **Options**: Available parameters"
  echo "- **Output**: What the script produces"
  echo ""
  
  for script in "$SCRIPTS_DIR"/*.sh; do
    if [[ -f "$script" ]]; then
      extract_script_doc "$script"
    fi
  done
  
  echo "### Library Functions"
  echo ""
  for lib in "$SCRIPTS_DIR"/lib/*.sh; do
    if [[ -f "$lib" && "$(basename "$lib")" != "generate-docs.sh" ]]; then
      extract_function_doc "$lib"
    fi
  done
}

main() {
  local output_file=""
  
  while [[ $# -gt 0 ]]; do
    case $1 in
      --output)
        output_file="$2"
        shift 2
        ;;
      *)
        shift
        ;;
    esac
  done
  
  if [[ -n "$output_file" ]]; then
    generate_full_docs > "$output_file"
    echo "✅ Documentation generated: $output_file"
  else
    generate_full_docs
  fi
}

main "$@"
