---
sidebar_position: 3
---

# Public API

The `JsonMiller` instance exposes several methods to control the editor programmatically.

## Methods

### `setData(data)`

Updates the data displayed in the editor.

- **data**: `object` - The new JSON data.

```javascript
editor.setData({ new: "data" });
```

### `setSchema(schema)`

Updates the JSON Schema used for validation.

- **schema**: `object` - The new JSON Schema.

```javascript
editor.setSchema(newSchema);
```

### `lock()`

Locks the editor, preventing changes.

```javascript
editor.lock();
```

### `unlock()`

Unlocks the editor, allowing changes.

```javascript
editor.unlock();
```

### `toggleLock()`

Toggles the lock state.

```javascript
editor.toggleLock();
```

### `getValue()`

Returns the current JSON data.

- **Returns**: `object` - The current data.

```javascript
const currentData = editor.getValue();
```

### `getErrors()`

Returns the current validation errors.

- **Returns**: `Set<string>` - A set of error paths.

```javascript
const errors = editor.getErrors();
```

### `destroy()`

Destroys the editor instance and removes it from the DOM.

```javascript
editor.destroy();
```
