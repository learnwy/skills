# Example: Consolidating Knowledge from a Debugging Session

## Scenario

The user finished debugging an iOS image-cache memory leak.

## AI Detection

```
AI: I noticed we just wrapped up an important debugging session. Let me consolidate what we learned.

📊 Knowledge detection:
- Type: debug
- Topic: image-cache memory leak
- Value: root-cause analysis + fix
```

## Path Generation

```bash
$ node {skill_root}/scripts/cli.cjs path -r /project -a trae-cn -t debug -n image-cache-memory-leak
/project/.trae/knowledges/20260223_001_debug_image-cache-memory-leak.md
```

## Output Confirmation

```
📚 Knowledge consolidated:
- File: /project/.trae/knowledges/20260223_001_debug_image-cache-memory-leak.md
- Type: debug
- Topic: image-cache memory-leak fix

Summary: Found a retain cycle in ImageCacheManager caused by a strong reference in the completion callback.
Fixed by capturing with [weak self].
```

## Generated Document

````markdown
# Image-Cache Memory-Leak Fix

> **Type:** debug
> **Date:** 2026-02-23
> **Context:** Investigating the app's continuous memory growth while browsing images

## Summary

Found a retain cycle in ImageCacheManager caused by a strong reference to self in the async completion callback.
Fixed by using a [weak self] capture list.

## Background

When the user swiped through the image gallery, the app's memory grew continuously.
The memory profiler showed ImageCacheManager instances that were never released.

## Details

Root cause: a retain cycle in the completion callback

```swift
// Before the fix (retain cycle)
imageLoader.load(url: url) { result in
    self.cache[url] = result  // strong reference to self
}

// After the fix
imageLoader.load(url: url) { [weak self] result in
    self?.cache[url] = result
}
```
````

## Key Takeaways

- Always use [weak self] in async closures held by the captured object
- Use the Instruments Leaks template to detect retain cycles
- Check completion callbacks when investigating memory growth

## Related

- /project/Sources/ImageCacheManager.swift

```

```
