/**
 * JsonMiller - A Miller Column JSON Editor Library
 */
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import './style.css';

export class JsonMiller {
    constructor(container, config = {}) {
        this.container = typeof container === 'string' ? document.querySelector(container) : container;
        if (!this.container) {
            throw new Error("JsonMiller: Container not found");
        }

        this.title = config.title || "Miller Column JSON Editor";
        this.data = config.data || {};
        this.rootSchema = config.schema || {};
        this.ajvInstance = config.ajv || null;
        this.isLocked = false;

        this.selectionPath = []; // Array of keys/indices
        this.focusedPath = null;

        // Theme state
        this.isDark = true;

        // Create internal DOM structure
        this._createDom();

        // Init Theme
        this._initTheme();

        // Init AJV
        this._loadAjv();

        this.init();

    }

    _createDom() {
        this.container.classList.add('json-miller-container');

        // Create Header
        this.header = document.createElement('header');
        this.header.innerHTML = `
            <h3>${this.title}</h3>
            <div style="display: flex; gap: 10px;">
                <button class="jm-theme-btn">🌙</button>
                <button class="jm-lock-btn">🔓</button>
                <button class="jm-copy-btn">📋</button>
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
                <div class="jm-output"></div>
            </div>
        `;

        this.container.appendChild(this.header);
        this.container.appendChild(body);

        this.breadcrumbsContainer = this.container.querySelector('.jm-breadcrumbs');
        this.editorContainer = this.container.querySelector('.jm-editor');
        this.outputContainer = this.container.querySelector('.jm-output');

        this.themeBtn = this.header.querySelector('.jm-theme-btn');
        this.lockBtn = this.header.querySelector('.jm-lock-btn');
        this.copyBtn = this.header.querySelector('.jm-copy-btn');

        // Bind events
        this.themeBtn.onclick = () => this.toggleTheme();
        this.lockBtn.onclick = () => this.toggleLock();
        this.copyBtn.onclick = () => this.copyJson();
    }

    _loadAjv() {
        if (this.ajvInstance) {
            this._ajv = this.ajvInstance;
            this._validateFn = this._ajv.compile(this.rootSchema);
            return;
        }

        // Use bundled Ajv
        this._ajv = addFormats(new Ajv({ allErrors: true }));
        this._validateFn = this._ajv.compile(this.rootSchema);
    }

    get ajv() {
        return this._ajv;
    }

    get validateFn() {
        return this._validateFn;
    }

    init() {
        // If AJV is loading async (e.g. via script tag), we might need to wait.
        // But for a library, we usually expect dependencies to be ready.
        // We'll just render.
        this.render();
    }

    // --- Public API ---

    setData(data) {
        this.data = data;
        this.selectionPath = []; // Reset selection? Or try to keep it? Resetting is safer.
        this.render();
    }

    setSchema(schema) {
        this.rootSchema = schema;
        if (this._ajv) {
            this._validateFn = this._ajv.compile(this.rootSchema);
        }
        this.render();
    }

    lock() {
        this.isLocked = true;
        this.container.classList.add('jm-locked');
        if (this.lockBtn) this.lockBtn.innerText = '🔒';
        this.render({ preserveScroll: true });
    }

