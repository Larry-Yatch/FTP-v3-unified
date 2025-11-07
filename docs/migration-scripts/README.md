# Migration Scripts

This directory contains legacy migration and debugging scripts that were used during the v2 to v3 migration process.

## ⚠️ Important Note

These scripts are **NOT** part of the active codebase. They are kept for historical reference only.

## Scripts

### Migration Scripts
- **fix-is-latest-column.js** - Fixed the Is_Latest column during v2→v3 migration
- **fix-responses-sheet.js** - Data migration script for RESPONSES sheet
- **cleanup-edit-drafts.js** - Cleaned up edit draft data during migration

### Debugging Utilities (Legacy)
- **sheets.js** - Legacy sheet management functions
- **debug-sheets.js** - Debug utility for sheet inspection
- **check-responses.js** - Response data validation
- **check-sheets.js** - Sheet structure validation

## Usage

These scripts are **not imported** by the main application. They were one-time use scripts for migration and debugging purposes.

If you need to reference migration logic, see MIGRATION-BUG-ANALYSIS.md for details on what issues were fixed and how.

## Status

- **Last Updated**: Migration to v3 completed
- **Status**: Archived for reference only
- **Active**: No
