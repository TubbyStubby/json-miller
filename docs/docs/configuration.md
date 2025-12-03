---
sidebar_position: 2
---

# Configuration

When initializing `JsonMiller`, you can pass a configuration object as the second argument.

```javascript
const editor = new JsonMiller(container, config);
```

## Options

| Option | Type | Default | Description |
|---|---|---|---|
| `title` | `string` | `"Miller Column JSON Editor"` | The title displayed in the header. |
| `data` | `object` | `{}` | The initial JSON data to display. |
| `schema` | `object` | `{}` | The JSON Schema to validate against. |
| `ajv` | `Ajv` | `null` | An optional existing Ajv instance to use. |
| `showLockBtn` | `boolean` | `true` | Whether to show the lock/unlock button in the header. |
| `enableJsonEdit` | `boolean` | `false` | Whether to allow raw JSON editing via a toggle button. |

## Example

```javascript
const config = {
  title: "User Profile Editor",
  data: userProfile,
  schema: userSchema,
  showLockBtn: false,
  enableJsonEdit: true
};

const editor = new JsonMiller('#editor', config);
```