    unlock() {
        this.isLocked = false;
        this.container.classList.remove('jm-locked');
        if (this.lockBtn) this.lockBtn.innerText = '🔓';
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
            document.documentElement.setAttribute('data-theme', 'dark');
            if (this.themeBtn) this.themeBtn.innerText = '🌙';
        } else {
            document.documentElement.setAttribute('data-theme', 'light');
            if (this.themeBtn) this.themeBtn.innerText = '☀️';
        }
    }

    copyJson() {
        navigator.clipboard.writeText(JSON.stringify(this.data, null, 2));
        alert("JSON copied to clipboard");
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
        this.render({ preserveScroll: true });
    }

    getDefaultValue(schema) {
        if (!schema) return "";
        if (schema.default !== undefined) return schema.default;

        const type = Array.isArray(schema.type) ? schema.type[0] : schema.type;

        if (type === 'string') return "";
        if (type === 'number') return 0;
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
                const pathStr = err.instancePath;
                if (pathStr) {
                    const parts = pathStr.split('/').filter(p => p !== "");
                    const pathArray = parts.map(p => {
                        return isNaN(p) ? p : Number(p);
                    });
                    errors.add(JSON.stringify(pathArray));
                } else {
                    errors.add(JSON.stringify([]));
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
        this.outputContainer.innerHTML = this.renderJsonHtml(this.data);

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

    renderJsonHtml(data, path = []) {
        if (data === null) return `<span class="json-value type-null">null</span>`;
        if (typeof data === 'string') return `<span class="json-value type-string">"${data}"</span>`;
        if (typeof data === 'number') return `<span class="json-value type-number">${data}</span>`;
        if (typeof data === 'boolean') return `<span class="json-value type-boolean">${data}</span>`;

        const isArray = Array.isArray(data);
        const openChar = isArray ? '[' : '{';
        const closeChar = isArray ? ']' : '}';
        const keys = Object.keys(data);

        if (keys.length === 0) return `${openChar}${closeChar}`;

        let html = `${openChar}\n`;
        keys.forEach((key, index) => {
            const currentPath = [...path, isArray ? Number(key) : key];
            const pathStr = JSON.stringify(currentPath);
            const value = data[key];
            const isLast = index === keys.length - 1;
            const comma = isLast ? '' : ',';
            const indent = '  '.repeat(path.length + 1);
            const keyHtml = isArray ? '' : `<span class="json-key">"${key}"</span>: `;
            const valueHtml = this.renderJsonHtml(value, currentPath);

            html += `<div class="json-line" data-path='${pathStr}'>${indent}${keyHtml}${valueHtml}${comma}</div>`;
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

            if (schema && schema.title) {
                headerText = schema.title;
                if (!isNaN(lastKey)) {
                    headerText += ` [${lastKey}]`;
                }
            } else {
                headerText = String(lastKey).toUpperCase();
                if (!isNaN(lastKey)) {
                    const parentPath = path.slice(0, -1);
                    const parentLastKey = parentPath.length > 0 ? parentPath[parentPath.length - 1] : 'ITEM';
                    headerText = `${String(parentLastKey).toUpperCase()} [${lastKey}]`;
                }
            }
        }

        header.innerText = headerText;
        col.appendChild(header);

        const keys = Object.keys(dataContext);

        keys.forEach(key => {
            const fullPath = [...path, Array.isArray(dataContext) ? Number(key) : key];
            const value = dataContext[key];
            const valueType = this.getType(value);
            const isComplex = valueType === 'object' || valueType === 'array';

            const fieldSchema = this.getSchemaForPath(fullPath);
            const parentSchema = this.getSchemaForPath(path);
            const isRequired = !Array.isArray(dataContext) && this.isRequired(parentSchema, key);

            const row = document.createElement('div');
            row.className = 'row';
            row.setAttribute('data-path', JSON.stringify(fullPath));

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
                    cb.checked = value;
                    cb.disabled = this.isLocked;
                    cb.onchange = (e) => this.setValueAt(fullPath, e.target.checked);
                    cb.style.width = "20px";
                    cb.style.borderBottom = "none";
                    inputWrapper.appendChild(cb);
                } else if (fieldSchema && fieldSchema.enum) {
                    const sel = document.createElement('select');
                    sel.disabled = this.isLocked;
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
                    const isLongText = valueType === 'string' && String(value).length > 60;

                    let input;
                    if (isLongText) {
                        input = document.createElement('textarea');
                        input.value = value;
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
                        input.value = value;
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
                arrow.innerText = '▶';
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
                lockIcon.innerHTML = '<svg fill="currentColor" width="20" height="20" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 22h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7A5 5 0 0 0 7 7v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2zm7-4.5a2 2 0 1 1 2-2 2 2 0 0 1-2 2zM9 9V7a3 3 0 0 1 6 0v2H9z"/></svg>';
                row.appendChild(lockIcon);
            } else {
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'delete-btn';
                deleteBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M280-120q-33 0-56.5-23.5T200-200v-520h-40v-80h200v-40h240v40h200v80h-40v520q0 33-23.5 56.5T680-120H280Zm400-600H280v520h400v-520ZM360-280h80v-360h-80v360Zm160 0h80v-360h-80v360ZM280-720v520-520Z"/></svg>';
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
            if (schema && schema.properties) {
                const allKeys = Object.keys(schema.properties);
                const currentKeys = Object.keys(dataContext);
                const missingKeys = allKeys.filter(k => !currentKeys.includes(k));

                if (missingKeys.length > 0) {
                    const addPropBtn = document.createElement('button');
                    addPropBtn.innerText = "+ Property";
                    addPropBtn.className = "add-property-btn";

                    addPropBtn.onclick = (e) => {
                        e.stopPropagation();
                        const existingDropdown = col.querySelector('.property-dropdown');
                        if (existingDropdown) {
                            existingDropdown.remove();
                            return;
                        }

                        const dropdown = document.createElement('div');
                        dropdown.className = 'property-dropdown';
                        dropdown.style.top = (addPropBtn.offsetTop + addPropBtn.offsetHeight) + 'px';
                        dropdown.style.left = addPropBtn.offsetLeft + 'px';
                        dropdown.style.width = addPropBtn.offsetWidth + 'px';

                        missingKeys.forEach(key => {
                            const item = document.createElement('div');
                            item.className = 'property-dropdown-item';
                            item.innerText = key;
                            item.onclick = () => {
                                const newPath = [...path, key];
                                const propSchema = schema.properties[key];
                                const defaultVal = this.getDefaultValue(propSchema);
                                this.setValueAt(newPath, defaultVal);
                            };
                            dropdown.appendChild(item);
                        });

                        col.appendChild(dropdown);

                        const closeDropdown = (ev) => {
                            if (!dropdown.contains(ev.target) && ev.target !== addPropBtn) {
                                dropdown.remove();
                                document.removeEventListener('click', closeDropdown);
                            }
                        };
                        setTimeout(() => document.addEventListener('click', closeDropdown), 0);
                    };
                    col.appendChild(addPropBtn);
                }
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
