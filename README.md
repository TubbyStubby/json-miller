# json-miller

**json-miller** is a lightweight, schema-driven column JSON editor and viewer designed for deep JSON structures. It features a modern Material You aesthetic, visual Bezier curve flow connections, and full JSON Schema validation support.

## Features

- **Column-Based Layout**: Navigate deep JSON hierarchies with ease using a column view similar to macOS Finder.
- **Schema-Driven**: Full support for JSON Schema validation, including `enum`, `pattern`, `minimum`, and `maximum` constraints.
- **Visual Flow**: Bezier curve connections visualize the path through your data, making it easier to track relationships.
- **Material Design**: Modern UI with Material You aesthetics, supporting both Light and Dark modes.
- **Search**: Built-in search functionality to quickly find keys or values.
- **Zero Dependencies**: Lightweight and fast, built with vanilla JavaScript and CSS (only `ajv` for validation).
- **Configurable**: Toggle editing, lock buttons, and more.

## Installation

```bash
npm install json-miller
```

## Usage

Import the library and initialize it with your target container, data, and schema.

```javascript
import { JsonMiller } from 'json-miller';
import 'json-miller/dist/style.css'; // Import styles if needed

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "number" }
  }
};

const data = {
  name: "John Doe",
  age: 30
};

const editor = new JsonMiller('#editor-wrapper', {
  data: data,
  schema: schema,
  enableJsonEdit: true, // Enable/Disable JSON text editing
  showLockBtn: false,   // Show/Hide lock button
  title: "My Config"    // Editor title
});
```

## Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | `Object` | `{}` | The initial JSON data to load. |
| `schema` | `Object` | `{}` | The JSON Schema to validate against. |
| `enableJsonEdit` | `Boolean` | `true` | Enable the right-side JSON text editor. |
| `showLockBtn` | `Boolean` | `true` | Show the lock/unlock button in the header. |
| `title` | `String` | `""` | Title displayed in the editor header. |

## Development

To run the project locally:

1. Clone the repository.
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
