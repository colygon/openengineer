#!/usr/bin/env bash
# Open Engineer Shell Plugin Installer
set -euo pipefail

PLUGIN_DIR="${HOME}/.openengineer"
PLUGIN_FILE="oe.plugin.zsh"
SCRIPT_DIR="$(cd "$(dirname "$0")" && pwd)"

echo "Installing Open Engineer shell plugin..."

# Create plugin directory
mkdir -p "$PLUGIN_DIR"

# Copy plugin file
cp "$SCRIPT_DIR/$PLUGIN_FILE" "$PLUGIN_DIR/$PLUGIN_FILE"

# Detect shell config file
SHELL_RC=""
if [[ -f "${HOME}/.zshrc" ]]; then
  SHELL_RC="${HOME}/.zshrc"
elif [[ -f "${HOME}/.zprofile" ]]; then
  SHELL_RC="${HOME}/.zprofile"
fi

if [[ -z "$SHELL_RC" ]]; then
  echo "Could not find .zshrc or .zprofile"
  echo "Add this line manually to your shell config:"
  echo "  source $PLUGIN_DIR/$PLUGIN_FILE"
  exit 0
fi

# Check if already installed
SOURCE_LINE="source $PLUGIN_DIR/$PLUGIN_FILE"
if grep -qF "$SOURCE_LINE" "$SHELL_RC" 2>/dev/null; then
  echo "Already installed in $SHELL_RC"
else
  echo "" >> "$SHELL_RC"
  echo "# Open Engineer shell plugin" >> "$SHELL_RC"
  echo "$SOURCE_LINE" >> "$SHELL_RC"
  echo "Added to $SHELL_RC"
fi

echo ""
echo "Done! Restart your shell or run:"
echo "  source $PLUGIN_DIR/$PLUGIN_FILE"
echo ""
echo "Usage:"
echo "  : fix the login bug"
echo "  :strategist should we use Redis?"
echo "  :help"
