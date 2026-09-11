# Known Issues

This file tracks issues found during a code review of the chord selector and related chord flows. Items are ordered by user impact and should be verified in the UI before implementation.

## 1. Chord selector catalog is missing common chord types

- **Severity:** Medium
- **Area:** Chord selector, chord search, chord library
- **Status:** Open
- **Location:** [src/data/chordsData.ts](src/data/chordsData.ts)

The shared `CHORD_TYPES_CATALOG` currently contains 19 chord types. Common forms such as minor 9th, major 9th, 7sus4, minor add9, and altered dominant variants are not available in the chord selector or search input. The Chords page also displays a coverage notice that confirms the catalog is incomplete.

**Impact:** Users cannot select or search for several standard guitar and piano chord shapes, even when they know the chord name.

**Suggested direction:** Expand the catalog and provide interval formulas, symbols, keyboard voicings, and guitar voicing strategies for each new type. Add a data-level test that checks every advertised chord type can be selected and resolved.
