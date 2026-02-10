---
name: checkpoint-hooks
description: Guide for automating checkpoint creation using Claude Code hooks.
metadata:
  copyright: Copyright Daniel Grenemark 2026
  version: "0.0.1"
---

# Checkpoint Hooks Integration

Automate checkpoint creation using Claude Code hooks. This guide covers hook configuration for triggering checkpoints at key lifecycle events.

## Overview

Claude Code hooks can automatically trigger checkpoint creation at:

- **Stop**: When Claude finishes responding
- **PostToolUse**: After file write/edit operations
- **TaskCompleted**: When a task is marked complete

## Hook Configuration

Add hook configuration to your `.claude/settings.json`:

```json
{
  "hooks": {
    "Stop": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/checkpoint.sh",
            "timeout": 30000
          }
        ]
      }
    ]
  }
}
```

## Hook Events

### Stop Hook

Triggers when Claude finishes responding. Best for general checkpoint creation.

**JSON Input Fields:**

```json
{
  "session_id": "abc123",
  "stop_hook_active": false,
  "transcript_path": "/path/to/transcript.json"
}
```

**Important:** Check `stop_hook_active` to prevent infinite loops. If `true`, the hook was triggered by another Stop hook.

### PostToolUse Hook

Triggers after successful tool execution. Use matcher to filter for file operations.

```json
{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Write|Edit",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/checkpoint.sh"
          }
        ]
      }
    ]
  }
}
```

**JSON Input Fields:**

```json
{
  "session_id": "abc123",
  "tool_name": "Write",
  "tool_input": { "file_path": "/path/to/file.md" },
  "tool_output": "File written successfully"
}
```

### TaskCompleted Hook

Triggers when a task is marked complete. Ideal for final checkpoints.

```json
{
  "hooks": {
    "TaskCompleted": [
      {
        "matcher": "*",
        "hooks": [
          {
            "type": "command",
            "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/checkpoint.sh"
          }
        ]
      }
    ]
  }
}
```

## Checkpoint Script

Create `.claude/hooks/checkpoint.sh`:

```bash
#!/bin/bash
# Checkpoint hook script
set -e

# Read JSON input from stdin
INPUT=$(cat)

# Check for infinite loop prevention (Stop hook only)
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi

# Check for uncommitted changes
if git diff --quiet && git diff --staged --quiet; then
  exit 0  # No changes to checkpoint
fi

# Stage all changes
git add -A

# Create checkpoint commit
TIMESTAMP=$(date +%Y%m%d-%H%M%S)
git commit -m "checkpoint: auto-save $TIMESTAMP" || true
```

Make the script executable:

```bash
chmod +x .claude/hooks/checkpoint.sh
```

## Best Practices

### Timeout Configuration

Set appropriate timeouts to prevent hanging:

```json
{
  "type": "command",
  "command": "$CLAUDE_PROJECT_DIR/.claude/hooks/checkpoint.sh",
  "timeout": 30000
}
```

Default timeout is 60 seconds. Reduce for faster feedback.

### Portable Paths

Always use `$CLAUDE_PROJECT_DIR` for script paths to ensure portability across environments.

### Error Handling

- Use `set -e` to exit on errors
- Use `|| true` for commands that may fail gracefully (e.g., `git commit` with no changes)
- Log errors to stderr for debugging

### Infinite Loop Prevention

For Stop hooks, always check `stop_hook_active`:

```bash
STOP_HOOK_ACTIVE=$(echo "$INPUT" | jq -r '.stop_hook_active // false')
if [ "$STOP_HOOK_ACTIVE" = "true" ]; then
  exit 0
fi
```

## See Also

- [Checkpoint Instruction](checkpoint.md) - Manual checkpoint workflow
- [Claude Code Hooks Reference](https://docs.anthropic.com/en/docs/claude-code/hooks) - Official documentation
