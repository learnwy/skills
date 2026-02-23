# Example: Debug Session Knowledge Consolidation

## Scenario

User completes debugging a memory leak in an iOS image cache.

## AI Detection

```
AI: I notice we've completed a significant debugging session. Let me consolidate this knowledge.

📊 Knowledge Detection:
- Type: debug
- Topic: Image cache memory leak
- Value: Root cause analysis + fix approach
```

## Path Generation

```bash
$ {skill_root}/scripts/get-knowledge-path.sh -r /project -a trae-cn -t debug -n image-cache-memory-leak
/project/.trae/knowledges/20260223_001_debug_image-cache-memory-leak.md
```

## Output Confirmation

```
📚 Knowledge Consolidated:
- File: /project/.trae/knowledges/20260223_001_debug_image-cache-memory-leak.md
- Type: debug
- Topic: Image Cache Memory Leak Fix

Summary: Identified retain cycle in ImageCacheManager due to strong
reference in completion handler. Fixed by using [weak self] capture.
```

## Generated Document

````markdown
# Image Cache Memory Leak Fix

> **Type:** debug
> **Date:** 2026-02-23
> **Context:** Investigating app memory growth during image browsing

## Summary

Identified retain cycle in ImageCacheManager caused by strong self reference
in async completion handler. Fixed by using [weak self] capture list.

## Background

App memory continuously grew when users scrolled through image gallery.
Memory profiler showed ImageCacheManager instances never deallocated.

## Details

Root cause: Strong reference cycle in completion handler

```swift
// Before (retain cycle)
imageLoader.load(url: url) { result in
    self.cache[url] = result  // strong self capture
}

// After (fixed)
imageLoader.load(url: url) { [weak self] result in
    self?.cache[url] = result
}
```
````

## Key Takeaways

- Always use [weak self] in async closures stored by the object
- Use Instruments Leaks template to detect retain cycles
- Check completion handlers when investigating memory growth

## Related

- /project/Sources/ImageCacheManager.swift

```

```
