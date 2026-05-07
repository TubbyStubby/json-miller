/**
 * JsonMiller - A Miller Column JSON Editor Library
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import styles from './style.css';
import { arrowIcon, copyIcon, darkThemeIcon, editIcon, filledLockIcon, lightThemeIcon, lockIcon, saveIcon, tickIcon, trashIcon, unlockIcon, visibilityIcon, visibilityOffIcon } from './svg';

export class JsonMiller {
    constructor(container, config = {}) {
        this.container = typeof container === 'string' ?
            document.querySelector(container) :
            container;
        if (!this.container) {
            throw new Error("JsonMiller: Container not found");
        }

        this.title = config.title || "Miller Column JSON Editor";
        this.data = config.data || {};
        this.originalData = JSON.parse(JSON.stringify(this.data));
        this._computeDiffs();
        this.rootSchema = config.schema || {};
        this.showLockBtn = config.showLockBtn === true;
        this.disableOutput = config.disableOutput === true;
        this.showEditBtn = config.showJsonEditBtn === true;
        this.showOutputToggleBtn = config.showOutputToggleBtn === true;

        this.isOutputVisible = !this.disableOutput && config.defaultOutputVisible !== false;
        this.isJsonEditMode = false;
        this.isLocked = false;
        this.selectionPath = [];
        this.focusedPath = null;

        // Theme state
        this.isDark = config.defaultDark === true;

        // Create internal DOM structure
        this._createDom();

        // Init Theme
        this._initTheme();

        // Init AJV
        this._ajv = addFormats(new Ajv({ allErrors: true }));
        this._validateFn = this._ajv.compile(this.rootSchema);

        this.init();
    }

    get showJsonEditBtn() {
        return this.showEditBtn && !this.disableOutput;
    }

    _createDom() {
        // Attach Shadow DOM
        this.shadowRoot = this.container.attachShadow({ mode: 'open' });

        // Inject Styles
        const style = document.createElement('style');
        style.textContent = styles;
        this.shadowRoot.appendChild(style);

        // Create Wrapper
        this.wrapper = document.createElement('div');
        this.wrapper.className = 'json-miller-container';

        // Create Header
        this.header = document.createElement('header');
        this.header.innerHTML = `
            <h3>${this.title}</h3>
            <div style="display: flex; gap: 10px;">
                <button class="jm-theme-btn" title="Toggle Theme">
                    ${lightThemeIcon}
                </button>
                </button>
                ${this.showLockBtn ? `<button class="jm-lock-btn" title="Lock/Unlock">
                    ${lockIcon}
                </button>` : ''}
                ${this.showJsonEditBtn ? `<button class="jm-json-edit-btn" title="Edit JSON">
                    ${editIcon}
                </button>` : ''}
                <button class="jm-copy-btn" title="Copy JSON">
                    ${copyIcon}
                </button>
                ${this.showOutputToggleBtn && !this.disableOutput ? `<button class="jm-output-toggle-btn" title="Toggle Output">
                    ${visibilityIcon}
                </button>` : ''}
            </div>
        `;

        // Create Body
        const body = document.createElement('div');
        body.className = 'jm-body';
        // Ensure body takes remaining space
        body.style.display = 'flex';
        body.style.flexDirection = 'column';
        body.style.flex = '1';
        body.style.minHeight = '0';
        body.style.overflow = 'hidden';

        body.innerHTML = `
            <div class="jm-breadcrumbs"></div>
            <div class="jm-workspace">
                <div class="jm-editor"></div>
                ${this.disableOutput ? '' :
                `<div class="jm-output"></div>`}
            </div>
        `;

        this.wrapper.appendChild(this.header);
        this.wrapper.appendChild(body);
        this.shadowRoot.appendChild(this.wrapper);

        this.breadcrumbsContainer = this.wrapper.querySelector('.jm-breadcrumbs');
        this.editorContainer = this.wrapper.querySelector('.jm-editor');
        if (!this.disableOutput) {
            this.outputContainer = this.wrapper.querySelector('.jm-output');
        }

        this.themeBtn = this.header.querySelector('.jm-theme-btn');
        this.lockBtn = this.header.querySelector('.jm-lock-btn');
        this.copyBtn = this.header.querySelector('.jm-copy-btn');
        this.jsonEditBtn = this.header.querySelector('.jm-json-edit-btn');
        this.outputToggleBtn = this.header.querySelector('.jm-output-toggle-btn');

        // Bind events
        this.themeBtn.onclick = () => this.toggleTheme();
        if (this.lockBtn) this.lockBtn.onclick = () => this.toggleLock();
        this.copyBtn.onclick = () => this.copyJson();
        if (this.jsonEditBtn) this.jsonEditBtn.onclick = () => this.toggleJsonEditMode();
        if (this.outputToggleBtn) this.outputToggleBtn.onclick = () => this.toggleOutput();
    }

    get ajv() {
        return this._ajv;
    }

    get validateFn() {
        return this._validateFn;
    }

    init() {
        this.render();
    }

    // --- Public API ---

    setData(data) {
        this.data = data;
        this.originalData = JSON.parse(JSON.stringify(this.data));
        this._computeDiffs();
        // Reset selection
        this.selectionPath = [];
        this.render();
    }

    getOriginalValueAt(path) {
        return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, this.originalData);
    }

    isEqual(v1, v2) {
        if (v1 === v2) return true;
        if (v1 == null || v2 == null) return false;
        if (typeof v1 !== 'object' || typeof v2 !== 'object') return false;

        const keys1 = Object.keys(v1);
        const keys2 = Object.keys(v2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
            if (!this.isEqual(v1[key], v2[key])) return false;
        }

        return true;
    }

    _computeDiffs() {
        this.diffMap = new Map();

        const compare = (current, original, path) => {
            const pathStr = JSON.stringify(path);

            if (current === undefined && original !== undefined) {
                this.diffMap.set(pathStr, 'removed');
                return true;
            }
            if (current !== undefined && original === undefined) {
                this.diffMap.set(pathStr, 'added');
                return true;
            }
            if (current === original) return false;

            if (current == null || original == null || typeof current !== 'object' || typeof original !== 'object') {
                if (!this.isEqual(current, original)) {
                    this.diffMap.set(pathStr, 'updated');
                    return true;
                }
                return false;
            }

            let hasDiff = false;
            const keys = new Set([...Object.keys(current), ...Object.keys(original)]);

            for (let key of keys) {
                const childPath = [...path, Array.isArray(current) && Array.isArray(original) ? Number(key) : key];
                const childDiff = compare(current[key], original[key], childPath);
                if (childDiff) hasDiff = true;
            }

            if (hasDiff) {
                this.diffMap.set(pathStr, 'updated');
            }

            return hasDiff;
        };

        compare(this.data, this.originalData, []);
    }

    setSchema(schema) {
        this.rootSchema = schema;
        this._validateFn = this._ajv.compile(this.rootSchema);
        this.render();
    }

    lock() {
        this.isLocked = true;
        this.container.classList.add('jm-locked');
        if (this.lockBtn) this.lockBtn.innerHTML = unlockIcon;
        this.render({ preserveScroll: true });
    }

    unlock() {
        this.isLocked = false;
        this.container.classList.remove('jm-locked');
        if (this.lockBtn) this.lockBtn.innerHTML = lockIcon;
        this.render({ preserveScroll: true });
    }

    toggleLock() {
        if (this.isLocked) {
            this.unlock();
        } else {
            this.lock();
        }
    }

    getValue() {
        return this.data;
    }

    getErrors() {
        return this.validate(this.data);
    }

    destroy() {
        this.container.innerHTML = '';
        this.container.classList.remove('json-miller-container', 'jm-locked');
    }

    // --- Header Actions ---

    _initTheme() {
        // Check system preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
            this.isDark = false;
        }
        this._updateTheme();
    }

    toggleTheme() {
        this.isDark = !this.isDark;
        this._updateTheme();
    }

    _updateTheme() {
        if (this.isDark) {
            this.container.setAttribute('data-theme', 'dark');
            if (this.themeBtn) this.themeBtn.innerHTML = lightThemeIcon;
        } else {
            this.container.setAttribute('data-theme', 'light');
            if (this.themeBtn) this.themeBtn.innerHTML = darkThemeIcon;
        }
    }

    copyJson() {
        navigator.clipboard.writeText(JSON.stringify(this.data));
        alert("JSON copied to clipboard");
    }

    toggleJsonEditMode() {
        if (this.isJsonEditMode) {
            // Saving
            const textarea = this.outputContainer.querySelector('textarea');
            if (textarea) {
                try {
                    this.isJsonEditMode = false;
                    this.jsonEditBtn.innerHTML = editIcon;
                    this.jsonEditBtn.title = "Edit JSON";
                    const newData = JSON.parse(textarea.value);
                    this.setData(newData);
                } catch (e) {
                    alert("Invalid JSON: " + e.message);
                    return; // Stay in edit mode
                }
            }
        } else {
            // Switching to edit mode
            this.isJsonEditMode = true;
            this.jsonEditBtn.innerHTML = saveIcon;
            this.jsonEditBtn.title = "Save JSON";
            this.render();
        }
    }

    toggleOutput() {
        if (!this.outputContainer) return;

        this.isOutputVisible = !this.isOutputVisible;
        if (this.isOutputVisible) {
            this.outputContainer.classList.remove('collapsed');
            this.outputToggleBtn.innerHTML = visibilityIcon;
            this.outputToggleBtn.title = "Hide Output";
        } else {
            this.outputContainer.classList.add('collapsed');
            this.outputToggleBtn.innerHTML = visibilityOffIcon;
            this.outputToggleBtn.title = "Show Output";
        }
        this.render();
    }

    // --- Data Helpers ---

    getValueAt(path) {
        return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, this.data);
    }

    setValueAt(path, value) {
        if (this.isLocked) return;

        if (path.length === 0) {
            this.data = value;
        } else {
            const lastKey = path[path.length - 1];
            const parentPath = path.slice(0, -1);
            const parent = this.getValueAt(parentPath);
            parent[lastKey] = value;
        }
        this._computeDiffs();
        this.render({ preserveScroll: true });
    }

    getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    deleteValueAt(path) {
        if (this.isLocked) return;
        if (path.length === 0) return; // Cannot delete root

        const lastKey = path[path.length - 1];
        const parentPath = path.slice(0, -1);
        const parent = this.getValueAt(parentPath);

        if (Array.isArray(parent)) {
            parent.splice(Number(lastKey), 1);
        } else {
            delete parent[lastKey];
        }
        this._computeDiffs();
        this.render({ preserveScroll: true });
    }

    getDefaultValue(schema) {
        if (!schema) return "";
        if (schema.default !== undefined) return schema.default;
        if (schema.enum && schema.enum.length > 0) return schema.enum[0];

        const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

        if (type === 'string') return "";
        if (type === 'number' || type === 'integer') return 0;
        if (type === 'boolean') return false;
        if (type === 'object') {
            const obj = {};
            if (schema.required) {
                schema.required.forEach(reqKey => {
                    if (schema.properties && schema.properties[reqKey]) {
                        obj[reqKey] = this.getDefaultValue(schema.properties[reqKey]);
                    }
                });
            }
            return obj;
        }
        if (type === 'array') return [];
        return null;
    }

    isRequired(parentSchema, key) {
        if (!parentSchema || !parentSchema.required) return false;
        return parentSchema.required.includes(key);
    }

    validate(data) {
        const errors = new Set();
        if (!this.validateFn) return errors;

        const valid = this.validateFn(data);
        if (!valid) {
            this.validateFn.errors.forEach(err => {
                let parts = [];
                if (err.instancePath) {
                    parts = err.instancePath.split('/').filter(p => p !== "");
                }

                // Add the missing property to the path so the child row gets highlighted
                if (err.keyword === 'required' && err.params && err.params.missingProperty) {
                    parts.push(err.params.missingProperty);
                }

                const pathArray = parts.map(p => isNaN(p) ? p : Number(p));
                errors.add(JSON.stringify(pathArray));

                // Also add parent error so parent row shows child-error
                if (parts.length > 0 && err.keyword === 'required') {
                    const parentPath = parts.slice(0, -1);
                    errors.add(JSON.stringify(parentPath.map(p => isNaN(p) ? p : Number(p))));
                }
            });
        }
        return errors;
    }

    // --- Schema Inference ---

    getSchemaForPath(path) {
        let currentSchema = this.rootSchema;

        for (let key of path) {
            if (!currentSchema) return null;

            if (currentSchema.type === 'array' && !isNaN(key)) {
                currentSchema = currentSchema.items;
                continue;
            }

            if (currentSchema.properties && currentSchema.properties[key]) {
                currentSchema = currentSchema.properties[key];
                continue;
            }

            if (currentSchema.additionalProperties && typeof currentSchema.additionalProperties === 'object') {
                currentSchema = currentSchema.additionalProperties;
                continue;
            }

            return null;
        }
        return currentSchema;
    }

    getAvailableTypes(schemaNode) {
        if (!schemaNode) return ['string', 'number', 'boolean', 'object', 'array', 'null'];

        if (schemaNode.oneOf) {
            return schemaNode.oneOf.map(s => s.type);
        }
        if (schemaNode.type) {
            return Array.isArray(schemaNode.type) ? schemaNode.type : [schemaNode.type];
        }
        return ['string']; // Default
    }

    // --- Rendering ---

    render(options = {}) {
        const preserveScroll = options.preserveScroll || false;
        const previousScrollLeft = this.editorContainer.scrollLeft;

        this.editorContainer.innerHTML = '';

        // Update Output JSON
        if (!this.disableOutput && this.isOutputVisible) {
            if (this.isJsonEditMode) {
                this.renderJsonTextArea();
            } else {
                this.renderJsonHtml();
            }
        } else if (!this.isOutputVisible) {
            this.clearOutputArea();
        }

        // Render Breadcrumbs
        this.renderBreadcrumbs();

        // Run validation once to get all errors
        const validationErrors = this.validate(this.data);

        // Always render root level
        this.renderColumn([], this.data, validationErrors);

        // Render subsequent columns based on selectionPath
        let currentPath = [];

        for (const key of this.selectionPath) {
            currentPath.push(key);
            const value = this.getValueAt(currentPath);

            if (value && typeof value === 'object') {
                this.renderColumn([...currentPath], value, validationErrors);
            } else {
                break;
            }
        }

        // Handle scrolling
        if (preserveScroll) {
            this.editorContainer.scrollLeft = previousScrollLeft;
        } else {
            this.editorContainer.scrollLeft = this.editorContainer.scrollWidth;
        }
    }

    renderJsonTextArea() {
        this.outputContainer.innerHTML = '';
        const textarea = document.createElement('textarea');
        textarea.value = JSON.stringify(this.data, null, 2);
        textarea.style.width = '100%';
        textarea.style.height = '100%';
        textarea.style.border = 'none';
        textarea.style.resize = 'none';
        textarea.style.background = 'transparent';
        textarea.style.color = 'inherit';
        textarea.style.fontFamily = 'monospace';
        textarea.style.outline = 'none';
        this.outputContainer.appendChild(textarea);

        // Focus and select all? Maybe just focus.
        textarea.focus();
    }

    clearOutputArea() {
        this.outputContainer.innerHTML = '';
    }

    renderJsonHtml() {
        this.outputContainer.innerHTML = this.generateJsonHtml(this.data);
    }

    generateJsonHtml(data, path = []) {
        if (data === null) return `<span class="json-value type-null">null</span>`;
        if (typeof data === 'string') return `<span class="json-value type-string">"${data}"</span>`;
        if (typeof data === 'number') return `<span class="json-value type-number">${data}</span>`;
        if (typeof data === 'boolean') return `<span class="json-value type-boolean">${data}</span>`;
        if (data === undefined) return '';

        const isArray = Array.isArray(data);
        const openChar = isArray ? '[' : '{';
        const closeChar = isArray ? ']' : '}';

        let keys = Object.keys(data || {});
        const originalData = this.getOriginalValueAt(path);

        if (originalData && typeof originalData === 'object') {
            if (isArray && Array.isArray(originalData)) {
                const maxLen = Math.max((data || []).length, originalData.length);
                keys = Array.from({ length: maxLen }, (_, i) => String(i));
            } else if (!isArray && !Array.isArray(originalData)) {
                const originalKeys = Object.keys(originalData);
                keys = [...new Set([...keys, ...originalKeys])];
            }
        }

        if (keys.length === 0) return `${openChar}${closeChar}`;

        let html = `${openChar}\n`;
        keys.forEach((key, index) => {
            const currentPath = [...path, isArray ? Number(key) : key];
            const pathStr = JSON.stringify(currentPath);
            const value = data ? data[key] : undefined;
            const originalValue = originalData ? originalData[key] : undefined;

            const diffState = this.diffMap ? this.diffMap.get(pathStr) : undefined;

            let diffClass = '';
            if (diffState === 'added') diffClass = 'diff-added';
            if (diffState === 'removed') diffClass = 'diff-removed';
            if (diffState === 'updated') diffClass = 'diff-updated';

            const renderValue = diffState === 'removed' ? originalValue : value;

            const isLast = index === keys.length - 1;
            const comma = isLast ? '' : ',';
            const indent = '  '.repeat(path.length + 1);
            const keyHtml = isArray ? '' : `<span class="json-key">"${key}"</span>: `;

            let valueHtml = '';
            if (renderValue === null) valueHtml = `<span class="json-value type-null">null</span>`;
            else if (typeof renderValue === 'string') valueHtml = `<span class="json-value type-string">"${renderValue}"</span>`;
            else if (typeof renderValue === 'number') valueHtml = `<span class="json-value type-number">${renderValue}</span>`;
            else if (typeof renderValue === 'boolean') valueHtml = `<span class="json-value type-boolean">${renderValue}</span>`;
            else valueHtml = this.generateJsonHtml(renderValue, currentPath);

            html += `<div class="json-line ${diffClass}" data-path='${pathStr}'>${indent}${keyHtml}${valueHtml}${comma}</div>`;
        });
        html += `${'  '.repeat(path.length)}${closeChar}`;
        return html;
    }

    renderBreadcrumbs() {
        this.breadcrumbsContainer.innerHTML = '';

        const fullPath = ['ROOT', ...this.selectionPath];

        fullPath.forEach((item, index) => {
            if (index > 0) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-separator';
                sep.innerText = '>';
                this.breadcrumbsContainer.appendChild(sep);
            }

            const el = document.createElement('span');
            el.className = 'breadcrumb-item';
            el.innerText = item;

            if (index === fullPath.length - 1) {
                el.classList.add('active');
            } else {
                el.onclick = () => {
                    this.selectionPath = this.selectionPath.slice(0, index);
                    this.render();
                };
            }
            this.breadcrumbsContainer.appendChild(el);
        });

        // Copy Path Button
        if (this.selectionPath.length > 0) {
            const copyBtn = document.createElement('button');
            copyBtn.className = 'breadcrumb-copy-btn';
            copyBtn.innerHTML = copyIcon;
            copyBtn.title = 'Copy Path';
            copyBtn.onclick = (e) => {
                e.stopPropagation();
                let pathStr = '';
                this.selectionPath.forEach((key, i) => {
                    if (typeof key === 'number') {
                        pathStr += `[${key}]`;
                    } else {
                        if (i > 0) pathStr += '.';
                        pathStr += key;
                    }
                });
                navigator.clipboard.writeText(pathStr);

                // Visual feedback
                const originalIcon = copyBtn.innerHTML;
                copyBtn.innerHTML = tickIcon;
                setTimeout(() => {
                    copyBtn.innerHTML = originalIcon;
                }, 1500);
            };
            this.breadcrumbsContainer.appendChild(copyBtn);
        }
    }

    renderColumn(path, dataContext, validationErrors = new Set()) {
        const col = document.createElement('div');
        col.className = 'column';

        const header = document.createElement('div');
        header.className = 'column-header';

        let headerText = 'ROOT';
        if (path.length > 0) {
            const lastKey = path[path.length - 1];
            const schema = this.getSchemaForPath(path);
            const isArrayItem = !isNaN(lastKey);

            let title = '';

            if (schema && schema.title) {
                title = schema.title;
            } else {
                if (isArrayItem) {
                    const parentPath = path.slice(0, -1);
                    const parentLastKey = parentPath.length > 0 ? parentPath[parentPath.length - 1] : 'Item';
                    title = String(parentLastKey);
                } else {
                    title = String(lastKey);
                }
                // Capitalize first letter
                title = title.charAt(0).toUpperCase() + title.slice(1);
            }

            title = title.replaceAll(/[-_]/g, ' ');
            if (isArrayItem) {
                headerText = `${title} #${lastKey}`;
            } else {
                headerText = title;
            }
        }

        header.innerText = headerText;
        col.appendChild(header);

        let keys = Object.keys(dataContext || {});
        const originalDataContext = this.getOriginalValueAt(path);

        if (Array.isArray(dataContext) && Array.isArray(originalDataContext)) {
            const maxLen = Math.max(dataContext.length, originalDataContext.length);
            keys = Array.from({ length: maxLen }, (_, i) => String(i));
        } else if (!Array.isArray(dataContext)) {
            let originalKeys = originalDataContext && typeof originalDataContext === 'object' && !Array.isArray(originalDataContext) ? Object.keys(originalDataContext) : [];
            const currentSchema = this.getSchemaForPath(path);
            let schemaKeys = [];

            if (currentSchema && currentSchema.properties) {
                schemaKeys = Object.keys(currentSchema.properties);
            }

            keys = [...new Set([...keys, ...originalKeys, ...schemaKeys])];

            // Sort keys to match schema order if possible
            keys.sort((a, b) => {
                const idxA = schemaKeys.indexOf(a);
                const idxB = schemaKeys.indexOf(b);
                if (idxA !== -1 && idxB !== -1) return idxA - idxB;
                if (idxA !== -1) return -1;
                if (idxB !== -1) return 1;
                return 0;
            });
        }


        keys.forEach(key => {
            const fullPath = [...path, Array.isArray(dataContext) ? Number(key) : key];

            // Auto-populate defaults for missing fields if provided in schema
            if (dataContext[key] === undefined && !Array.isArray(dataContext)) {
                const fieldSchema = this.getSchemaForPath(fullPath);
                if (fieldSchema && fieldSchema.default !== undefined) {
                    dataContext[key] = fieldSchema.default;
                }
            }
            let value = dataContext[key];
            let valueType = this.getType(value);

            // Handle undefined/missing values
            if (value === undefined) {
                const fieldSchema = this.getSchemaForPath(fullPath);
                const availableTypes = this.getAvailableTypes(fieldSchema);
                // Guess type from allowed types
                if (availableTypes && availableTypes.length > 0) {
                    const firstType = availableTypes[0];
                    // Only override if not 'undefined' (which getAvailableTypes returns if no schema)
                    if (firstType !== 'undefined') {
                        valueType = firstType;
                        if (valueType === 'integer') valueType = 'number';
                    } else {
                        valueType = 'string';
                    }
                } else {
                    valueType = 'string';
                }
            }

            const isComplex = valueType === 'object' || valueType === 'array';

            const parentSchema = this.getSchemaForPath(path);
            const fieldSchema = this.getSchemaForPath(fullPath); // Redundant call but safe
            const isRequired = !Array.isArray(dataContext) && this.isRequired(parentSchema, key);

            const diffState = this.diffMap ? this.diffMap.get(JSON.stringify(fullPath)) : undefined;

            const row = document.createElement('div');
            row.className = 'row';
            row.setAttribute('data-path', JSON.stringify(fullPath));

            if (diffState === 'added') row.classList.add('diff-added');
            if (diffState === 'removed') row.classList.add('diff-removed');
            if (diffState === 'updated') row.classList.add('diff-updated');

            if (dataContext[key] === undefined) {
                row.classList.add('is-missing');
            }

            const initializeMissing = () => {
                if (dataContext[key] === undefined && !this.isLocked) {
                    let defaultVal = "";
                    if (valueType === 'object') defaultVal = {};
                    else if (valueType === 'array') defaultVal = [];
                    else if (valueType === 'number') defaultVal = 0;
                    else if (valueType === 'boolean') defaultVal = false;
                    else if (valueType === 'null') defaultVal = null;

                    dataContext[key] = defaultVal;
                    row.classList.remove('is-missing');

                    if (!this.disableOutput && this.isOutputVisible) {
                        if (this.isJsonEditMode) {
                            this.renderJsonTextArea();
                        } else {
                            this.renderJsonHtml();
                        }
                    }
                }
            };
            row.addEventListener('mousedown', initializeMissing, true);
            row.addEventListener('focusin', initializeMissing, true);

            const pathStr = JSON.stringify(fullPath);
            if (validationErrors.has(pathStr)) {
                row.classList.add('has-error');
            } else {
                for (let errPath of validationErrors) {
                    if (errPath.startsWith(pathStr.slice(0, -1) + ',')) {
                        row.classList.add('child-error');
                        break;
                    }
                }
            }

            row.onmouseenter = () => {
                const pathStr = JSON.stringify(fullPath);
                const jsonLine = this.outputContainer.querySelector(`.json-line[data-path='${pathStr}']`);
                if (jsonLine) {
                    jsonLine.classList.add('highlight');
                    jsonLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
            row.onmouseleave = () => {
                const pathStr = JSON.stringify(fullPath);
                const jsonLine = this.outputContainer.querySelector(`.json-line[data-path='${pathStr}']`);
                if (jsonLine) {
                    jsonLine.classList.remove('highlight');
                }
            };

            const isSelected = this.selectionPath.length > path.length &&
                this.selectionPath[path.length] == key;
            if (isSelected) row.classList.add('active');
            if (!isComplex) row.classList.add('scalar-row');

            const rowHeader = document.createElement('div');
            rowHeader.className = 'row-header';

            const label = document.createElement('span');
            label.className = 'key-label';
            label.title = key; // Native tooltip
            if (isRequired) label.classList.add('required');
            else label.classList.add('optional');
            label.innerText = key;

            const allowedTypes = this.getAvailableTypes(fieldSchema);
            const typeBadge = document.createElement('select');
            typeBadge.className = 'type-badge';
            typeBadge.disabled = this.isLocked;

            const typeIcons = {
                'string': 'abc',
                'number': '#',
                'boolean': '?',
                'object': '{}',
                'array': '[]',
                'null': '∅'
            };

            typeBadge.classList.add(`type-${valueType}`);

            allowedTypes.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.innerText = typeIcons[t] || t;
                if (t === valueType) opt.selected = true;
                typeBadge.appendChild(opt);
            });

            typeBadge.onchange = (e) => {
                const newType = e.target.value;
                let newValue;
                if (newType === 'string') newValue = "";
                else if (newType === 'number') newValue = 0;
                else if (newType === 'boolean') newValue = false;
                else if (newType === 'object') newValue = {};
                else if (newType === 'array') newValue = [];
                else if (newType === 'null') newValue = null;

                this.setValueAt(fullPath, newValue);
                e.stopPropagation();
            };

            if (allowedTypes.length > 1 || !fieldSchema) {
                rowHeader.appendChild(typeBadge);
            } else {
                const staticBadge = document.createElement('span');
                staticBadge.className = `type-badge type-${valueType}`;
                staticBadge.innerText = typeIcons[valueType] || valueType;
                rowHeader.appendChild(staticBadge);
            }

            rowHeader.appendChild(label);

            row.appendChild(rowHeader);

            if (!isComplex) {
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'input-wrapper';

                if (valueType === 'boolean') {
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.checked = value === undefined ? false : value;
                    cb.disabled = this.isLocked;
                    cb.onchange = (e) => this.setValueAt(fullPath, e.target.checked);
                    cb.style.width = "20px";
                    cb.style.borderBottom = "none";
                    inputWrapper.appendChild(cb);
                } else if (fieldSchema && fieldSchema.enum) {
                    const sel = document.createElement('select');
                    sel.disabled = this.isLocked;

                    if (value === undefined) {
                        const opt = document.createElement('option');
                        opt.value = "";
                        opt.innerText = "-- Select --";
                        opt.disabled = true;
                        opt.selected = true;
                        opt.hidden = true;
                        sel.appendChild(opt);
                    }

                    fieldSchema.enum.forEach(optVal => {
                        const opt = document.createElement('option');
                        opt.value = optVal;
                        opt.innerText = optVal;
                        if (optVal === value) opt.selected = true;
                        sel.appendChild(opt);
                    });
                    sel.onchange = (e) => this.setValueAt(fullPath, e.target.value);
                    inputWrapper.appendChild(sel);
                } else if (valueType === 'null') {
                    const nullTxt = document.createElement('span');
                    nullTxt.innerText = "null";
                    nullTxt.style.color = "#666";
                    nullTxt.style.fontStyle = "italic";
                    inputWrapper.appendChild(nullTxt);
                } else {
                    const isLongText = valueType === 'string' && String(value || "").length > 60;

                    let input;
                    if (isLongText) {
                        input = document.createElement('textarea');
                        input.value = value === undefined ? "" : value;
                        input.rows = 3;
                        input.disabled = this.isLocked;
                        input.oninput = (e) => {
                            e.target.style.height = 'auto';
                            e.target.style.height = (e.target.scrollHeight) + 'px';
                        };
                        input.onchange = (e) => {
                            this.setValueAt(fullPath, e.target.value);
                        };
                    } else {
                        input = document.createElement('input');
                        input.type = valueType === 'number' ? 'number' : 'text';
                        input.value = value === undefined ? "" : value;
                        input.disabled = this.isLocked;

                        input.onchange = (e) => {
                            const val = valueType === 'number' ? parseFloat(e.target.value) : e.target.value;
                            this.setValueAt(fullPath, val);
                        };
                    }

                    if (input.type === 'text') {
                        if (validationErrors.has(JSON.stringify(fullPath))) {
                            input.classList.add('input-error');
                        }
                    }
                    inputWrapper.appendChild(input);
                }
                row.appendChild(inputWrapper);
            } else {
                const arrow = document.createElement('span');
                arrow.className = 'arrow';
                arrow.innerHTML = arrowIcon;
                rowHeader.appendChild(arrow);
            }

            row.onclick = (e) => {
                if (e.target.tagName === 'INPUT' ||
                    e.target.tagName === 'SELECT' ||
                    e.target.tagName === 'TEXTAREA' ||
                    e.target.closest('.input-wrapper')) return;

                const newPath = this.selectionPath.slice(0, path.length);
                newPath.push(Array.isArray(dataContext) ? Number(key) : key);

                this.selectionPath = newPath;
                this.focusedPath = null;
                this.render();
            };

            if (isRequired) {
                const lockIcon = document.createElement('span');
                lockIcon.className = 'lock-icon';
                lockIcon.innerHTML = filledLockIcon;
                row.appendChild(lockIcon);
            } else {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = trashIcon;
                deleteBtn.title = 'Delete Item';
                deleteBtn.disabled = this.isLocked;

                let deleteArmed = false;
                deleteBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (this.isLocked) return;

                    if (deleteArmed) {
                        this.deleteValueAt(fullPath);
                    } else {
                        deleteArmed = true;
                        deleteBtn.classList.add('confirm');
                        setTimeout(() => {
                            deleteArmed = false;
                            deleteBtn.classList.remove('confirm');
                        }, 3000);
                    }
                };
                row.appendChild(deleteBtn);
            }

            col.appendChild(row);
        });

        if (!this.isLocked && !Array.isArray(dataContext) && typeof dataContext === 'object') {
            const schema = this.getSchemaForPath(path);

            const allowsAdditional = !schema || schema.additionalProperties !== false;

            if (allowsAdditional) {
                const addPropBtn = document.createElement('button');
                addPropBtn.innerText = "+ Custom Property";
                addPropBtn.className = "add-property-btn";

                addPropBtn.onclick = (e) => {
                    e.stopPropagation();
                    const propName = prompt("Enter new custom property name:");
                    if (propName && !Object.keys(dataContext).includes(propName)) {
                        const newPath = [...path, propName];
                        let defaultVal = "";
                        if (schema && schema.additionalProperties && typeof schema.additionalProperties === 'object') {
                            defaultVal = this.getDefaultValue(schema.additionalProperties);
                        }
                        this.setValueAt(newPath, defaultVal);
                    }
                };
                col.appendChild(addPropBtn);
            }
        }

        if (!this.isLocked && Array.isArray(dataContext)) {
            const addBtn = document.createElement('button');
            addBtn.innerText = "+ Add Item";
            addBtn.className = "add-item-btn";
            addBtn.onclick = () => {
                const newPath = [...path, dataContext.length];
                let defaultValue = "";
                const currentSchema = this.getSchemaForPath(path);
                if (currentSchema && currentSchema.items) {
                    defaultValue = this.getDefaultValue(currentSchema.items);
                }
                this.setValueAt(newPath, defaultValue);
            };
            col.appendChild(addBtn);
        }

        this.editorContainer.appendChild(col);
    }
}
