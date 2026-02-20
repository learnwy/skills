#!/bin/bash
# =============================================================================
# log-utils.sh - Logging and output utility functions
# =============================================================================
#
# DESCRIPTION:
#   Provides consistent logging functions with emoji prefixes for
#   info, warning, error messages and fatal error handling.
#
# USAGE:
#   source "$(dirname "$0")/lib/log-utils.sh"
#
# FUNCTIONS:
#   log_info <msg>      - Print info message to stdout
#   log_warn <msg>      - Print warning message to stderr
#   log_error <msg>     - Print error message to stderr
#   log_success <msg>   - Print success message to stdout
#   log_debug <msg>     - Print debug message (if DEBUG=1)
#   die <msg> [code]    - Print error and exit with code (default: 1)
#
# =============================================================================

log_info() {
  echo "ℹ️  $1"
}

log_warn() {
  echo "⚠️  $1" >&2
}

log_error() {
  echo "❌ $1" >&2
}

log_success() {
  echo "✅ $1"
}

log_debug() {
  if [[ "${DEBUG:-0}" == "1" ]]; then
    echo "🔍 [DEBUG] $1" >&2
  fi
}

die() {
  log_error "$1"
  exit "${2:-1}"
}
