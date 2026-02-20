#!/bin/bash
# =============================================================================
# common-utils.sh - Unified entry point for all utility functions
# =============================================================================
#
# DESCRIPTION:
#   Sources all utility modules providing a single entry point for scripts.
#   All scripts should source this file for access to complete utility API.
#
# USAGE:
#   source "$(dirname "$0")/lib/common-utils.sh"
#
# MODULES INCLUDED:
#   - log-utils.sh        : Logging and output functions
#   - time-utils.sh       : Time and date functions
#   - fs-utils.sh         : File system operations
#   - validation-utils.sh : Input validation functions
#   - yaml-utils.sh       : YAML read/write/update operations
#   - workflow-utils.sh   : Workflow path and state management
#   - hooks-utils.sh      : Hook point operations for skill injection
#
# =============================================================================

_COMMON_UTILS_LIB_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

source "$_COMMON_UTILS_LIB_DIR/log-utils.sh"
source "$_COMMON_UTILS_LIB_DIR/time-utils.sh"
source "$_COMMON_UTILS_LIB_DIR/fs-utils.sh"
source "$_COMMON_UTILS_LIB_DIR/validation-utils.sh"
source "$_COMMON_UTILS_LIB_DIR/yaml-utils.sh"
source "$_COMMON_UTILS_LIB_DIR/workflow-utils.sh"
source "$_COMMON_UTILS_LIB_DIR/hooks-utils.sh"
