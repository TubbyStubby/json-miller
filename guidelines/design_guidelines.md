# Design Language & Guidelines

This document describes the design system and guidelines used in the JSON Miller Editor.

## Design Philosophy
-   **Clean & Modern**: Focus on content and data structure. Minimalist UI elements to reduce cognitive load.
-   **Visual Feedback**: Immediate feedback for user interactions (hover, focus, selection).
-   **Context-Aware**: Provide context through navigation aids (breadcrumbs, headers) and visual cues (icons, colors).

## Color Palette

### Base Colors
-   **Background**: `#202124` (Dark), `#f0f2f5` (Light)
-   **Column Background**: `#2d2e31` (Dark), `#ffffff` (Light)
-   **Border**: `#3c4043` (Dark), `#dadce0` (Light)
-   **Text**: `#e8eaed` (Dark), `#202124` (Light)

### Accent Colors
-   **Primary Accent**: `#8ab4f8` (Soft Blue - Dark Mode), `#1a73e8` (Blue - Light Mode)
-   **Active Row Background**: `#3c4043` (Dark), `#e8f0fe` (Light)

### Data Type Colors
Used for icons and badges to distinguish data types.
-   **String**: `#5db075` (Greenish)
-   **Number**: `#f2a53d` (Orange)
-   **Boolean**: `#a4508b` (Purple)
-   **Object**: `#4285f4` (Blue)
-   **Array**: `#fbbc04` (Yellow/Gold)
-   **Null**: `#9aa0a6` (Grey)

## Typography
-   **Font Family**: "Google Sans Flex", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif.
-   **Monospace**: 'Fira Code', monospace (for code view and type badges).
-   **Weights**:
    -   Regular (400): Body text, inputs.
    -   Medium (500): Headers, labels, active states.

## Component Guidelines

### Columns
-   **Width**: Fixed width (`320px`) for consistency.
-   **Scroll**: Independent vertical scrolling.
-   **Headers**: Uppercase, distinct background, sticky (if needed, currently static).

### Rows
-   **Padding**: `12px 15px` for comfortable touch targets.
-   **Hover**: Subtle background change.
-   **Active**: Stronger background, left border accent, subtle inner shadow.
-   **Layout**:
    -   **Scalar**: Side-by-side (Label Left, Input Right).
    -   **Complex**: Top-down (Label Top, Arrow Indicator).

### Inputs
-   **Style**: Transparent background, bottom border only.
-   **Focus**: Bottom border changes to accent color, slight background tint.
-   **Typography**: Inherit font family, standard size (`0.9rem`).

### Icons
-   **Type Icons**: Small, color-coded, distinct characters/symbols.
-   **Navigation**: Arrows (`▶`) for complex types.

## Interaction Patterns
-   **Drill-down**: Clicking a row (outside inputs) navigates deeper.
-   **Breadcrumbs**: Clicking a breadcrumb navigates back to a parent.
-   **Toggle**: Buttons for global states (Theme, Code View).
-   **Sync**: Hovering links the visual representation with the code representation.
