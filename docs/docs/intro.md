---
sidebar_position: 1
---

# Introduction

![JsonMiller Screenshot](/img/screenshot.png)

JsonMiller is a Miller Column JSON Editor Library. It provides a clean, column-based interface for navigating and editing large JSON objects.

## Features

- **Miller Column Navigation**: Easily traverse deep JSON structures.
- **Schema Validation**: Built-in support for JSON Schema validation using Ajv.
- **Editing**: Edit values, add/remove items (if enabled).
- **Theming**: Light and Dark mode support.
- **Zero Dependencies**: (Well, almost, it bundles Ajv).

## Installation

```bash
npm install json-miller
```

## Basic Usage

```javascript
import { JsonMiller } from 'json-miller';
import 'json-miller/dist/style.css';

const container = document.getElementById('editor');
const editor = new JsonMiller(container, {
  data: { foo: "bar" },
  title: "My Editor"
});
```
