/**
 * INITIAL DATA & SCHEMA
 */

const schema = { "type": "object", "properties": { "id": { "type": "number" }, "match_config": { "title": "match_config", "type": "object", "properties": { "player_level_cap": { "type": "number", "default": 25 }, "investment": { "type": "array", "items": { "title": "itemOf_investment", "type": "object", "properties": { "id": { "type": "number" }, "type": { "type": "string" }, "quantity": { "type": "number" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "rewards": { "title": "rewards", "type": "object", "properties": { "win": { "type": "array", "items": { "title": "itemOf_win", "type": "object", "properties": { "id": { "type": "number" }, "type": { "type": "string" }, "quantity": { "type": "number" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "loss": { "type": "array", "items": { "title": "itemOf_loss", "type": "object", "properties": { "id": { "type": "number" }, "type": { "type": "string" }, "quantity": { "type": "number" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "tie": { "type": "array", "items": { "title": "itemOf_tie", "type": "object", "properties": { "id": { "type": "number" }, "type": { "type": "string" }, "quantity": { "type": "number" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } } } }, "matchmaking": { "title": "matchmaking", "type": "object", "properties": { "opponent_buffer": { "type": "number", "default": 2 } } }, "cards_per_match": { "type": "number", "default": 2 } } }, "starts_at": { "type": "string", "format": "date-time" }, "ends_at": { "type": "string", "format": "date-time" }, "sessions": { "type": "array", "items": { "title": "itemOf_sessions", "type": "object", "properties": { "id": { "type": "number" }, "start_time": { "type": "string" }, "end_time": { "type": "string" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "general_info": { "title": "general_info", "type": "object", "properties": { "guidelines_data": { "type": "array", "items": { "title": "itemOf_guidelines_data", "type": "object", "properties": { "title": { "type": "string", "default": "Title" }, "body": { "type": "string", "default": "Description" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "infographics_data": { "type": "array", "items": { "title": "itemOf_infographics_data", "type": "object", "properties": { "url": { "type": "string", "default": "" }, "identifier": { "type": "string", "default": "" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "leaderboard": { "title": "leaderboard", "type": "object", "properties": { "lb_discord_link": { "type": "string", "default": "" }, "rewards": { "title": "rewards", "type": "object", "properties": { "url": { "type": "string", "default": "" }, "identifier": { "type": "string", "default": "" } } } } }, "event_items_info_text": { "type": "string", "default": "" } } }, "event_skus": { "type": "array", "items": { "title": "itemOf_event_skus", "type": "object", "properties": { "id": { "type": "number" }, "name": { "type": "string" }, "rewards": { "type": "array", "items": { "title": "itemOf_rewards", "type": "object", "properties": { "id": { "type": "number" }, "type": { "type": "string" }, "quantity": { "type": "number" }, "rarity": { "type": "string" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "price": { "type": "array", "items": { "title": "itemOf_price", "type": "object", "properties": { "id": { "type": "number" }, "type": { "type": "string" }, "quantity": { "type": "number" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "url": { "type": "string" }, "identifier": { "type": "string" }, "infographic": { "type": "string" }, "max_allowable_buys": { "type": "number" }, "daily_max_allowable_buys": { "type": "number" }, "characters": { "type": "array", "items": { "type": "number" } }, "order": { "type": "number" }, "status": { "type": "number" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" } } } }, "status": { "type": "number" }, "release_version": { "type": "number" }, "_id": { "type": "string", "pattern": "^[0-9a-fA-F]{24}$" }, "__v": { "type": "number" } }, "required": ["id", "starts_at", "ends_at", "release_version"] };

const initialData = { "id": 1, "match_config": { "player_level_cap": 25, "investment": [{ "id": 1, "type": "HardCurrency", "quantity": 0 }], "rewards": { "win": [{ "id": 9, "type": "SoftCurrency", "quantity": 7 }, { "id": 1, "type": "HardCurrency", "quantity": 0 }], "loss": [], "tie": [] }, "matchmaking": { "opponent_buffer": 2 }, "cards_per_match": 2 }, "general_info": { "guidelines_data": [{ "title": "New event: PvP World Cup", "body": "The wait is finally over, we present to you PvP World Cup!! \nPvP World Cup is a brand new limited-time exclusive Multiplayer event. The event would be live only for a duration of 7 days.  \nWe now ensure a level playing field for all our managers and their team. All teams participating in the event would be levels out to level 25, that is the level of players in the team would be buffed or nerfed such that each player in the team is level 25, with the exception fo common players, who are maxxed to level 10. \nNow get ready to use every trick in your book to battle against others in real time!\n\nPS: The buff or nerf on levels will only apply for the PvP World Cup matches.\n" }, { "title": "New power-ups!", "body": "Introducing brand new special power-up cards that you can use in-match to gain advantage over your opponent. These cards give you the extra edge you need and sometimes can even turn the game around. \nBut  it’s a double-edged sword. Using the cards and losing a match means that your cards are won by the opponent and vice versa.  \n\nInstant Special Ability card: Used to fill up your Special Ability mana instantly. \nRecall card: Users can bring back 1 batsman who was previously out, back onto the pitch.\nYou can have upto 2 cards at once with you in the match.\nPS: You shall only win your opponent's card if they use it, lose and you have less than 2 cards.  \n" }, { "title": "How to register for the event?  ", "body": "No registration is required. Any user above Level 6 is eligible for participation! \nThe event registration is completely free of cost!\n\nEvent Timings\nThe event is divided into two sessions in a day-\n\n1st Session: 2pm to 5pm IST\n2nd Session: 8pm to 11pm IST\n\nAll managers who are eligible will be able to play the event" }, { "title": "Playing a PvP World Cup match", "body": "Each PvP World Cup match costs only 5 Hitcoins. Winning a match would reward the team with 10 gems and 7 Hitcoins\n\nHow to play?\n\nManagers will have to make their own lineup in the squad page and then face off against other users in real-time. This effect is only for PvP World Cup matches, the actual players level will not be changed. \nThe match would follow the same PvP format, which includes both batting and bowling, with the use of the Class Advantage system, which will affect your PvP gameplay." }, { "title": "PvP gameplay: Class Advantage", "body": "Users will be matched against other users of similar strength. Both players will be allowed to select their starting batsmen/bowlers before the match starts.\n\nClass Advantage\nThe class advantage system for this mode makes it interesting. Users will have 1 of 3 types of players- Powerful (red), balanced (green), technical (blue). \n\nRed beats Green\nGreen beats Blue\nBlue beats red\n\nDepending on the type, the batsmen might get hindered and there will be no mana filling during a type disadvantage." }], "infographics_data": [{ "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/pvp_wc_slide1_1.png", "identifier": "br_infographics_slide1_1" }, { "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/pvp_wc_slide2.png", "identifier": "br_infographics_slide2_1" }, { "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/pvp_wc_slide3.png", "identifier": "br_infographics_slide3_1" }], "leaderboard": { "lb_discord_link": "", "rewards": { "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/pvp_wc_leaderboard.png", "identifier": "br_leaderboard_rewards_infographics_1" } }, "event_items_info_text": "All items have a purchase limit for the event. \n\nSuper Chest: 18\nTraining Points: 9\nWorld Class Player: 2" }, "event_skus": [{ "id": 1, "name": "Brilliant Player Box", "price": [{ "id": 9, "type": "SoftCurrency", "quantity": 420 }], "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/Battle+Royale/UI+cards/Brill+Card+v2.png", "identifier": "br_brilliant_player_box", "infographic": "You will get any one of the three premium Brilliant players shown in the Box with each purchase!\nBox has a limit of three purchases.", "max_allowable_buys": 3, "characters": [168, 197, 158], "order": 1, "status": 0 }, { "id": 2, "name": "World Class Player", "price": [{ "id": 9, "type": "SoftCurrency", "quantity": 1400 }], "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/pvp_wc_wc2.png", "identifier": "br_wc_player_box_1", "infographic": "You will get any one of three premium WC players shown in the Box with each purchase!\nBox has a limit of two purchases.", "max_allowable_buys": 2, "characters": [155, 196, 156], "order": 3, "status": 1 }, { "id": 3, "name": "Super Chest", "price": [{ "id": 9, "type": "SoftCurrency", "quantity": 25 }], "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/pvp_wc_cstore.png", "identifier": "br_super_chest_1", "infographic": "Open the super chest with the gems.\nCan purchase 18 super chest throughtout the event.", "max_allowable_buys": 18, "order": 1, "status": 1 }, { "id": 4, "name": "Training Points", "rewards": [{ "id": 5, "type": "SoftCurrency", "quantity": 50000, "rarity": "Epic" }], "price": [{ "id": 9, "type": "SoftCurrency", "quantity": 120 }], "url": "https://cdn.octathorpeweb.com/v1/superstars-ipl/pvp_wc_tpstore.png", "identifier": "br_training_points", "infographic": "Exchange your gems to earn Training Points!", "max_allowable_buys": 9, "order": 2, "status": 1 }], "starts_at": "2022-10-24T00:00:00.000", "ends_at": "2022-11-02T00:00:00.000Z", "sessions": [{ "id": 1, "start_time": "14:00:00", "end_time": "17:00:00" }, { "id": 2, "start_time": "20:00:00", "end_time": "23:00:00" }], "status": 1, "release_version": 999 };


/**
 * CORE EDITOR CLASS
 */
class ColumnEditor {
    constructor(containerId, outputId, data, schema) {
        this.container = document.getElementById(containerId);
        this.output = document.getElementById(outputId);
        this.data = data;
        this.rootSchema = schema;

        // Track the path of selected objects: [] -> root, ['metadata'] -> metadata obj
        this.selectionPath = [];
        this.focusedPath = null;
        this.focusedSelection = null;

        this.render();
    }

    // --- Data Helpers ---

    getValueAt(path) {
        return path.reduce((acc, key) => (acc && acc[key] !== undefined) ? acc[key] : undefined, this.data);
    }

    setValueAt(path, value) {
        if (path.length === 0) {
            this.data = value;
        } else {
            const lastKey = path[path.length - 1];
            const parentPath = path.slice(0, -1);
            const parent = this.getValueAt(parentPath);
            parent[lastKey] = value;
        }
        this.render();
    }

    getType(value) {
        if (value === null) return 'null';
        if (Array.isArray(value)) return 'array';
        return typeof value;
    }

    // --- Schema Inference ---

    getSchemaForPath(path) {
        let currentSchema = this.rootSchema;

        for (let key of path) {
            if (!currentSchema) return null;

            // Handle Array items
            if (currentSchema.type === 'array' && !isNaN(key)) {
                currentSchema = currentSchema.items;
                continue;
            }

            // Handle Object properties
            if (currentSchema.properties && currentSchema.properties[key]) {
                currentSchema = currentSchema.properties[key];
                continue;
            }

            // Fallback for generic objects
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

    render() {
        this.container.innerHTML = '';

        // Update Output JSON
        this.output.innerHTML = this.renderJsonHtml(this.data);

        // Render Breadcrumbs
        this.renderBreadcrumbs();

        // Always render root level
        this.renderColumn([], this.data);

        // Render subsequent columns based on selectionPath
        let currentPath = [];
        for (const key of this.selectionPath) {
            currentPath.push(key);
            const value = this.getValueAt(currentPath);

            // Only render next column if value is complex (obj/arr) and exists
            if (value && typeof value === 'object') {
                this.renderColumn([...currentPath], value);
            } else {
                // Path is invalid or leads to primitive, stop rendering deeper
                break;
            }
        }
    }

    renderJsonHtml(data, path = []) {
        // Simple recursive JSON renderer to generate HTML with data-path attributes
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

            // Indentation
            const indent = '  '.repeat(path.length + 1);

            // Key (only for objects)
            const keyHtml = isArray ? '' : `<span class="json-key">"${key}"</span>: `;

            // Value
            const valueHtml = this.renderJsonHtml(value, currentPath);

            html += `<div class="json-line" data-path='${pathStr}'>${indent}${keyHtml}${valueHtml}${comma}</div>`;
        });
        html += `${'  '.repeat(path.length)}${closeChar}`;
        return html;
    }

    renderBreadcrumbs() {
        const breadcrumbsContainer = document.getElementById('breadcrumbs');
        breadcrumbsContainer.innerHTML = '';

        const fullPath = ['ROOT', ...this.selectionPath];

        fullPath.forEach((item, index) => {
            // Separator
            if (index > 0) {
                const sep = document.createElement('span');
                sep.className = 'breadcrumb-separator';
                sep.innerText = '>';
                breadcrumbsContainer.appendChild(sep);
            }

            const el = document.createElement('span');
            el.className = 'breadcrumb-item';
            el.innerText = item;

            if (index === fullPath.length - 1) {
                el.classList.add('active');
            } else {
                el.onclick = () => {
                    // Navigate to this path
                    // If index is 0 (ROOT), path is []
                    // If index is 1, path is [selectionPath[0]]
                    this.selectionPath = this.selectionPath.slice(0, index);
                    this.render();
                };
            }
            breadcrumbsContainer.appendChild(el);
        });
    }

    renderColumn(path, dataContext) {
        const col = document.createElement('div');
        col.className = 'column';

        const header = document.createElement('div');
        header.className = 'column-header';

        // Dynamic Header Logic
        let headerText = 'ROOT';
        if (path.length > 0) {
            const lastKey = path[path.length - 1];
            const schema = this.getSchemaForPath(path);

            if (schema && schema.title) {
                headerText = schema.title;
                // If it's an array item, append index for clarity
                if (!isNaN(lastKey)) {
                    headerText += ` [${lastKey}]`;
                }
            } else {
                // Fallback: use key name
                headerText = String(lastKey).toUpperCase();
                // If it's just a number, try to give context from parent
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

        // If array, use indices. If object, use keys.
        keys.forEach(key => {
            const fullPath = [...path, Array.isArray(dataContext) ? Number(key) : key];
            const value = dataContext[key];
            const valueType = this.getType(value);
            const isComplex = valueType === 'object' || valueType === 'array';

            // Determine schema for this specific field
            const fieldSchema = this.getSchemaForPath(fullPath);

            const row = document.createElement('div');
            row.className = 'row';
            row.setAttribute('data-path', JSON.stringify(fullPath));

            // Sync Highlight: Hover on Row -> Highlight JSON Line
            row.onmouseenter = () => {
                const pathStr = JSON.stringify(fullPath);
                const jsonLine = document.querySelector(`.json-line[data-path='${pathStr}']`);
                if (jsonLine) {
                    jsonLine.classList.add('highlight');
                    jsonLine.scrollIntoView({ behavior: 'smooth', block: 'center' });
                }
            };
            row.onmouseleave = () => {
                const pathStr = JSON.stringify(fullPath);
                const jsonLine = document.querySelector(`.json-line[data-path='${pathStr}']`);
                if (jsonLine) {
                    jsonLine.classList.remove('highlight');
                }
            };

            // Check active state
            const isSelected = this.selectionPath.length > path.length &&
                this.selectionPath[path.length] == key; // strict eq for array indices
            if (isSelected) row.classList.add('active');
            if (!isComplex) row.classList.add('scalar-row');

            // 1. Header Row (Key Name + Type Selector)
            const rowHeader = document.createElement('div');
            rowHeader.className = 'row-header';

            const label = document.createElement('span');
            label.className = 'key-label';
            label.innerText = key;

            // Type Switcher Logic
            const allowedTypes = this.getAvailableTypes(fieldSchema);
            const typeBadge = document.createElement('select');
            typeBadge.className = 'type-badge';

            // Icon Map
            const typeIcons = {
                'string': 'abc',
                'number': '#',
                'boolean': '?',
                'object': '{}',
                'array': '[]',
                'null': '∅'
            };

            // Apply color class based on current type
            typeBadge.classList.add(`type-${valueType}`);

            allowedTypes.forEach(t => {
                const opt = document.createElement('option');
                opt.value = t;
                opt.innerText = typeIcons[t] || t; // Use icon if available
                if (t === valueType) opt.selected = true;
                typeBadge.appendChild(opt);
            });

            // Handle Type Change
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

            rowHeader.appendChild(label);

            // Only show type selector if strictly multiple types or generic
            if (allowedTypes.length > 1 || !fieldSchema) {
                rowHeader.appendChild(typeBadge);
            } else {
                const staticBadge = document.createElement('span');
                staticBadge.className = `type-badge type-${valueType}`;
                staticBadge.innerText = typeIcons[valueType] || valueType;
                rowHeader.appendChild(staticBadge);
            }

            row.appendChild(rowHeader);

            // 2. Input Area
            if (!isComplex) {
                const inputWrapper = document.createElement('div');
                inputWrapper.className = 'input-wrapper';

                if (valueType === 'boolean') {
                    const cb = document.createElement('input');
                    cb.type = 'checkbox';
                    cb.checked = value;
                    cb.onchange = (e) => this.setValueAt(fullPath, e.target.checked);
                    cb.style.width = "20px";
                    // Remove bottom border for checkbox
                    cb.style.borderBottom = "none";
                    inputWrapper.appendChild(cb);
                } else if (fieldSchema && fieldSchema.enum) {
                    const sel = document.createElement('select');
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
                    const input = document.createElement('input');
                    input.type = valueType === 'number' ? 'number' : 'text';
                    input.value = value;

                    // Restore focus if this was the element being edited
                    if (this.focusedPath && JSON.stringify(this.focusedPath) === JSON.stringify(fullPath)) {
                        setTimeout(() => {
                            input.focus();
                            if (this.focusedSelection && input.type === 'text') {
                                input.setSelectionRange(this.focusedSelection.start, this.focusedSelection.end);
                            }
                        }, 0);
                    }

                    input.oninput = (e) => {
                        this.focusedPath = fullPath;
                        if (input.type === 'text') {
                            this.focusedSelection = { start: e.target.selectionStart, end: e.target.selectionEnd };
                        }
                        const val = valueType === 'number' ? parseFloat(e.target.value) : e.target.value;
                        this.setValueAt(fullPath, val);
                    };
                    inputWrapper.appendChild(input);
                }
                row.appendChild(inputWrapper);
            } else {
                // It's complex, add arrow indicator
                const arrow = document.createElement('span');
                arrow.className = 'arrow';
                arrow.innerText = '▶';
                rowHeader.appendChild(arrow);
            }

            // Click Handling for Drill-down
            row.onclick = (e) => {
                // Don't drill down if clicking inputs directly
                if (e.target.tagName === 'INPUT' || e.target.tagName === 'SELECT') return;

                // Update path
                // We slice the current selection path to the depth of this column
                // This handles "switching siblings" correctly
                const newPath = this.selectionPath.slice(0, path.length);
                newPath.push(Array.isArray(dataContext) ? Number(key) : key);

                this.selectionPath = newPath;
                this.render();
            };

            col.appendChild(row);
        });

        // Add "Add Property" button for Objects or Arrays
        // (Simplified for this demo: supports Arrays)
        if (Array.isArray(dataContext)) {
            const addBtn = document.createElement('button');
            addBtn.innerText = "+ Add Item";
            addBtn.style.margin = "10px";
            addBtn.onclick = () => {
                // Default to string, logic could be smarter based on schema items
                const newPath = [...path, dataContext.length];
                this.setValueAt(newPath, "");
            };
            col.appendChild(addBtn);
        }

        this.container.appendChild(col);

        // Scroll to right most column
        this.container.scrollLeft = this.container.scrollWidth;
    }
}

// --- Init ---
const editor = new ColumnEditor('editor-container', 'output-pane', initialData, schema);

// Sync Highlight: Hover on JSON Line -> Highlight Miller Row
document.getElementById('output-pane').addEventListener('mouseover', (e) => {
    const line = e.target.closest('.json-line');
    if (line) {
        const pathStr = line.getAttribute('data-path');
        const row = document.querySelector(`.row[data-path='${pathStr}']`);
        if (row) {
            row.style.backgroundColor = 'rgba(255, 255, 0, 0.2)'; // Temporary highlight
        }
    }
});

document.getElementById('output-pane').addEventListener('mouseout', (e) => {
    const line = e.target.closest('.json-line');
    if (line) {
        const pathStr = line.getAttribute('data-path');
        const row = document.querySelector(`.row[data-path='${pathStr}']`);
        if (row) {
            row.style.backgroundColor = ''; // Remove temporary highlight
        }
    }
});


function copyJson() {
    navigator.clipboard.writeText(JSON.stringify(editor.data, null, 2));
    alert("JSON copied to clipboard");
}

// Theme Toggle Logic
const themeBtn = document.getElementById('theme-btn');
let isDark = true;

// Check system preference
if (window.matchMedia && window.matchMedia('(prefers-color-scheme: light)').matches) {
    isDark = false;
}
updateTheme();

function toggleTheme() {
    isDark = !isDark;
    updateTheme();
}

function updateTheme() {
    if (isDark) {
        document.documentElement.setAttribute('data-theme', 'dark');
        themeBtn.innerText = '🌙 Dark Mode';
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
        themeBtn.innerText = '☀️ Light Mode';
    }
}

// Toggle Code View Logic
function toggleCodeView() {
    const outputPane = document.getElementById('output-pane');
    const btn = document.getElementById('toggle-code-btn');
    outputPane.classList.toggle('collapsed');

    if (outputPane.classList.contains('collapsed')) {
        btn.innerText = 'Show Code';
    } else {
        btn.innerText = 'Hide Code';
    }
}
