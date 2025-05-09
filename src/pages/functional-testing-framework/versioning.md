---
title: Versioning | Commerce Testing
description: Learn about the Functional Testing Framework versioning scheme for Adobe Commerce and Magento Open Source code.
keywords:
  - Tools
---

# Functional Testing Framework versioning schema

This document describes the versioning policy for the Functional Testing Framework, including the version numbering schema.

## Backward compatibility

In this context, backward compatibility means that when changes are made to the MFTF, all existing tests still run normally.
If a modification to the Functional Testing Framework forces tests to be changed, this is a backward incompatible change.

## Find your version number

To find the version of the Functional Testing Framework that you are using, run the Adobe Commerce or Magento Open Source CLI command:

```bash
vendor/bin/mftf --version
```

## Versioning policy

The Functional Testing Framework versioning policy follows [Semantic Versioning](https://semver.org/) guidelines.

### Three-component version numbers

Version numbering schemes help users to understand the scope of the changes made a new release.

```tree
X.Y.Z
| | |
| | +-- Backward Compatible changes (Patch release - bug fixes, small additions)
| +---- Backward Compatible changes (Minor release - small new features, bug fixes)
+------ Backward Incompatible changes (Major release - new features and/or major changes)
```

For example:

-  Adobe Commerce and Magento Open Source 2.4.x ships with Functional Testing Framework version 2.3.9
-  A patch is added to fix a bug: 2.3.10 (Increment Z = backward compatible change)
-  New action command added: 2.4.0 (Increment Y, set Z to 0 = backward compatible change)
-  New action added: 2.4.1 (Increment Z = backward compatible change)
-  Major new features added to the Functional Testing Framework to support changes in the Adobe Commerce or Magento Open Source codebase: 3.0.0. (Increment X, reset Y and Z to 0 = backward incompatible change)

### Z release - patch

Patch version **Z** MUST be incremented for a release that introduces only backward compatible changes.
  
### Y release - minor

Minor version **Y** MUST be incremented for a release that introduces new, backward compatible features.
It MUST be incremented if any test or test entity is marked as deprecated.
It MAY include patch level changes. Patch version MUST be reset to 0 when minor version is incremented.

### X release - major

Major version **X** MUST be incremented for a release that introduces backward incompatible changes.
A major release can also include minor and patch level changes.
You must reset the patch and minor version to 0 when you change the major version.
