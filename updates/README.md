# Updates and Documentation

This folder contains update logs, verification reports, and documentation generated during development and testing.

## Purpose

This directory stores:
- Feature update documentation
- Verification and test reports
- Fix summaries and analysis
- Migration guides
- Development notes

## Current Updates

### Priority Field Sync Fix
- **Status:** ✅ Complete
- **Date:** 2025-11-12
- **Description:** Implemented priority field synchronization from Markdown to Jira
- **Impact:** All issues now sync with correct priority values (Highest, High, Medium, Low, Lowest)

### Table Structure Improvement
- **Status:** ✅ Complete
- **Date:** 2025-11-12
- **Description:** Improved table parsing to maintain proper row structure
- **Impact:** Tables no longer break into separate single-row tables

### JMS-16 Content Loss Fix
- **Status:** ✅ Complete
- **Date:** 2025-11-12
- **Description:** Fixed content truncation in complex descriptions
- **Impact:** All content sections now preserved during sync

### CLI Simplification
- **Status:** ✅ Complete
- **Date:** 2025-11-12
- **Description:** Unified CLI command for exporting single or all issues
- **Impact:** Simpler API - use `npm run jira-to-md -- ISSUE-KEY` for single issue export

## Document Types

### Verification Reports
Documents that verify functionality and correctness:
- Test results
- Field comparisons
- Content validation
- Round-trip sync verification

### Fix Summaries
Documents that describe bug fixes:
- Problem analysis
- Root cause identification
- Solution implementation
- Testing results

### Update Guides
Documents that explain changes:
- Feature updates
- API changes
- Migration instructions
- Usage examples

## Usage

These documents are for reference and historical tracking. They provide:
- Context for changes made
- Verification of fixes
- Migration guidance
- Development history

## Main Documentation

For current usage and API documentation, see:
- **README.md** - Main project documentation
- **CONFIGURATION.md** - Configuration guide
- **CHANGELOG.md** - Version history
- **WORKFLOW.md** - Development workflow

---

**Note:** This folder is for documentation purposes and does not affect the functionality of the tool.
