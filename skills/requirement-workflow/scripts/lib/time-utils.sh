#!/bin/bash
# =============================================================================
# time-utils.sh - Time and date utility functions
# =============================================================================
#
# DESCRIPTION:
#   Provides time-related utility functions for timestamps,
#   date formatting, and duration calculations.
#
# USAGE:
#   source "$(dirname "$0")/lib/time-utils.sh"
#
# FUNCTIONS:
#   get_timestamp           - Get ISO 8601 UTC timestamp
#   get_date_id             - Get date in YYYYMMDD format
#   get_datetime_id         - Get datetime in YYYYMMDD_HHMMSS format
#   format_duration <secs>  - Format seconds as human readable
#
# =============================================================================

get_timestamp() {
  date -u +"%Y-%m-%dT%H:%M:%SZ"
}

get_date_id() {
  date +"%Y%m%d"
}

get_datetime_id() {
  date +"%Y%m%d_%H%M%S"
}

format_duration() {
  local seconds="$1"
  
  if [[ $seconds -lt 60 ]]; then
    echo "${seconds}s"
  elif [[ $seconds -lt 3600 ]]; then
    local mins=$((seconds / 60))
    local secs=$((seconds % 60))
    echo "${mins}m ${secs}s"
  elif [[ $seconds -lt 86400 ]]; then
    local hours=$((seconds / 3600))
    local mins=$(((seconds % 3600) / 60))
    echo "${hours}h ${mins}m"
  else
    local days=$((seconds / 86400))
    local hours=$(((seconds % 86400) / 3600))
    echo "${days}d ${hours}h"
  fi
}

parse_iso_timestamp() {
  local timestamp="$1"
  if [[ "$(uname)" == "Darwin" ]]; then
    date -j -f "%Y-%m-%dT%H:%M:%SZ" "$timestamp" +%s 2>/dev/null || echo ""
  else
    date -d "$timestamp" +%s 2>/dev/null || echo ""
  fi
}
