# JSON Miller Editor - Features

This document outlines the key features implemented in the JSON Miller Editor.

## Core Features

### 1. Miller Column Interface
-   **Hierarchical Navigation**: Navigate deep into nested JSON structures using a column-based layout.
-   **Dynamic Columns**: Columns are generated dynamically as you drill down into objects and arrays.
-   **Selection Path**: Clear visual indication of the current selection path.

### 2. JSON Editing
-   **Real-time Editing**: Changes made in the UI are immediately reflected in the underlying JSON data.
-   **Type-Aware Inputs**:
    -   **Strings**: Text inputs.
    -   **Numbers**: Number inputs.
    -   **Booleans**: Checkboxes.
    -   **Enums**: Dropdowns (if defined in schema).
-   **Type Switching**: Ability to change the data type of a field (e.g., from String to Number) using a dropdown/icon selector.
-   **Array Management**: Add new items to arrays.

### 3. Visualizations & UI/UX

#### Visual Hierarchy
-   **Strong Selected States**: Active rows are highlighted with a distinct border and background color to indicate the current selection.
-   **Clean Input Styling**: Input fields use a modern, transparent design with a bottom border, reducing visual clutter.

#### Layout
-   **Side-by-Side Scalar Fields**: Simple fields (strings, numbers) are displayed with the label on the left and input on the right to save vertical space.
-   **Top-Down Complex Fields**: Objects and Arrays retain a top-down layout for better readability of nested structures.

#### Navigation
-   **Breadcrumbs**: A navigation bar at the top shows the current path (e.g., `ROOT > event_skus > 0`). Clicking a breadcrumb navigates back to that level.
-   **Dynamic Column Headers**: Headers display meaningful context (e.g., "REWARDS [0]") instead of generic indices, derived from the JSON schema `title` property where available.

#### Data Type Visualization
-   **Iconography**: Distinct icons represent different data types:
    -   `abc` (String)
    -   `#` (Number)
    -   `?` (Boolean)
    -   `{}` (Object)
    -   `[]` (Array)
    -   `∅` (Null)
-   **Color Coding**: Types are color-coded for quick scanning:
    -   **String**: Green
    -   **Number**: Orange
    -   **Boolean**: Purple
    -   **Object**: Blue
    -   **Array**: Yellow
    -   **Null**: Grey

### 4. Code View (JSON Preview)
-   **Live Preview**: A right-hand panel shows the raw JSON output in real-time.
-   **Collapsible**: The code view can be toggled (hidden/shown) to maximize the editor workspace.
-   **Bi-directional Sync Highlight**:
    -   Hovering a row in the editor highlights the corresponding line in the JSON preview.
    -   Hovering a line in the JSON preview highlights the corresponding row in the editor.

### 5. Theming
-   **Dark/Light Mode**: Toggle between dark and light themes. The application respects the system preference by default.
