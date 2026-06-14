/**
 * JsonMiller - A Miller Column JSON Editor Library
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import styles from './style.css';
import { arrowIcon, copyIcon, darkThemeIcon, editIcon, filledLockIcon, lightThemeIcon, lockIcon, saveIcon, tickIcon, trashIcon, unlockIcon, visibilityIcon, visibilityOffIcon, restoreIcon } from './svg';

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
        this.diffMap = new Map();
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

        this.searchQuery = '';
        this.searchResults = [];
        this.searchIndex = -1;
        this.activeSearchPath = null;
        this.searchCaseSensitive = false;

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
            
            <div class="jm-search-container">
                <span class="jm-search-icon" style="font-size: 16px;">🔍</span>
                <input type="text" class="jm-search-input" placeholder="Search keys and values..." />
                <span class="jm-search-counter" style="font-size: 12px; margin-right: 8px; opacity: 0.6; display: none;"></span>
                <button class="jm-search-case-btn" title="Match Case" style="font-family: monospace; font-weight: bold; font-size: 14px;">Aa</button>
                <div class="jm-search-nav">
                    <button class="jm-search-prev-btn" title="Previous Match" style="font-size: 16px;">↑</button>
                    <button class="jm-search-next-btn" title="Next Match" style="font-size: 16px;">↓</button>
                </div>
            </div>

            <div style="display: flex; gap: 10px;">
                <button class="jm-theme-btn" title="Toggle Theme">
                    ${lightThemeIcon}
                </button>
                ${this.showLockBtn ? `<button class="jm-lock-btn" title="Lock/Unlock">
                    ${lockIcon}
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
                `<div class="jm-output">
                    ${this.showJsonEditBtn ? `<button class="jm-json-edit-btn" title="Edit JSON">
                        ${editIcon}
                    </button>` : ''}
                    <div class="jm-output-content"></div>
                </div>`}
            </div>
        `;

        this.wrapper.appendChild(this.header);
        this.wrapper.appendChild(body);
        this.shadowRoot.appendChild(this.wrapper);

        this.breadcrumbsContainer = this.wrapper.querySelector('.jm-breadcrumbs');
        this.editorContainer = this.wrapper.querySelector('.jm-editor');
        if (!this.disableOutput) {
            this.outputContainer = this.wrapper.querySelector('.jm-output');
            this.outputContentContainer = this.wrapper.querySelector('.jm-output-content');
        }

        this.themeBtn = this.header.querySelector('.jm-theme-btn');
        this.lockBtn = this.header.querySelector('.jm-lock-btn');
        this.copyBtn = this.header.querySelector('.jm-copy-btn');
        this.jsonEditBtn = this.wrapper.querySelector('.jm-json-edit-btn');
        this.outputToggleBtn = this.header.querySelector('.jm-output-toggle-btn');

        this.searchInput = this.header.querySelector('.jm-search-input');
        this.searchCaseBtn = this.header.querySelector('.jm-search-case-btn');
        this.searchPrevBtn = this.header.querySelector('.jm-search-prev-btn');
        this.searchNextBtn = this.header.querySelector('.jm-search-next-btn');
        this.searchCounter = this.header.querySelector('.jm-search-counter');

        // Bind events
        this.searchInput.addEventListener('input', (e) => {
            this._executeSearch(e.target.value);
        });
        this.searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                if (e.shiftKey) this._prevSearchResult();
                else this._nextSearchResult();
            }
        });
        this.searchCaseBtn.onclick = () => {
            this.searchCaseSensitive = !this.searchCaseSensitive;
            if (this.searchCaseSensitive) this.searchCaseBtn.classList.add('active');
            else this.searchCaseBtn.classList.remove('active');
            this._executeSearch(this.searchInput.value);
        };
        this.searchPrevBtn.onclick = () => this._prevSearchResult();
        this.searchNextBtn.onclick = () => this._nextSearchResult();

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
        this.diffMap = new Map();
        // Reset selection
        this.selectionPath = [];
        this.render();
    }

    updateData(newData) {
        this.data = newData;
        this.diffMap = new Map();
        this._updateDiffForPath([]);
        this.render();
    }

    getOriginalValueAt(path) {
        return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, this.originalData);
    }

    _executeSearch(query) {
        this.searchQuery = query;
        this.searchResults = [];
        this.searchIndex = -1;
        this.activeSearchPath = null;

        if (!query) {
            this.render({ preserveScroll: true });
            return;
        }

        const q = this.searchCaseSensitive ? query : query.toLowerCase();

        const searchNode = (node, path) => {
            if (node && typeof node === 'object') {
                Object.keys(node).forEach(key => {
                    const childPath = [...path, Array.isArray(node) ? Number(key) : key];
                    const k = this.searchCaseSensitive ? String(key) : String(key).toLowerCase();

                    if (k.includes(q)) {
                        this.searchResults.push({ path: childPath, isKey: true });
                    }

                    searchNode(node[key], childPath);
                });
            } else if (node !== undefined && node !== null) {
                const v = this.searchCaseSensitive ? String(node) : String(node).toLowerCase();
                if (v.includes(q)) {
                    this.searchResults.push({ path, isKey: false });
                }
            }
        };

        searchNode(this.data, []);

        if (this.searchResults.length > 0) {
            this.searchIndex = 0;
            this._jumpToSearchIndex();
        } else {
            this.searchCounter.style.display = 'none';
            this.render({ preserveScroll: true });
        }
    }

    _jumpToSearchIndex() {
        if (this.searchIndex < 0 || this.searchIndex >= this.searchResults.length) return;

        this.searchCounter.style.display = 'inline';
        this.searchCounter.innerText = `${this.searchIndex + 1} / ${this.searchResults.length}`;

        const result = this.searchResults[this.searchIndex];
        this.activeSearchPath = result.path;
        this.selectionPath = result.path.slice(0, -1);
        this.focusedPath = null;
        this.render();
    }

    _nextSearchResult() {
        if (this.searchResults.length === 0) return;
        this.searchIndex = (this.searchIndex + 1) % this.searchResults.length;
        this._jumpToSearchIndex();
    }

    _prevSearchResult() {
        if (this.searchResults.length === 0) return;
        this.searchIndex = (this.searchIndex - 1 + this.searchResults.length) % this.searchResults.length;
        this._jumpToSearchIndex();
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


    _updateDiffForPath(path) {
        if (!this.diffMap) this.diffMap = new Map();

        const removePathAndChildren = (pStr) => {
            const prefix = pStr === '[]' ? '[' : pStr.slice(0, -1) + ',';
            for (let key of this.diffMap.keys()) {
                if (key === pStr || key.startsWith(prefix)) {
                    this.diffMap.delete(key);
                }
            }
        };

        const compare = (current, original, p) => {
            const pathStr = JSON.stringify(p);
            removePathAndChildren(pathStr);

            if (current === undefined && original !== undefined) {
                this.diffMap.set(pathStr, 'removed');
                const markChildrenRemoved = (obj, childP) => {
                    if (obj && typeof obj === 'object') {
                        Object.keys(obj).forEach(k => {
                            const nextP = [...childP, Array.isArray(obj) ? Number(k) : k];
                            this.diffMap.set(JSON.stringify(nextP), 'removed');
                            markChildrenRemoved(obj[k], nextP);
                        });
                    }
                };
                markChildrenRemoved(original, p);
                return true;
            }
            if (current !== undefined && original === undefined) {
                this.diffMap.set(pathStr, 'added');
                const markChildrenAdded = (obj, childP) => {
                    if (obj && typeof obj === 'object') {
                        Object.keys(obj).forEach(k => {
                            const nextP = [...childP, Array.isArray(obj) ? Number(k) : k];
                            this.diffMap.set(JSON.stringify(nextP), 'added');
                            markChildrenAdded(obj[k], nextP);
                        });
                    }
                };
                markChildrenAdded(current, p);
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
            const keys = new Set([...Object.keys(current || {}), ...Object.keys(original || {})]);

            for (let key of keys) {
                const childPath = [...p, Array.isArray(current) && Array.isArray(original) ? Number(key) : key];
                const childDiff = compare(current[key], original[key], childPath);
                if (childDiff) hasDiff = true;
            }

            if (hasDiff) {
                this.diffMap.set(pathStr, 'updated');
            }

            return hasDiff;
        };

        const current = this.getValueAt(path);
        const original = this.getOriginalValueAt(path);
        compare(current, original, path);

        for (let i = path.length - 1; i >= 0; i--) {
            const ancestorPath = path.slice(0, i);
            const ancestorStr = JSON.stringify(ancestorPath);
            const ancestorPrefix = ancestorPath.length === 0 ? '[' : ancestorStr.slice(0, -1) + ',';

            let ancestorHasDiff = false;
            for (let diffKey of this.diffMap.keys()) {
                if (diffKey !== ancestorStr && (ancestorPath.length === 0 || diffKey.startsWith(ancestorPrefix))) {
                    ancestorHasDiff = true;
                    break;
                }
            }

            if (ancestorHasDiff) {
                this.diffMap.set(ancestorStr, 'updated');
            } else {
                this.diffMap.delete(ancestorStr);
            }
        }
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
            const textarea = this.outputContentContainer.querySelector('textarea');
            if (textarea) {
                this.jsonEditBtn.style.opacity = '0.5';
                this.jsonEditBtn.style.pointerEvents = 'none';
                if (this.outputContentContainer) {
                    this.outputContentContainer.innerHTML = '<div style="opacity: 0.7; font-style: italic;">Parsing JSON...</div>';
                }

                setTimeout(() => {
                    try {
                        const newData = JSON.parse(textarea.value);
                        this.isJsonEditMode = false;
                        this.jsonEditBtn.innerHTML = editIcon;
                        this.jsonEditBtn.title = "Edit JSON";
                        this.updateData(newData);
                    } catch (e) {
                        alert("Invalid JSON: " + e.message);
                        if (this.outputContentContainer) {
                            this.outputContentContainer.innerHTML = '';
                            this.outputContentContainer.appendChild(textarea);
                        }
                    } finally {
                        this.jsonEditBtn.style.opacity = '1';
                        this.jsonEditBtn.style.pointerEvents = 'auto';
                    }
                }, 10);
            }
        } else {
            // Switching to edit mode
            this.isJsonEditMode = true;
            this.jsonEditBtn.innerHTML = saveIcon;
            this.jsonEditBtn.title = "Save JSON";

            this.jsonEditBtn.style.opacity = '0.5';
            this.jsonEditBtn.style.pointerEvents = 'none';
            if (this.outputContentContainer) {
                this.outputContentContainer.innerHTML = '<div style="opacity: 0.7; font-style: italic;">Loading...</div>';
            }

            setTimeout(() => {
                this.render();
                this.jsonEditBtn.style.opacity = '1';
                this.jsonEditBtn.style.pointerEvents = 'auto';
            }, 10);
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
        this._updateDiffForPath(path);
        this.render({ preserveScroll: true });
    }

    getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    getEnumOptions(schema) {
        if (!schema) return null;

        if (Array.isArray(schema.enum)) {
            return schema.enum.map(value => ({ value, label: String(value) }));
        }

        return null;
    }

    _valuesEqual(a, b) {
        if (a === b) return true;
        if (a && b && typeof a === 'object' && typeof b === 'object') {
            return JSON.stringify(a) === JSON.stringify(b);
        }
        return false;
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
        this._updateDiffForPath(path);
        this.render({ preserveScroll: true });
    }

    getDefaultValue(schema) {
        if (!schema) return "";
        if (schema.default !== undefined) return schema.default;
        const enumOptions = this.getEnumOptions(schema);
        if (enumOptions && enumOptions.length > 0) return enumOptions[0].value;

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

        if (schemaNode.type) {
            return Array.isArray(schemaNode.type) ? schemaNode.type : [schemaNode.type];
        }

        const enumOptions = this.getEnumOptions(schemaNode);
        if (enumOptions && enumOptions.length > 0) {
            return [...new Set(enumOptions.map(o => this.getType(o.value)))];
        }

        if (schemaNode.oneOf) {
            return schemaNode.oneOf.map(s => s.type).filter(Boolean);
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
            const origValue = this.getOriginalValueAt(currentPath);

            const isComplex = (value && typeof value === 'object') || (origValue && typeof origValue === 'object');

            if (isComplex) {
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
        this.outputContentContainer.innerHTML = '';
        const textarea = document.createElement('textarea');
        textarea.placeholder = "Loading JSON...";
        textarea.style.width = '100%';
        textarea.style.height = '100%';
        textarea.style.border = 'none';
        textarea.style.resize = 'none';
        textarea.style.background = 'transparent';
        textarea.style.color = 'inherit';
        textarea.style.fontFamily = 'monospace';
        textarea.style.outline = 'none';
        this.outputContentContainer.appendChild(textarea);

        // Focus and select all? Maybe just focus.
        textarea.focus();

        // Use setTimeout to allow the browser to paint the UI updates before the heavy JSON.stringify and DOM value assignment blocks the thread
        setTimeout(() => {
            textarea.value = JSON.stringify(this.data, null, 2);
        }, 10);
    }

    clearOutputArea() {
        if (this.outputContentContainer) {
            this.outputContentContainer.innerHTML = '';
        }
    }

    renderJsonHtml() {
        const state = { count: 0, max: 2000 };
        if (this.outputContentContainer) {
            this.outputContentContainer.innerHTML = this.generateJsonHtml(this.data, [], state);
        }
    }

    generateJsonHtml(data, path = [], state = { count: 0, max: 2000 }) {
        if (data === null) return `<span class="json-value type-null">null</span>`;
        if (typeof data === 'string') return `<span class="json-value type-string">"${data}"</span>`;
        if (typeof data === 'number') return `<span class="json-value type-number">${data}</span>`;
        if (typeof data === 'boolean') return `<span class="json-value type-boolean">${data}</span>`;
        if (data === undefined) return '';

        if (state.count >= state.max) {
            return `<span class="json-value type-string" style="color: gray;">"... (truncated for performance)"</span>`;
        }

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
        for (let index = 0; index < keys.length; index++) {
            if (state.count >= state.max) {
                html += `<div class="json-line" style="opacity: 0.5;">${'  '.repeat(path.length + 1)}... (${keys.length - index} more omitted)</div>`;
                break;
            }
            state.count++;

            const key = keys[index];
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
            else valueHtml = this.generateJsonHtml(renderValue, currentPath, state);

            html += `<div class="json-line ${diffClass}" data-path='${pathStr}'>${indent}${keyHtml}${valueHtml}${comma}</div>`;
        }
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


        const viewport = document.createElement('div');
        viewport.className = 'column-viewport';

        const content = document.createElement('div');
        content.className = 'column-content';
        viewport.appendChild(content);
        col.appendChild(viewport);

        const createRowElement = (key) => {
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

            if (this.activeSearchPath && JSON.stringify(fullPath) === JSON.stringify(this.activeSearchPath)) {
                row.classList.add('search-highlight');
                setTimeout(() => {
                    row.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }, 10);
            }

            if (diffState === 'added') row.classList.add('diff-added');
            if (diffState === 'removed') row.classList.add('diff-removed');
            if (diffState === 'updated') row.classList.add('diff-updated');

            if (dataContext[key] === undefined) {
                row.classList.add('is-missing');
            }

            const initializeMissing = () => {
                if (dataContext[key] === undefined && !this.isLocked && diffState !== 'removed') {
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

                const enumOptions = this.getEnumOptions(fieldSchema);

                if (enumOptions) {
                    const sel = document.createElement('select');
                    sel.disabled = this.isLocked;

                    const selectedIndex = enumOptions.findIndex(o => this._valuesEqual(o.value, value));

                    if (selectedIndex === -1) {
                        const opt = document.createElement('option');
                        opt.value = "";
                        opt.innerText = "-- Select --";
                        opt.disabled = true;
                        opt.selected = true;
                        opt.hidden = true;
                        sel.appendChild(opt);
                    }

                    enumOptions.forEach((o, i) => {
                        const opt = document.createElement('option');
                        opt.value = String(i);
                        opt.innerText = o.label;
                        if (i === selectedIndex) opt.selected = true;
                        sel.appendChild(opt);
                    });
                    sel.onchange = (e) => this.setValueAt(fullPath, enumOptions[Number(e.target.value)].value);
                    inputWrapper.appendChild(sel);
                } else if (valueType === 'boolean') {
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.checked = value === undefined ? false : value;
                    cb.disabled = this.isLocked;
                    cb.onchange = (e) => this.setValueAt(fullPath, e.target.checked);
                    cb.style.width = "20px";
                    cb.style.borderBottom = "none";
                    inputWrapper.appendChild(cb);
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

            const canRestore = !this.isLocked && (diffState === 'updated' || diffState === 'added');

            if (isRequired) {
                // For required fields: show restore above the lock icon if field was changed
                const reqGroup = document.createElement('div');
                reqGroup.className = 'row-actions row-actions-required';
                if (canRestore) {
                    const restoreBtn = document.createElement('button');
                    restoreBtn.className = 'row-action-btn restore-btn';
                    restoreBtn.innerHTML = restoreIcon;
                    restoreBtn.title = 'Restore Original Value';
                    restoreBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (this.isLocked) return;
                        const origVal = this.getOriginalValueAt(fullPath);
                        this.setValueAt(fullPath, JSON.parse(JSON.stringify(origVal)));
                    };
                    reqGroup.appendChild(restoreBtn);
                }
                const lockIconEl = document.createElement('span');
                lockIconEl.className = 'lock-icon';
                lockIconEl.innerHTML = filledLockIcon;
                reqGroup.appendChild(lockIconEl);
                row.appendChild(reqGroup);
            } else if (diffState === 'removed') {
                const restoreBtn = document.createElement('button');
                restoreBtn.className = 'delete-btn';
                restoreBtn.innerHTML = restoreIcon;
                restoreBtn.title = 'Restore Original Value';
                restoreBtn.disabled = this.isLocked;

                restoreBtn.onclick = (e) => {
                    e.stopPropagation();
                    if (this.isLocked) return;
                    const origVal = this.getOriginalValueAt(fullPath);
                    this.setValueAt(fullPath, JSON.parse(JSON.stringify(origVal)));
                };
                row.appendChild(restoreBtn);
            } else {
                const actionsGroup = document.createElement('div');
                actionsGroup.className = 'row-actions';

                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'row-action-btn delete-btn';
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
                if (canRestore) {
                    const restoreBtn = document.createElement('button');
                    restoreBtn.className = 'row-action-btn restore-btn';
                    restoreBtn.innerHTML = restoreIcon;
                    restoreBtn.title = diffState === 'added' ? 'Undo Addition' : 'Restore Original Value';
                    restoreBtn.onclick = (e) => {
                        e.stopPropagation();
                        if (this.isLocked) return;
                        if (diffState === 'added') {
                            this.deleteValueAt(fullPath);
                        } else {
                            const origVal = this.getOriginalValueAt(fullPath);
                            this.setValueAt(fullPath, JSON.parse(JSON.stringify(origVal)));
                        }
                    };
                    actionsGroup.appendChild(restoreBtn);
                }

                actionsGroup.appendChild(deleteBtn);

                row.appendChild(actionsGroup);
            }

            return row;
        };

        let lastStartIndex = -1;
        let renderFrame = null;
        const ROW_HEIGHT = 70;

        const renderRows = () => {
            const scrollTop = viewport.scrollTop;
            const viewportHeight = viewport.clientHeight || 400;

            const visibleCount = Math.ceil(viewportHeight / ROW_HEIGHT) + 4;
            const startIndex = Math.max(0, Math.floor(scrollTop / ROW_HEIGHT) - 2);
            let endIndex = Math.min(keys.length, startIndex + visibleCount);

            if (keys.length < 50) {
                if (lastStartIndex === 0) return;
                lastStartIndex = 0;
                content.innerHTML = '';
                content.style.paddingTop = '0px';
                content.style.paddingBottom = '0px';

                keys.forEach(key => content.appendChild(createRowElement(key)));
            } else {
                if (startIndex === lastStartIndex) return;
                lastStartIndex = startIndex;

                content.innerHTML = '';
                const paddingTop = startIndex * ROW_HEIGHT;
                const paddingBottom = Math.max(0, (keys.length - endIndex) * ROW_HEIGHT);

                content.style.paddingTop = `${paddingTop}px`;
                content.style.paddingBottom = `${paddingBottom}px`;

                const visibleKeys = keys.slice(startIndex, endIndex);
                visibleKeys.forEach(key => content.appendChild(createRowElement(key)));
            }

            if (keys.length < 50 || endIndex === keys.length) {
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
                        content.appendChild(addPropBtn);
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
                    content.appendChild(addBtn);
                }
            }
        };

        renderRows();
        viewport.addEventListener('scroll', () => {
            if (renderFrame) cancelAnimationFrame(renderFrame);
            renderFrame = requestAnimationFrame(renderRows);
        });

        this.editorContainer.appendChild(col);
    }
}
