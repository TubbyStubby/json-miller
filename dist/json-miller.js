(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
	typeof define === 'function' && define.amd ? define(['exports'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.JsonMiller = {}));
})(this, (function (exports) { 'use strict';

	function getDefaultExportFromCjs (x) {
		return x && x.__esModule && Object.prototype.hasOwnProperty.call(x, 'default') ? x['default'] : x;
	}

	var ajv = {exports: {}};

	var core$1 = {};

	var validate = {};

	var boolSchema = {};

	var errors = {};

	var codegen = {};

	var code$1 = {};

	var hasRequiredCode$1;

	function requireCode$1 () {
		if (hasRequiredCode$1) return code$1;
		hasRequiredCode$1 = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.regexpCode = exports$1.getEsmExportName = exports$1.getProperty = exports$1.safeStringify = exports$1.stringify = exports$1.strConcat = exports$1.addCodeArg = exports$1.str = exports$1._ = exports$1.nil = exports$1._Code = exports$1.Name = exports$1.IDENTIFIER = exports$1._CodeOrName = void 0;
			// eslint-disable-next-line @typescript-eslint/no-extraneous-class
			class _CodeOrName {
			}
			exports$1._CodeOrName = _CodeOrName;
			exports$1.IDENTIFIER = /^[a-z$_][a-z$_0-9]*$/i;
			class Name extends _CodeOrName {
			    constructor(s) {
			        super();
			        if (!exports$1.IDENTIFIER.test(s))
			            throw new Error("CodeGen: name must be a valid identifier");
			        this.str = s;
			    }
			    toString() {
			        return this.str;
			    }
			    emptyStr() {
			        return false;
			    }
			    get names() {
			        return { [this.str]: 1 };
			    }
			}
			exports$1.Name = Name;
			class _Code extends _CodeOrName {
			    constructor(code) {
			        super();
			        this._items = typeof code === "string" ? [code] : code;
			    }
			    toString() {
			        return this.str;
			    }
			    emptyStr() {
			        if (this._items.length > 1)
			            return false;
			        const item = this._items[0];
			        return item === "" || item === '""';
			    }
			    get str() {
			        var _a;
			        return ((_a = this._str) !== null && _a !== void 0 ? _a : (this._str = this._items.reduce((s, c) => `${s}${c}`, "")));
			    }
			    get names() {
			        var _a;
			        return ((_a = this._names) !== null && _a !== void 0 ? _a : (this._names = this._items.reduce((names, c) => {
			            if (c instanceof Name)
			                names[c.str] = (names[c.str] || 0) + 1;
			            return names;
			        }, {})));
			    }
			}
			exports$1._Code = _Code;
			exports$1.nil = new _Code("");
			function _(strs, ...args) {
			    const code = [strs[0]];
			    let i = 0;
			    while (i < args.length) {
			        addCodeArg(code, args[i]);
			        code.push(strs[++i]);
			    }
			    return new _Code(code);
			}
			exports$1._ = _;
			const plus = new _Code("+");
			function str(strs, ...args) {
			    const expr = [safeStringify(strs[0])];
			    let i = 0;
			    while (i < args.length) {
			        expr.push(plus);
			        addCodeArg(expr, args[i]);
			        expr.push(plus, safeStringify(strs[++i]));
			    }
			    optimize(expr);
			    return new _Code(expr);
			}
			exports$1.str = str;
			function addCodeArg(code, arg) {
			    if (arg instanceof _Code)
			        code.push(...arg._items);
			    else if (arg instanceof Name)
			        code.push(arg);
			    else
			        code.push(interpolate(arg));
			}
			exports$1.addCodeArg = addCodeArg;
			function optimize(expr) {
			    let i = 1;
			    while (i < expr.length - 1) {
			        if (expr[i] === plus) {
			            const res = mergeExprItems(expr[i - 1], expr[i + 1]);
			            if (res !== undefined) {
			                expr.splice(i - 1, 3, res);
			                continue;
			            }
			            expr[i++] = "+";
			        }
			        i++;
			    }
			}
			function mergeExprItems(a, b) {
			    if (b === '""')
			        return a;
			    if (a === '""')
			        return b;
			    if (typeof a == "string") {
			        if (b instanceof Name || a[a.length - 1] !== '"')
			            return;
			        if (typeof b != "string")
			            return `${a.slice(0, -1)}${b}"`;
			        if (b[0] === '"')
			            return a.slice(0, -1) + b.slice(1);
			        return;
			    }
			    if (typeof b == "string" && b[0] === '"' && !(a instanceof Name))
			        return `"${a}${b.slice(1)}`;
			    return;
			}
			function strConcat(c1, c2) {
			    return c2.emptyStr() ? c1 : c1.emptyStr() ? c2 : str `${c1}${c2}`;
			}
			exports$1.strConcat = strConcat;
			// TODO do not allow arrays here
			function interpolate(x) {
			    return typeof x == "number" || typeof x == "boolean" || x === null
			        ? x
			        : safeStringify(Array.isArray(x) ? x.join(",") : x);
			}
			function stringify(x) {
			    return new _Code(safeStringify(x));
			}
			exports$1.stringify = stringify;
			function safeStringify(x) {
			    return JSON.stringify(x)
			        .replace(/\u2028/g, "\\u2028")
			        .replace(/\u2029/g, "\\u2029");
			}
			exports$1.safeStringify = safeStringify;
			function getProperty(key) {
			    return typeof key == "string" && exports$1.IDENTIFIER.test(key) ? new _Code(`.${key}`) : _ `[${key}]`;
			}
			exports$1.getProperty = getProperty;
			//Does best effort to format the name properly
			function getEsmExportName(key) {
			    if (typeof key == "string" && exports$1.IDENTIFIER.test(key)) {
			        return new _Code(`${key}`);
			    }
			    throw new Error(`CodeGen: invalid export name: ${key}, use explicit $id name mapping`);
			}
			exports$1.getEsmExportName = getEsmExportName;
			function regexpCode(rx) {
			    return new _Code(rx.toString());
			}
			exports$1.regexpCode = regexpCode;
			
		} (code$1));
		return code$1;
	}

	var scope = {};

	var hasRequiredScope;

	function requireScope () {
		if (hasRequiredScope) return scope;
		hasRequiredScope = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.ValueScope = exports$1.ValueScopeName = exports$1.Scope = exports$1.varKinds = exports$1.UsedValueState = void 0;
			const code_1 = requireCode$1();
			class ValueError extends Error {
			    constructor(name) {
			        super(`CodeGen: "code" for ${name} not defined`);
			        this.value = name.value;
			    }
			}
			var UsedValueState;
			(function (UsedValueState) {
			    UsedValueState[UsedValueState["Started"] = 0] = "Started";
			    UsedValueState[UsedValueState["Completed"] = 1] = "Completed";
			})(UsedValueState || (exports$1.UsedValueState = UsedValueState = {}));
			exports$1.varKinds = {
			    const: new code_1.Name("const"),
			    let: new code_1.Name("let"),
			    var: new code_1.Name("var"),
			};
			class Scope {
			    constructor({ prefixes, parent } = {}) {
			        this._names = {};
			        this._prefixes = prefixes;
			        this._parent = parent;
			    }
			    toName(nameOrPrefix) {
			        return nameOrPrefix instanceof code_1.Name ? nameOrPrefix : this.name(nameOrPrefix);
			    }
			    name(prefix) {
			        return new code_1.Name(this._newName(prefix));
			    }
			    _newName(prefix) {
			        const ng = this._names[prefix] || this._nameGroup(prefix);
			        return `${prefix}${ng.index++}`;
			    }
			    _nameGroup(prefix) {
			        var _a, _b;
			        if (((_b = (_a = this._parent) === null || _a === void 0 ? void 0 : _a._prefixes) === null || _b === void 0 ? void 0 : _b.has(prefix)) || (this._prefixes && !this._prefixes.has(prefix))) {
			            throw new Error(`CodeGen: prefix "${prefix}" is not allowed in this scope`);
			        }
			        return (this._names[prefix] = { prefix, index: 0 });
			    }
			}
			exports$1.Scope = Scope;
			class ValueScopeName extends code_1.Name {
			    constructor(prefix, nameStr) {
			        super(nameStr);
			        this.prefix = prefix;
			    }
			    setValue(value, { property, itemIndex }) {
			        this.value = value;
			        this.scopePath = (0, code_1._) `.${new code_1.Name(property)}[${itemIndex}]`;
			    }
			}
			exports$1.ValueScopeName = ValueScopeName;
			const line = (0, code_1._) `\n`;
			class ValueScope extends Scope {
			    constructor(opts) {
			        super(opts);
			        this._values = {};
			        this._scope = opts.scope;
			        this.opts = { ...opts, _n: opts.lines ? line : code_1.nil };
			    }
			    get() {
			        return this._scope;
			    }
			    name(prefix) {
			        return new ValueScopeName(prefix, this._newName(prefix));
			    }
			    value(nameOrPrefix, value) {
			        var _a;
			        if (value.ref === undefined)
			            throw new Error("CodeGen: ref must be passed in value");
			        const name = this.toName(nameOrPrefix);
			        const { prefix } = name;
			        const valueKey = (_a = value.key) !== null && _a !== void 0 ? _a : value.ref;
			        let vs = this._values[prefix];
			        if (vs) {
			            const _name = vs.get(valueKey);
			            if (_name)
			                return _name;
			        }
			        else {
			            vs = this._values[prefix] = new Map();
			        }
			        vs.set(valueKey, name);
			        const s = this._scope[prefix] || (this._scope[prefix] = []);
			        const itemIndex = s.length;
			        s[itemIndex] = value.ref;
			        name.setValue(value, { property: prefix, itemIndex });
			        return name;
			    }
			    getValue(prefix, keyOrRef) {
			        const vs = this._values[prefix];
			        if (!vs)
			            return;
			        return vs.get(keyOrRef);
			    }
			    scopeRefs(scopeName, values = this._values) {
			        return this._reduceValues(values, (name) => {
			            if (name.scopePath === undefined)
			                throw new Error(`CodeGen: name "${name}" has no value`);
			            return (0, code_1._) `${scopeName}${name.scopePath}`;
			        });
			    }
			    scopeCode(values = this._values, usedValues, getCode) {
			        return this._reduceValues(values, (name) => {
			            if (name.value === undefined)
			                throw new Error(`CodeGen: name "${name}" has no value`);
			            return name.value.code;
			        }, usedValues, getCode);
			    }
			    _reduceValues(values, valueCode, usedValues = {}, getCode) {
			        let code = code_1.nil;
			        for (const prefix in values) {
			            const vs = values[prefix];
			            if (!vs)
			                continue;
			            const nameSet = (usedValues[prefix] = usedValues[prefix] || new Map());
			            vs.forEach((name) => {
			                if (nameSet.has(name))
			                    return;
			                nameSet.set(name, UsedValueState.Started);
			                let c = valueCode(name);
			                if (c) {
			                    const def = this.opts.es5 ? exports$1.varKinds.var : exports$1.varKinds.const;
			                    code = (0, code_1._) `${code}${def} ${name} = ${c};${this.opts._n}`;
			                }
			                else if ((c = getCode === null || getCode === void 0 ? void 0 : getCode(name))) {
			                    code = (0, code_1._) `${code}${c}${this.opts._n}`;
			                }
			                else {
			                    throw new ValueError(name);
			                }
			                nameSet.set(name, UsedValueState.Completed);
			            });
			        }
			        return code;
			    }
			}
			exports$1.ValueScope = ValueScope;
			
		} (scope));
		return scope;
	}

	var hasRequiredCodegen;

	function requireCodegen () {
		if (hasRequiredCodegen) return codegen;
		hasRequiredCodegen = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.or = exports$1.and = exports$1.not = exports$1.CodeGen = exports$1.operators = exports$1.varKinds = exports$1.ValueScopeName = exports$1.ValueScope = exports$1.Scope = exports$1.Name = exports$1.regexpCode = exports$1.stringify = exports$1.getProperty = exports$1.nil = exports$1.strConcat = exports$1.str = exports$1._ = void 0;
			const code_1 = requireCode$1();
			const scope_1 = requireScope();
			var code_2 = requireCode$1();
			Object.defineProperty(exports$1, "_", { enumerable: true, get: function () { return code_2._; } });
			Object.defineProperty(exports$1, "str", { enumerable: true, get: function () { return code_2.str; } });
			Object.defineProperty(exports$1, "strConcat", { enumerable: true, get: function () { return code_2.strConcat; } });
			Object.defineProperty(exports$1, "nil", { enumerable: true, get: function () { return code_2.nil; } });
			Object.defineProperty(exports$1, "getProperty", { enumerable: true, get: function () { return code_2.getProperty; } });
			Object.defineProperty(exports$1, "stringify", { enumerable: true, get: function () { return code_2.stringify; } });
			Object.defineProperty(exports$1, "regexpCode", { enumerable: true, get: function () { return code_2.regexpCode; } });
			Object.defineProperty(exports$1, "Name", { enumerable: true, get: function () { return code_2.Name; } });
			var scope_2 = requireScope();
			Object.defineProperty(exports$1, "Scope", { enumerable: true, get: function () { return scope_2.Scope; } });
			Object.defineProperty(exports$1, "ValueScope", { enumerable: true, get: function () { return scope_2.ValueScope; } });
			Object.defineProperty(exports$1, "ValueScopeName", { enumerable: true, get: function () { return scope_2.ValueScopeName; } });
			Object.defineProperty(exports$1, "varKinds", { enumerable: true, get: function () { return scope_2.varKinds; } });
			exports$1.operators = {
			    GT: new code_1._Code(">"),
			    GTE: new code_1._Code(">="),
			    LT: new code_1._Code("<"),
			    LTE: new code_1._Code("<="),
			    EQ: new code_1._Code("==="),
			    NEQ: new code_1._Code("!=="),
			    NOT: new code_1._Code("!"),
			    OR: new code_1._Code("||"),
			    AND: new code_1._Code("&&"),
			    ADD: new code_1._Code("+"),
			};
			class Node {
			    optimizeNodes() {
			        return this;
			    }
			    optimizeNames(_names, _constants) {
			        return this;
			    }
			}
			class Def extends Node {
			    constructor(varKind, name, rhs) {
			        super();
			        this.varKind = varKind;
			        this.name = name;
			        this.rhs = rhs;
			    }
			    render({ es5, _n }) {
			        const varKind = es5 ? scope_1.varKinds.var : this.varKind;
			        const rhs = this.rhs === undefined ? "" : ` = ${this.rhs}`;
			        return `${varKind} ${this.name}${rhs};` + _n;
			    }
			    optimizeNames(names, constants) {
			        if (!names[this.name.str])
			            return;
			        if (this.rhs)
			            this.rhs = optimizeExpr(this.rhs, names, constants);
			        return this;
			    }
			    get names() {
			        return this.rhs instanceof code_1._CodeOrName ? this.rhs.names : {};
			    }
			}
			class Assign extends Node {
			    constructor(lhs, rhs, sideEffects) {
			        super();
			        this.lhs = lhs;
			        this.rhs = rhs;
			        this.sideEffects = sideEffects;
			    }
			    render({ _n }) {
			        return `${this.lhs} = ${this.rhs};` + _n;
			    }
			    optimizeNames(names, constants) {
			        if (this.lhs instanceof code_1.Name && !names[this.lhs.str] && !this.sideEffects)
			            return;
			        this.rhs = optimizeExpr(this.rhs, names, constants);
			        return this;
			    }
			    get names() {
			        const names = this.lhs instanceof code_1.Name ? {} : { ...this.lhs.names };
			        return addExprNames(names, this.rhs);
			    }
			}
			class AssignOp extends Assign {
			    constructor(lhs, op, rhs, sideEffects) {
			        super(lhs, rhs, sideEffects);
			        this.op = op;
			    }
			    render({ _n }) {
			        return `${this.lhs} ${this.op}= ${this.rhs};` + _n;
			    }
			}
			class Label extends Node {
			    constructor(label) {
			        super();
			        this.label = label;
			        this.names = {};
			    }
			    render({ _n }) {
			        return `${this.label}:` + _n;
			    }
			}
			class Break extends Node {
			    constructor(label) {
			        super();
			        this.label = label;
			        this.names = {};
			    }
			    render({ _n }) {
			        const label = this.label ? ` ${this.label}` : "";
			        return `break${label};` + _n;
			    }
			}
			class Throw extends Node {
			    constructor(error) {
			        super();
			        this.error = error;
			    }
			    render({ _n }) {
			        return `throw ${this.error};` + _n;
			    }
			    get names() {
			        return this.error.names;
			    }
			}
			class AnyCode extends Node {
			    constructor(code) {
			        super();
			        this.code = code;
			    }
			    render({ _n }) {
			        return `${this.code};` + _n;
			    }
			    optimizeNodes() {
			        return `${this.code}` ? this : undefined;
			    }
			    optimizeNames(names, constants) {
			        this.code = optimizeExpr(this.code, names, constants);
			        return this;
			    }
			    get names() {
			        return this.code instanceof code_1._CodeOrName ? this.code.names : {};
			    }
			}
			class ParentNode extends Node {
			    constructor(nodes = []) {
			        super();
			        this.nodes = nodes;
			    }
			    render(opts) {
			        return this.nodes.reduce((code, n) => code + n.render(opts), "");
			    }
			    optimizeNodes() {
			        const { nodes } = this;
			        let i = nodes.length;
			        while (i--) {
			            const n = nodes[i].optimizeNodes();
			            if (Array.isArray(n))
			                nodes.splice(i, 1, ...n);
			            else if (n)
			                nodes[i] = n;
			            else
			                nodes.splice(i, 1);
			        }
			        return nodes.length > 0 ? this : undefined;
			    }
			    optimizeNames(names, constants) {
			        const { nodes } = this;
			        let i = nodes.length;
			        while (i--) {
			            // iterating backwards improves 1-pass optimization
			            const n = nodes[i];
			            if (n.optimizeNames(names, constants))
			                continue;
			            subtractNames(names, n.names);
			            nodes.splice(i, 1);
			        }
			        return nodes.length > 0 ? this : undefined;
			    }
			    get names() {
			        return this.nodes.reduce((names, n) => addNames(names, n.names), {});
			    }
			}
			class BlockNode extends ParentNode {
			    render(opts) {
			        return "{" + opts._n + super.render(opts) + "}" + opts._n;
			    }
			}
			class Root extends ParentNode {
			}
			class Else extends BlockNode {
			}
			Else.kind = "else";
			class If extends BlockNode {
			    constructor(condition, nodes) {
			        super(nodes);
			        this.condition = condition;
			    }
			    render(opts) {
			        let code = `if(${this.condition})` + super.render(opts);
			        if (this.else)
			            code += "else " + this.else.render(opts);
			        return code;
			    }
			    optimizeNodes() {
			        super.optimizeNodes();
			        const cond = this.condition;
			        if (cond === true)
			            return this.nodes; // else is ignored here
			        let e = this.else;
			        if (e) {
			            const ns = e.optimizeNodes();
			            e = this.else = Array.isArray(ns) ? new Else(ns) : ns;
			        }
			        if (e) {
			            if (cond === false)
			                return e instanceof If ? e : e.nodes;
			            if (this.nodes.length)
			                return this;
			            return new If(not(cond), e instanceof If ? [e] : e.nodes);
			        }
			        if (cond === false || !this.nodes.length)
			            return undefined;
			        return this;
			    }
			    optimizeNames(names, constants) {
			        var _a;
			        this.else = (_a = this.else) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
			        if (!(super.optimizeNames(names, constants) || this.else))
			            return;
			        this.condition = optimizeExpr(this.condition, names, constants);
			        return this;
			    }
			    get names() {
			        const names = super.names;
			        addExprNames(names, this.condition);
			        if (this.else)
			            addNames(names, this.else.names);
			        return names;
			    }
			}
			If.kind = "if";
			class For extends BlockNode {
			}
			For.kind = "for";
			class ForLoop extends For {
			    constructor(iteration) {
			        super();
			        this.iteration = iteration;
			    }
			    render(opts) {
			        return `for(${this.iteration})` + super.render(opts);
			    }
			    optimizeNames(names, constants) {
			        if (!super.optimizeNames(names, constants))
			            return;
			        this.iteration = optimizeExpr(this.iteration, names, constants);
			        return this;
			    }
			    get names() {
			        return addNames(super.names, this.iteration.names);
			    }
			}
			class ForRange extends For {
			    constructor(varKind, name, from, to) {
			        super();
			        this.varKind = varKind;
			        this.name = name;
			        this.from = from;
			        this.to = to;
			    }
			    render(opts) {
			        const varKind = opts.es5 ? scope_1.varKinds.var : this.varKind;
			        const { name, from, to } = this;
			        return `for(${varKind} ${name}=${from}; ${name}<${to}; ${name}++)` + super.render(opts);
			    }
			    get names() {
			        const names = addExprNames(super.names, this.from);
			        return addExprNames(names, this.to);
			    }
			}
			class ForIter extends For {
			    constructor(loop, varKind, name, iterable) {
			        super();
			        this.loop = loop;
			        this.varKind = varKind;
			        this.name = name;
			        this.iterable = iterable;
			    }
			    render(opts) {
			        return `for(${this.varKind} ${this.name} ${this.loop} ${this.iterable})` + super.render(opts);
			    }
			    optimizeNames(names, constants) {
			        if (!super.optimizeNames(names, constants))
			            return;
			        this.iterable = optimizeExpr(this.iterable, names, constants);
			        return this;
			    }
			    get names() {
			        return addNames(super.names, this.iterable.names);
			    }
			}
			class Func extends BlockNode {
			    constructor(name, args, async) {
			        super();
			        this.name = name;
			        this.args = args;
			        this.async = async;
			    }
			    render(opts) {
			        const _async = this.async ? "async " : "";
			        return `${_async}function ${this.name}(${this.args})` + super.render(opts);
			    }
			}
			Func.kind = "func";
			class Return extends ParentNode {
			    render(opts) {
			        return "return " + super.render(opts);
			    }
			}
			Return.kind = "return";
			class Try extends BlockNode {
			    render(opts) {
			        let code = "try" + super.render(opts);
			        if (this.catch)
			            code += this.catch.render(opts);
			        if (this.finally)
			            code += this.finally.render(opts);
			        return code;
			    }
			    optimizeNodes() {
			        var _a, _b;
			        super.optimizeNodes();
			        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNodes();
			        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNodes();
			        return this;
			    }
			    optimizeNames(names, constants) {
			        var _a, _b;
			        super.optimizeNames(names, constants);
			        (_a = this.catch) === null || _a === void 0 ? void 0 : _a.optimizeNames(names, constants);
			        (_b = this.finally) === null || _b === void 0 ? void 0 : _b.optimizeNames(names, constants);
			        return this;
			    }
			    get names() {
			        const names = super.names;
			        if (this.catch)
			            addNames(names, this.catch.names);
			        if (this.finally)
			            addNames(names, this.finally.names);
			        return names;
			    }
			}
			class Catch extends BlockNode {
			    constructor(error) {
			        super();
			        this.error = error;
			    }
			    render(opts) {
			        return `catch(${this.error})` + super.render(opts);
			    }
			}
			Catch.kind = "catch";
			class Finally extends BlockNode {
			    render(opts) {
			        return "finally" + super.render(opts);
			    }
			}
			Finally.kind = "finally";
			class CodeGen {
			    constructor(extScope, opts = {}) {
			        this._values = {};
			        this._blockStarts = [];
			        this._constants = {};
			        this.opts = { ...opts, _n: opts.lines ? "\n" : "" };
			        this._extScope = extScope;
			        this._scope = new scope_1.Scope({ parent: extScope });
			        this._nodes = [new Root()];
			    }
			    toString() {
			        return this._root.render(this.opts);
			    }
			    // returns unique name in the internal scope
			    name(prefix) {
			        return this._scope.name(prefix);
			    }
			    // reserves unique name in the external scope
			    scopeName(prefix) {
			        return this._extScope.name(prefix);
			    }
			    // reserves unique name in the external scope and assigns value to it
			    scopeValue(prefixOrName, value) {
			        const name = this._extScope.value(prefixOrName, value);
			        const vs = this._values[name.prefix] || (this._values[name.prefix] = new Set());
			        vs.add(name);
			        return name;
			    }
			    getScopeValue(prefix, keyOrRef) {
			        return this._extScope.getValue(prefix, keyOrRef);
			    }
			    // return code that assigns values in the external scope to the names that are used internally
			    // (same names that were returned by gen.scopeName or gen.scopeValue)
			    scopeRefs(scopeName) {
			        return this._extScope.scopeRefs(scopeName, this._values);
			    }
			    scopeCode() {
			        return this._extScope.scopeCode(this._values);
			    }
			    _def(varKind, nameOrPrefix, rhs, constant) {
			        const name = this._scope.toName(nameOrPrefix);
			        if (rhs !== undefined && constant)
			            this._constants[name.str] = rhs;
			        this._leafNode(new Def(varKind, name, rhs));
			        return name;
			    }
			    // `const` declaration (`var` in es5 mode)
			    const(nameOrPrefix, rhs, _constant) {
			        return this._def(scope_1.varKinds.const, nameOrPrefix, rhs, _constant);
			    }
			    // `let` declaration with optional assignment (`var` in es5 mode)
			    let(nameOrPrefix, rhs, _constant) {
			        return this._def(scope_1.varKinds.let, nameOrPrefix, rhs, _constant);
			    }
			    // `var` declaration with optional assignment
			    var(nameOrPrefix, rhs, _constant) {
			        return this._def(scope_1.varKinds.var, nameOrPrefix, rhs, _constant);
			    }
			    // assignment code
			    assign(lhs, rhs, sideEffects) {
			        return this._leafNode(new Assign(lhs, rhs, sideEffects));
			    }
			    // `+=` code
			    add(lhs, rhs) {
			        return this._leafNode(new AssignOp(lhs, exports$1.operators.ADD, rhs));
			    }
			    // appends passed SafeExpr to code or executes Block
			    code(c) {
			        if (typeof c == "function")
			            c();
			        else if (c !== code_1.nil)
			            this._leafNode(new AnyCode(c));
			        return this;
			    }
			    // returns code for object literal for the passed argument list of key-value pairs
			    object(...keyValues) {
			        const code = ["{"];
			        for (const [key, value] of keyValues) {
			            if (code.length > 1)
			                code.push(",");
			            code.push(key);
			            if (key !== value || this.opts.es5) {
			                code.push(":");
			                (0, code_1.addCodeArg)(code, value);
			            }
			        }
			        code.push("}");
			        return new code_1._Code(code);
			    }
			    // `if` clause (or statement if `thenBody` and, optionally, `elseBody` are passed)
			    if(condition, thenBody, elseBody) {
			        this._blockNode(new If(condition));
			        if (thenBody && elseBody) {
			            this.code(thenBody).else().code(elseBody).endIf();
			        }
			        else if (thenBody) {
			            this.code(thenBody).endIf();
			        }
			        else if (elseBody) {
			            throw new Error('CodeGen: "else" body without "then" body');
			        }
			        return this;
			    }
			    // `else if` clause - invalid without `if` or after `else` clauses
			    elseIf(condition) {
			        return this._elseNode(new If(condition));
			    }
			    // `else` clause - only valid after `if` or `else if` clauses
			    else() {
			        return this._elseNode(new Else());
			    }
			    // end `if` statement (needed if gen.if was used only with condition)
			    endIf() {
			        return this._endBlockNode(If, Else);
			    }
			    _for(node, forBody) {
			        this._blockNode(node);
			        if (forBody)
			            this.code(forBody).endFor();
			        return this;
			    }
			    // a generic `for` clause (or statement if `forBody` is passed)
			    for(iteration, forBody) {
			        return this._for(new ForLoop(iteration), forBody);
			    }
			    // `for` statement for a range of values
			    forRange(nameOrPrefix, from, to, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.let) {
			        const name = this._scope.toName(nameOrPrefix);
			        return this._for(new ForRange(varKind, name, from, to), () => forBody(name));
			    }
			    // `for-of` statement (in es5 mode replace with a normal for loop)
			    forOf(nameOrPrefix, iterable, forBody, varKind = scope_1.varKinds.const) {
			        const name = this._scope.toName(nameOrPrefix);
			        if (this.opts.es5) {
			            const arr = iterable instanceof code_1.Name ? iterable : this.var("_arr", iterable);
			            return this.forRange("_i", 0, (0, code_1._) `${arr}.length`, (i) => {
			                this.var(name, (0, code_1._) `${arr}[${i}]`);
			                forBody(name);
			            });
			        }
			        return this._for(new ForIter("of", varKind, name, iterable), () => forBody(name));
			    }
			    // `for-in` statement.
			    // With option `ownProperties` replaced with a `for-of` loop for object keys
			    forIn(nameOrPrefix, obj, forBody, varKind = this.opts.es5 ? scope_1.varKinds.var : scope_1.varKinds.const) {
			        if (this.opts.ownProperties) {
			            return this.forOf(nameOrPrefix, (0, code_1._) `Object.keys(${obj})`, forBody);
			        }
			        const name = this._scope.toName(nameOrPrefix);
			        return this._for(new ForIter("in", varKind, name, obj), () => forBody(name));
			    }
			    // end `for` loop
			    endFor() {
			        return this._endBlockNode(For);
			    }
			    // `label` statement
			    label(label) {
			        return this._leafNode(new Label(label));
			    }
			    // `break` statement
			    break(label) {
			        return this._leafNode(new Break(label));
			    }
			    // `return` statement
			    return(value) {
			        const node = new Return();
			        this._blockNode(node);
			        this.code(value);
			        if (node.nodes.length !== 1)
			            throw new Error('CodeGen: "return" should have one node');
			        return this._endBlockNode(Return);
			    }
			    // `try` statement
			    try(tryBody, catchCode, finallyCode) {
			        if (!catchCode && !finallyCode)
			            throw new Error('CodeGen: "try" without "catch" and "finally"');
			        const node = new Try();
			        this._blockNode(node);
			        this.code(tryBody);
			        if (catchCode) {
			            const error = this.name("e");
			            this._currNode = node.catch = new Catch(error);
			            catchCode(error);
			        }
			        if (finallyCode) {
			            this._currNode = node.finally = new Finally();
			            this.code(finallyCode);
			        }
			        return this._endBlockNode(Catch, Finally);
			    }
			    // `throw` statement
			    throw(error) {
			        return this._leafNode(new Throw(error));
			    }
			    // start self-balancing block
			    block(body, nodeCount) {
			        this._blockStarts.push(this._nodes.length);
			        if (body)
			            this.code(body).endBlock(nodeCount);
			        return this;
			    }
			    // end the current self-balancing block
			    endBlock(nodeCount) {
			        const len = this._blockStarts.pop();
			        if (len === undefined)
			            throw new Error("CodeGen: not in self-balancing block");
			        const toClose = this._nodes.length - len;
			        if (toClose < 0 || (nodeCount !== undefined && toClose !== nodeCount)) {
			            throw new Error(`CodeGen: wrong number of nodes: ${toClose} vs ${nodeCount} expected`);
			        }
			        this._nodes.length = len;
			        return this;
			    }
			    // `function` heading (or definition if funcBody is passed)
			    func(name, args = code_1.nil, async, funcBody) {
			        this._blockNode(new Func(name, args, async));
			        if (funcBody)
			            this.code(funcBody).endFunc();
			        return this;
			    }
			    // end function definition
			    endFunc() {
			        return this._endBlockNode(Func);
			    }
			    optimize(n = 1) {
			        while (n-- > 0) {
			            this._root.optimizeNodes();
			            this._root.optimizeNames(this._root.names, this._constants);
			        }
			    }
			    _leafNode(node) {
			        this._currNode.nodes.push(node);
			        return this;
			    }
			    _blockNode(node) {
			        this._currNode.nodes.push(node);
			        this._nodes.push(node);
			    }
			    _endBlockNode(N1, N2) {
			        const n = this._currNode;
			        if (n instanceof N1 || (N2 && n instanceof N2)) {
			            this._nodes.pop();
			            return this;
			        }
			        throw new Error(`CodeGen: not in block "${N2 ? `${N1.kind}/${N2.kind}` : N1.kind}"`);
			    }
			    _elseNode(node) {
			        const n = this._currNode;
			        if (!(n instanceof If)) {
			            throw new Error('CodeGen: "else" without "if"');
			        }
			        this._currNode = n.else = node;
			        return this;
			    }
			    get _root() {
			        return this._nodes[0];
			    }
			    get _currNode() {
			        const ns = this._nodes;
			        return ns[ns.length - 1];
			    }
			    set _currNode(node) {
			        const ns = this._nodes;
			        ns[ns.length - 1] = node;
			    }
			}
			exports$1.CodeGen = CodeGen;
			function addNames(names, from) {
			    for (const n in from)
			        names[n] = (names[n] || 0) + (from[n] || 0);
			    return names;
			}
			function addExprNames(names, from) {
			    return from instanceof code_1._CodeOrName ? addNames(names, from.names) : names;
			}
			function optimizeExpr(expr, names, constants) {
			    if (expr instanceof code_1.Name)
			        return replaceName(expr);
			    if (!canOptimize(expr))
			        return expr;
			    return new code_1._Code(expr._items.reduce((items, c) => {
			        if (c instanceof code_1.Name)
			            c = replaceName(c);
			        if (c instanceof code_1._Code)
			            items.push(...c._items);
			        else
			            items.push(c);
			        return items;
			    }, []));
			    function replaceName(n) {
			        const c = constants[n.str];
			        if (c === undefined || names[n.str] !== 1)
			            return n;
			        delete names[n.str];
			        return c;
			    }
			    function canOptimize(e) {
			        return (e instanceof code_1._Code &&
			            e._items.some((c) => c instanceof code_1.Name && names[c.str] === 1 && constants[c.str] !== undefined));
			    }
			}
			function subtractNames(names, from) {
			    for (const n in from)
			        names[n] = (names[n] || 0) - (from[n] || 0);
			}
			function not(x) {
			    return typeof x == "boolean" || typeof x == "number" || x === null ? !x : (0, code_1._) `!${par(x)}`;
			}
			exports$1.not = not;
			const andCode = mappend(exports$1.operators.AND);
			// boolean AND (&&) expression with the passed arguments
			function and(...args) {
			    return args.reduce(andCode);
			}
			exports$1.and = and;
			const orCode = mappend(exports$1.operators.OR);
			// boolean OR (||) expression with the passed arguments
			function or(...args) {
			    return args.reduce(orCode);
			}
			exports$1.or = or;
			function mappend(op) {
			    return (x, y) => (x === code_1.nil ? y : y === code_1.nil ? x : (0, code_1._) `${par(x)} ${op} ${par(y)}`);
			}
			function par(x) {
			    return x instanceof code_1.Name ? x : (0, code_1._) `(${x})`;
			}
			
		} (codegen));
		return codegen;
	}

	var util = {};

	var hasRequiredUtil;

	function requireUtil () {
		if (hasRequiredUtil) return util;
		hasRequiredUtil = 1;
		Object.defineProperty(util, "__esModule", { value: true });
		util.checkStrictMode = util.getErrorPath = util.Type = util.useFunc = util.setEvaluated = util.evaluatedPropsToName = util.mergeEvaluated = util.eachItem = util.unescapeJsonPointer = util.escapeJsonPointer = util.escapeFragment = util.unescapeFragment = util.schemaRefOrVal = util.schemaHasRulesButRef = util.schemaHasRules = util.checkUnknownRules = util.alwaysValidSchema = util.toHash = void 0;
		const codegen_1 = requireCodegen();
		const code_1 = requireCode$1();
		// TODO refactor to use Set
		function toHash(arr) {
		    const hash = {};
		    for (const item of arr)
		        hash[item] = true;
		    return hash;
		}
		util.toHash = toHash;
		function alwaysValidSchema(it, schema) {
		    if (typeof schema == "boolean")
		        return schema;
		    if (Object.keys(schema).length === 0)
		        return true;
		    checkUnknownRules(it, schema);
		    return !schemaHasRules(schema, it.self.RULES.all);
		}
		util.alwaysValidSchema = alwaysValidSchema;
		function checkUnknownRules(it, schema = it.schema) {
		    const { opts, self } = it;
		    if (!opts.strictSchema)
		        return;
		    if (typeof schema === "boolean")
		        return;
		    const rules = self.RULES.keywords;
		    for (const key in schema) {
		        if (!rules[key])
		            checkStrictMode(it, `unknown keyword: "${key}"`);
		    }
		}
		util.checkUnknownRules = checkUnknownRules;
		function schemaHasRules(schema, rules) {
		    if (typeof schema == "boolean")
		        return !schema;
		    for (const key in schema)
		        if (rules[key])
		            return true;
		    return false;
		}
		util.schemaHasRules = schemaHasRules;
		function schemaHasRulesButRef(schema, RULES) {
		    if (typeof schema == "boolean")
		        return !schema;
		    for (const key in schema)
		        if (key !== "$ref" && RULES.all[key])
		            return true;
		    return false;
		}
		util.schemaHasRulesButRef = schemaHasRulesButRef;
		function schemaRefOrVal({ topSchemaRef, schemaPath }, schema, keyword, $data) {
		    if (!$data) {
		        if (typeof schema == "number" || typeof schema == "boolean")
		            return schema;
		        if (typeof schema == "string")
		            return (0, codegen_1._) `${schema}`;
		    }
		    return (0, codegen_1._) `${topSchemaRef}${schemaPath}${(0, codegen_1.getProperty)(keyword)}`;
		}
		util.schemaRefOrVal = schemaRefOrVal;
		function unescapeFragment(str) {
		    return unescapeJsonPointer(decodeURIComponent(str));
		}
		util.unescapeFragment = unescapeFragment;
		function escapeFragment(str) {
		    return encodeURIComponent(escapeJsonPointer(str));
		}
		util.escapeFragment = escapeFragment;
		function escapeJsonPointer(str) {
		    if (typeof str == "number")
		        return `${str}`;
		    return str.replace(/~/g, "~0").replace(/\//g, "~1");
		}
		util.escapeJsonPointer = escapeJsonPointer;
		function unescapeJsonPointer(str) {
		    return str.replace(/~1/g, "/").replace(/~0/g, "~");
		}
		util.unescapeJsonPointer = unescapeJsonPointer;
		function eachItem(xs, f) {
		    if (Array.isArray(xs)) {
		        for (const x of xs)
		            f(x);
		    }
		    else {
		        f(xs);
		    }
		}
		util.eachItem = eachItem;
		function makeMergeEvaluated({ mergeNames, mergeToName, mergeValues, resultToName, }) {
		    return (gen, from, to, toName) => {
		        const res = to === undefined
		            ? from
		            : to instanceof codegen_1.Name
		                ? (from instanceof codegen_1.Name ? mergeNames(gen, from, to) : mergeToName(gen, from, to), to)
		                : from instanceof codegen_1.Name
		                    ? (mergeToName(gen, to, from), from)
		                    : mergeValues(from, to);
		        return toName === codegen_1.Name && !(res instanceof codegen_1.Name) ? resultToName(gen, res) : res;
		    };
		}
		util.mergeEvaluated = {
		    props: makeMergeEvaluated({
		        mergeNames: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true && ${from} !== undefined`, () => {
		            gen.if((0, codegen_1._) `${from} === true`, () => gen.assign(to, true), () => gen.assign(to, (0, codegen_1._) `${to} || {}`).code((0, codegen_1._) `Object.assign(${to}, ${from})`));
		        }),
		        mergeToName: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true`, () => {
		            if (from === true) {
		                gen.assign(to, true);
		            }
		            else {
		                gen.assign(to, (0, codegen_1._) `${to} || {}`);
		                setEvaluated(gen, to, from);
		            }
		        }),
		        mergeValues: (from, to) => (from === true ? true : { ...from, ...to }),
		        resultToName: evaluatedPropsToName,
		    }),
		    items: makeMergeEvaluated({
		        mergeNames: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true && ${from} !== undefined`, () => gen.assign(to, (0, codegen_1._) `${from} === true ? true : ${to} > ${from} ? ${to} : ${from}`)),
		        mergeToName: (gen, from, to) => gen.if((0, codegen_1._) `${to} !== true`, () => gen.assign(to, from === true ? true : (0, codegen_1._) `${to} > ${from} ? ${to} : ${from}`)),
		        mergeValues: (from, to) => (from === true ? true : Math.max(from, to)),
		        resultToName: (gen, items) => gen.var("items", items),
		    }),
		};
		function evaluatedPropsToName(gen, ps) {
		    if (ps === true)
		        return gen.var("props", true);
		    const props = gen.var("props", (0, codegen_1._) `{}`);
		    if (ps !== undefined)
		        setEvaluated(gen, props, ps);
		    return props;
		}
		util.evaluatedPropsToName = evaluatedPropsToName;
		function setEvaluated(gen, props, ps) {
		    Object.keys(ps).forEach((p) => gen.assign((0, codegen_1._) `${props}${(0, codegen_1.getProperty)(p)}`, true));
		}
		util.setEvaluated = setEvaluated;
		const snippets = {};
		function useFunc(gen, f) {
		    return gen.scopeValue("func", {
		        ref: f,
		        code: snippets[f.code] || (snippets[f.code] = new code_1._Code(f.code)),
		    });
		}
		util.useFunc = useFunc;
		var Type;
		(function (Type) {
		    Type[Type["Num"] = 0] = "Num";
		    Type[Type["Str"] = 1] = "Str";
		})(Type || (util.Type = Type = {}));
		function getErrorPath(dataProp, dataPropType, jsPropertySyntax) {
		    // let path
		    if (dataProp instanceof codegen_1.Name) {
		        const isNumber = dataPropType === Type.Num;
		        return jsPropertySyntax
		            ? isNumber
		                ? (0, codegen_1._) `"[" + ${dataProp} + "]"`
		                : (0, codegen_1._) `"['" + ${dataProp} + "']"`
		            : isNumber
		                ? (0, codegen_1._) `"/" + ${dataProp}`
		                : (0, codegen_1._) `"/" + ${dataProp}.replace(/~/g, "~0").replace(/\\//g, "~1")`; // TODO maybe use global escapePointer
		    }
		    return jsPropertySyntax ? (0, codegen_1.getProperty)(dataProp).toString() : "/" + escapeJsonPointer(dataProp);
		}
		util.getErrorPath = getErrorPath;
		function checkStrictMode(it, msg, mode = it.opts.strictSchema) {
		    if (!mode)
		        return;
		    msg = `strict mode: ${msg}`;
		    if (mode === true)
		        throw new Error(msg);
		    it.self.logger.warn(msg);
		}
		util.checkStrictMode = checkStrictMode;
		
		return util;
	}

	var names = {};

	var hasRequiredNames;

	function requireNames () {
		if (hasRequiredNames) return names;
		hasRequiredNames = 1;
		Object.defineProperty(names, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const names$1 = {
		    // validation function arguments
		    data: new codegen_1.Name("data"), // data passed to validation function
		    // args passed from referencing schema
		    valCxt: new codegen_1.Name("valCxt"), // validation/data context - should not be used directly, it is destructured to the names below
		    instancePath: new codegen_1.Name("instancePath"),
		    parentData: new codegen_1.Name("parentData"),
		    parentDataProperty: new codegen_1.Name("parentDataProperty"),
		    rootData: new codegen_1.Name("rootData"), // root data - same as the data passed to the first/top validation function
		    dynamicAnchors: new codegen_1.Name("dynamicAnchors"), // used to support recursiveRef and dynamicRef
		    // function scoped variables
		    vErrors: new codegen_1.Name("vErrors"), // null or array of validation errors
		    errors: new codegen_1.Name("errors"), // counter of validation errors
		    this: new codegen_1.Name("this"),
		    // "globals"
		    self: new codegen_1.Name("self"),
		    scope: new codegen_1.Name("scope"),
		    // JTD serialize/parse name for JSON string and position
		    json: new codegen_1.Name("json"),
		    jsonPos: new codegen_1.Name("jsonPos"),
		    jsonLen: new codegen_1.Name("jsonLen"),
		    jsonPart: new codegen_1.Name("jsonPart"),
		};
		names.default = names$1;
		
		return names;
	}

	var hasRequiredErrors;

	function requireErrors () {
		if (hasRequiredErrors) return errors;
		hasRequiredErrors = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.extendErrors = exports$1.resetErrorsCount = exports$1.reportExtraError = exports$1.reportError = exports$1.keyword$DataError = exports$1.keywordError = void 0;
			const codegen_1 = requireCodegen();
			const util_1 = requireUtil();
			const names_1 = requireNames();
			exports$1.keywordError = {
			    message: ({ keyword }) => (0, codegen_1.str) `must pass "${keyword}" keyword validation`,
			};
			exports$1.keyword$DataError = {
			    message: ({ keyword, schemaType }) => schemaType
			        ? (0, codegen_1.str) `"${keyword}" keyword must be ${schemaType} ($data)`
			        : (0, codegen_1.str) `"${keyword}" keyword is invalid ($data)`,
			};
			function reportError(cxt, error = exports$1.keywordError, errorPaths, overrideAllErrors) {
			    const { it } = cxt;
			    const { gen, compositeRule, allErrors } = it;
			    const errObj = errorObjectCode(cxt, error, errorPaths);
			    if (overrideAllErrors !== null && overrideAllErrors !== void 0 ? overrideAllErrors : (compositeRule || allErrors)) {
			        addError(gen, errObj);
			    }
			    else {
			        returnErrors(it, (0, codegen_1._) `[${errObj}]`);
			    }
			}
			exports$1.reportError = reportError;
			function reportExtraError(cxt, error = exports$1.keywordError, errorPaths) {
			    const { it } = cxt;
			    const { gen, compositeRule, allErrors } = it;
			    const errObj = errorObjectCode(cxt, error, errorPaths);
			    addError(gen, errObj);
			    if (!(compositeRule || allErrors)) {
			        returnErrors(it, names_1.default.vErrors);
			    }
			}
			exports$1.reportExtraError = reportExtraError;
			function resetErrorsCount(gen, errsCount) {
			    gen.assign(names_1.default.errors, errsCount);
			    gen.if((0, codegen_1._) `${names_1.default.vErrors} !== null`, () => gen.if(errsCount, () => gen.assign((0, codegen_1._) `${names_1.default.vErrors}.length`, errsCount), () => gen.assign(names_1.default.vErrors, null)));
			}
			exports$1.resetErrorsCount = resetErrorsCount;
			function extendErrors({ gen, keyword, schemaValue, data, errsCount, it, }) {
			    /* istanbul ignore if */
			    if (errsCount === undefined)
			        throw new Error("ajv implementation error");
			    const err = gen.name("err");
			    gen.forRange("i", errsCount, names_1.default.errors, (i) => {
			        gen.const(err, (0, codegen_1._) `${names_1.default.vErrors}[${i}]`);
			        gen.if((0, codegen_1._) `${err}.instancePath === undefined`, () => gen.assign((0, codegen_1._) `${err}.instancePath`, (0, codegen_1.strConcat)(names_1.default.instancePath, it.errorPath)));
			        gen.assign((0, codegen_1._) `${err}.schemaPath`, (0, codegen_1.str) `${it.errSchemaPath}/${keyword}`);
			        if (it.opts.verbose) {
			            gen.assign((0, codegen_1._) `${err}.schema`, schemaValue);
			            gen.assign((0, codegen_1._) `${err}.data`, data);
			        }
			    });
			}
			exports$1.extendErrors = extendErrors;
			function addError(gen, errObj) {
			    const err = gen.const("err", errObj);
			    gen.if((0, codegen_1._) `${names_1.default.vErrors} === null`, () => gen.assign(names_1.default.vErrors, (0, codegen_1._) `[${err}]`), (0, codegen_1._) `${names_1.default.vErrors}.push(${err})`);
			    gen.code((0, codegen_1._) `${names_1.default.errors}++`);
			}
			function returnErrors(it, errs) {
			    const { gen, validateName, schemaEnv } = it;
			    if (schemaEnv.$async) {
			        gen.throw((0, codegen_1._) `new ${it.ValidationError}(${errs})`);
			    }
			    else {
			        gen.assign((0, codegen_1._) `${validateName}.errors`, errs);
			        gen.return(false);
			    }
			}
			const E = {
			    keyword: new codegen_1.Name("keyword"),
			    schemaPath: new codegen_1.Name("schemaPath"), // also used in JTD errors
			    params: new codegen_1.Name("params"),
			    propertyName: new codegen_1.Name("propertyName"),
			    message: new codegen_1.Name("message"),
			    schema: new codegen_1.Name("schema"),
			    parentSchema: new codegen_1.Name("parentSchema"),
			};
			function errorObjectCode(cxt, error, errorPaths) {
			    const { createErrors } = cxt.it;
			    if (createErrors === false)
			        return (0, codegen_1._) `{}`;
			    return errorObject(cxt, error, errorPaths);
			}
			function errorObject(cxt, error, errorPaths = {}) {
			    const { gen, it } = cxt;
			    const keyValues = [
			        errorInstancePath(it, errorPaths),
			        errorSchemaPath(cxt, errorPaths),
			    ];
			    extraErrorProps(cxt, error, keyValues);
			    return gen.object(...keyValues);
			}
			function errorInstancePath({ errorPath }, { instancePath }) {
			    const instPath = instancePath
			        ? (0, codegen_1.str) `${errorPath}${(0, util_1.getErrorPath)(instancePath, util_1.Type.Str)}`
			        : errorPath;
			    return [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, instPath)];
			}
			function errorSchemaPath({ keyword, it: { errSchemaPath } }, { schemaPath, parentSchema }) {
			    let schPath = parentSchema ? errSchemaPath : (0, codegen_1.str) `${errSchemaPath}/${keyword}`;
			    if (schemaPath) {
			        schPath = (0, codegen_1.str) `${schPath}${(0, util_1.getErrorPath)(schemaPath, util_1.Type.Str)}`;
			    }
			    return [E.schemaPath, schPath];
			}
			function extraErrorProps(cxt, { params, message }, keyValues) {
			    const { keyword, data, schemaValue, it } = cxt;
			    const { opts, propertyName, topSchemaRef, schemaPath } = it;
			    keyValues.push([E.keyword, keyword], [E.params, typeof params == "function" ? params(cxt) : params || (0, codegen_1._) `{}`]);
			    if (opts.messages) {
			        keyValues.push([E.message, typeof message == "function" ? message(cxt) : message]);
			    }
			    if (opts.verbose) {
			        keyValues.push([E.schema, schemaValue], [E.parentSchema, (0, codegen_1._) `${topSchemaRef}${schemaPath}`], [names_1.default.data, data]);
			    }
			    if (propertyName)
			        keyValues.push([E.propertyName, propertyName]);
			}
			
		} (errors));
		return errors;
	}

	var hasRequiredBoolSchema;

	function requireBoolSchema () {
		if (hasRequiredBoolSchema) return boolSchema;
		hasRequiredBoolSchema = 1;
		Object.defineProperty(boolSchema, "__esModule", { value: true });
		boolSchema.boolOrEmptySchema = boolSchema.topBoolOrEmptySchema = void 0;
		const errors_1 = requireErrors();
		const codegen_1 = requireCodegen();
		const names_1 = requireNames();
		const boolError = {
		    message: "boolean schema is false",
		};
		function topBoolOrEmptySchema(it) {
		    const { gen, schema, validateName } = it;
		    if (schema === false) {
		        falseSchemaError(it, false);
		    }
		    else if (typeof schema == "object" && schema.$async === true) {
		        gen.return(names_1.default.data);
		    }
		    else {
		        gen.assign((0, codegen_1._) `${validateName}.errors`, null);
		        gen.return(true);
		    }
		}
		boolSchema.topBoolOrEmptySchema = topBoolOrEmptySchema;
		function boolOrEmptySchema(it, valid) {
		    const { gen, schema } = it;
		    if (schema === false) {
		        gen.var(valid, false); // TODO var
		        falseSchemaError(it);
		    }
		    else {
		        gen.var(valid, true); // TODO var
		    }
		}
		boolSchema.boolOrEmptySchema = boolOrEmptySchema;
		function falseSchemaError(it, overrideAllErrors) {
		    const { gen, data } = it;
		    // TODO maybe some other interface should be used for non-keyword validation errors...
		    const cxt = {
		        gen,
		        keyword: "false schema",
		        data,
		        schema: false,
		        schemaCode: false,
		        schemaValue: false,
		        params: {},
		        it,
		    };
		    (0, errors_1.reportError)(cxt, boolError, undefined, overrideAllErrors);
		}
		
		return boolSchema;
	}

	var dataType = {};

	var rules = {};

	var hasRequiredRules;

	function requireRules () {
		if (hasRequiredRules) return rules;
		hasRequiredRules = 1;
		Object.defineProperty(rules, "__esModule", { value: true });
		rules.getRules = rules.isJSONType = void 0;
		const _jsonTypes = ["string", "number", "integer", "boolean", "null", "object", "array"];
		const jsonTypes = new Set(_jsonTypes);
		function isJSONType(x) {
		    return typeof x == "string" && jsonTypes.has(x);
		}
		rules.isJSONType = isJSONType;
		function getRules() {
		    const groups = {
		        number: { type: "number", rules: [] },
		        string: { type: "string", rules: [] },
		        array: { type: "array", rules: [] },
		        object: { type: "object", rules: [] },
		    };
		    return {
		        types: { ...groups, integer: true, boolean: true, null: true },
		        rules: [{ rules: [] }, groups.number, groups.string, groups.array, groups.object],
		        post: { rules: [] },
		        all: {},
		        keywords: {},
		    };
		}
		rules.getRules = getRules;
		
		return rules;
	}

	var applicability = {};

	var hasRequiredApplicability;

	function requireApplicability () {
		if (hasRequiredApplicability) return applicability;
		hasRequiredApplicability = 1;
		Object.defineProperty(applicability, "__esModule", { value: true });
		applicability.shouldUseRule = applicability.shouldUseGroup = applicability.schemaHasRulesForType = void 0;
		function schemaHasRulesForType({ schema, self }, type) {
		    const group = self.RULES.types[type];
		    return group && group !== true && shouldUseGroup(schema, group);
		}
		applicability.schemaHasRulesForType = schemaHasRulesForType;
		function shouldUseGroup(schema, group) {
		    return group.rules.some((rule) => shouldUseRule(schema, rule));
		}
		applicability.shouldUseGroup = shouldUseGroup;
		function shouldUseRule(schema, rule) {
		    var _a;
		    return (schema[rule.keyword] !== undefined ||
		        ((_a = rule.definition.implements) === null || _a === void 0 ? void 0 : _a.some((kwd) => schema[kwd] !== undefined)));
		}
		applicability.shouldUseRule = shouldUseRule;
		
		return applicability;
	}

	var hasRequiredDataType;

	function requireDataType () {
		if (hasRequiredDataType) return dataType;
		hasRequiredDataType = 1;
		Object.defineProperty(dataType, "__esModule", { value: true });
		dataType.reportTypeError = dataType.checkDataTypes = dataType.checkDataType = dataType.coerceAndCheckDataType = dataType.getJSONTypes = dataType.getSchemaTypes = dataType.DataType = void 0;
		const rules_1 = requireRules();
		const applicability_1 = requireApplicability();
		const errors_1 = requireErrors();
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		var DataType;
		(function (DataType) {
		    DataType[DataType["Correct"] = 0] = "Correct";
		    DataType[DataType["Wrong"] = 1] = "Wrong";
		})(DataType || (dataType.DataType = DataType = {}));
		function getSchemaTypes(schema) {
		    const types = getJSONTypes(schema.type);
		    const hasNull = types.includes("null");
		    if (hasNull) {
		        if (schema.nullable === false)
		            throw new Error("type: null contradicts nullable: false");
		    }
		    else {
		        if (!types.length && schema.nullable !== undefined) {
		            throw new Error('"nullable" cannot be used without "type"');
		        }
		        if (schema.nullable === true)
		            types.push("null");
		    }
		    return types;
		}
		dataType.getSchemaTypes = getSchemaTypes;
		// eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
		function getJSONTypes(ts) {
		    const types = Array.isArray(ts) ? ts : ts ? [ts] : [];
		    if (types.every(rules_1.isJSONType))
		        return types;
		    throw new Error("type must be JSONType or JSONType[]: " + types.join(","));
		}
		dataType.getJSONTypes = getJSONTypes;
		function coerceAndCheckDataType(it, types) {
		    const { gen, data, opts } = it;
		    const coerceTo = coerceToTypes(types, opts.coerceTypes);
		    const checkTypes = types.length > 0 &&
		        !(coerceTo.length === 0 && types.length === 1 && (0, applicability_1.schemaHasRulesForType)(it, types[0]));
		    if (checkTypes) {
		        const wrongType = checkDataTypes(types, data, opts.strictNumbers, DataType.Wrong);
		        gen.if(wrongType, () => {
		            if (coerceTo.length)
		                coerceData(it, types, coerceTo);
		            else
		                reportTypeError(it);
		        });
		    }
		    return checkTypes;
		}
		dataType.coerceAndCheckDataType = coerceAndCheckDataType;
		const COERCIBLE = new Set(["string", "number", "integer", "boolean", "null"]);
		function coerceToTypes(types, coerceTypes) {
		    return coerceTypes
		        ? types.filter((t) => COERCIBLE.has(t) || (coerceTypes === "array" && t === "array"))
		        : [];
		}
		function coerceData(it, types, coerceTo) {
		    const { gen, data, opts } = it;
		    const dataType = gen.let("dataType", (0, codegen_1._) `typeof ${data}`);
		    const coerced = gen.let("coerced", (0, codegen_1._) `undefined`);
		    if (opts.coerceTypes === "array") {
		        gen.if((0, codegen_1._) `${dataType} == 'object' && Array.isArray(${data}) && ${data}.length == 1`, () => gen
		            .assign(data, (0, codegen_1._) `${data}[0]`)
		            .assign(dataType, (0, codegen_1._) `typeof ${data}`)
		            .if(checkDataTypes(types, data, opts.strictNumbers), () => gen.assign(coerced, data)));
		    }
		    gen.if((0, codegen_1._) `${coerced} !== undefined`);
		    for (const t of coerceTo) {
		        if (COERCIBLE.has(t) || (t === "array" && opts.coerceTypes === "array")) {
		            coerceSpecificType(t);
		        }
		    }
		    gen.else();
		    reportTypeError(it);
		    gen.endIf();
		    gen.if((0, codegen_1._) `${coerced} !== undefined`, () => {
		        gen.assign(data, coerced);
		        assignParentData(it, coerced);
		    });
		    function coerceSpecificType(t) {
		        switch (t) {
		            case "string":
		                gen
		                    .elseIf((0, codegen_1._) `${dataType} == "number" || ${dataType} == "boolean"`)
		                    .assign(coerced, (0, codegen_1._) `"" + ${data}`)
		                    .elseIf((0, codegen_1._) `${data} === null`)
		                    .assign(coerced, (0, codegen_1._) `""`);
		                return;
		            case "number":
		                gen
		                    .elseIf((0, codegen_1._) `${dataType} == "boolean" || ${data} === null
              || (${dataType} == "string" && ${data} && ${data} == +${data})`)
		                    .assign(coerced, (0, codegen_1._) `+${data}`);
		                return;
		            case "integer":
		                gen
		                    .elseIf((0, codegen_1._) `${dataType} === "boolean" || ${data} === null
              || (${dataType} === "string" && ${data} && ${data} == +${data} && !(${data} % 1))`)
		                    .assign(coerced, (0, codegen_1._) `+${data}`);
		                return;
		            case "boolean":
		                gen
		                    .elseIf((0, codegen_1._) `${data} === "false" || ${data} === 0 || ${data} === null`)
		                    .assign(coerced, false)
		                    .elseIf((0, codegen_1._) `${data} === "true" || ${data} === 1`)
		                    .assign(coerced, true);
		                return;
		            case "null":
		                gen.elseIf((0, codegen_1._) `${data} === "" || ${data} === 0 || ${data} === false`);
		                gen.assign(coerced, null);
		                return;
		            case "array":
		                gen
		                    .elseIf((0, codegen_1._) `${dataType} === "string" || ${dataType} === "number"
              || ${dataType} === "boolean" || ${data} === null`)
		                    .assign(coerced, (0, codegen_1._) `[${data}]`);
		        }
		    }
		}
		function assignParentData({ gen, parentData, parentDataProperty }, expr) {
		    // TODO use gen.property
		    gen.if((0, codegen_1._) `${parentData} !== undefined`, () => gen.assign((0, codegen_1._) `${parentData}[${parentDataProperty}]`, expr));
		}
		function checkDataType(dataType, data, strictNums, correct = DataType.Correct) {
		    const EQ = correct === DataType.Correct ? codegen_1.operators.EQ : codegen_1.operators.NEQ;
		    let cond;
		    switch (dataType) {
		        case "null":
		            return (0, codegen_1._) `${data} ${EQ} null`;
		        case "array":
		            cond = (0, codegen_1._) `Array.isArray(${data})`;
		            break;
		        case "object":
		            cond = (0, codegen_1._) `${data} && typeof ${data} == "object" && !Array.isArray(${data})`;
		            break;
		        case "integer":
		            cond = numCond((0, codegen_1._) `!(${data} % 1) && !isNaN(${data})`);
		            break;
		        case "number":
		            cond = numCond();
		            break;
		        default:
		            return (0, codegen_1._) `typeof ${data} ${EQ} ${dataType}`;
		    }
		    return correct === DataType.Correct ? cond : (0, codegen_1.not)(cond);
		    function numCond(_cond = codegen_1.nil) {
		        return (0, codegen_1.and)((0, codegen_1._) `typeof ${data} == "number"`, _cond, strictNums ? (0, codegen_1._) `isFinite(${data})` : codegen_1.nil);
		    }
		}
		dataType.checkDataType = checkDataType;
		function checkDataTypes(dataTypes, data, strictNums, correct) {
		    if (dataTypes.length === 1) {
		        return checkDataType(dataTypes[0], data, strictNums, correct);
		    }
		    let cond;
		    const types = (0, util_1.toHash)(dataTypes);
		    if (types.array && types.object) {
		        const notObj = (0, codegen_1._) `typeof ${data} != "object"`;
		        cond = types.null ? notObj : (0, codegen_1._) `!${data} || ${notObj}`;
		        delete types.null;
		        delete types.array;
		        delete types.object;
		    }
		    else {
		        cond = codegen_1.nil;
		    }
		    if (types.number)
		        delete types.integer;
		    for (const t in types)
		        cond = (0, codegen_1.and)(cond, checkDataType(t, data, strictNums, correct));
		    return cond;
		}
		dataType.checkDataTypes = checkDataTypes;
		const typeError = {
		    message: ({ schema }) => `must be ${schema}`,
		    params: ({ schema, schemaValue }) => typeof schema == "string" ? (0, codegen_1._) `{type: ${schema}}` : (0, codegen_1._) `{type: ${schemaValue}}`,
		};
		function reportTypeError(it) {
		    const cxt = getTypeErrorContext(it);
		    (0, errors_1.reportError)(cxt, typeError);
		}
		dataType.reportTypeError = reportTypeError;
		function getTypeErrorContext(it) {
		    const { gen, data, schema } = it;
		    const schemaCode = (0, util_1.schemaRefOrVal)(it, schema, "type");
		    return {
		        gen,
		        keyword: "type",
		        data,
		        schema: schema.type,
		        schemaCode,
		        schemaValue: schemaCode,
		        parentSchema: schema,
		        params: {},
		        it,
		    };
		}
		
		return dataType;
	}

	var defaults = {};

	var hasRequiredDefaults;

	function requireDefaults () {
		if (hasRequiredDefaults) return defaults;
		hasRequiredDefaults = 1;
		Object.defineProperty(defaults, "__esModule", { value: true });
		defaults.assignDefaults = void 0;
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		function assignDefaults(it, ty) {
		    const { properties, items } = it.schema;
		    if (ty === "object" && properties) {
		        for (const key in properties) {
		            assignDefault(it, key, properties[key].default);
		        }
		    }
		    else if (ty === "array" && Array.isArray(items)) {
		        items.forEach((sch, i) => assignDefault(it, i, sch.default));
		    }
		}
		defaults.assignDefaults = assignDefaults;
		function assignDefault(it, prop, defaultValue) {
		    const { gen, compositeRule, data, opts } = it;
		    if (defaultValue === undefined)
		        return;
		    const childData = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(prop)}`;
		    if (compositeRule) {
		        (0, util_1.checkStrictMode)(it, `default is ignored for: ${childData}`);
		        return;
		    }
		    let condition = (0, codegen_1._) `${childData} === undefined`;
		    if (opts.useDefaults === "empty") {
		        condition = (0, codegen_1._) `${condition} || ${childData} === null || ${childData} === ""`;
		    }
		    // `${childData} === undefined` +
		    // (opts.useDefaults === "empty" ? ` || ${childData} === null || ${childData} === ""` : "")
		    gen.if(condition, (0, codegen_1._) `${childData} = ${(0, codegen_1.stringify)(defaultValue)}`);
		}
		
		return defaults;
	}

	var keyword = {};

	var code = {};

	var hasRequiredCode;

	function requireCode () {
		if (hasRequiredCode) return code;
		hasRequiredCode = 1;
		Object.defineProperty(code, "__esModule", { value: true });
		code.validateUnion = code.validateArray = code.usePattern = code.callValidateCode = code.schemaProperties = code.allSchemaProperties = code.noPropertyInData = code.propertyInData = code.isOwnProperty = code.hasPropFunc = code.reportMissingProp = code.checkMissingProp = code.checkReportMissingProp = void 0;
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const names_1 = requireNames();
		const util_2 = requireUtil();
		function checkReportMissingProp(cxt, prop) {
		    const { gen, data, it } = cxt;
		    gen.if(noPropertyInData(gen, data, prop, it.opts.ownProperties), () => {
		        cxt.setParams({ missingProperty: (0, codegen_1._) `${prop}` }, true);
		        cxt.error();
		    });
		}
		code.checkReportMissingProp = checkReportMissingProp;
		function checkMissingProp({ gen, data, it: { opts } }, properties, missing) {
		    return (0, codegen_1.or)(...properties.map((prop) => (0, codegen_1.and)(noPropertyInData(gen, data, prop, opts.ownProperties), (0, codegen_1._) `${missing} = ${prop}`)));
		}
		code.checkMissingProp = checkMissingProp;
		function reportMissingProp(cxt, missing) {
		    cxt.setParams({ missingProperty: missing }, true);
		    cxt.error();
		}
		code.reportMissingProp = reportMissingProp;
		function hasPropFunc(gen) {
		    return gen.scopeValue("func", {
		        // eslint-disable-next-line @typescript-eslint/unbound-method
		        ref: Object.prototype.hasOwnProperty,
		        code: (0, codegen_1._) `Object.prototype.hasOwnProperty`,
		    });
		}
		code.hasPropFunc = hasPropFunc;
		function isOwnProperty(gen, data, property) {
		    return (0, codegen_1._) `${hasPropFunc(gen)}.call(${data}, ${property})`;
		}
		code.isOwnProperty = isOwnProperty;
		function propertyInData(gen, data, property, ownProperties) {
		    const cond = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(property)} !== undefined`;
		    return ownProperties ? (0, codegen_1._) `${cond} && ${isOwnProperty(gen, data, property)}` : cond;
		}
		code.propertyInData = propertyInData;
		function noPropertyInData(gen, data, property, ownProperties) {
		    const cond = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(property)} === undefined`;
		    return ownProperties ? (0, codegen_1.or)(cond, (0, codegen_1.not)(isOwnProperty(gen, data, property))) : cond;
		}
		code.noPropertyInData = noPropertyInData;
		function allSchemaProperties(schemaMap) {
		    return schemaMap ? Object.keys(schemaMap).filter((p) => p !== "__proto__") : [];
		}
		code.allSchemaProperties = allSchemaProperties;
		function schemaProperties(it, schemaMap) {
		    return allSchemaProperties(schemaMap).filter((p) => !(0, util_1.alwaysValidSchema)(it, schemaMap[p]));
		}
		code.schemaProperties = schemaProperties;
		function callValidateCode({ schemaCode, data, it: { gen, topSchemaRef, schemaPath, errorPath }, it }, func, context, passSchema) {
		    const dataAndSchema = passSchema ? (0, codegen_1._) `${schemaCode}, ${data}, ${topSchemaRef}${schemaPath}` : data;
		    const valCxt = [
		        [names_1.default.instancePath, (0, codegen_1.strConcat)(names_1.default.instancePath, errorPath)],
		        [names_1.default.parentData, it.parentData],
		        [names_1.default.parentDataProperty, it.parentDataProperty],
		        [names_1.default.rootData, names_1.default.rootData],
		    ];
		    if (it.opts.dynamicRef)
		        valCxt.push([names_1.default.dynamicAnchors, names_1.default.dynamicAnchors]);
		    const args = (0, codegen_1._) `${dataAndSchema}, ${gen.object(...valCxt)}`;
		    return context !== codegen_1.nil ? (0, codegen_1._) `${func}.call(${context}, ${args})` : (0, codegen_1._) `${func}(${args})`;
		}
		code.callValidateCode = callValidateCode;
		const newRegExp = (0, codegen_1._) `new RegExp`;
		function usePattern({ gen, it: { opts } }, pattern) {
		    const u = opts.unicodeRegExp ? "u" : "";
		    const { regExp } = opts.code;
		    const rx = regExp(pattern, u);
		    return gen.scopeValue("pattern", {
		        key: rx.toString(),
		        ref: rx,
		        code: (0, codegen_1._) `${regExp.code === "new RegExp" ? newRegExp : (0, util_2.useFunc)(gen, regExp)}(${pattern}, ${u})`,
		    });
		}
		code.usePattern = usePattern;
		function validateArray(cxt) {
		    const { gen, data, keyword, it } = cxt;
		    const valid = gen.name("valid");
		    if (it.allErrors) {
		        const validArr = gen.let("valid", true);
		        validateItems(() => gen.assign(validArr, false));
		        return validArr;
		    }
		    gen.var(valid, true);
		    validateItems(() => gen.break());
		    return valid;
		    function validateItems(notValid) {
		        const len = gen.const("len", (0, codegen_1._) `${data}.length`);
		        gen.forRange("i", 0, len, (i) => {
		            cxt.subschema({
		                keyword,
		                dataProp: i,
		                dataPropType: util_1.Type.Num,
		            }, valid);
		            gen.if((0, codegen_1.not)(valid), notValid);
		        });
		    }
		}
		code.validateArray = validateArray;
		function validateUnion(cxt) {
		    const { gen, schema, keyword, it } = cxt;
		    /* istanbul ignore if */
		    if (!Array.isArray(schema))
		        throw new Error("ajv implementation error");
		    const alwaysValid = schema.some((sch) => (0, util_1.alwaysValidSchema)(it, sch));
		    if (alwaysValid && !it.opts.unevaluated)
		        return;
		    const valid = gen.let("valid", false);
		    const schValid = gen.name("_valid");
		    gen.block(() => schema.forEach((_sch, i) => {
		        const schCxt = cxt.subschema({
		            keyword,
		            schemaProp: i,
		            compositeRule: true,
		        }, schValid);
		        gen.assign(valid, (0, codegen_1._) `${valid} || ${schValid}`);
		        const merged = cxt.mergeValidEvaluated(schCxt, schValid);
		        // can short-circuit if `unevaluatedProperties/Items` not supported (opts.unevaluated !== true)
		        // or if all properties and items were evaluated (it.props === true && it.items === true)
		        if (!merged)
		            gen.if((0, codegen_1.not)(valid));
		    }));
		    cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
		}
		code.validateUnion = validateUnion;
		
		return code;
	}

	var hasRequiredKeyword;

	function requireKeyword () {
		if (hasRequiredKeyword) return keyword;
		hasRequiredKeyword = 1;
		Object.defineProperty(keyword, "__esModule", { value: true });
		keyword.validateKeywordUsage = keyword.validSchemaType = keyword.funcKeywordCode = keyword.macroKeywordCode = void 0;
		const codegen_1 = requireCodegen();
		const names_1 = requireNames();
		const code_1 = requireCode();
		const errors_1 = requireErrors();
		function macroKeywordCode(cxt, def) {
		    const { gen, keyword, schema, parentSchema, it } = cxt;
		    const macroSchema = def.macro.call(it.self, schema, parentSchema, it);
		    const schemaRef = useKeyword(gen, keyword, macroSchema);
		    if (it.opts.validateSchema !== false)
		        it.self.validateSchema(macroSchema, true);
		    const valid = gen.name("valid");
		    cxt.subschema({
		        schema: macroSchema,
		        schemaPath: codegen_1.nil,
		        errSchemaPath: `${it.errSchemaPath}/${keyword}`,
		        topSchemaRef: schemaRef,
		        compositeRule: true,
		    }, valid);
		    cxt.pass(valid, () => cxt.error(true));
		}
		keyword.macroKeywordCode = macroKeywordCode;
		function funcKeywordCode(cxt, def) {
		    var _a;
		    const { gen, keyword, schema, parentSchema, $data, it } = cxt;
		    checkAsyncKeyword(it, def);
		    const validate = !$data && def.compile ? def.compile.call(it.self, schema, parentSchema, it) : def.validate;
		    const validateRef = useKeyword(gen, keyword, validate);
		    const valid = gen.let("valid");
		    cxt.block$data(valid, validateKeyword);
		    cxt.ok((_a = def.valid) !== null && _a !== void 0 ? _a : valid);
		    function validateKeyword() {
		        if (def.errors === false) {
		            assignValid();
		            if (def.modifying)
		                modifyData(cxt);
		            reportErrs(() => cxt.error());
		        }
		        else {
		            const ruleErrs = def.async ? validateAsync() : validateSync();
		            if (def.modifying)
		                modifyData(cxt);
		            reportErrs(() => addErrs(cxt, ruleErrs));
		        }
		    }
		    function validateAsync() {
		        const ruleErrs = gen.let("ruleErrs", null);
		        gen.try(() => assignValid((0, codegen_1._) `await `), (e) => gen.assign(valid, false).if((0, codegen_1._) `${e} instanceof ${it.ValidationError}`, () => gen.assign(ruleErrs, (0, codegen_1._) `${e}.errors`), () => gen.throw(e)));
		        return ruleErrs;
		    }
		    function validateSync() {
		        const validateErrs = (0, codegen_1._) `${validateRef}.errors`;
		        gen.assign(validateErrs, null);
		        assignValid(codegen_1.nil);
		        return validateErrs;
		    }
		    function assignValid(_await = def.async ? (0, codegen_1._) `await ` : codegen_1.nil) {
		        const passCxt = it.opts.passContext ? names_1.default.this : names_1.default.self;
		        const passSchema = !(("compile" in def && !$data) || def.schema === false);
		        gen.assign(valid, (0, codegen_1._) `${_await}${(0, code_1.callValidateCode)(cxt, validateRef, passCxt, passSchema)}`, def.modifying);
		    }
		    function reportErrs(errors) {
		        var _a;
		        gen.if((0, codegen_1.not)((_a = def.valid) !== null && _a !== void 0 ? _a : valid), errors);
		    }
		}
		keyword.funcKeywordCode = funcKeywordCode;
		function modifyData(cxt) {
		    const { gen, data, it } = cxt;
		    gen.if(it.parentData, () => gen.assign(data, (0, codegen_1._) `${it.parentData}[${it.parentDataProperty}]`));
		}
		function addErrs(cxt, errs) {
		    const { gen } = cxt;
		    gen.if((0, codegen_1._) `Array.isArray(${errs})`, () => {
		        gen
		            .assign(names_1.default.vErrors, (0, codegen_1._) `${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`)
		            .assign(names_1.default.errors, (0, codegen_1._) `${names_1.default.vErrors}.length`);
		        (0, errors_1.extendErrors)(cxt);
		    }, () => cxt.error());
		}
		function checkAsyncKeyword({ schemaEnv }, def) {
		    if (def.async && !schemaEnv.$async)
		        throw new Error("async keyword in sync schema");
		}
		function useKeyword(gen, keyword, result) {
		    if (result === undefined)
		        throw new Error(`keyword "${keyword}" failed to compile`);
		    return gen.scopeValue("keyword", typeof result == "function" ? { ref: result } : { ref: result, code: (0, codegen_1.stringify)(result) });
		}
		function validSchemaType(schema, schemaType, allowUndefined = false) {
		    // TODO add tests
		    return (!schemaType.length ||
		        schemaType.some((st) => st === "array"
		            ? Array.isArray(schema)
		            : st === "object"
		                ? schema && typeof schema == "object" && !Array.isArray(schema)
		                : typeof schema == st || (allowUndefined && typeof schema == "undefined")));
		}
		keyword.validSchemaType = validSchemaType;
		function validateKeywordUsage({ schema, opts, self, errSchemaPath }, def, keyword) {
		    /* istanbul ignore if */
		    if (Array.isArray(def.keyword) ? !def.keyword.includes(keyword) : def.keyword !== keyword) {
		        throw new Error("ajv implementation error");
		    }
		    const deps = def.dependencies;
		    if (deps === null || deps === void 0 ? void 0 : deps.some((kwd) => !Object.prototype.hasOwnProperty.call(schema, kwd))) {
		        throw new Error(`parent schema must have dependencies of ${keyword}: ${deps.join(",")}`);
		    }
		    if (def.validateSchema) {
		        const valid = def.validateSchema(schema[keyword]);
		        if (!valid) {
		            const msg = `keyword "${keyword}" value is invalid at path "${errSchemaPath}": ` +
		                self.errorsText(def.validateSchema.errors);
		            if (opts.validateSchema === "log")
		                self.logger.error(msg);
		            else
		                throw new Error(msg);
		        }
		    }
		}
		keyword.validateKeywordUsage = validateKeywordUsage;
		
		return keyword;
	}

	var subschema = {};

	var hasRequiredSubschema;

	function requireSubschema () {
		if (hasRequiredSubschema) return subschema;
		hasRequiredSubschema = 1;
		Object.defineProperty(subschema, "__esModule", { value: true });
		subschema.extendSubschemaMode = subschema.extendSubschemaData = subschema.getSubschema = void 0;
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		function getSubschema(it, { keyword, schemaProp, schema, schemaPath, errSchemaPath, topSchemaRef }) {
		    if (keyword !== undefined && schema !== undefined) {
		        throw new Error('both "keyword" and "schema" passed, only one allowed');
		    }
		    if (keyword !== undefined) {
		        const sch = it.schema[keyword];
		        return schemaProp === undefined
		            ? {
		                schema: sch,
		                schemaPath: (0, codegen_1._) `${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}`,
		                errSchemaPath: `${it.errSchemaPath}/${keyword}`,
		            }
		            : {
		                schema: sch[schemaProp],
		                schemaPath: (0, codegen_1._) `${it.schemaPath}${(0, codegen_1.getProperty)(keyword)}${(0, codegen_1.getProperty)(schemaProp)}`,
		                errSchemaPath: `${it.errSchemaPath}/${keyword}/${(0, util_1.escapeFragment)(schemaProp)}`,
		            };
		    }
		    if (schema !== undefined) {
		        if (schemaPath === undefined || errSchemaPath === undefined || topSchemaRef === undefined) {
		            throw new Error('"schemaPath", "errSchemaPath" and "topSchemaRef" are required with "schema"');
		        }
		        return {
		            schema,
		            schemaPath,
		            topSchemaRef,
		            errSchemaPath,
		        };
		    }
		    throw new Error('either "keyword" or "schema" must be passed');
		}
		subschema.getSubschema = getSubschema;
		function extendSubschemaData(subschema, it, { dataProp, dataPropType: dpType, data, dataTypes, propertyName }) {
		    if (data !== undefined && dataProp !== undefined) {
		        throw new Error('both "data" and "dataProp" passed, only one allowed');
		    }
		    const { gen } = it;
		    if (dataProp !== undefined) {
		        const { errorPath, dataPathArr, opts } = it;
		        const nextData = gen.let("data", (0, codegen_1._) `${it.data}${(0, codegen_1.getProperty)(dataProp)}`, true);
		        dataContextProps(nextData);
		        subschema.errorPath = (0, codegen_1.str) `${errorPath}${(0, util_1.getErrorPath)(dataProp, dpType, opts.jsPropertySyntax)}`;
		        subschema.parentDataProperty = (0, codegen_1._) `${dataProp}`;
		        subschema.dataPathArr = [...dataPathArr, subschema.parentDataProperty];
		    }
		    if (data !== undefined) {
		        const nextData = data instanceof codegen_1.Name ? data : gen.let("data", data, true); // replaceable if used once?
		        dataContextProps(nextData);
		        if (propertyName !== undefined)
		            subschema.propertyName = propertyName;
		        // TODO something is possibly wrong here with not changing parentDataProperty and not appending dataPathArr
		    }
		    if (dataTypes)
		        subschema.dataTypes = dataTypes;
		    function dataContextProps(_nextData) {
		        subschema.data = _nextData;
		        subschema.dataLevel = it.dataLevel + 1;
		        subschema.dataTypes = [];
		        it.definedProperties = new Set();
		        subschema.parentData = it.data;
		        subschema.dataNames = [...it.dataNames, _nextData];
		    }
		}
		subschema.extendSubschemaData = extendSubschemaData;
		function extendSubschemaMode(subschema, { jtdDiscriminator, jtdMetadata, compositeRule, createErrors, allErrors }) {
		    if (compositeRule !== undefined)
		        subschema.compositeRule = compositeRule;
		    if (createErrors !== undefined)
		        subschema.createErrors = createErrors;
		    if (allErrors !== undefined)
		        subschema.allErrors = allErrors;
		    subschema.jtdDiscriminator = jtdDiscriminator; // not inherited
		    subschema.jtdMetadata = jtdMetadata; // not inherited
		}
		subschema.extendSubschemaMode = extendSubschemaMode;
		
		return subschema;
	}

	var resolve = {};

	var fastDeepEqual;
	var hasRequiredFastDeepEqual;

	function requireFastDeepEqual () {
		if (hasRequiredFastDeepEqual) return fastDeepEqual;
		hasRequiredFastDeepEqual = 1;

		// do not edit .js files directly - edit src/index.jst



		fastDeepEqual = function equal(a, b) {
		  if (a === b) return true;

		  if (a && b && typeof a == 'object' && typeof b == 'object') {
		    if (a.constructor !== b.constructor) return false;

		    var length, i, keys;
		    if (Array.isArray(a)) {
		      length = a.length;
		      if (length != b.length) return false;
		      for (i = length; i-- !== 0;)
		        if (!equal(a[i], b[i])) return false;
		      return true;
		    }



		    if (a.constructor === RegExp) return a.source === b.source && a.flags === b.flags;
		    if (a.valueOf !== Object.prototype.valueOf) return a.valueOf() === b.valueOf();
		    if (a.toString !== Object.prototype.toString) return a.toString() === b.toString();

		    keys = Object.keys(a);
		    length = keys.length;
		    if (length !== Object.keys(b).length) return false;

		    for (i = length; i-- !== 0;)
		      if (!Object.prototype.hasOwnProperty.call(b, keys[i])) return false;

		    for (i = length; i-- !== 0;) {
		      var key = keys[i];

		      if (!equal(a[key], b[key])) return false;
		    }

		    return true;
		  }

		  // true if both NaN, false otherwise
		  return a!==a && b!==b;
		};
		return fastDeepEqual;
	}

	var jsonSchemaTraverse = {exports: {}};

	var hasRequiredJsonSchemaTraverse;

	function requireJsonSchemaTraverse () {
		if (hasRequiredJsonSchemaTraverse) return jsonSchemaTraverse.exports;
		hasRequiredJsonSchemaTraverse = 1;

		var traverse = jsonSchemaTraverse.exports = function (schema, opts, cb) {
		  // Legacy support for v0.3.1 and earlier.
		  if (typeof opts == 'function') {
		    cb = opts;
		    opts = {};
		  }

		  cb = opts.cb || cb;
		  var pre = (typeof cb == 'function') ? cb : cb.pre || function() {};
		  var post = cb.post || function() {};

		  _traverse(opts, pre, post, schema, '', schema);
		};


		traverse.keywords = {
		  additionalItems: true,
		  items: true,
		  contains: true,
		  additionalProperties: true,
		  propertyNames: true,
		  not: true,
		  if: true,
		  then: true,
		  else: true
		};

		traverse.arrayKeywords = {
		  items: true,
		  allOf: true,
		  anyOf: true,
		  oneOf: true
		};

		traverse.propsKeywords = {
		  $defs: true,
		  definitions: true,
		  properties: true,
		  patternProperties: true,
		  dependencies: true
		};

		traverse.skipKeywords = {
		  default: true,
		  enum: true,
		  const: true,
		  required: true,
		  maximum: true,
		  minimum: true,
		  exclusiveMaximum: true,
		  exclusiveMinimum: true,
		  multipleOf: true,
		  maxLength: true,
		  minLength: true,
		  pattern: true,
		  format: true,
		  maxItems: true,
		  minItems: true,
		  uniqueItems: true,
		  maxProperties: true,
		  minProperties: true
		};


		function _traverse(opts, pre, post, schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex) {
		  if (schema && typeof schema == 'object' && !Array.isArray(schema)) {
		    pre(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
		    for (var key in schema) {
		      var sch = schema[key];
		      if (Array.isArray(sch)) {
		        if (key in traverse.arrayKeywords) {
		          for (var i=0; i<sch.length; i++)
		            _traverse(opts, pre, post, sch[i], jsonPtr + '/' + key + '/' + i, rootSchema, jsonPtr, key, schema, i);
		        }
		      } else if (key in traverse.propsKeywords) {
		        if (sch && typeof sch == 'object') {
		          for (var prop in sch)
		            _traverse(opts, pre, post, sch[prop], jsonPtr + '/' + key + '/' + escapeJsonPtr(prop), rootSchema, jsonPtr, key, schema, prop);
		        }
		      } else if (key in traverse.keywords || (opts.allKeys && !(key in traverse.skipKeywords))) {
		        _traverse(opts, pre, post, sch, jsonPtr + '/' + key, rootSchema, jsonPtr, key, schema);
		      }
		    }
		    post(schema, jsonPtr, rootSchema, parentJsonPtr, parentKeyword, parentSchema, keyIndex);
		  }
		}


		function escapeJsonPtr(str) {
		  return str.replace(/~/g, '~0').replace(/\//g, '~1');
		}
		return jsonSchemaTraverse.exports;
	}

	var hasRequiredResolve;

	function requireResolve () {
		if (hasRequiredResolve) return resolve;
		hasRequiredResolve = 1;
		Object.defineProperty(resolve, "__esModule", { value: true });
		resolve.getSchemaRefs = resolve.resolveUrl = resolve.normalizeId = resolve._getFullPath = resolve.getFullPath = resolve.inlineRef = void 0;
		const util_1 = requireUtil();
		const equal = requireFastDeepEqual();
		const traverse = requireJsonSchemaTraverse();
		// TODO refactor to use keyword definitions
		const SIMPLE_INLINED = new Set([
		    "type",
		    "format",
		    "pattern",
		    "maxLength",
		    "minLength",
		    "maxProperties",
		    "minProperties",
		    "maxItems",
		    "minItems",
		    "maximum",
		    "minimum",
		    "uniqueItems",
		    "multipleOf",
		    "required",
		    "enum",
		    "const",
		]);
		function inlineRef(schema, limit = true) {
		    if (typeof schema == "boolean")
		        return true;
		    if (limit === true)
		        return !hasRef(schema);
		    if (!limit)
		        return false;
		    return countKeys(schema) <= limit;
		}
		resolve.inlineRef = inlineRef;
		const REF_KEYWORDS = new Set([
		    "$ref",
		    "$recursiveRef",
		    "$recursiveAnchor",
		    "$dynamicRef",
		    "$dynamicAnchor",
		]);
		function hasRef(schema) {
		    for (const key in schema) {
		        if (REF_KEYWORDS.has(key))
		            return true;
		        const sch = schema[key];
		        if (Array.isArray(sch) && sch.some(hasRef))
		            return true;
		        if (typeof sch == "object" && hasRef(sch))
		            return true;
		    }
		    return false;
		}
		function countKeys(schema) {
		    let count = 0;
		    for (const key in schema) {
		        if (key === "$ref")
		            return Infinity;
		        count++;
		        if (SIMPLE_INLINED.has(key))
		            continue;
		        if (typeof schema[key] == "object") {
		            (0, util_1.eachItem)(schema[key], (sch) => (count += countKeys(sch)));
		        }
		        if (count === Infinity)
		            return Infinity;
		    }
		    return count;
		}
		function getFullPath(resolver, id = "", normalize) {
		    if (normalize !== false)
		        id = normalizeId(id);
		    const p = resolver.parse(id);
		    return _getFullPath(resolver, p);
		}
		resolve.getFullPath = getFullPath;
		function _getFullPath(resolver, p) {
		    const serialized = resolver.serialize(p);
		    return serialized.split("#")[0] + "#";
		}
		resolve._getFullPath = _getFullPath;
		const TRAILING_SLASH_HASH = /#\/?$/;
		function normalizeId(id) {
		    return id ? id.replace(TRAILING_SLASH_HASH, "") : "";
		}
		resolve.normalizeId = normalizeId;
		function resolveUrl(resolver, baseId, id) {
		    id = normalizeId(id);
		    return resolver.resolve(baseId, id);
		}
		resolve.resolveUrl = resolveUrl;
		const ANCHOR = /^[a-z_][-a-z0-9._]*$/i;
		function getSchemaRefs(schema, baseId) {
		    if (typeof schema == "boolean")
		        return {};
		    const { schemaId, uriResolver } = this.opts;
		    const schId = normalizeId(schema[schemaId] || baseId);
		    const baseIds = { "": schId };
		    const pathPrefix = getFullPath(uriResolver, schId, false);
		    const localRefs = {};
		    const schemaRefs = new Set();
		    traverse(schema, { allKeys: true }, (sch, jsonPtr, _, parentJsonPtr) => {
		        if (parentJsonPtr === undefined)
		            return;
		        const fullPath = pathPrefix + jsonPtr;
		        let innerBaseId = baseIds[parentJsonPtr];
		        if (typeof sch[schemaId] == "string")
		            innerBaseId = addRef.call(this, sch[schemaId]);
		        addAnchor.call(this, sch.$anchor);
		        addAnchor.call(this, sch.$dynamicAnchor);
		        baseIds[jsonPtr] = innerBaseId;
		        function addRef(ref) {
		            // eslint-disable-next-line @typescript-eslint/unbound-method
		            const _resolve = this.opts.uriResolver.resolve;
		            ref = normalizeId(innerBaseId ? _resolve(innerBaseId, ref) : ref);
		            if (schemaRefs.has(ref))
		                throw ambiguos(ref);
		            schemaRefs.add(ref);
		            let schOrRef = this.refs[ref];
		            if (typeof schOrRef == "string")
		                schOrRef = this.refs[schOrRef];
		            if (typeof schOrRef == "object") {
		                checkAmbiguosRef(sch, schOrRef.schema, ref);
		            }
		            else if (ref !== normalizeId(fullPath)) {
		                if (ref[0] === "#") {
		                    checkAmbiguosRef(sch, localRefs[ref], ref);
		                    localRefs[ref] = sch;
		                }
		                else {
		                    this.refs[ref] = fullPath;
		                }
		            }
		            return ref;
		        }
		        function addAnchor(anchor) {
		            if (typeof anchor == "string") {
		                if (!ANCHOR.test(anchor))
		                    throw new Error(`invalid anchor "${anchor}"`);
		                addRef.call(this, `#${anchor}`);
		            }
		        }
		    });
		    return localRefs;
		    function checkAmbiguosRef(sch1, sch2, ref) {
		        if (sch2 !== undefined && !equal(sch1, sch2))
		            throw ambiguos(ref);
		    }
		    function ambiguos(ref) {
		        return new Error(`reference "${ref}" resolves to more than one schema`);
		    }
		}
		resolve.getSchemaRefs = getSchemaRefs;
		
		return resolve;
	}

	var hasRequiredValidate;

	function requireValidate () {
		if (hasRequiredValidate) return validate;
		hasRequiredValidate = 1;
		Object.defineProperty(validate, "__esModule", { value: true });
		validate.getData = validate.KeywordCxt = validate.validateFunctionCode = void 0;
		const boolSchema_1 = requireBoolSchema();
		const dataType_1 = requireDataType();
		const applicability_1 = requireApplicability();
		const dataType_2 = requireDataType();
		const defaults_1 = requireDefaults();
		const keyword_1 = requireKeyword();
		const subschema_1 = requireSubschema();
		const codegen_1 = requireCodegen();
		const names_1 = requireNames();
		const resolve_1 = requireResolve();
		const util_1 = requireUtil();
		const errors_1 = requireErrors();
		// schema compilation - generates validation function, subschemaCode (below) is used for subschemas
		function validateFunctionCode(it) {
		    if (isSchemaObj(it)) {
		        checkKeywords(it);
		        if (schemaCxtHasRules(it)) {
		            topSchemaObjCode(it);
		            return;
		        }
		    }
		    validateFunction(it, () => (0, boolSchema_1.topBoolOrEmptySchema)(it));
		}
		validate.validateFunctionCode = validateFunctionCode;
		function validateFunction({ gen, validateName, schema, schemaEnv, opts }, body) {
		    if (opts.code.es5) {
		        gen.func(validateName, (0, codegen_1._) `${names_1.default.data}, ${names_1.default.valCxt}`, schemaEnv.$async, () => {
		            gen.code((0, codegen_1._) `"use strict"; ${funcSourceUrl(schema, opts)}`);
		            destructureValCxtES5(gen, opts);
		            gen.code(body);
		        });
		    }
		    else {
		        gen.func(validateName, (0, codegen_1._) `${names_1.default.data}, ${destructureValCxt(opts)}`, schemaEnv.$async, () => gen.code(funcSourceUrl(schema, opts)).code(body));
		    }
		}
		function destructureValCxt(opts) {
		    return (0, codegen_1._) `{${names_1.default.instancePath}="", ${names_1.default.parentData}, ${names_1.default.parentDataProperty}, ${names_1.default.rootData}=${names_1.default.data}${opts.dynamicRef ? (0, codegen_1._) `, ${names_1.default.dynamicAnchors}={}` : codegen_1.nil}}={}`;
		}
		function destructureValCxtES5(gen, opts) {
		    gen.if(names_1.default.valCxt, () => {
		        gen.var(names_1.default.instancePath, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.instancePath}`);
		        gen.var(names_1.default.parentData, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.parentData}`);
		        gen.var(names_1.default.parentDataProperty, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.parentDataProperty}`);
		        gen.var(names_1.default.rootData, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.rootData}`);
		        if (opts.dynamicRef)
		            gen.var(names_1.default.dynamicAnchors, (0, codegen_1._) `${names_1.default.valCxt}.${names_1.default.dynamicAnchors}`);
		    }, () => {
		        gen.var(names_1.default.instancePath, (0, codegen_1._) `""`);
		        gen.var(names_1.default.parentData, (0, codegen_1._) `undefined`);
		        gen.var(names_1.default.parentDataProperty, (0, codegen_1._) `undefined`);
		        gen.var(names_1.default.rootData, names_1.default.data);
		        if (opts.dynamicRef)
		            gen.var(names_1.default.dynamicAnchors, (0, codegen_1._) `{}`);
		    });
		}
		function topSchemaObjCode(it) {
		    const { schema, opts, gen } = it;
		    validateFunction(it, () => {
		        if (opts.$comment && schema.$comment)
		            commentKeyword(it);
		        checkNoDefault(it);
		        gen.let(names_1.default.vErrors, null);
		        gen.let(names_1.default.errors, 0);
		        if (opts.unevaluated)
		            resetEvaluated(it);
		        typeAndKeywords(it);
		        returnResults(it);
		    });
		    return;
		}
		function resetEvaluated(it) {
		    // TODO maybe some hook to execute it in the end to check whether props/items are Name, as in assignEvaluated
		    const { gen, validateName } = it;
		    it.evaluated = gen.const("evaluated", (0, codegen_1._) `${validateName}.evaluated`);
		    gen.if((0, codegen_1._) `${it.evaluated}.dynamicProps`, () => gen.assign((0, codegen_1._) `${it.evaluated}.props`, (0, codegen_1._) `undefined`));
		    gen.if((0, codegen_1._) `${it.evaluated}.dynamicItems`, () => gen.assign((0, codegen_1._) `${it.evaluated}.items`, (0, codegen_1._) `undefined`));
		}
		function funcSourceUrl(schema, opts) {
		    const schId = typeof schema == "object" && schema[opts.schemaId];
		    return schId && (opts.code.source || opts.code.process) ? (0, codegen_1._) `/*# sourceURL=${schId} */` : codegen_1.nil;
		}
		// schema compilation - this function is used recursively to generate code for sub-schemas
		function subschemaCode(it, valid) {
		    if (isSchemaObj(it)) {
		        checkKeywords(it);
		        if (schemaCxtHasRules(it)) {
		            subSchemaObjCode(it, valid);
		            return;
		        }
		    }
		    (0, boolSchema_1.boolOrEmptySchema)(it, valid);
		}
		function schemaCxtHasRules({ schema, self }) {
		    if (typeof schema == "boolean")
		        return !schema;
		    for (const key in schema)
		        if (self.RULES.all[key])
		            return true;
		    return false;
		}
		function isSchemaObj(it) {
		    return typeof it.schema != "boolean";
		}
		function subSchemaObjCode(it, valid) {
		    const { schema, gen, opts } = it;
		    if (opts.$comment && schema.$comment)
		        commentKeyword(it);
		    updateContext(it);
		    checkAsyncSchema(it);
		    const errsCount = gen.const("_errs", names_1.default.errors);
		    typeAndKeywords(it, errsCount);
		    // TODO var
		    gen.var(valid, (0, codegen_1._) `${errsCount} === ${names_1.default.errors}`);
		}
		function checkKeywords(it) {
		    (0, util_1.checkUnknownRules)(it);
		    checkRefsAndKeywords(it);
		}
		function typeAndKeywords(it, errsCount) {
		    if (it.opts.jtd)
		        return schemaKeywords(it, [], false, errsCount);
		    const types = (0, dataType_1.getSchemaTypes)(it.schema);
		    const checkedTypes = (0, dataType_1.coerceAndCheckDataType)(it, types);
		    schemaKeywords(it, types, !checkedTypes, errsCount);
		}
		function checkRefsAndKeywords(it) {
		    const { schema, errSchemaPath, opts, self } = it;
		    if (schema.$ref && opts.ignoreKeywordsWithRef && (0, util_1.schemaHasRulesButRef)(schema, self.RULES)) {
		        self.logger.warn(`$ref: keywords ignored in schema at path "${errSchemaPath}"`);
		    }
		}
		function checkNoDefault(it) {
		    const { schema, opts } = it;
		    if (schema.default !== undefined && opts.useDefaults && opts.strictSchema) {
		        (0, util_1.checkStrictMode)(it, "default is ignored in the schema root");
		    }
		}
		function updateContext(it) {
		    const schId = it.schema[it.opts.schemaId];
		    if (schId)
		        it.baseId = (0, resolve_1.resolveUrl)(it.opts.uriResolver, it.baseId, schId);
		}
		function checkAsyncSchema(it) {
		    if (it.schema.$async && !it.schemaEnv.$async)
		        throw new Error("async schema in sync schema");
		}
		function commentKeyword({ gen, schemaEnv, schema, errSchemaPath, opts }) {
		    const msg = schema.$comment;
		    if (opts.$comment === true) {
		        gen.code((0, codegen_1._) `${names_1.default.self}.logger.log(${msg})`);
		    }
		    else if (typeof opts.$comment == "function") {
		        const schemaPath = (0, codegen_1.str) `${errSchemaPath}/$comment`;
		        const rootName = gen.scopeValue("root", { ref: schemaEnv.root });
		        gen.code((0, codegen_1._) `${names_1.default.self}.opts.$comment(${msg}, ${schemaPath}, ${rootName}.schema)`);
		    }
		}
		function returnResults(it) {
		    const { gen, schemaEnv, validateName, ValidationError, opts } = it;
		    if (schemaEnv.$async) {
		        // TODO assign unevaluated
		        gen.if((0, codegen_1._) `${names_1.default.errors} === 0`, () => gen.return(names_1.default.data), () => gen.throw((0, codegen_1._) `new ${ValidationError}(${names_1.default.vErrors})`));
		    }
		    else {
		        gen.assign((0, codegen_1._) `${validateName}.errors`, names_1.default.vErrors);
		        if (opts.unevaluated)
		            assignEvaluated(it);
		        gen.return((0, codegen_1._) `${names_1.default.errors} === 0`);
		    }
		}
		function assignEvaluated({ gen, evaluated, props, items }) {
		    if (props instanceof codegen_1.Name)
		        gen.assign((0, codegen_1._) `${evaluated}.props`, props);
		    if (items instanceof codegen_1.Name)
		        gen.assign((0, codegen_1._) `${evaluated}.items`, items);
		}
		function schemaKeywords(it, types, typeErrors, errsCount) {
		    const { gen, schema, data, allErrors, opts, self } = it;
		    const { RULES } = self;
		    if (schema.$ref && (opts.ignoreKeywordsWithRef || !(0, util_1.schemaHasRulesButRef)(schema, RULES))) {
		        gen.block(() => keywordCode(it, "$ref", RULES.all.$ref.definition)); // TODO typecast
		        return;
		    }
		    if (!opts.jtd)
		        checkStrictTypes(it, types);
		    gen.block(() => {
		        for (const group of RULES.rules)
		            groupKeywords(group);
		        groupKeywords(RULES.post);
		    });
		    function groupKeywords(group) {
		        if (!(0, applicability_1.shouldUseGroup)(schema, group))
		            return;
		        if (group.type) {
		            gen.if((0, dataType_2.checkDataType)(group.type, data, opts.strictNumbers));
		            iterateKeywords(it, group);
		            if (types.length === 1 && types[0] === group.type && typeErrors) {
		                gen.else();
		                (0, dataType_2.reportTypeError)(it);
		            }
		            gen.endIf();
		        }
		        else {
		            iterateKeywords(it, group);
		        }
		        // TODO make it "ok" call?
		        if (!allErrors)
		            gen.if((0, codegen_1._) `${names_1.default.errors} === ${errsCount || 0}`);
		    }
		}
		function iterateKeywords(it, group) {
		    const { gen, schema, opts: { useDefaults }, } = it;
		    if (useDefaults)
		        (0, defaults_1.assignDefaults)(it, group.type);
		    gen.block(() => {
		        for (const rule of group.rules) {
		            if ((0, applicability_1.shouldUseRule)(schema, rule)) {
		                keywordCode(it, rule.keyword, rule.definition, group.type);
		            }
		        }
		    });
		}
		function checkStrictTypes(it, types) {
		    if (it.schemaEnv.meta || !it.opts.strictTypes)
		        return;
		    checkContextTypes(it, types);
		    if (!it.opts.allowUnionTypes)
		        checkMultipleTypes(it, types);
		    checkKeywordTypes(it, it.dataTypes);
		}
		function checkContextTypes(it, types) {
		    if (!types.length)
		        return;
		    if (!it.dataTypes.length) {
		        it.dataTypes = types;
		        return;
		    }
		    types.forEach((t) => {
		        if (!includesType(it.dataTypes, t)) {
		            strictTypesError(it, `type "${t}" not allowed by context "${it.dataTypes.join(",")}"`);
		        }
		    });
		    narrowSchemaTypes(it, types);
		}
		function checkMultipleTypes(it, ts) {
		    if (ts.length > 1 && !(ts.length === 2 && ts.includes("null"))) {
		        strictTypesError(it, "use allowUnionTypes to allow union type keyword");
		    }
		}
		function checkKeywordTypes(it, ts) {
		    const rules = it.self.RULES.all;
		    for (const keyword in rules) {
		        const rule = rules[keyword];
		        if (typeof rule == "object" && (0, applicability_1.shouldUseRule)(it.schema, rule)) {
		            const { type } = rule.definition;
		            if (type.length && !type.some((t) => hasApplicableType(ts, t))) {
		                strictTypesError(it, `missing type "${type.join(",")}" for keyword "${keyword}"`);
		            }
		        }
		    }
		}
		function hasApplicableType(schTs, kwdT) {
		    return schTs.includes(kwdT) || (kwdT === "number" && schTs.includes("integer"));
		}
		function includesType(ts, t) {
		    return ts.includes(t) || (t === "integer" && ts.includes("number"));
		}
		function narrowSchemaTypes(it, withTypes) {
		    const ts = [];
		    for (const t of it.dataTypes) {
		        if (includesType(withTypes, t))
		            ts.push(t);
		        else if (withTypes.includes("integer") && t === "number")
		            ts.push("integer");
		    }
		    it.dataTypes = ts;
		}
		function strictTypesError(it, msg) {
		    const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
		    msg += ` at "${schemaPath}" (strictTypes)`;
		    (0, util_1.checkStrictMode)(it, msg, it.opts.strictTypes);
		}
		class KeywordCxt {
		    constructor(it, def, keyword) {
		        (0, keyword_1.validateKeywordUsage)(it, def, keyword);
		        this.gen = it.gen;
		        this.allErrors = it.allErrors;
		        this.keyword = keyword;
		        this.data = it.data;
		        this.schema = it.schema[keyword];
		        this.$data = def.$data && it.opts.$data && this.schema && this.schema.$data;
		        this.schemaValue = (0, util_1.schemaRefOrVal)(it, this.schema, keyword, this.$data);
		        this.schemaType = def.schemaType;
		        this.parentSchema = it.schema;
		        this.params = {};
		        this.it = it;
		        this.def = def;
		        if (this.$data) {
		            this.schemaCode = it.gen.const("vSchema", getData(this.$data, it));
		        }
		        else {
		            this.schemaCode = this.schemaValue;
		            if (!(0, keyword_1.validSchemaType)(this.schema, def.schemaType, def.allowUndefined)) {
		                throw new Error(`${keyword} value must be ${JSON.stringify(def.schemaType)}`);
		            }
		        }
		        if ("code" in def ? def.trackErrors : def.errors !== false) {
		            this.errsCount = it.gen.const("_errs", names_1.default.errors);
		        }
		    }
		    result(condition, successAction, failAction) {
		        this.failResult((0, codegen_1.not)(condition), successAction, failAction);
		    }
		    failResult(condition, successAction, failAction) {
		        this.gen.if(condition);
		        if (failAction)
		            failAction();
		        else
		            this.error();
		        if (successAction) {
		            this.gen.else();
		            successAction();
		            if (this.allErrors)
		                this.gen.endIf();
		        }
		        else {
		            if (this.allErrors)
		                this.gen.endIf();
		            else
		                this.gen.else();
		        }
		    }
		    pass(condition, failAction) {
		        this.failResult((0, codegen_1.not)(condition), undefined, failAction);
		    }
		    fail(condition) {
		        if (condition === undefined) {
		            this.error();
		            if (!this.allErrors)
		                this.gen.if(false); // this branch will be removed by gen.optimize
		            return;
		        }
		        this.gen.if(condition);
		        this.error();
		        if (this.allErrors)
		            this.gen.endIf();
		        else
		            this.gen.else();
		    }
		    fail$data(condition) {
		        if (!this.$data)
		            return this.fail(condition);
		        const { schemaCode } = this;
		        this.fail((0, codegen_1._) `${schemaCode} !== undefined && (${(0, codegen_1.or)(this.invalid$data(), condition)})`);
		    }
		    error(append, errorParams, errorPaths) {
		        if (errorParams) {
		            this.setParams(errorParams);
		            this._error(append, errorPaths);
		            this.setParams({});
		            return;
		        }
		        this._error(append, errorPaths);
		    }
		    _error(append, errorPaths) {
		        (append ? errors_1.reportExtraError : errors_1.reportError)(this, this.def.error, errorPaths);
		    }
		    $dataError() {
		        (0, errors_1.reportError)(this, this.def.$dataError || errors_1.keyword$DataError);
		    }
		    reset() {
		        if (this.errsCount === undefined)
		            throw new Error('add "trackErrors" to keyword definition');
		        (0, errors_1.resetErrorsCount)(this.gen, this.errsCount);
		    }
		    ok(cond) {
		        if (!this.allErrors)
		            this.gen.if(cond);
		    }
		    setParams(obj, assign) {
		        if (assign)
		            Object.assign(this.params, obj);
		        else
		            this.params = obj;
		    }
		    block$data(valid, codeBlock, $dataValid = codegen_1.nil) {
		        this.gen.block(() => {
		            this.check$data(valid, $dataValid);
		            codeBlock();
		        });
		    }
		    check$data(valid = codegen_1.nil, $dataValid = codegen_1.nil) {
		        if (!this.$data)
		            return;
		        const { gen, schemaCode, schemaType, def } = this;
		        gen.if((0, codegen_1.or)((0, codegen_1._) `${schemaCode} === undefined`, $dataValid));
		        if (valid !== codegen_1.nil)
		            gen.assign(valid, true);
		        if (schemaType.length || def.validateSchema) {
		            gen.elseIf(this.invalid$data());
		            this.$dataError();
		            if (valid !== codegen_1.nil)
		                gen.assign(valid, false);
		        }
		        gen.else();
		    }
		    invalid$data() {
		        const { gen, schemaCode, schemaType, def, it } = this;
		        return (0, codegen_1.or)(wrong$DataType(), invalid$DataSchema());
		        function wrong$DataType() {
		            if (schemaType.length) {
		                /* istanbul ignore if */
		                if (!(schemaCode instanceof codegen_1.Name))
		                    throw new Error("ajv implementation error");
		                const st = Array.isArray(schemaType) ? schemaType : [schemaType];
		                return (0, codegen_1._) `${(0, dataType_2.checkDataTypes)(st, schemaCode, it.opts.strictNumbers, dataType_2.DataType.Wrong)}`;
		            }
		            return codegen_1.nil;
		        }
		        function invalid$DataSchema() {
		            if (def.validateSchema) {
		                const validateSchemaRef = gen.scopeValue("validate$data", { ref: def.validateSchema }); // TODO value.code for standalone
		                return (0, codegen_1._) `!${validateSchemaRef}(${schemaCode})`;
		            }
		            return codegen_1.nil;
		        }
		    }
		    subschema(appl, valid) {
		        const subschema = (0, subschema_1.getSubschema)(this.it, appl);
		        (0, subschema_1.extendSubschemaData)(subschema, this.it, appl);
		        (0, subschema_1.extendSubschemaMode)(subschema, appl);
		        const nextContext = { ...this.it, ...subschema, items: undefined, props: undefined };
		        subschemaCode(nextContext, valid);
		        return nextContext;
		    }
		    mergeEvaluated(schemaCxt, toName) {
		        const { it, gen } = this;
		        if (!it.opts.unevaluated)
		            return;
		        if (it.props !== true && schemaCxt.props !== undefined) {
		            it.props = util_1.mergeEvaluated.props(gen, schemaCxt.props, it.props, toName);
		        }
		        if (it.items !== true && schemaCxt.items !== undefined) {
		            it.items = util_1.mergeEvaluated.items(gen, schemaCxt.items, it.items, toName);
		        }
		    }
		    mergeValidEvaluated(schemaCxt, valid) {
		        const { it, gen } = this;
		        if (it.opts.unevaluated && (it.props !== true || it.items !== true)) {
		            gen.if(valid, () => this.mergeEvaluated(schemaCxt, codegen_1.Name));
		            return true;
		        }
		    }
		}
		validate.KeywordCxt = KeywordCxt;
		function keywordCode(it, keyword, def, ruleType) {
		    const cxt = new KeywordCxt(it, def, keyword);
		    if ("code" in def) {
		        def.code(cxt, ruleType);
		    }
		    else if (cxt.$data && def.validate) {
		        (0, keyword_1.funcKeywordCode)(cxt, def);
		    }
		    else if ("macro" in def) {
		        (0, keyword_1.macroKeywordCode)(cxt, def);
		    }
		    else if (def.compile || def.validate) {
		        (0, keyword_1.funcKeywordCode)(cxt, def);
		    }
		}
		const JSON_POINTER = /^\/(?:[^~]|~0|~1)*$/;
		const RELATIVE_JSON_POINTER = /^([0-9]+)(#|\/(?:[^~]|~0|~1)*)?$/;
		function getData($data, { dataLevel, dataNames, dataPathArr }) {
		    let jsonPointer;
		    let data;
		    if ($data === "")
		        return names_1.default.rootData;
		    if ($data[0] === "/") {
		        if (!JSON_POINTER.test($data))
		            throw new Error(`Invalid JSON-pointer: ${$data}`);
		        jsonPointer = $data;
		        data = names_1.default.rootData;
		    }
		    else {
		        const matches = RELATIVE_JSON_POINTER.exec($data);
		        if (!matches)
		            throw new Error(`Invalid JSON-pointer: ${$data}`);
		        const up = +matches[1];
		        jsonPointer = matches[2];
		        if (jsonPointer === "#") {
		            if (up >= dataLevel)
		                throw new Error(errorMsg("property/index", up));
		            return dataPathArr[dataLevel - up];
		        }
		        if (up > dataLevel)
		            throw new Error(errorMsg("data", up));
		        data = dataNames[dataLevel - up];
		        if (!jsonPointer)
		            return data;
		    }
		    let expr = data;
		    const segments = jsonPointer.split("/");
		    for (const segment of segments) {
		        if (segment) {
		            data = (0, codegen_1._) `${data}${(0, codegen_1.getProperty)((0, util_1.unescapeJsonPointer)(segment))}`;
		            expr = (0, codegen_1._) `${expr} && ${data}`;
		        }
		    }
		    return expr;
		    function errorMsg(pointerType, up) {
		        return `Cannot access ${pointerType} ${up} levels up, current level is ${dataLevel}`;
		    }
		}
		validate.getData = getData;
		
		return validate;
	}

	var validation_error = {};

	var hasRequiredValidation_error;

	function requireValidation_error () {
		if (hasRequiredValidation_error) return validation_error;
		hasRequiredValidation_error = 1;
		Object.defineProperty(validation_error, "__esModule", { value: true });
		class ValidationError extends Error {
		    constructor(errors) {
		        super("validation failed");
		        this.errors = errors;
		        this.ajv = this.validation = true;
		    }
		}
		validation_error.default = ValidationError;
		
		return validation_error;
	}

	var ref_error = {};

	var hasRequiredRef_error;

	function requireRef_error () {
		if (hasRequiredRef_error) return ref_error;
		hasRequiredRef_error = 1;
		Object.defineProperty(ref_error, "__esModule", { value: true });
		const resolve_1 = requireResolve();
		class MissingRefError extends Error {
		    constructor(resolver, baseId, ref, msg) {
		        super(msg || `can't resolve reference ${ref} from id ${baseId}`);
		        this.missingRef = (0, resolve_1.resolveUrl)(resolver, baseId, ref);
		        this.missingSchema = (0, resolve_1.normalizeId)((0, resolve_1.getFullPath)(resolver, this.missingRef));
		    }
		}
		ref_error.default = MissingRefError;
		
		return ref_error;
	}

	var compile = {};

	var hasRequiredCompile;

	function requireCompile () {
		if (hasRequiredCompile) return compile;
		hasRequiredCompile = 1;
		Object.defineProperty(compile, "__esModule", { value: true });
		compile.resolveSchema = compile.getCompilingSchema = compile.resolveRef = compile.compileSchema = compile.SchemaEnv = void 0;
		const codegen_1 = requireCodegen();
		const validation_error_1 = requireValidation_error();
		const names_1 = requireNames();
		const resolve_1 = requireResolve();
		const util_1 = requireUtil();
		const validate_1 = requireValidate();
		class SchemaEnv {
		    constructor(env) {
		        var _a;
		        this.refs = {};
		        this.dynamicAnchors = {};
		        let schema;
		        if (typeof env.schema == "object")
		            schema = env.schema;
		        this.schema = env.schema;
		        this.schemaId = env.schemaId;
		        this.root = env.root || this;
		        this.baseId = (_a = env.baseId) !== null && _a !== void 0 ? _a : (0, resolve_1.normalizeId)(schema === null || schema === void 0 ? void 0 : schema[env.schemaId || "$id"]);
		        this.schemaPath = env.schemaPath;
		        this.localRefs = env.localRefs;
		        this.meta = env.meta;
		        this.$async = schema === null || schema === void 0 ? void 0 : schema.$async;
		        this.refs = {};
		    }
		}
		compile.SchemaEnv = SchemaEnv;
		// let codeSize = 0
		// let nodeCount = 0
		// Compiles schema in SchemaEnv
		function compileSchema(sch) {
		    // TODO refactor - remove compilations
		    const _sch = getCompilingSchema.call(this, sch);
		    if (_sch)
		        return _sch;
		    const rootId = (0, resolve_1.getFullPath)(this.opts.uriResolver, sch.root.baseId); // TODO if getFullPath removed 1 tests fails
		    const { es5, lines } = this.opts.code;
		    const { ownProperties } = this.opts;
		    const gen = new codegen_1.CodeGen(this.scope, { es5, lines, ownProperties });
		    let _ValidationError;
		    if (sch.$async) {
		        _ValidationError = gen.scopeValue("Error", {
		            ref: validation_error_1.default,
		            code: (0, codegen_1._) `require("ajv/dist/runtime/validation_error").default`,
		        });
		    }
		    const validateName = gen.scopeName("validate");
		    sch.validateName = validateName;
		    const schemaCxt = {
		        gen,
		        allErrors: this.opts.allErrors,
		        data: names_1.default.data,
		        parentData: names_1.default.parentData,
		        parentDataProperty: names_1.default.parentDataProperty,
		        dataNames: [names_1.default.data],
		        dataPathArr: [codegen_1.nil], // TODO can its length be used as dataLevel if nil is removed?
		        dataLevel: 0,
		        dataTypes: [],
		        definedProperties: new Set(),
		        topSchemaRef: gen.scopeValue("schema", this.opts.code.source === true
		            ? { ref: sch.schema, code: (0, codegen_1.stringify)(sch.schema) }
		            : { ref: sch.schema }),
		        validateName,
		        ValidationError: _ValidationError,
		        schema: sch.schema,
		        schemaEnv: sch,
		        rootId,
		        baseId: sch.baseId || rootId,
		        schemaPath: codegen_1.nil,
		        errSchemaPath: sch.schemaPath || (this.opts.jtd ? "" : "#"),
		        errorPath: (0, codegen_1._) `""`,
		        opts: this.opts,
		        self: this,
		    };
		    let sourceCode;
		    try {
		        this._compilations.add(sch);
		        (0, validate_1.validateFunctionCode)(schemaCxt);
		        gen.optimize(this.opts.code.optimize);
		        // gen.optimize(1)
		        const validateCode = gen.toString();
		        sourceCode = `${gen.scopeRefs(names_1.default.scope)}return ${validateCode}`;
		        // console.log((codeSize += sourceCode.length), (nodeCount += gen.nodeCount))
		        if (this.opts.code.process)
		            sourceCode = this.opts.code.process(sourceCode, sch);
		        // console.log("\n\n\n *** \n", sourceCode)
		        const makeValidate = new Function(`${names_1.default.self}`, `${names_1.default.scope}`, sourceCode);
		        const validate = makeValidate(this, this.scope.get());
		        this.scope.value(validateName, { ref: validate });
		        validate.errors = null;
		        validate.schema = sch.schema;
		        validate.schemaEnv = sch;
		        if (sch.$async)
		            validate.$async = true;
		        if (this.opts.code.source === true) {
		            validate.source = { validateName, validateCode, scopeValues: gen._values };
		        }
		        if (this.opts.unevaluated) {
		            const { props, items } = schemaCxt;
		            validate.evaluated = {
		                props: props instanceof codegen_1.Name ? undefined : props,
		                items: items instanceof codegen_1.Name ? undefined : items,
		                dynamicProps: props instanceof codegen_1.Name,
		                dynamicItems: items instanceof codegen_1.Name,
		            };
		            if (validate.source)
		                validate.source.evaluated = (0, codegen_1.stringify)(validate.evaluated);
		        }
		        sch.validate = validate;
		        return sch;
		    }
		    catch (e) {
		        delete sch.validate;
		        delete sch.validateName;
		        if (sourceCode)
		            this.logger.error("Error compiling schema, function code:", sourceCode);
		        // console.log("\n\n\n *** \n", sourceCode, this.opts)
		        throw e;
		    }
		    finally {
		        this._compilations.delete(sch);
		    }
		}
		compile.compileSchema = compileSchema;
		function resolveRef(root, baseId, ref) {
		    var _a;
		    ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, ref);
		    const schOrFunc = root.refs[ref];
		    if (schOrFunc)
		        return schOrFunc;
		    let _sch = resolve.call(this, root, ref);
		    if (_sch === undefined) {
		        const schema = (_a = root.localRefs) === null || _a === void 0 ? void 0 : _a[ref]; // TODO maybe localRefs should hold SchemaEnv
		        const { schemaId } = this.opts;
		        if (schema)
		            _sch = new SchemaEnv({ schema, schemaId, root, baseId });
		    }
		    if (_sch === undefined)
		        return;
		    return (root.refs[ref] = inlineOrCompile.call(this, _sch));
		}
		compile.resolveRef = resolveRef;
		function inlineOrCompile(sch) {
		    if ((0, resolve_1.inlineRef)(sch.schema, this.opts.inlineRefs))
		        return sch.schema;
		    return sch.validate ? sch : compileSchema.call(this, sch);
		}
		// Index of schema compilation in the currently compiled list
		function getCompilingSchema(schEnv) {
		    for (const sch of this._compilations) {
		        if (sameSchemaEnv(sch, schEnv))
		            return sch;
		    }
		}
		compile.getCompilingSchema = getCompilingSchema;
		function sameSchemaEnv(s1, s2) {
		    return s1.schema === s2.schema && s1.root === s2.root && s1.baseId === s2.baseId;
		}
		// resolve and compile the references ($ref)
		// TODO returns AnySchemaObject (if the schema can be inlined) or validation function
		function resolve(root, // information about the root schema for the current schema
		ref // reference to resolve
		) {
		    let sch;
		    while (typeof (sch = this.refs[ref]) == "string")
		        ref = sch;
		    return sch || this.schemas[ref] || resolveSchema.call(this, root, ref);
		}
		// Resolve schema, its root and baseId
		function resolveSchema(root, // root object with properties schema, refs TODO below SchemaEnv is assigned to it
		ref // reference to resolve
		) {
		    const p = this.opts.uriResolver.parse(ref);
		    const refPath = (0, resolve_1._getFullPath)(this.opts.uriResolver, p);
		    let baseId = (0, resolve_1.getFullPath)(this.opts.uriResolver, root.baseId, undefined);
		    // TODO `Object.keys(root.schema).length > 0` should not be needed - but removing breaks 2 tests
		    if (Object.keys(root.schema).length > 0 && refPath === baseId) {
		        return getJsonPointer.call(this, p, root);
		    }
		    const id = (0, resolve_1.normalizeId)(refPath);
		    const schOrRef = this.refs[id] || this.schemas[id];
		    if (typeof schOrRef == "string") {
		        const sch = resolveSchema.call(this, root, schOrRef);
		        if (typeof (sch === null || sch === void 0 ? void 0 : sch.schema) !== "object")
		            return;
		        return getJsonPointer.call(this, p, sch);
		    }
		    if (typeof (schOrRef === null || schOrRef === void 0 ? void 0 : schOrRef.schema) !== "object")
		        return;
		    if (!schOrRef.validate)
		        compileSchema.call(this, schOrRef);
		    if (id === (0, resolve_1.normalizeId)(ref)) {
		        const { schema } = schOrRef;
		        const { schemaId } = this.opts;
		        const schId = schema[schemaId];
		        if (schId)
		            baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
		        return new SchemaEnv({ schema, schemaId, root, baseId });
		    }
		    return getJsonPointer.call(this, p, schOrRef);
		}
		compile.resolveSchema = resolveSchema;
		const PREVENT_SCOPE_CHANGE = new Set([
		    "properties",
		    "patternProperties",
		    "enum",
		    "dependencies",
		    "definitions",
		]);
		function getJsonPointer(parsedRef, { baseId, schema, root }) {
		    var _a;
		    if (((_a = parsedRef.fragment) === null || _a === void 0 ? void 0 : _a[0]) !== "/")
		        return;
		    for (const part of parsedRef.fragment.slice(1).split("/")) {
		        if (typeof schema === "boolean")
		            return;
		        const partSchema = schema[(0, util_1.unescapeFragment)(part)];
		        if (partSchema === undefined)
		            return;
		        schema = partSchema;
		        // TODO PREVENT_SCOPE_CHANGE could be defined in keyword def?
		        const schId = typeof schema === "object" && schema[this.opts.schemaId];
		        if (!PREVENT_SCOPE_CHANGE.has(part) && schId) {
		            baseId = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schId);
		        }
		    }
		    let env;
		    if (typeof schema != "boolean" && schema.$ref && !(0, util_1.schemaHasRulesButRef)(schema, this.RULES)) {
		        const $ref = (0, resolve_1.resolveUrl)(this.opts.uriResolver, baseId, schema.$ref);
		        env = resolveSchema.call(this, root, $ref);
		    }
		    // even though resolution failed we need to return SchemaEnv to throw exception
		    // so that compileAsync loads missing schema.
		    const { schemaId } = this.opts;
		    env = env || new SchemaEnv({ schema, schemaId, root, baseId });
		    if (env.schema !== env.root.schema)
		        return env;
		    return undefined;
		}
		
		return compile;
	}

	var $id$1 = "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#";
	var description = "Meta-schema for $data reference (JSON AnySchema extension proposal)";
	var type$1 = "object";
	var required$1 = [
		"$data"
	];
	var properties$2 = {
		$data: {
			type: "string",
			anyOf: [
				{
					format: "relative-json-pointer"
				},
				{
					format: "json-pointer"
				}
			]
		}
	};
	var additionalProperties$1 = false;
	var require$$9 = {
		$id: $id$1,
		description: description,
		type: type$1,
		required: required$1,
		properties: properties$2,
		additionalProperties: additionalProperties$1
	};

	var uri = {};

	var fastUri = {exports: {}};

	var utils;
	var hasRequiredUtils;

	function requireUtils () {
		if (hasRequiredUtils) return utils;
		hasRequiredUtils = 1;

		/** @type {(value: string) => boolean} */
		const isUUID = RegExp.prototype.test.bind(/^[\da-f]{8}-[\da-f]{4}-[\da-f]{4}-[\da-f]{4}-[\da-f]{12}$/iu);

		/** @type {(value: string) => boolean} */
		const isIPv4 = RegExp.prototype.test.bind(/^(?:(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d{2}|[1-9]\d|\d)$/u);

		/**
		 * @param {Array<string>} input
		 * @returns {string}
		 */
		function stringArrayToHexStripped (input) {
		  let acc = '';
		  let code = 0;
		  let i = 0;

		  for (i = 0; i < input.length; i++) {
		    code = input[i].charCodeAt(0);
		    if (code === 48) {
		      continue
		    }
		    if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102))) {
		      return ''
		    }
		    acc += input[i];
		    break
		  }

		  for (i += 1; i < input.length; i++) {
		    code = input[i].charCodeAt(0);
		    if (!((code >= 48 && code <= 57) || (code >= 65 && code <= 70) || (code >= 97 && code <= 102))) {
		      return ''
		    }
		    acc += input[i];
		  }
		  return acc
		}

		/**
		 * @typedef {Object} GetIPV6Result
		 * @property {boolean} error - Indicates if there was an error parsing the IPv6 address.
		 * @property {string} address - The parsed IPv6 address.
		 * @property {string} [zone] - The zone identifier, if present.
		 */

		/**
		 * @param {string} value
		 * @returns {boolean}
		 */
		const nonSimpleDomain = RegExp.prototype.test.bind(/[^!"$&'()*+,\-.;=_`a-z{}~]/u);

		/**
		 * @param {Array<string>} buffer
		 * @returns {boolean}
		 */
		function consumeIsZone (buffer) {
		  buffer.length = 0;
		  return true
		}

		/**
		 * @param {Array<string>} buffer
		 * @param {Array<string>} address
		 * @param {GetIPV6Result} output
		 * @returns {boolean}
		 */
		function consumeHextets (buffer, address, output) {
		  if (buffer.length) {
		    const hex = stringArrayToHexStripped(buffer);
		    if (hex !== '') {
		      address.push(hex);
		    } else {
		      output.error = true;
		      return false
		    }
		    buffer.length = 0;
		  }
		  return true
		}

		/**
		 * @param {string} input
		 * @returns {GetIPV6Result}
		 */
		function getIPV6 (input) {
		  let tokenCount = 0;
		  const output = { error: false, address: '', zone: '' };
		  /** @type {Array<string>} */
		  const address = [];
		  /** @type {Array<string>} */
		  const buffer = [];
		  let endipv6Encountered = false;
		  let endIpv6 = false;

		  let consume = consumeHextets;

		  for (let i = 0; i < input.length; i++) {
		    const cursor = input[i];
		    if (cursor === '[' || cursor === ']') { continue }
		    if (cursor === ':') {
		      if (endipv6Encountered === true) {
		        endIpv6 = true;
		      }
		      if (!consume(buffer, address, output)) { break }
		      if (++tokenCount > 7) {
		        // not valid
		        output.error = true;
		        break
		      }
		      if (i > 0 && input[i - 1] === ':') {
		        endipv6Encountered = true;
		      }
		      address.push(':');
		      continue
		    } else if (cursor === '%') {
		      if (!consume(buffer, address, output)) { break }
		      // switch to zone detection
		      consume = consumeIsZone;
		    } else {
		      buffer.push(cursor);
		      continue
		    }
		  }
		  if (buffer.length) {
		    if (consume === consumeIsZone) {
		      output.zone = buffer.join('');
		    } else if (endIpv6) {
		      address.push(buffer.join(''));
		    } else {
		      address.push(stringArrayToHexStripped(buffer));
		    }
		  }
		  output.address = address.join('');
		  return output
		}

		/**
		 * @typedef {Object} NormalizeIPv6Result
		 * @property {string} host - The normalized host.
		 * @property {string} [escapedHost] - The escaped host.
		 * @property {boolean} isIPV6 - Indicates if the host is an IPv6 address.
		 */

		/**
		 * @param {string} host
		 * @returns {NormalizeIPv6Result}
		 */
		function normalizeIPv6 (host) {
		  if (findToken(host, ':') < 2) { return { host, isIPV6: false } }
		  const ipv6 = getIPV6(host);

		  if (!ipv6.error) {
		    let newHost = ipv6.address;
		    let escapedHost = ipv6.address;
		    if (ipv6.zone) {
		      newHost += '%' + ipv6.zone;
		      escapedHost += '%25' + ipv6.zone;
		    }
		    return { host: newHost, isIPV6: true, escapedHost }
		  } else {
		    return { host, isIPV6: false }
		  }
		}

		/**
		 * @param {string} str
		 * @param {string} token
		 * @returns {number}
		 */
		function findToken (str, token) {
		  let ind = 0;
		  for (let i = 0; i < str.length; i++) {
		    if (str[i] === token) ind++;
		  }
		  return ind
		}

		/**
		 * @param {string} path
		 * @returns {string}
		 *
		 * @see https://datatracker.ietf.org/doc/html/rfc3986#section-5.2.4
		 */
		function removeDotSegments (path) {
		  let input = path;
		  const output = [];
		  let nextSlash = -1;
		  let len = 0;

		  // eslint-disable-next-line no-cond-assign
		  while (len = input.length) {
		    if (len === 1) {
		      if (input === '.') {
		        break
		      } else if (input === '/') {
		        output.push('/');
		        break
		      } else {
		        output.push(input);
		        break
		      }
		    } else if (len === 2) {
		      if (input[0] === '.') {
		        if (input[1] === '.') {
		          break
		        } else if (input[1] === '/') {
		          input = input.slice(2);
		          continue
		        }
		      } else if (input[0] === '/') {
		        if (input[1] === '.' || input[1] === '/') {
		          output.push('/');
		          break
		        }
		      }
		    } else if (len === 3) {
		      if (input === '/..') {
		        if (output.length !== 0) {
		          output.pop();
		        }
		        output.push('/');
		        break
		      }
		    }
		    if (input[0] === '.') {
		      if (input[1] === '.') {
		        if (input[2] === '/') {
		          input = input.slice(3);
		          continue
		        }
		      } else if (input[1] === '/') {
		        input = input.slice(2);
		        continue
		      }
		    } else if (input[0] === '/') {
		      if (input[1] === '.') {
		        if (input[2] === '/') {
		          input = input.slice(2);
		          continue
		        } else if (input[2] === '.') {
		          if (input[3] === '/') {
		            input = input.slice(3);
		            if (output.length !== 0) {
		              output.pop();
		            }
		            continue
		          }
		        }
		      }
		    }

		    // Rule 2E: Move normal path segment to output
		    if ((nextSlash = input.indexOf('/', 1)) === -1) {
		      output.push(input);
		      break
		    } else {
		      output.push(input.slice(0, nextSlash));
		      input = input.slice(nextSlash);
		    }
		  }

		  return output.join('')
		}

		/**
		 * @param {import('../types/index').URIComponent} component
		 * @param {boolean} esc
		 * @returns {import('../types/index').URIComponent}
		 */
		function normalizeComponentEncoding (component, esc) {
		  const func = esc !== true ? escape : unescape;
		  if (component.scheme !== undefined) {
		    component.scheme = func(component.scheme);
		  }
		  if (component.userinfo !== undefined) {
		    component.userinfo = func(component.userinfo);
		  }
		  if (component.host !== undefined) {
		    component.host = func(component.host);
		  }
		  if (component.path !== undefined) {
		    component.path = func(component.path);
		  }
		  if (component.query !== undefined) {
		    component.query = func(component.query);
		  }
		  if (component.fragment !== undefined) {
		    component.fragment = func(component.fragment);
		  }
		  return component
		}

		/**
		 * @param {import('../types/index').URIComponent} component
		 * @returns {string|undefined}
		 */
		function recomposeAuthority (component) {
		  const uriTokens = [];

		  if (component.userinfo !== undefined) {
		    uriTokens.push(component.userinfo);
		    uriTokens.push('@');
		  }

		  if (component.host !== undefined) {
		    let host = unescape(component.host);
		    if (!isIPv4(host)) {
		      const ipV6res = normalizeIPv6(host);
		      if (ipV6res.isIPV6 === true) {
		        host = `[${ipV6res.escapedHost}]`;
		      } else {
		        host = component.host;
		      }
		    }
		    uriTokens.push(host);
		  }

		  if (typeof component.port === 'number' || typeof component.port === 'string') {
		    uriTokens.push(':');
		    uriTokens.push(String(component.port));
		  }

		  return uriTokens.length ? uriTokens.join('') : undefined
		}
		utils = {
		  nonSimpleDomain,
		  recomposeAuthority,
		  normalizeComponentEncoding,
		  removeDotSegments,
		  isIPv4,
		  isUUID,
		  normalizeIPv6,
		  stringArrayToHexStripped
		};
		return utils;
	}

	var schemes;
	var hasRequiredSchemes;

	function requireSchemes () {
		if (hasRequiredSchemes) return schemes;
		hasRequiredSchemes = 1;

		const { isUUID } = requireUtils();
		const URN_REG = /([\da-z][\d\-a-z]{0,31}):((?:[\w!$'()*+,\-.:;=@]|%[\da-f]{2})+)/iu;

		const supportedSchemeNames = /** @type {const} */ (['http', 'https', 'ws',
		  'wss', 'urn', 'urn:uuid']);

		/** @typedef {supportedSchemeNames[number]} SchemeName */

		/**
		 * @param {string} name
		 * @returns {name is SchemeName}
		 */
		function isValidSchemeName (name) {
		  return supportedSchemeNames.indexOf(/** @type {*} */ (name)) !== -1
		}

		/**
		 * @callback SchemeFn
		 * @param {import('../types/index').URIComponent} component
		 * @param {import('../types/index').Options} options
		 * @returns {import('../types/index').URIComponent}
		 */

		/**
		 * @typedef {Object} SchemeHandler
		 * @property {SchemeName} scheme - The scheme name.
		 * @property {boolean} [domainHost] - Indicates if the scheme supports domain hosts.
		 * @property {SchemeFn} parse - Function to parse the URI component for this scheme.
		 * @property {SchemeFn} serialize - Function to serialize the URI component for this scheme.
		 * @property {boolean} [skipNormalize] - Indicates if normalization should be skipped for this scheme.
		 * @property {boolean} [absolutePath] - Indicates if the scheme uses absolute paths.
		 * @property {boolean} [unicodeSupport] - Indicates if the scheme supports Unicode.
		 */

		/**
		 * @param {import('../types/index').URIComponent} wsComponent
		 * @returns {boolean}
		 */
		function wsIsSecure (wsComponent) {
		  if (wsComponent.secure === true) {
		    return true
		  } else if (wsComponent.secure === false) {
		    return false
		  } else if (wsComponent.scheme) {
		    return (
		      wsComponent.scheme.length === 3 &&
		      (wsComponent.scheme[0] === 'w' || wsComponent.scheme[0] === 'W') &&
		      (wsComponent.scheme[1] === 's' || wsComponent.scheme[1] === 'S') &&
		      (wsComponent.scheme[2] === 's' || wsComponent.scheme[2] === 'S')
		    )
		  } else {
		    return false
		  }
		}

		/** @type {SchemeFn} */
		function httpParse (component) {
		  if (!component.host) {
		    component.error = component.error || 'HTTP URIs must have a host.';
		  }

		  return component
		}

		/** @type {SchemeFn} */
		function httpSerialize (component) {
		  const secure = String(component.scheme).toLowerCase() === 'https';

		  // normalize the default port
		  if (component.port === (secure ? 443 : 80) || component.port === '') {
		    component.port = undefined;
		  }

		  // normalize the empty path
		  if (!component.path) {
		    component.path = '/';
		  }

		  // NOTE: We do not parse query strings for HTTP URIs
		  // as WWW Form Url Encoded query strings are part of the HTML4+ spec,
		  // and not the HTTP spec.

		  return component
		}

		/** @type {SchemeFn} */
		function wsParse (wsComponent) {
		// indicate if the secure flag is set
		  wsComponent.secure = wsIsSecure(wsComponent);

		  // construct resouce name
		  wsComponent.resourceName = (wsComponent.path || '/') + (wsComponent.query ? '?' + wsComponent.query : '');
		  wsComponent.path = undefined;
		  wsComponent.query = undefined;

		  return wsComponent
		}

		/** @type {SchemeFn} */
		function wsSerialize (wsComponent) {
		// normalize the default port
		  if (wsComponent.port === (wsIsSecure(wsComponent) ? 443 : 80) || wsComponent.port === '') {
		    wsComponent.port = undefined;
		  }

		  // ensure scheme matches secure flag
		  if (typeof wsComponent.secure === 'boolean') {
		    wsComponent.scheme = (wsComponent.secure ? 'wss' : 'ws');
		    wsComponent.secure = undefined;
		  }

		  // reconstruct path from resource name
		  if (wsComponent.resourceName) {
		    const [path, query] = wsComponent.resourceName.split('?');
		    wsComponent.path = (path && path !== '/' ? path : undefined);
		    wsComponent.query = query;
		    wsComponent.resourceName = undefined;
		  }

		  // forbid fragment component
		  wsComponent.fragment = undefined;

		  return wsComponent
		}

		/** @type {SchemeFn} */
		function urnParse (urnComponent, options) {
		  if (!urnComponent.path) {
		    urnComponent.error = 'URN can not be parsed';
		    return urnComponent
		  }
		  const matches = urnComponent.path.match(URN_REG);
		  if (matches) {
		    const scheme = options.scheme || urnComponent.scheme || 'urn';
		    urnComponent.nid = matches[1].toLowerCase();
		    urnComponent.nss = matches[2];
		    const urnScheme = `${scheme}:${options.nid || urnComponent.nid}`;
		    const schemeHandler = getSchemeHandler(urnScheme);
		    urnComponent.path = undefined;

		    if (schemeHandler) {
		      urnComponent = schemeHandler.parse(urnComponent, options);
		    }
		  } else {
		    urnComponent.error = urnComponent.error || 'URN can not be parsed.';
		  }

		  return urnComponent
		}

		/** @type {SchemeFn} */
		function urnSerialize (urnComponent, options) {
		  if (urnComponent.nid === undefined) {
		    throw new Error('URN without nid cannot be serialized')
		  }
		  const scheme = options.scheme || urnComponent.scheme || 'urn';
		  const nid = urnComponent.nid.toLowerCase();
		  const urnScheme = `${scheme}:${options.nid || nid}`;
		  const schemeHandler = getSchemeHandler(urnScheme);

		  if (schemeHandler) {
		    urnComponent = schemeHandler.serialize(urnComponent, options);
		  }

		  const uriComponent = urnComponent;
		  const nss = urnComponent.nss;
		  uriComponent.path = `${nid || options.nid}:${nss}`;

		  options.skipEscape = true;
		  return uriComponent
		}

		/** @type {SchemeFn} */
		function urnuuidParse (urnComponent, options) {
		  const uuidComponent = urnComponent;
		  uuidComponent.uuid = uuidComponent.nss;
		  uuidComponent.nss = undefined;

		  if (!options.tolerant && (!uuidComponent.uuid || !isUUID(uuidComponent.uuid))) {
		    uuidComponent.error = uuidComponent.error || 'UUID is not valid.';
		  }

		  return uuidComponent
		}

		/** @type {SchemeFn} */
		function urnuuidSerialize (uuidComponent) {
		  const urnComponent = uuidComponent;
		  // normalize UUID
		  urnComponent.nss = (uuidComponent.uuid || '').toLowerCase();
		  return urnComponent
		}

		const http = /** @type {SchemeHandler} */ ({
		  scheme: 'http',
		  domainHost: true,
		  parse: httpParse,
		  serialize: httpSerialize
		});

		const https = /** @type {SchemeHandler} */ ({
		  scheme: 'https',
		  domainHost: http.domainHost,
		  parse: httpParse,
		  serialize: httpSerialize
		});

		const ws = /** @type {SchemeHandler} */ ({
		  scheme: 'ws',
		  domainHost: true,
		  parse: wsParse,
		  serialize: wsSerialize
		});

		const wss = /** @type {SchemeHandler} */ ({
		  scheme: 'wss',
		  domainHost: ws.domainHost,
		  parse: ws.parse,
		  serialize: ws.serialize
		});

		const urn = /** @type {SchemeHandler} */ ({
		  scheme: 'urn',
		  parse: urnParse,
		  serialize: urnSerialize,
		  skipNormalize: true
		});

		const urnuuid = /** @type {SchemeHandler} */ ({
		  scheme: 'urn:uuid',
		  parse: urnuuidParse,
		  serialize: urnuuidSerialize,
		  skipNormalize: true
		});

		const SCHEMES = /** @type {Record<SchemeName, SchemeHandler>} */ ({
		  http,
		  https,
		  ws,
		  wss,
		  urn,
		  'urn:uuid': urnuuid
		});

		Object.setPrototypeOf(SCHEMES, null);

		/**
		 * @param {string|undefined} scheme
		 * @returns {SchemeHandler|undefined}
		 */
		function getSchemeHandler (scheme) {
		  return (
		    scheme && (
		      SCHEMES[/** @type {SchemeName} */ (scheme)] ||
		      SCHEMES[/** @type {SchemeName} */(scheme.toLowerCase())])
		  ) ||
		    undefined
		}

		schemes = {
		  wsIsSecure,
		  SCHEMES,
		  isValidSchemeName,
		  getSchemeHandler,
		};
		return schemes;
	}

	var hasRequiredFastUri;

	function requireFastUri () {
		if (hasRequiredFastUri) return fastUri.exports;
		hasRequiredFastUri = 1;

		const { normalizeIPv6, removeDotSegments, recomposeAuthority, normalizeComponentEncoding, isIPv4, nonSimpleDomain } = requireUtils();
		const { SCHEMES, getSchemeHandler } = requireSchemes();

		/**
		 * @template {import('./types/index').URIComponent|string} T
		 * @param {T} uri
		 * @param {import('./types/index').Options} [options]
		 * @returns {T}
		 */
		function normalize (uri, options) {
		  if (typeof uri === 'string') {
		    uri = /** @type {T} */ (serialize(parse(uri, options), options));
		  } else if (typeof uri === 'object') {
		    uri = /** @type {T} */ (parse(serialize(uri, options), options));
		  }
		  return uri
		}

		/**
		 * @param {string} baseURI
		 * @param {string} relativeURI
		 * @param {import('./types/index').Options} [options]
		 * @returns {string}
		 */
		function resolve (baseURI, relativeURI, options) {
		  const schemelessOptions = options ? Object.assign({ scheme: 'null' }, options) : { scheme: 'null' };
		  const resolved = resolveComponent(parse(baseURI, schemelessOptions), parse(relativeURI, schemelessOptions), schemelessOptions, true);
		  schemelessOptions.skipEscape = true;
		  return serialize(resolved, schemelessOptions)
		}

		/**
		 * @param {import ('./types/index').URIComponent} base
		 * @param {import ('./types/index').URIComponent} relative
		 * @param {import('./types/index').Options} [options]
		 * @param {boolean} [skipNormalization=false]
		 * @returns {import ('./types/index').URIComponent}
		 */
		function resolveComponent (base, relative, options, skipNormalization) {
		  /** @type {import('./types/index').URIComponent} */
		  const target = {};
		  if (!skipNormalization) {
		    base = parse(serialize(base, options), options); // normalize base component
		    relative = parse(serialize(relative, options), options); // normalize relative component
		  }
		  options = options || {};

		  if (!options.tolerant && relative.scheme) {
		    target.scheme = relative.scheme;
		    // target.authority = relative.authority;
		    target.userinfo = relative.userinfo;
		    target.host = relative.host;
		    target.port = relative.port;
		    target.path = removeDotSegments(relative.path || '');
		    target.query = relative.query;
		  } else {
		    if (relative.userinfo !== undefined || relative.host !== undefined || relative.port !== undefined) {
		      // target.authority = relative.authority;
		      target.userinfo = relative.userinfo;
		      target.host = relative.host;
		      target.port = relative.port;
		      target.path = removeDotSegments(relative.path || '');
		      target.query = relative.query;
		    } else {
		      if (!relative.path) {
		        target.path = base.path;
		        if (relative.query !== undefined) {
		          target.query = relative.query;
		        } else {
		          target.query = base.query;
		        }
		      } else {
		        if (relative.path[0] === '/') {
		          target.path = removeDotSegments(relative.path);
		        } else {
		          if ((base.userinfo !== undefined || base.host !== undefined || base.port !== undefined) && !base.path) {
		            target.path = '/' + relative.path;
		          } else if (!base.path) {
		            target.path = relative.path;
		          } else {
		            target.path = base.path.slice(0, base.path.lastIndexOf('/') + 1) + relative.path;
		          }
		          target.path = removeDotSegments(target.path);
		        }
		        target.query = relative.query;
		      }
		      // target.authority = base.authority;
		      target.userinfo = base.userinfo;
		      target.host = base.host;
		      target.port = base.port;
		    }
		    target.scheme = base.scheme;
		  }

		  target.fragment = relative.fragment;

		  return target
		}

		/**
		 * @param {import ('./types/index').URIComponent|string} uriA
		 * @param {import ('./types/index').URIComponent|string} uriB
		 * @param {import ('./types/index').Options} options
		 * @returns {boolean}
		 */
		function equal (uriA, uriB, options) {
		  if (typeof uriA === 'string') {
		    uriA = unescape(uriA);
		    uriA = serialize(normalizeComponentEncoding(parse(uriA, options), true), { ...options, skipEscape: true });
		  } else if (typeof uriA === 'object') {
		    uriA = serialize(normalizeComponentEncoding(uriA, true), { ...options, skipEscape: true });
		  }

		  if (typeof uriB === 'string') {
		    uriB = unescape(uriB);
		    uriB = serialize(normalizeComponentEncoding(parse(uriB, options), true), { ...options, skipEscape: true });
		  } else if (typeof uriB === 'object') {
		    uriB = serialize(normalizeComponentEncoding(uriB, true), { ...options, skipEscape: true });
		  }

		  return uriA.toLowerCase() === uriB.toLowerCase()
		}

		/**
		 * @param {Readonly<import('./types/index').URIComponent>} cmpts
		 * @param {import('./types/index').Options} [opts]
		 * @returns {string}
		 */
		function serialize (cmpts, opts) {
		  const component = {
		    host: cmpts.host,
		    scheme: cmpts.scheme,
		    userinfo: cmpts.userinfo,
		    port: cmpts.port,
		    path: cmpts.path,
		    query: cmpts.query,
		    nid: cmpts.nid,
		    nss: cmpts.nss,
		    uuid: cmpts.uuid,
		    fragment: cmpts.fragment,
		    reference: cmpts.reference,
		    resourceName: cmpts.resourceName,
		    secure: cmpts.secure,
		    error: ''
		  };
		  const options = Object.assign({}, opts);
		  const uriTokens = [];

		  // find scheme handler
		  const schemeHandler = getSchemeHandler(options.scheme || component.scheme);

		  // perform scheme specific serialization
		  if (schemeHandler && schemeHandler.serialize) schemeHandler.serialize(component, options);

		  if (component.path !== undefined) {
		    if (!options.skipEscape) {
		      component.path = escape(component.path);

		      if (component.scheme !== undefined) {
		        component.path = component.path.split('%3A').join(':');
		      }
		    } else {
		      component.path = unescape(component.path);
		    }
		  }

		  if (options.reference !== 'suffix' && component.scheme) {
		    uriTokens.push(component.scheme, ':');
		  }

		  const authority = recomposeAuthority(component);
		  if (authority !== undefined) {
		    if (options.reference !== 'suffix') {
		      uriTokens.push('//');
		    }

		    uriTokens.push(authority);

		    if (component.path && component.path[0] !== '/') {
		      uriTokens.push('/');
		    }
		  }
		  if (component.path !== undefined) {
		    let s = component.path;

		    if (!options.absolutePath && (!schemeHandler || !schemeHandler.absolutePath)) {
		      s = removeDotSegments(s);
		    }

		    if (
		      authority === undefined &&
		      s[0] === '/' &&
		      s[1] === '/'
		    ) {
		      // don't allow the path to start with "//"
		      s = '/%2F' + s.slice(2);
		    }

		    uriTokens.push(s);
		  }

		  if (component.query !== undefined) {
		    uriTokens.push('?', component.query);
		  }

		  if (component.fragment !== undefined) {
		    uriTokens.push('#', component.fragment);
		  }
		  return uriTokens.join('')
		}

		const URI_PARSE = /^(?:([^#/:?]+):)?(?:\/\/((?:([^#/?@]*)@)?(\[[^#/?\]]+\]|[^#/:?]*)(?::(\d*))?))?([^#?]*)(?:\?([^#]*))?(?:#((?:.|[\n\r])*))?/u;

		/**
		 * @param {string} uri
		 * @param {import('./types/index').Options} [opts]
		 * @returns
		 */
		function parse (uri, opts) {
		  const options = Object.assign({}, opts);
		  /** @type {import('./types/index').URIComponent} */
		  const parsed = {
		    scheme: undefined,
		    userinfo: undefined,
		    host: '',
		    port: undefined,
		    path: '',
		    query: undefined,
		    fragment: undefined
		  };

		  let isIP = false;
		  if (options.reference === 'suffix') {
		    if (options.scheme) {
		      uri = options.scheme + ':' + uri;
		    } else {
		      uri = '//' + uri;
		    }
		  }

		  const matches = uri.match(URI_PARSE);

		  if (matches) {
		    // store each component
		    parsed.scheme = matches[1];
		    parsed.userinfo = matches[3];
		    parsed.host = matches[4];
		    parsed.port = parseInt(matches[5], 10);
		    parsed.path = matches[6] || '';
		    parsed.query = matches[7];
		    parsed.fragment = matches[8];

		    // fix port number
		    if (isNaN(parsed.port)) {
		      parsed.port = matches[5];
		    }
		    if (parsed.host) {
		      const ipv4result = isIPv4(parsed.host);
		      if (ipv4result === false) {
		        const ipv6result = normalizeIPv6(parsed.host);
		        parsed.host = ipv6result.host.toLowerCase();
		        isIP = ipv6result.isIPV6;
		      } else {
		        isIP = true;
		      }
		    }
		    if (parsed.scheme === undefined && parsed.userinfo === undefined && parsed.host === undefined && parsed.port === undefined && parsed.query === undefined && !parsed.path) {
		      parsed.reference = 'same-document';
		    } else if (parsed.scheme === undefined) {
		      parsed.reference = 'relative';
		    } else if (parsed.fragment === undefined) {
		      parsed.reference = 'absolute';
		    } else {
		      parsed.reference = 'uri';
		    }

		    // check for reference errors
		    if (options.reference && options.reference !== 'suffix' && options.reference !== parsed.reference) {
		      parsed.error = parsed.error || 'URI is not a ' + options.reference + ' reference.';
		    }

		    // find scheme handler
		    const schemeHandler = getSchemeHandler(options.scheme || parsed.scheme);

		    // check if scheme can't handle IRIs
		    if (!options.unicodeSupport && (!schemeHandler || !schemeHandler.unicodeSupport)) {
		      // if host component is a domain name
		      if (parsed.host && (options.domainHost || (schemeHandler && schemeHandler.domainHost)) && isIP === false && nonSimpleDomain(parsed.host)) {
		        // convert Unicode IDN -> ASCII IDN
		        try {
		          parsed.host = URL.domainToASCII(parsed.host.toLowerCase());
		        } catch (e) {
		          parsed.error = parsed.error || "Host's domain name can not be converted to ASCII: " + e;
		        }
		      }
		      // convert IRI -> URI
		    }

		    if (!schemeHandler || (schemeHandler && !schemeHandler.skipNormalize)) {
		      if (uri.indexOf('%') !== -1) {
		        if (parsed.scheme !== undefined) {
		          parsed.scheme = unescape(parsed.scheme);
		        }
		        if (parsed.host !== undefined) {
		          parsed.host = unescape(parsed.host);
		        }
		      }
		      if (parsed.path) {
		        parsed.path = escape(unescape(parsed.path));
		      }
		      if (parsed.fragment) {
		        parsed.fragment = encodeURI(decodeURIComponent(parsed.fragment));
		      }
		    }

		    // perform scheme specific parsing
		    if (schemeHandler && schemeHandler.parse) {
		      schemeHandler.parse(parsed, options);
		    }
		  } else {
		    parsed.error = parsed.error || 'URI can not be parsed.';
		  }
		  return parsed
		}

		const fastUri$1 = {
		  SCHEMES,
		  normalize,
		  resolve,
		  resolveComponent,
		  equal,
		  serialize,
		  parse
		};

		fastUri.exports = fastUri$1;
		fastUri.exports.default = fastUri$1;
		fastUri.exports.fastUri = fastUri$1;
		return fastUri.exports;
	}

	var hasRequiredUri;

	function requireUri () {
		if (hasRequiredUri) return uri;
		hasRequiredUri = 1;
		Object.defineProperty(uri, "__esModule", { value: true });
		const uri$1 = requireFastUri();
		uri$1.code = 'require("ajv/dist/runtime/uri").default';
		uri.default = uri$1;
		
		return uri;
	}

	var hasRequiredCore$1;

	function requireCore$1 () {
		if (hasRequiredCore$1) return core$1;
		hasRequiredCore$1 = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.CodeGen = exports$1.Name = exports$1.nil = exports$1.stringify = exports$1.str = exports$1._ = exports$1.KeywordCxt = void 0;
			var validate_1 = requireValidate();
			Object.defineProperty(exports$1, "KeywordCxt", { enumerable: true, get: function () { return validate_1.KeywordCxt; } });
			var codegen_1 = requireCodegen();
			Object.defineProperty(exports$1, "_", { enumerable: true, get: function () { return codegen_1._; } });
			Object.defineProperty(exports$1, "str", { enumerable: true, get: function () { return codegen_1.str; } });
			Object.defineProperty(exports$1, "stringify", { enumerable: true, get: function () { return codegen_1.stringify; } });
			Object.defineProperty(exports$1, "nil", { enumerable: true, get: function () { return codegen_1.nil; } });
			Object.defineProperty(exports$1, "Name", { enumerable: true, get: function () { return codegen_1.Name; } });
			Object.defineProperty(exports$1, "CodeGen", { enumerable: true, get: function () { return codegen_1.CodeGen; } });
			const validation_error_1 = requireValidation_error();
			const ref_error_1 = requireRef_error();
			const rules_1 = requireRules();
			const compile_1 = requireCompile();
			const codegen_2 = requireCodegen();
			const resolve_1 = requireResolve();
			const dataType_1 = requireDataType();
			const util_1 = requireUtil();
			const $dataRefSchema = require$$9;
			const uri_1 = requireUri();
			const defaultRegExp = (str, flags) => new RegExp(str, flags);
			defaultRegExp.code = "new RegExp";
			const META_IGNORE_OPTIONS = ["removeAdditional", "useDefaults", "coerceTypes"];
			const EXT_SCOPE_NAMES = new Set([
			    "validate",
			    "serialize",
			    "parse",
			    "wrapper",
			    "root",
			    "schema",
			    "keyword",
			    "pattern",
			    "formats",
			    "validate$data",
			    "func",
			    "obj",
			    "Error",
			]);
			const removedOptions = {
			    errorDataPath: "",
			    format: "`validateFormats: false` can be used instead.",
			    nullable: '"nullable" keyword is supported by default.',
			    jsonPointers: "Deprecated jsPropertySyntax can be used instead.",
			    extendRefs: "Deprecated ignoreKeywordsWithRef can be used instead.",
			    missingRefs: "Pass empty schema with $id that should be ignored to ajv.addSchema.",
			    processCode: "Use option `code: {process: (code, schemaEnv: object) => string}`",
			    sourceCode: "Use option `code: {source: true}`",
			    strictDefaults: "It is default now, see option `strict`.",
			    strictKeywords: "It is default now, see option `strict`.",
			    uniqueItems: '"uniqueItems" keyword is always validated.',
			    unknownFormats: "Disable strict mode or pass `true` to `ajv.addFormat` (or `formats` option).",
			    cache: "Map is used as cache, schema object as key.",
			    serialize: "Map is used as cache, schema object as key.",
			    ajvErrors: "It is default now.",
			};
			const deprecatedOptions = {
			    ignoreKeywordsWithRef: "",
			    jsPropertySyntax: "",
			    unicode: '"minLength"/"maxLength" account for unicode characters by default.',
			};
			const MAX_EXPRESSION = 200;
			// eslint-disable-next-line complexity
			function requiredOptions(o) {
			    var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v, _w, _x, _y, _z, _0;
			    const s = o.strict;
			    const _optz = (_a = o.code) === null || _a === void 0 ? void 0 : _a.optimize;
			    const optimize = _optz === true || _optz === undefined ? 1 : _optz || 0;
			    const regExp = (_c = (_b = o.code) === null || _b === void 0 ? void 0 : _b.regExp) !== null && _c !== void 0 ? _c : defaultRegExp;
			    const uriResolver = (_d = o.uriResolver) !== null && _d !== void 0 ? _d : uri_1.default;
			    return {
			        strictSchema: (_f = (_e = o.strictSchema) !== null && _e !== void 0 ? _e : s) !== null && _f !== void 0 ? _f : true,
			        strictNumbers: (_h = (_g = o.strictNumbers) !== null && _g !== void 0 ? _g : s) !== null && _h !== void 0 ? _h : true,
			        strictTypes: (_k = (_j = o.strictTypes) !== null && _j !== void 0 ? _j : s) !== null && _k !== void 0 ? _k : "log",
			        strictTuples: (_m = (_l = o.strictTuples) !== null && _l !== void 0 ? _l : s) !== null && _m !== void 0 ? _m : "log",
			        strictRequired: (_p = (_o = o.strictRequired) !== null && _o !== void 0 ? _o : s) !== null && _p !== void 0 ? _p : false,
			        code: o.code ? { ...o.code, optimize, regExp } : { optimize, regExp },
			        loopRequired: (_q = o.loopRequired) !== null && _q !== void 0 ? _q : MAX_EXPRESSION,
			        loopEnum: (_r = o.loopEnum) !== null && _r !== void 0 ? _r : MAX_EXPRESSION,
			        meta: (_s = o.meta) !== null && _s !== void 0 ? _s : true,
			        messages: (_t = o.messages) !== null && _t !== void 0 ? _t : true,
			        inlineRefs: (_u = o.inlineRefs) !== null && _u !== void 0 ? _u : true,
			        schemaId: (_v = o.schemaId) !== null && _v !== void 0 ? _v : "$id",
			        addUsedSchema: (_w = o.addUsedSchema) !== null && _w !== void 0 ? _w : true,
			        validateSchema: (_x = o.validateSchema) !== null && _x !== void 0 ? _x : true,
			        validateFormats: (_y = o.validateFormats) !== null && _y !== void 0 ? _y : true,
			        unicodeRegExp: (_z = o.unicodeRegExp) !== null && _z !== void 0 ? _z : true,
			        int32range: (_0 = o.int32range) !== null && _0 !== void 0 ? _0 : true,
			        uriResolver: uriResolver,
			    };
			}
			class Ajv {
			    constructor(opts = {}) {
			        this.schemas = {};
			        this.refs = {};
			        this.formats = {};
			        this._compilations = new Set();
			        this._loading = {};
			        this._cache = new Map();
			        opts = this.opts = { ...opts, ...requiredOptions(opts) };
			        const { es5, lines } = this.opts.code;
			        this.scope = new codegen_2.ValueScope({ scope: {}, prefixes: EXT_SCOPE_NAMES, es5, lines });
			        this.logger = getLogger(opts.logger);
			        const formatOpt = opts.validateFormats;
			        opts.validateFormats = false;
			        this.RULES = (0, rules_1.getRules)();
			        checkOptions.call(this, removedOptions, opts, "NOT SUPPORTED");
			        checkOptions.call(this, deprecatedOptions, opts, "DEPRECATED", "warn");
			        this._metaOpts = getMetaSchemaOptions.call(this);
			        if (opts.formats)
			            addInitialFormats.call(this);
			        this._addVocabularies();
			        this._addDefaultMetaSchema();
			        if (opts.keywords)
			            addInitialKeywords.call(this, opts.keywords);
			        if (typeof opts.meta == "object")
			            this.addMetaSchema(opts.meta);
			        addInitialSchemas.call(this);
			        opts.validateFormats = formatOpt;
			    }
			    _addVocabularies() {
			        this.addKeyword("$async");
			    }
			    _addDefaultMetaSchema() {
			        const { $data, meta, schemaId } = this.opts;
			        let _dataRefSchema = $dataRefSchema;
			        if (schemaId === "id") {
			            _dataRefSchema = { ...$dataRefSchema };
			            _dataRefSchema.id = _dataRefSchema.$id;
			            delete _dataRefSchema.$id;
			        }
			        if (meta && $data)
			            this.addMetaSchema(_dataRefSchema, _dataRefSchema[schemaId], false);
			    }
			    defaultMeta() {
			        const { meta, schemaId } = this.opts;
			        return (this.opts.defaultMeta = typeof meta == "object" ? meta[schemaId] || meta : undefined);
			    }
			    validate(schemaKeyRef, // key, ref or schema object
			    // eslint-disable-next-line @typescript-eslint/no-redundant-type-constituents
			    data // to be validated
			    ) {
			        let v;
			        if (typeof schemaKeyRef == "string") {
			            v = this.getSchema(schemaKeyRef);
			            if (!v)
			                throw new Error(`no schema with key or ref "${schemaKeyRef}"`);
			        }
			        else {
			            v = this.compile(schemaKeyRef);
			        }
			        const valid = v(data);
			        if (!("$async" in v))
			            this.errors = v.errors;
			        return valid;
			    }
			    compile(schema, _meta) {
			        const sch = this._addSchema(schema, _meta);
			        return (sch.validate || this._compileSchemaEnv(sch));
			    }
			    compileAsync(schema, meta) {
			        if (typeof this.opts.loadSchema != "function") {
			            throw new Error("options.loadSchema should be a function");
			        }
			        const { loadSchema } = this.opts;
			        return runCompileAsync.call(this, schema, meta);
			        async function runCompileAsync(_schema, _meta) {
			            await loadMetaSchema.call(this, _schema.$schema);
			            const sch = this._addSchema(_schema, _meta);
			            return sch.validate || _compileAsync.call(this, sch);
			        }
			        async function loadMetaSchema($ref) {
			            if ($ref && !this.getSchema($ref)) {
			                await runCompileAsync.call(this, { $ref }, true);
			            }
			        }
			        async function _compileAsync(sch) {
			            try {
			                return this._compileSchemaEnv(sch);
			            }
			            catch (e) {
			                if (!(e instanceof ref_error_1.default))
			                    throw e;
			                checkLoaded.call(this, e);
			                await loadMissingSchema.call(this, e.missingSchema);
			                return _compileAsync.call(this, sch);
			            }
			        }
			        function checkLoaded({ missingSchema: ref, missingRef }) {
			            if (this.refs[ref]) {
			                throw new Error(`AnySchema ${ref} is loaded but ${missingRef} cannot be resolved`);
			            }
			        }
			        async function loadMissingSchema(ref) {
			            const _schema = await _loadSchema.call(this, ref);
			            if (!this.refs[ref])
			                await loadMetaSchema.call(this, _schema.$schema);
			            if (!this.refs[ref])
			                this.addSchema(_schema, ref, meta);
			        }
			        async function _loadSchema(ref) {
			            const p = this._loading[ref];
			            if (p)
			                return p;
			            try {
			                return await (this._loading[ref] = loadSchema(ref));
			            }
			            finally {
			                delete this._loading[ref];
			            }
			        }
			    }
			    // Adds schema to the instance
			    addSchema(schema, // If array is passed, `key` will be ignored
			    key, // Optional schema key. Can be passed to `validate` method instead of schema object or id/ref. One schema per instance can have empty `id` and `key`.
			    _meta, // true if schema is a meta-schema. Used internally, addMetaSchema should be used instead.
			    _validateSchema = this.opts.validateSchema // false to skip schema validation. Used internally, option validateSchema should be used instead.
			    ) {
			        if (Array.isArray(schema)) {
			            for (const sch of schema)
			                this.addSchema(sch, undefined, _meta, _validateSchema);
			            return this;
			        }
			        let id;
			        if (typeof schema === "object") {
			            const { schemaId } = this.opts;
			            id = schema[schemaId];
			            if (id !== undefined && typeof id != "string") {
			                throw new Error(`schema ${schemaId} must be string`);
			            }
			        }
			        key = (0, resolve_1.normalizeId)(key || id);
			        this._checkUnique(key);
			        this.schemas[key] = this._addSchema(schema, _meta, key, _validateSchema, true);
			        return this;
			    }
			    // Add schema that will be used to validate other schemas
			    // options in META_IGNORE_OPTIONS are alway set to false
			    addMetaSchema(schema, key, // schema key
			    _validateSchema = this.opts.validateSchema // false to skip schema validation, can be used to override validateSchema option for meta-schema
			    ) {
			        this.addSchema(schema, key, true, _validateSchema);
			        return this;
			    }
			    //  Validate schema against its meta-schema
			    validateSchema(schema, throwOrLogError) {
			        if (typeof schema == "boolean")
			            return true;
			        let $schema;
			        $schema = schema.$schema;
			        if ($schema !== undefined && typeof $schema != "string") {
			            throw new Error("$schema must be a string");
			        }
			        $schema = $schema || this.opts.defaultMeta || this.defaultMeta();
			        if (!$schema) {
			            this.logger.warn("meta-schema not available");
			            this.errors = null;
			            return true;
			        }
			        const valid = this.validate($schema, schema);
			        if (!valid && throwOrLogError) {
			            const message = "schema is invalid: " + this.errorsText();
			            if (this.opts.validateSchema === "log")
			                this.logger.error(message);
			            else
			                throw new Error(message);
			        }
			        return valid;
			    }
			    // Get compiled schema by `key` or `ref`.
			    // (`key` that was passed to `addSchema` or full schema reference - `schema.$id` or resolved id)
			    getSchema(keyRef) {
			        let sch;
			        while (typeof (sch = getSchEnv.call(this, keyRef)) == "string")
			            keyRef = sch;
			        if (sch === undefined) {
			            const { schemaId } = this.opts;
			            const root = new compile_1.SchemaEnv({ schema: {}, schemaId });
			            sch = compile_1.resolveSchema.call(this, root, keyRef);
			            if (!sch)
			                return;
			            this.refs[keyRef] = sch;
			        }
			        return (sch.validate || this._compileSchemaEnv(sch));
			    }
			    // Remove cached schema(s).
			    // If no parameter is passed all schemas but meta-schemas are removed.
			    // If RegExp is passed all schemas with key/id matching pattern but meta-schemas are removed.
			    // Even if schema is referenced by other schemas it still can be removed as other schemas have local references.
			    removeSchema(schemaKeyRef) {
			        if (schemaKeyRef instanceof RegExp) {
			            this._removeAllSchemas(this.schemas, schemaKeyRef);
			            this._removeAllSchemas(this.refs, schemaKeyRef);
			            return this;
			        }
			        switch (typeof schemaKeyRef) {
			            case "undefined":
			                this._removeAllSchemas(this.schemas);
			                this._removeAllSchemas(this.refs);
			                this._cache.clear();
			                return this;
			            case "string": {
			                const sch = getSchEnv.call(this, schemaKeyRef);
			                if (typeof sch == "object")
			                    this._cache.delete(sch.schema);
			                delete this.schemas[schemaKeyRef];
			                delete this.refs[schemaKeyRef];
			                return this;
			            }
			            case "object": {
			                const cacheKey = schemaKeyRef;
			                this._cache.delete(cacheKey);
			                let id = schemaKeyRef[this.opts.schemaId];
			                if (id) {
			                    id = (0, resolve_1.normalizeId)(id);
			                    delete this.schemas[id];
			                    delete this.refs[id];
			                }
			                return this;
			            }
			            default:
			                throw new Error("ajv.removeSchema: invalid parameter");
			        }
			    }
			    // add "vocabulary" - a collection of keywords
			    addVocabulary(definitions) {
			        for (const def of definitions)
			            this.addKeyword(def);
			        return this;
			    }
			    addKeyword(kwdOrDef, def // deprecated
			    ) {
			        let keyword;
			        if (typeof kwdOrDef == "string") {
			            keyword = kwdOrDef;
			            if (typeof def == "object") {
			                this.logger.warn("these parameters are deprecated, see docs for addKeyword");
			                def.keyword = keyword;
			            }
			        }
			        else if (typeof kwdOrDef == "object" && def === undefined) {
			            def = kwdOrDef;
			            keyword = def.keyword;
			            if (Array.isArray(keyword) && !keyword.length) {
			                throw new Error("addKeywords: keyword must be string or non-empty array");
			            }
			        }
			        else {
			            throw new Error("invalid addKeywords parameters");
			        }
			        checkKeyword.call(this, keyword, def);
			        if (!def) {
			            (0, util_1.eachItem)(keyword, (kwd) => addRule.call(this, kwd));
			            return this;
			        }
			        keywordMetaschema.call(this, def);
			        const definition = {
			            ...def,
			            type: (0, dataType_1.getJSONTypes)(def.type),
			            schemaType: (0, dataType_1.getJSONTypes)(def.schemaType),
			        };
			        (0, util_1.eachItem)(keyword, definition.type.length === 0
			            ? (k) => addRule.call(this, k, definition)
			            : (k) => definition.type.forEach((t) => addRule.call(this, k, definition, t)));
			        return this;
			    }
			    getKeyword(keyword) {
			        const rule = this.RULES.all[keyword];
			        return typeof rule == "object" ? rule.definition : !!rule;
			    }
			    // Remove keyword
			    removeKeyword(keyword) {
			        // TODO return type should be Ajv
			        const { RULES } = this;
			        delete RULES.keywords[keyword];
			        delete RULES.all[keyword];
			        for (const group of RULES.rules) {
			            const i = group.rules.findIndex((rule) => rule.keyword === keyword);
			            if (i >= 0)
			                group.rules.splice(i, 1);
			        }
			        return this;
			    }
			    // Add format
			    addFormat(name, format) {
			        if (typeof format == "string")
			            format = new RegExp(format);
			        this.formats[name] = format;
			        return this;
			    }
			    errorsText(errors = this.errors, // optional array of validation errors
			    { separator = ", ", dataVar = "data" } = {} // optional options with properties `separator` and `dataVar`
			    ) {
			        if (!errors || errors.length === 0)
			            return "No errors";
			        return errors
			            .map((e) => `${dataVar}${e.instancePath} ${e.message}`)
			            .reduce((text, msg) => text + separator + msg);
			    }
			    $dataMetaSchema(metaSchema, keywordsJsonPointers) {
			        const rules = this.RULES.all;
			        metaSchema = JSON.parse(JSON.stringify(metaSchema));
			        for (const jsonPointer of keywordsJsonPointers) {
			            const segments = jsonPointer.split("/").slice(1); // first segment is an empty string
			            let keywords = metaSchema;
			            for (const seg of segments)
			                keywords = keywords[seg];
			            for (const key in rules) {
			                const rule = rules[key];
			                if (typeof rule != "object")
			                    continue;
			                const { $data } = rule.definition;
			                const schema = keywords[key];
			                if ($data && schema)
			                    keywords[key] = schemaOrData(schema);
			            }
			        }
			        return metaSchema;
			    }
			    _removeAllSchemas(schemas, regex) {
			        for (const keyRef in schemas) {
			            const sch = schemas[keyRef];
			            if (!regex || regex.test(keyRef)) {
			                if (typeof sch == "string") {
			                    delete schemas[keyRef];
			                }
			                else if (sch && !sch.meta) {
			                    this._cache.delete(sch.schema);
			                    delete schemas[keyRef];
			                }
			            }
			        }
			    }
			    _addSchema(schema, meta, baseId, validateSchema = this.opts.validateSchema, addSchema = this.opts.addUsedSchema) {
			        let id;
			        const { schemaId } = this.opts;
			        if (typeof schema == "object") {
			            id = schema[schemaId];
			        }
			        else {
			            if (this.opts.jtd)
			                throw new Error("schema must be object");
			            else if (typeof schema != "boolean")
			                throw new Error("schema must be object or boolean");
			        }
			        let sch = this._cache.get(schema);
			        if (sch !== undefined)
			            return sch;
			        baseId = (0, resolve_1.normalizeId)(id || baseId);
			        const localRefs = resolve_1.getSchemaRefs.call(this, schema, baseId);
			        sch = new compile_1.SchemaEnv({ schema, schemaId, meta, baseId, localRefs });
			        this._cache.set(sch.schema, sch);
			        if (addSchema && !baseId.startsWith("#")) {
			            // TODO atm it is allowed to overwrite schemas without id (instead of not adding them)
			            if (baseId)
			                this._checkUnique(baseId);
			            this.refs[baseId] = sch;
			        }
			        if (validateSchema)
			            this.validateSchema(schema, true);
			        return sch;
			    }
			    _checkUnique(id) {
			        if (this.schemas[id] || this.refs[id]) {
			            throw new Error(`schema with key or id "${id}" already exists`);
			        }
			    }
			    _compileSchemaEnv(sch) {
			        if (sch.meta)
			            this._compileMetaSchema(sch);
			        else
			            compile_1.compileSchema.call(this, sch);
			        /* istanbul ignore if */
			        if (!sch.validate)
			            throw new Error("ajv implementation error");
			        return sch.validate;
			    }
			    _compileMetaSchema(sch) {
			        const currentOpts = this.opts;
			        this.opts = this._metaOpts;
			        try {
			            compile_1.compileSchema.call(this, sch);
			        }
			        finally {
			            this.opts = currentOpts;
			        }
			    }
			}
			Ajv.ValidationError = validation_error_1.default;
			Ajv.MissingRefError = ref_error_1.default;
			exports$1.default = Ajv;
			function checkOptions(checkOpts, options, msg, log = "error") {
			    for (const key in checkOpts) {
			        const opt = key;
			        if (opt in options)
			            this.logger[log](`${msg}: option ${key}. ${checkOpts[opt]}`);
			    }
			}
			function getSchEnv(keyRef) {
			    keyRef = (0, resolve_1.normalizeId)(keyRef); // TODO tests fail without this line
			    return this.schemas[keyRef] || this.refs[keyRef];
			}
			function addInitialSchemas() {
			    const optsSchemas = this.opts.schemas;
			    if (!optsSchemas)
			        return;
			    if (Array.isArray(optsSchemas))
			        this.addSchema(optsSchemas);
			    else
			        for (const key in optsSchemas)
			            this.addSchema(optsSchemas[key], key);
			}
			function addInitialFormats() {
			    for (const name in this.opts.formats) {
			        const format = this.opts.formats[name];
			        if (format)
			            this.addFormat(name, format);
			    }
			}
			function addInitialKeywords(defs) {
			    if (Array.isArray(defs)) {
			        this.addVocabulary(defs);
			        return;
			    }
			    this.logger.warn("keywords option as map is deprecated, pass array");
			    for (const keyword in defs) {
			        const def = defs[keyword];
			        if (!def.keyword)
			            def.keyword = keyword;
			        this.addKeyword(def);
			    }
			}
			function getMetaSchemaOptions() {
			    const metaOpts = { ...this.opts };
			    for (const opt of META_IGNORE_OPTIONS)
			        delete metaOpts[opt];
			    return metaOpts;
			}
			const noLogs = { log() { }, warn() { }, error() { } };
			function getLogger(logger) {
			    if (logger === false)
			        return noLogs;
			    if (logger === undefined)
			        return console;
			    if (logger.log && logger.warn && logger.error)
			        return logger;
			    throw new Error("logger must implement log, warn and error methods");
			}
			const KEYWORD_NAME = /^[a-z_$][a-z0-9_$:-]*$/i;
			function checkKeyword(keyword, def) {
			    const { RULES } = this;
			    (0, util_1.eachItem)(keyword, (kwd) => {
			        if (RULES.keywords[kwd])
			            throw new Error(`Keyword ${kwd} is already defined`);
			        if (!KEYWORD_NAME.test(kwd))
			            throw new Error(`Keyword ${kwd} has invalid name`);
			    });
			    if (!def)
			        return;
			    if (def.$data && !("code" in def || "validate" in def)) {
			        throw new Error('$data keyword must have "code" or "validate" function');
			    }
			}
			function addRule(keyword, definition, dataType) {
			    var _a;
			    const post = definition === null || definition === void 0 ? void 0 : definition.post;
			    if (dataType && post)
			        throw new Error('keyword with "post" flag cannot have "type"');
			    const { RULES } = this;
			    let ruleGroup = post ? RULES.post : RULES.rules.find(({ type: t }) => t === dataType);
			    if (!ruleGroup) {
			        ruleGroup = { type: dataType, rules: [] };
			        RULES.rules.push(ruleGroup);
			    }
			    RULES.keywords[keyword] = true;
			    if (!definition)
			        return;
			    const rule = {
			        keyword,
			        definition: {
			            ...definition,
			            type: (0, dataType_1.getJSONTypes)(definition.type),
			            schemaType: (0, dataType_1.getJSONTypes)(definition.schemaType),
			        },
			    };
			    if (definition.before)
			        addBeforeRule.call(this, ruleGroup, rule, definition.before);
			    else
			        ruleGroup.rules.push(rule);
			    RULES.all[keyword] = rule;
			    (_a = definition.implements) === null || _a === void 0 ? void 0 : _a.forEach((kwd) => this.addKeyword(kwd));
			}
			function addBeforeRule(ruleGroup, rule, before) {
			    const i = ruleGroup.rules.findIndex((_rule) => _rule.keyword === before);
			    if (i >= 0) {
			        ruleGroup.rules.splice(i, 0, rule);
			    }
			    else {
			        ruleGroup.rules.push(rule);
			        this.logger.warn(`rule ${before} is not defined`);
			    }
			}
			function keywordMetaschema(def) {
			    let { metaSchema } = def;
			    if (metaSchema === undefined)
			        return;
			    if (def.$data && this.opts.$data)
			        metaSchema = schemaOrData(metaSchema);
			    def.validateSchema = this.compile(metaSchema, true);
			}
			const $dataRef = {
			    $ref: "https://raw.githubusercontent.com/ajv-validator/ajv/master/lib/refs/data.json#",
			};
			function schemaOrData(schema) {
			    return { anyOf: [schema, $dataRef] };
			}
			
		} (core$1));
		return core$1;
	}

	var draft7 = {};

	var core = {};

	var id = {};

	var hasRequiredId;

	function requireId () {
		if (hasRequiredId) return id;
		hasRequiredId = 1;
		Object.defineProperty(id, "__esModule", { value: true });
		const def = {
		    keyword: "id",
		    code() {
		        throw new Error('NOT SUPPORTED: keyword "id", use "$id" for schema ID');
		    },
		};
		id.default = def;
		
		return id;
	}

	var ref = {};

	var hasRequiredRef;

	function requireRef () {
		if (hasRequiredRef) return ref;
		hasRequiredRef = 1;
		Object.defineProperty(ref, "__esModule", { value: true });
		ref.callRef = ref.getValidate = void 0;
		const ref_error_1 = requireRef_error();
		const code_1 = requireCode();
		const codegen_1 = requireCodegen();
		const names_1 = requireNames();
		const compile_1 = requireCompile();
		const util_1 = requireUtil();
		const def = {
		    keyword: "$ref",
		    schemaType: "string",
		    code(cxt) {
		        const { gen, schema: $ref, it } = cxt;
		        const { baseId, schemaEnv: env, validateName, opts, self } = it;
		        const { root } = env;
		        if (($ref === "#" || $ref === "#/") && baseId === root.baseId)
		            return callRootRef();
		        const schOrEnv = compile_1.resolveRef.call(self, root, baseId, $ref);
		        if (schOrEnv === undefined)
		            throw new ref_error_1.default(it.opts.uriResolver, baseId, $ref);
		        if (schOrEnv instanceof compile_1.SchemaEnv)
		            return callValidate(schOrEnv);
		        return inlineRefSchema(schOrEnv);
		        function callRootRef() {
		            if (env === root)
		                return callRef(cxt, validateName, env, env.$async);
		            const rootName = gen.scopeValue("root", { ref: root });
		            return callRef(cxt, (0, codegen_1._) `${rootName}.validate`, root, root.$async);
		        }
		        function callValidate(sch) {
		            const v = getValidate(cxt, sch);
		            callRef(cxt, v, sch, sch.$async);
		        }
		        function inlineRefSchema(sch) {
		            const schName = gen.scopeValue("schema", opts.code.source === true ? { ref: sch, code: (0, codegen_1.stringify)(sch) } : { ref: sch });
		            const valid = gen.name("valid");
		            const schCxt = cxt.subschema({
		                schema: sch,
		                dataTypes: [],
		                schemaPath: codegen_1.nil,
		                topSchemaRef: schName,
		                errSchemaPath: $ref,
		            }, valid);
		            cxt.mergeEvaluated(schCxt);
		            cxt.ok(valid);
		        }
		    },
		};
		function getValidate(cxt, sch) {
		    const { gen } = cxt;
		    return sch.validate
		        ? gen.scopeValue("validate", { ref: sch.validate })
		        : (0, codegen_1._) `${gen.scopeValue("wrapper", { ref: sch })}.validate`;
		}
		ref.getValidate = getValidate;
		function callRef(cxt, v, sch, $async) {
		    const { gen, it } = cxt;
		    const { allErrors, schemaEnv: env, opts } = it;
		    const passCxt = opts.passContext ? names_1.default.this : codegen_1.nil;
		    if ($async)
		        callAsyncRef();
		    else
		        callSyncRef();
		    function callAsyncRef() {
		        if (!env.$async)
		            throw new Error("async schema referenced by sync schema");
		        const valid = gen.let("valid");
		        gen.try(() => {
		            gen.code((0, codegen_1._) `await ${(0, code_1.callValidateCode)(cxt, v, passCxt)}`);
		            addEvaluatedFrom(v); // TODO will not work with async, it has to be returned with the result
		            if (!allErrors)
		                gen.assign(valid, true);
		        }, (e) => {
		            gen.if((0, codegen_1._) `!(${e} instanceof ${it.ValidationError})`, () => gen.throw(e));
		            addErrorsFrom(e);
		            if (!allErrors)
		                gen.assign(valid, false);
		        });
		        cxt.ok(valid);
		    }
		    function callSyncRef() {
		        cxt.result((0, code_1.callValidateCode)(cxt, v, passCxt), () => addEvaluatedFrom(v), () => addErrorsFrom(v));
		    }
		    function addErrorsFrom(source) {
		        const errs = (0, codegen_1._) `${source}.errors`;
		        gen.assign(names_1.default.vErrors, (0, codegen_1._) `${names_1.default.vErrors} === null ? ${errs} : ${names_1.default.vErrors}.concat(${errs})`); // TODO tagged
		        gen.assign(names_1.default.errors, (0, codegen_1._) `${names_1.default.vErrors}.length`);
		    }
		    function addEvaluatedFrom(source) {
		        var _a;
		        if (!it.opts.unevaluated)
		            return;
		        const schEvaluated = (_a = sch === null || sch === void 0 ? void 0 : sch.validate) === null || _a === void 0 ? void 0 : _a.evaluated;
		        // TODO refactor
		        if (it.props !== true) {
		            if (schEvaluated && !schEvaluated.dynamicProps) {
		                if (schEvaluated.props !== undefined) {
		                    it.props = util_1.mergeEvaluated.props(gen, schEvaluated.props, it.props);
		                }
		            }
		            else {
		                const props = gen.var("props", (0, codegen_1._) `${source}.evaluated.props`);
		                it.props = util_1.mergeEvaluated.props(gen, props, it.props, codegen_1.Name);
		            }
		        }
		        if (it.items !== true) {
		            if (schEvaluated && !schEvaluated.dynamicItems) {
		                if (schEvaluated.items !== undefined) {
		                    it.items = util_1.mergeEvaluated.items(gen, schEvaluated.items, it.items);
		                }
		            }
		            else {
		                const items = gen.var("items", (0, codegen_1._) `${source}.evaluated.items`);
		                it.items = util_1.mergeEvaluated.items(gen, items, it.items, codegen_1.Name);
		            }
		        }
		    }
		}
		ref.callRef = callRef;
		ref.default = def;
		
		return ref;
	}

	var hasRequiredCore;

	function requireCore () {
		if (hasRequiredCore) return core;
		hasRequiredCore = 1;
		Object.defineProperty(core, "__esModule", { value: true });
		const id_1 = requireId();
		const ref_1 = requireRef();
		const core$1 = [
		    "$schema",
		    "$id",
		    "$defs",
		    "$vocabulary",
		    { keyword: "$comment" },
		    "definitions",
		    id_1.default,
		    ref_1.default,
		];
		core.default = core$1;
		
		return core;
	}

	var validation = {};

	var limitNumber = {};

	var hasRequiredLimitNumber;

	function requireLimitNumber () {
		if (hasRequiredLimitNumber) return limitNumber;
		hasRequiredLimitNumber = 1;
		Object.defineProperty(limitNumber, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const ops = codegen_1.operators;
		const KWDs = {
		    maximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
		    minimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
		    exclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
		    exclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE },
		};
		const error = {
		    message: ({ keyword, schemaCode }) => (0, codegen_1.str) `must be ${KWDs[keyword].okStr} ${schemaCode}`,
		    params: ({ keyword, schemaCode }) => (0, codegen_1._) `{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`,
		};
		const def = {
		    keyword: Object.keys(KWDs),
		    type: "number",
		    schemaType: "number",
		    $data: true,
		    error,
		    code(cxt) {
		        const { keyword, data, schemaCode } = cxt;
		        cxt.fail$data((0, codegen_1._) `${data} ${KWDs[keyword].fail} ${schemaCode} || isNaN(${data})`);
		    },
		};
		limitNumber.default = def;
		
		return limitNumber;
	}

	var multipleOf = {};

	var hasRequiredMultipleOf;

	function requireMultipleOf () {
		if (hasRequiredMultipleOf) return multipleOf;
		hasRequiredMultipleOf = 1;
		Object.defineProperty(multipleOf, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const error = {
		    message: ({ schemaCode }) => (0, codegen_1.str) `must be multiple of ${schemaCode}`,
		    params: ({ schemaCode }) => (0, codegen_1._) `{multipleOf: ${schemaCode}}`,
		};
		const def = {
		    keyword: "multipleOf",
		    type: "number",
		    schemaType: "number",
		    $data: true,
		    error,
		    code(cxt) {
		        const { gen, data, schemaCode, it } = cxt;
		        // const bdt = bad$DataType(schemaCode, <string>def.schemaType, $data)
		        const prec = it.opts.multipleOfPrecision;
		        const res = gen.let("res");
		        const invalid = prec
		            ? (0, codegen_1._) `Math.abs(Math.round(${res}) - ${res}) > 1e-${prec}`
		            : (0, codegen_1._) `${res} !== parseInt(${res})`;
		        cxt.fail$data((0, codegen_1._) `(${schemaCode} === 0 || (${res} = ${data}/${schemaCode}, ${invalid}))`);
		    },
		};
		multipleOf.default = def;
		
		return multipleOf;
	}

	var limitLength = {};

	var ucs2length = {};

	var hasRequiredUcs2length;

	function requireUcs2length () {
		if (hasRequiredUcs2length) return ucs2length;
		hasRequiredUcs2length = 1;
		Object.defineProperty(ucs2length, "__esModule", { value: true });
		// https://mathiasbynens.be/notes/javascript-encoding
		// https://github.com/bestiejs/punycode.js - punycode.ucs2.decode
		function ucs2length$1(str) {
		    const len = str.length;
		    let length = 0;
		    let pos = 0;
		    let value;
		    while (pos < len) {
		        length++;
		        value = str.charCodeAt(pos++);
		        if (value >= 0xd800 && value <= 0xdbff && pos < len) {
		            // high surrogate, and there is a next character
		            value = str.charCodeAt(pos);
		            if ((value & 0xfc00) === 0xdc00)
		                pos++; // low surrogate
		        }
		    }
		    return length;
		}
		ucs2length.default = ucs2length$1;
		ucs2length$1.code = 'require("ajv/dist/runtime/ucs2length").default';
		
		return ucs2length;
	}

	var hasRequiredLimitLength;

	function requireLimitLength () {
		if (hasRequiredLimitLength) return limitLength;
		hasRequiredLimitLength = 1;
		Object.defineProperty(limitLength, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const ucs2length_1 = requireUcs2length();
		const error = {
		    message({ keyword, schemaCode }) {
		        const comp = keyword === "maxLength" ? "more" : "fewer";
		        return (0, codegen_1.str) `must NOT have ${comp} than ${schemaCode} characters`;
		    },
		    params: ({ schemaCode }) => (0, codegen_1._) `{limit: ${schemaCode}}`,
		};
		const def = {
		    keyword: ["maxLength", "minLength"],
		    type: "string",
		    schemaType: "number",
		    $data: true,
		    error,
		    code(cxt) {
		        const { keyword, data, schemaCode, it } = cxt;
		        const op = keyword === "maxLength" ? codegen_1.operators.GT : codegen_1.operators.LT;
		        const len = it.opts.unicode === false ? (0, codegen_1._) `${data}.length` : (0, codegen_1._) `${(0, util_1.useFunc)(cxt.gen, ucs2length_1.default)}(${data})`;
		        cxt.fail$data((0, codegen_1._) `${len} ${op} ${schemaCode}`);
		    },
		};
		limitLength.default = def;
		
		return limitLength;
	}

	var pattern = {};

	var hasRequiredPattern;

	function requirePattern () {
		if (hasRequiredPattern) return pattern;
		hasRequiredPattern = 1;
		Object.defineProperty(pattern, "__esModule", { value: true });
		const code_1 = requireCode();
		const codegen_1 = requireCodegen();
		const error = {
		    message: ({ schemaCode }) => (0, codegen_1.str) `must match pattern "${schemaCode}"`,
		    params: ({ schemaCode }) => (0, codegen_1._) `{pattern: ${schemaCode}}`,
		};
		const def = {
		    keyword: "pattern",
		    type: "string",
		    schemaType: "string",
		    $data: true,
		    error,
		    code(cxt) {
		        const { data, $data, schema, schemaCode, it } = cxt;
		        // TODO regexp should be wrapped in try/catchs
		        const u = it.opts.unicodeRegExp ? "u" : "";
		        const regExp = $data ? (0, codegen_1._) `(new RegExp(${schemaCode}, ${u}))` : (0, code_1.usePattern)(cxt, schema);
		        cxt.fail$data((0, codegen_1._) `!${regExp}.test(${data})`);
		    },
		};
		pattern.default = def;
		
		return pattern;
	}

	var limitProperties = {};

	var hasRequiredLimitProperties;

	function requireLimitProperties () {
		if (hasRequiredLimitProperties) return limitProperties;
		hasRequiredLimitProperties = 1;
		Object.defineProperty(limitProperties, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const error = {
		    message({ keyword, schemaCode }) {
		        const comp = keyword === "maxProperties" ? "more" : "fewer";
		        return (0, codegen_1.str) `must NOT have ${comp} than ${schemaCode} properties`;
		    },
		    params: ({ schemaCode }) => (0, codegen_1._) `{limit: ${schemaCode}}`,
		};
		const def = {
		    keyword: ["maxProperties", "minProperties"],
		    type: "object",
		    schemaType: "number",
		    $data: true,
		    error,
		    code(cxt) {
		        const { keyword, data, schemaCode } = cxt;
		        const op = keyword === "maxProperties" ? codegen_1.operators.GT : codegen_1.operators.LT;
		        cxt.fail$data((0, codegen_1._) `Object.keys(${data}).length ${op} ${schemaCode}`);
		    },
		};
		limitProperties.default = def;
		
		return limitProperties;
	}

	var required = {};

	var hasRequiredRequired;

	function requireRequired () {
		if (hasRequiredRequired) return required;
		hasRequiredRequired = 1;
		Object.defineProperty(required, "__esModule", { value: true });
		const code_1 = requireCode();
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const error = {
		    message: ({ params: { missingProperty } }) => (0, codegen_1.str) `must have required property '${missingProperty}'`,
		    params: ({ params: { missingProperty } }) => (0, codegen_1._) `{missingProperty: ${missingProperty}}`,
		};
		const def = {
		    keyword: "required",
		    type: "object",
		    schemaType: "array",
		    $data: true,
		    error,
		    code(cxt) {
		        const { gen, schema, schemaCode, data, $data, it } = cxt;
		        const { opts } = it;
		        if (!$data && schema.length === 0)
		            return;
		        const useLoop = schema.length >= opts.loopRequired;
		        if (it.allErrors)
		            allErrorsMode();
		        else
		            exitOnErrorMode();
		        if (opts.strictRequired) {
		            const props = cxt.parentSchema.properties;
		            const { definedProperties } = cxt.it;
		            for (const requiredKey of schema) {
		                if ((props === null || props === void 0 ? void 0 : props[requiredKey]) === undefined && !definedProperties.has(requiredKey)) {
		                    const schemaPath = it.schemaEnv.baseId + it.errSchemaPath;
		                    const msg = `required property "${requiredKey}" is not defined at "${schemaPath}" (strictRequired)`;
		                    (0, util_1.checkStrictMode)(it, msg, it.opts.strictRequired);
		                }
		            }
		        }
		        function allErrorsMode() {
		            if (useLoop || $data) {
		                cxt.block$data(codegen_1.nil, loopAllRequired);
		            }
		            else {
		                for (const prop of schema) {
		                    (0, code_1.checkReportMissingProp)(cxt, prop);
		                }
		            }
		        }
		        function exitOnErrorMode() {
		            const missing = gen.let("missing");
		            if (useLoop || $data) {
		                const valid = gen.let("valid", true);
		                cxt.block$data(valid, () => loopUntilMissing(missing, valid));
		                cxt.ok(valid);
		            }
		            else {
		                gen.if((0, code_1.checkMissingProp)(cxt, schema, missing));
		                (0, code_1.reportMissingProp)(cxt, missing);
		                gen.else();
		            }
		        }
		        function loopAllRequired() {
		            gen.forOf("prop", schemaCode, (prop) => {
		                cxt.setParams({ missingProperty: prop });
		                gen.if((0, code_1.noPropertyInData)(gen, data, prop, opts.ownProperties), () => cxt.error());
		            });
		        }
		        function loopUntilMissing(missing, valid) {
		            cxt.setParams({ missingProperty: missing });
		            gen.forOf(missing, schemaCode, () => {
		                gen.assign(valid, (0, code_1.propertyInData)(gen, data, missing, opts.ownProperties));
		                gen.if((0, codegen_1.not)(valid), () => {
		                    cxt.error();
		                    gen.break();
		                });
		            }, codegen_1.nil);
		        }
		    },
		};
		required.default = def;
		
		return required;
	}

	var limitItems = {};

	var hasRequiredLimitItems;

	function requireLimitItems () {
		if (hasRequiredLimitItems) return limitItems;
		hasRequiredLimitItems = 1;
		Object.defineProperty(limitItems, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const error = {
		    message({ keyword, schemaCode }) {
		        const comp = keyword === "maxItems" ? "more" : "fewer";
		        return (0, codegen_1.str) `must NOT have ${comp} than ${schemaCode} items`;
		    },
		    params: ({ schemaCode }) => (0, codegen_1._) `{limit: ${schemaCode}}`,
		};
		const def = {
		    keyword: ["maxItems", "minItems"],
		    type: "array",
		    schemaType: "number",
		    $data: true,
		    error,
		    code(cxt) {
		        const { keyword, data, schemaCode } = cxt;
		        const op = keyword === "maxItems" ? codegen_1.operators.GT : codegen_1.operators.LT;
		        cxt.fail$data((0, codegen_1._) `${data}.length ${op} ${schemaCode}`);
		    },
		};
		limitItems.default = def;
		
		return limitItems;
	}

	var uniqueItems = {};

	var equal = {};

	var hasRequiredEqual;

	function requireEqual () {
		if (hasRequiredEqual) return equal;
		hasRequiredEqual = 1;
		Object.defineProperty(equal, "__esModule", { value: true });
		// https://github.com/ajv-validator/ajv/issues/889
		const equal$1 = requireFastDeepEqual();
		equal$1.code = 'require("ajv/dist/runtime/equal").default';
		equal.default = equal$1;
		
		return equal;
	}

	var hasRequiredUniqueItems;

	function requireUniqueItems () {
		if (hasRequiredUniqueItems) return uniqueItems;
		hasRequiredUniqueItems = 1;
		Object.defineProperty(uniqueItems, "__esModule", { value: true });
		const dataType_1 = requireDataType();
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const equal_1 = requireEqual();
		const error = {
		    message: ({ params: { i, j } }) => (0, codegen_1.str) `must NOT have duplicate items (items ## ${j} and ${i} are identical)`,
		    params: ({ params: { i, j } }) => (0, codegen_1._) `{i: ${i}, j: ${j}}`,
		};
		const def = {
		    keyword: "uniqueItems",
		    type: "array",
		    schemaType: "boolean",
		    $data: true,
		    error,
		    code(cxt) {
		        const { gen, data, $data, schema, parentSchema, schemaCode, it } = cxt;
		        if (!$data && !schema)
		            return;
		        const valid = gen.let("valid");
		        const itemTypes = parentSchema.items ? (0, dataType_1.getSchemaTypes)(parentSchema.items) : [];
		        cxt.block$data(valid, validateUniqueItems, (0, codegen_1._) `${schemaCode} === false`);
		        cxt.ok(valid);
		        function validateUniqueItems() {
		            const i = gen.let("i", (0, codegen_1._) `${data}.length`);
		            const j = gen.let("j");
		            cxt.setParams({ i, j });
		            gen.assign(valid, true);
		            gen.if((0, codegen_1._) `${i} > 1`, () => (canOptimize() ? loopN : loopN2)(i, j));
		        }
		        function canOptimize() {
		            return itemTypes.length > 0 && !itemTypes.some((t) => t === "object" || t === "array");
		        }
		        function loopN(i, j) {
		            const item = gen.name("item");
		            const wrongType = (0, dataType_1.checkDataTypes)(itemTypes, item, it.opts.strictNumbers, dataType_1.DataType.Wrong);
		            const indices = gen.const("indices", (0, codegen_1._) `{}`);
		            gen.for((0, codegen_1._) `;${i}--;`, () => {
		                gen.let(item, (0, codegen_1._) `${data}[${i}]`);
		                gen.if(wrongType, (0, codegen_1._) `continue`);
		                if (itemTypes.length > 1)
		                    gen.if((0, codegen_1._) `typeof ${item} == "string"`, (0, codegen_1._) `${item} += "_"`);
		                gen
		                    .if((0, codegen_1._) `typeof ${indices}[${item}] == "number"`, () => {
		                    gen.assign(j, (0, codegen_1._) `${indices}[${item}]`);
		                    cxt.error();
		                    gen.assign(valid, false).break();
		                })
		                    .code((0, codegen_1._) `${indices}[${item}] = ${i}`);
		            });
		        }
		        function loopN2(i, j) {
		            const eql = (0, util_1.useFunc)(gen, equal_1.default);
		            const outer = gen.name("outer");
		            gen.label(outer).for((0, codegen_1._) `;${i}--;`, () => gen.for((0, codegen_1._) `${j} = ${i}; ${j}--;`, () => gen.if((0, codegen_1._) `${eql}(${data}[${i}], ${data}[${j}])`, () => {
		                cxt.error();
		                gen.assign(valid, false).break(outer);
		            })));
		        }
		    },
		};
		uniqueItems.default = def;
		
		return uniqueItems;
	}

	var _const = {};

	var hasRequired_const;

	function require_const () {
		if (hasRequired_const) return _const;
		hasRequired_const = 1;
		Object.defineProperty(_const, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const equal_1 = requireEqual();
		const error = {
		    message: "must be equal to constant",
		    params: ({ schemaCode }) => (0, codegen_1._) `{allowedValue: ${schemaCode}}`,
		};
		const def = {
		    keyword: "const",
		    $data: true,
		    error,
		    code(cxt) {
		        const { gen, data, $data, schemaCode, schema } = cxt;
		        if ($data || (schema && typeof schema == "object")) {
		            cxt.fail$data((0, codegen_1._) `!${(0, util_1.useFunc)(gen, equal_1.default)}(${data}, ${schemaCode})`);
		        }
		        else {
		            cxt.fail((0, codegen_1._) `${schema} !== ${data}`);
		        }
		    },
		};
		_const.default = def;
		
		return _const;
	}

	var _enum = {};

	var hasRequired_enum;

	function require_enum () {
		if (hasRequired_enum) return _enum;
		hasRequired_enum = 1;
		Object.defineProperty(_enum, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const equal_1 = requireEqual();
		const error = {
		    message: "must be equal to one of the allowed values",
		    params: ({ schemaCode }) => (0, codegen_1._) `{allowedValues: ${schemaCode}}`,
		};
		const def = {
		    keyword: "enum",
		    schemaType: "array",
		    $data: true,
		    error,
		    code(cxt) {
		        const { gen, data, $data, schema, schemaCode, it } = cxt;
		        if (!$data && schema.length === 0)
		            throw new Error("enum must have non-empty array");
		        const useLoop = schema.length >= it.opts.loopEnum;
		        let eql;
		        const getEql = () => (eql !== null && eql !== void 0 ? eql : (eql = (0, util_1.useFunc)(gen, equal_1.default)));
		        let valid;
		        if (useLoop || $data) {
		            valid = gen.let("valid");
		            cxt.block$data(valid, loopEnum);
		        }
		        else {
		            /* istanbul ignore if */
		            if (!Array.isArray(schema))
		                throw new Error("ajv implementation error");
		            const vSchema = gen.const("vSchema", schemaCode);
		            valid = (0, codegen_1.or)(...schema.map((_x, i) => equalCode(vSchema, i)));
		        }
		        cxt.pass(valid);
		        function loopEnum() {
		            gen.assign(valid, false);
		            gen.forOf("v", schemaCode, (v) => gen.if((0, codegen_1._) `${getEql()}(${data}, ${v})`, () => gen.assign(valid, true).break()));
		        }
		        function equalCode(vSchema, i) {
		            const sch = schema[i];
		            return typeof sch === "object" && sch !== null
		                ? (0, codegen_1._) `${getEql()}(${data}, ${vSchema}[${i}])`
		                : (0, codegen_1._) `${data} === ${sch}`;
		        }
		    },
		};
		_enum.default = def;
		
		return _enum;
	}

	var hasRequiredValidation;

	function requireValidation () {
		if (hasRequiredValidation) return validation;
		hasRequiredValidation = 1;
		Object.defineProperty(validation, "__esModule", { value: true });
		const limitNumber_1 = requireLimitNumber();
		const multipleOf_1 = requireMultipleOf();
		const limitLength_1 = requireLimitLength();
		const pattern_1 = requirePattern();
		const limitProperties_1 = requireLimitProperties();
		const required_1 = requireRequired();
		const limitItems_1 = requireLimitItems();
		const uniqueItems_1 = requireUniqueItems();
		const const_1 = require_const();
		const enum_1 = require_enum();
		const validation$1 = [
		    // number
		    limitNumber_1.default,
		    multipleOf_1.default,
		    // string
		    limitLength_1.default,
		    pattern_1.default,
		    // object
		    limitProperties_1.default,
		    required_1.default,
		    // array
		    limitItems_1.default,
		    uniqueItems_1.default,
		    // any
		    { keyword: "type", schemaType: ["string", "array"] },
		    { keyword: "nullable", schemaType: "boolean" },
		    const_1.default,
		    enum_1.default,
		];
		validation.default = validation$1;
		
		return validation;
	}

	var applicator = {};

	var additionalItems = {};

	var hasRequiredAdditionalItems;

	function requireAdditionalItems () {
		if (hasRequiredAdditionalItems) return additionalItems;
		hasRequiredAdditionalItems = 1;
		Object.defineProperty(additionalItems, "__esModule", { value: true });
		additionalItems.validateAdditionalItems = void 0;
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const error = {
		    message: ({ params: { len } }) => (0, codegen_1.str) `must NOT have more than ${len} items`,
		    params: ({ params: { len } }) => (0, codegen_1._) `{limit: ${len}}`,
		};
		const def = {
		    keyword: "additionalItems",
		    type: "array",
		    schemaType: ["boolean", "object"],
		    before: "uniqueItems",
		    error,
		    code(cxt) {
		        const { parentSchema, it } = cxt;
		        const { items } = parentSchema;
		        if (!Array.isArray(items)) {
		            (0, util_1.checkStrictMode)(it, '"additionalItems" is ignored when "items" is not an array of schemas');
		            return;
		        }
		        validateAdditionalItems(cxt, items);
		    },
		};
		function validateAdditionalItems(cxt, items) {
		    const { gen, schema, data, keyword, it } = cxt;
		    it.items = true;
		    const len = gen.const("len", (0, codegen_1._) `${data}.length`);
		    if (schema === false) {
		        cxt.setParams({ len: items.length });
		        cxt.pass((0, codegen_1._) `${len} <= ${items.length}`);
		    }
		    else if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
		        const valid = gen.var("valid", (0, codegen_1._) `${len} <= ${items.length}`); // TODO var
		        gen.if((0, codegen_1.not)(valid), () => validateItems(valid));
		        cxt.ok(valid);
		    }
		    function validateItems(valid) {
		        gen.forRange("i", items.length, len, (i) => {
		            cxt.subschema({ keyword, dataProp: i, dataPropType: util_1.Type.Num }, valid);
		            if (!it.allErrors)
		                gen.if((0, codegen_1.not)(valid), () => gen.break());
		        });
		    }
		}
		additionalItems.validateAdditionalItems = validateAdditionalItems;
		additionalItems.default = def;
		
		return additionalItems;
	}

	var prefixItems = {};

	var items = {};

	var hasRequiredItems;

	function requireItems () {
		if (hasRequiredItems) return items;
		hasRequiredItems = 1;
		Object.defineProperty(items, "__esModule", { value: true });
		items.validateTuple = void 0;
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const code_1 = requireCode();
		const def = {
		    keyword: "items",
		    type: "array",
		    schemaType: ["object", "array", "boolean"],
		    before: "uniqueItems",
		    code(cxt) {
		        const { schema, it } = cxt;
		        if (Array.isArray(schema))
		            return validateTuple(cxt, "additionalItems", schema);
		        it.items = true;
		        if ((0, util_1.alwaysValidSchema)(it, schema))
		            return;
		        cxt.ok((0, code_1.validateArray)(cxt));
		    },
		};
		function validateTuple(cxt, extraItems, schArr = cxt.schema) {
		    const { gen, parentSchema, data, keyword, it } = cxt;
		    checkStrictTuple(parentSchema);
		    if (it.opts.unevaluated && schArr.length && it.items !== true) {
		        it.items = util_1.mergeEvaluated.items(gen, schArr.length, it.items);
		    }
		    const valid = gen.name("valid");
		    const len = gen.const("len", (0, codegen_1._) `${data}.length`);
		    schArr.forEach((sch, i) => {
		        if ((0, util_1.alwaysValidSchema)(it, sch))
		            return;
		        gen.if((0, codegen_1._) `${len} > ${i}`, () => cxt.subschema({
		            keyword,
		            schemaProp: i,
		            dataProp: i,
		        }, valid));
		        cxt.ok(valid);
		    });
		    function checkStrictTuple(sch) {
		        const { opts, errSchemaPath } = it;
		        const l = schArr.length;
		        const fullTuple = l === sch.minItems && (l === sch.maxItems || sch[extraItems] === false);
		        if (opts.strictTuples && !fullTuple) {
		            const msg = `"${keyword}" is ${l}-tuple, but minItems or maxItems/${extraItems} are not specified or different at path "${errSchemaPath}"`;
		            (0, util_1.checkStrictMode)(it, msg, opts.strictTuples);
		        }
		    }
		}
		items.validateTuple = validateTuple;
		items.default = def;
		
		return items;
	}

	var hasRequiredPrefixItems;

	function requirePrefixItems () {
		if (hasRequiredPrefixItems) return prefixItems;
		hasRequiredPrefixItems = 1;
		Object.defineProperty(prefixItems, "__esModule", { value: true });
		const items_1 = requireItems();
		const def = {
		    keyword: "prefixItems",
		    type: "array",
		    schemaType: ["array"],
		    before: "uniqueItems",
		    code: (cxt) => (0, items_1.validateTuple)(cxt, "items"),
		};
		prefixItems.default = def;
		
		return prefixItems;
	}

	var items2020 = {};

	var hasRequiredItems2020;

	function requireItems2020 () {
		if (hasRequiredItems2020) return items2020;
		hasRequiredItems2020 = 1;
		Object.defineProperty(items2020, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const code_1 = requireCode();
		const additionalItems_1 = requireAdditionalItems();
		const error = {
		    message: ({ params: { len } }) => (0, codegen_1.str) `must NOT have more than ${len} items`,
		    params: ({ params: { len } }) => (0, codegen_1._) `{limit: ${len}}`,
		};
		const def = {
		    keyword: "items",
		    type: "array",
		    schemaType: ["object", "boolean"],
		    before: "uniqueItems",
		    error,
		    code(cxt) {
		        const { schema, parentSchema, it } = cxt;
		        const { prefixItems } = parentSchema;
		        it.items = true;
		        if ((0, util_1.alwaysValidSchema)(it, schema))
		            return;
		        if (prefixItems)
		            (0, additionalItems_1.validateAdditionalItems)(cxt, prefixItems);
		        else
		            cxt.ok((0, code_1.validateArray)(cxt));
		    },
		};
		items2020.default = def;
		
		return items2020;
	}

	var contains = {};

	var hasRequiredContains;

	function requireContains () {
		if (hasRequiredContains) return contains;
		hasRequiredContains = 1;
		Object.defineProperty(contains, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const error = {
		    message: ({ params: { min, max } }) => max === undefined
		        ? (0, codegen_1.str) `must contain at least ${min} valid item(s)`
		        : (0, codegen_1.str) `must contain at least ${min} and no more than ${max} valid item(s)`,
		    params: ({ params: { min, max } }) => max === undefined ? (0, codegen_1._) `{minContains: ${min}}` : (0, codegen_1._) `{minContains: ${min}, maxContains: ${max}}`,
		};
		const def = {
		    keyword: "contains",
		    type: "array",
		    schemaType: ["object", "boolean"],
		    before: "uniqueItems",
		    trackErrors: true,
		    error,
		    code(cxt) {
		        const { gen, schema, parentSchema, data, it } = cxt;
		        let min;
		        let max;
		        const { minContains, maxContains } = parentSchema;
		        if (it.opts.next) {
		            min = minContains === undefined ? 1 : minContains;
		            max = maxContains;
		        }
		        else {
		            min = 1;
		        }
		        const len = gen.const("len", (0, codegen_1._) `${data}.length`);
		        cxt.setParams({ min, max });
		        if (max === undefined && min === 0) {
		            (0, util_1.checkStrictMode)(it, `"minContains" == 0 without "maxContains": "contains" keyword ignored`);
		            return;
		        }
		        if (max !== undefined && min > max) {
		            (0, util_1.checkStrictMode)(it, `"minContains" > "maxContains" is always invalid`);
		            cxt.fail();
		            return;
		        }
		        if ((0, util_1.alwaysValidSchema)(it, schema)) {
		            let cond = (0, codegen_1._) `${len} >= ${min}`;
		            if (max !== undefined)
		                cond = (0, codegen_1._) `${cond} && ${len} <= ${max}`;
		            cxt.pass(cond);
		            return;
		        }
		        it.items = true;
		        const valid = gen.name("valid");
		        if (max === undefined && min === 1) {
		            validateItems(valid, () => gen.if(valid, () => gen.break()));
		        }
		        else if (min === 0) {
		            gen.let(valid, true);
		            if (max !== undefined)
		                gen.if((0, codegen_1._) `${data}.length > 0`, validateItemsWithCount);
		        }
		        else {
		            gen.let(valid, false);
		            validateItemsWithCount();
		        }
		        cxt.result(valid, () => cxt.reset());
		        function validateItemsWithCount() {
		            const schValid = gen.name("_valid");
		            const count = gen.let("count", 0);
		            validateItems(schValid, () => gen.if(schValid, () => checkLimits(count)));
		        }
		        function validateItems(_valid, block) {
		            gen.forRange("i", 0, len, (i) => {
		                cxt.subschema({
		                    keyword: "contains",
		                    dataProp: i,
		                    dataPropType: util_1.Type.Num,
		                    compositeRule: true,
		                }, _valid);
		                block();
		            });
		        }
		        function checkLimits(count) {
		            gen.code((0, codegen_1._) `${count}++`);
		            if (max === undefined) {
		                gen.if((0, codegen_1._) `${count} >= ${min}`, () => gen.assign(valid, true).break());
		            }
		            else {
		                gen.if((0, codegen_1._) `${count} > ${max}`, () => gen.assign(valid, false).break());
		                if (min === 1)
		                    gen.assign(valid, true);
		                else
		                    gen.if((0, codegen_1._) `${count} >= ${min}`, () => gen.assign(valid, true));
		            }
		        }
		    },
		};
		contains.default = def;
		
		return contains;
	}

	var dependencies = {};

	var hasRequiredDependencies;

	function requireDependencies () {
		if (hasRequiredDependencies) return dependencies;
		hasRequiredDependencies = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.validateSchemaDeps = exports$1.validatePropertyDeps = exports$1.error = void 0;
			const codegen_1 = requireCodegen();
			const util_1 = requireUtil();
			const code_1 = requireCode();
			exports$1.error = {
			    message: ({ params: { property, depsCount, deps } }) => {
			        const property_ies = depsCount === 1 ? "property" : "properties";
			        return (0, codegen_1.str) `must have ${property_ies} ${deps} when property ${property} is present`;
			    },
			    params: ({ params: { property, depsCount, deps, missingProperty } }) => (0, codegen_1._) `{property: ${property},
    missingProperty: ${missingProperty},
    depsCount: ${depsCount},
    deps: ${deps}}`, // TODO change to reference
			};
			const def = {
			    keyword: "dependencies",
			    type: "object",
			    schemaType: "object",
			    error: exports$1.error,
			    code(cxt) {
			        const [propDeps, schDeps] = splitDependencies(cxt);
			        validatePropertyDeps(cxt, propDeps);
			        validateSchemaDeps(cxt, schDeps);
			    },
			};
			function splitDependencies({ schema }) {
			    const propertyDeps = {};
			    const schemaDeps = {};
			    for (const key in schema) {
			        if (key === "__proto__")
			            continue;
			        const deps = Array.isArray(schema[key]) ? propertyDeps : schemaDeps;
			        deps[key] = schema[key];
			    }
			    return [propertyDeps, schemaDeps];
			}
			function validatePropertyDeps(cxt, propertyDeps = cxt.schema) {
			    const { gen, data, it } = cxt;
			    if (Object.keys(propertyDeps).length === 0)
			        return;
			    const missing = gen.let("missing");
			    for (const prop in propertyDeps) {
			        const deps = propertyDeps[prop];
			        if (deps.length === 0)
			            continue;
			        const hasProperty = (0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties);
			        cxt.setParams({
			            property: prop,
			            depsCount: deps.length,
			            deps: deps.join(", "),
			        });
			        if (it.allErrors) {
			            gen.if(hasProperty, () => {
			                for (const depProp of deps) {
			                    (0, code_1.checkReportMissingProp)(cxt, depProp);
			                }
			            });
			        }
			        else {
			            gen.if((0, codegen_1._) `${hasProperty} && (${(0, code_1.checkMissingProp)(cxt, deps, missing)})`);
			            (0, code_1.reportMissingProp)(cxt, missing);
			            gen.else();
			        }
			    }
			}
			exports$1.validatePropertyDeps = validatePropertyDeps;
			function validateSchemaDeps(cxt, schemaDeps = cxt.schema) {
			    const { gen, data, keyword, it } = cxt;
			    const valid = gen.name("valid");
			    for (const prop in schemaDeps) {
			        if ((0, util_1.alwaysValidSchema)(it, schemaDeps[prop]))
			            continue;
			        gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties), () => {
			            const schCxt = cxt.subschema({ keyword, schemaProp: prop }, valid);
			            cxt.mergeValidEvaluated(schCxt, valid);
			        }, () => gen.var(valid, true) // TODO var
			        );
			        cxt.ok(valid);
			    }
			}
			exports$1.validateSchemaDeps = validateSchemaDeps;
			exports$1.default = def;
			
		} (dependencies));
		return dependencies;
	}

	var propertyNames = {};

	var hasRequiredPropertyNames;

	function requirePropertyNames () {
		if (hasRequiredPropertyNames) return propertyNames;
		hasRequiredPropertyNames = 1;
		Object.defineProperty(propertyNames, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const error = {
		    message: "property name must be valid",
		    params: ({ params }) => (0, codegen_1._) `{propertyName: ${params.propertyName}}`,
		};
		const def = {
		    keyword: "propertyNames",
		    type: "object",
		    schemaType: ["object", "boolean"],
		    error,
		    code(cxt) {
		        const { gen, schema, data, it } = cxt;
		        if ((0, util_1.alwaysValidSchema)(it, schema))
		            return;
		        const valid = gen.name("valid");
		        gen.forIn("key", data, (key) => {
		            cxt.setParams({ propertyName: key });
		            cxt.subschema({
		                keyword: "propertyNames",
		                data: key,
		                dataTypes: ["string"],
		                propertyName: key,
		                compositeRule: true,
		            }, valid);
		            gen.if((0, codegen_1.not)(valid), () => {
		                cxt.error(true);
		                if (!it.allErrors)
		                    gen.break();
		            });
		        });
		        cxt.ok(valid);
		    },
		};
		propertyNames.default = def;
		
		return propertyNames;
	}

	var additionalProperties = {};

	var hasRequiredAdditionalProperties;

	function requireAdditionalProperties () {
		if (hasRequiredAdditionalProperties) return additionalProperties;
		hasRequiredAdditionalProperties = 1;
		Object.defineProperty(additionalProperties, "__esModule", { value: true });
		const code_1 = requireCode();
		const codegen_1 = requireCodegen();
		const names_1 = requireNames();
		const util_1 = requireUtil();
		const error = {
		    message: "must NOT have additional properties",
		    params: ({ params }) => (0, codegen_1._) `{additionalProperty: ${params.additionalProperty}}`,
		};
		const def = {
		    keyword: "additionalProperties",
		    type: ["object"],
		    schemaType: ["boolean", "object"],
		    allowUndefined: true,
		    trackErrors: true,
		    error,
		    code(cxt) {
		        const { gen, schema, parentSchema, data, errsCount, it } = cxt;
		        /* istanbul ignore if */
		        if (!errsCount)
		            throw new Error("ajv implementation error");
		        const { allErrors, opts } = it;
		        it.props = true;
		        if (opts.removeAdditional !== "all" && (0, util_1.alwaysValidSchema)(it, schema))
		            return;
		        const props = (0, code_1.allSchemaProperties)(parentSchema.properties);
		        const patProps = (0, code_1.allSchemaProperties)(parentSchema.patternProperties);
		        checkAdditionalProperties();
		        cxt.ok((0, codegen_1._) `${errsCount} === ${names_1.default.errors}`);
		        function checkAdditionalProperties() {
		            gen.forIn("key", data, (key) => {
		                if (!props.length && !patProps.length)
		                    additionalPropertyCode(key);
		                else
		                    gen.if(isAdditional(key), () => additionalPropertyCode(key));
		            });
		        }
		        function isAdditional(key) {
		            let definedProp;
		            if (props.length > 8) {
		                // TODO maybe an option instead of hard-coded 8?
		                const propsSchema = (0, util_1.schemaRefOrVal)(it, parentSchema.properties, "properties");
		                definedProp = (0, code_1.isOwnProperty)(gen, propsSchema, key);
		            }
		            else if (props.length) {
		                definedProp = (0, codegen_1.or)(...props.map((p) => (0, codegen_1._) `${key} === ${p}`));
		            }
		            else {
		                definedProp = codegen_1.nil;
		            }
		            if (patProps.length) {
		                definedProp = (0, codegen_1.or)(definedProp, ...patProps.map((p) => (0, codegen_1._) `${(0, code_1.usePattern)(cxt, p)}.test(${key})`));
		            }
		            return (0, codegen_1.not)(definedProp);
		        }
		        function deleteAdditional(key) {
		            gen.code((0, codegen_1._) `delete ${data}[${key}]`);
		        }
		        function additionalPropertyCode(key) {
		            if (opts.removeAdditional === "all" || (opts.removeAdditional && schema === false)) {
		                deleteAdditional(key);
		                return;
		            }
		            if (schema === false) {
		                cxt.setParams({ additionalProperty: key });
		                cxt.error();
		                if (!allErrors)
		                    gen.break();
		                return;
		            }
		            if (typeof schema == "object" && !(0, util_1.alwaysValidSchema)(it, schema)) {
		                const valid = gen.name("valid");
		                if (opts.removeAdditional === "failing") {
		                    applyAdditionalSchema(key, valid, false);
		                    gen.if((0, codegen_1.not)(valid), () => {
		                        cxt.reset();
		                        deleteAdditional(key);
		                    });
		                }
		                else {
		                    applyAdditionalSchema(key, valid);
		                    if (!allErrors)
		                        gen.if((0, codegen_1.not)(valid), () => gen.break());
		                }
		            }
		        }
		        function applyAdditionalSchema(key, valid, errors) {
		            const subschema = {
		                keyword: "additionalProperties",
		                dataProp: key,
		                dataPropType: util_1.Type.Str,
		            };
		            if (errors === false) {
		                Object.assign(subschema, {
		                    compositeRule: true,
		                    createErrors: false,
		                    allErrors: false,
		                });
		            }
		            cxt.subschema(subschema, valid);
		        }
		    },
		};
		additionalProperties.default = def;
		
		return additionalProperties;
	}

	var properties$1 = {};

	var hasRequiredProperties;

	function requireProperties () {
		if (hasRequiredProperties) return properties$1;
		hasRequiredProperties = 1;
		Object.defineProperty(properties$1, "__esModule", { value: true });
		const validate_1 = requireValidate();
		const code_1 = requireCode();
		const util_1 = requireUtil();
		const additionalProperties_1 = requireAdditionalProperties();
		const def = {
		    keyword: "properties",
		    type: "object",
		    schemaType: "object",
		    code(cxt) {
		        const { gen, schema, parentSchema, data, it } = cxt;
		        if (it.opts.removeAdditional === "all" && parentSchema.additionalProperties === undefined) {
		            additionalProperties_1.default.code(new validate_1.KeywordCxt(it, additionalProperties_1.default, "additionalProperties"));
		        }
		        const allProps = (0, code_1.allSchemaProperties)(schema);
		        for (const prop of allProps) {
		            it.definedProperties.add(prop);
		        }
		        if (it.opts.unevaluated && allProps.length && it.props !== true) {
		            it.props = util_1.mergeEvaluated.props(gen, (0, util_1.toHash)(allProps), it.props);
		        }
		        const properties = allProps.filter((p) => !(0, util_1.alwaysValidSchema)(it, schema[p]));
		        if (properties.length === 0)
		            return;
		        const valid = gen.name("valid");
		        for (const prop of properties) {
		            if (hasDefault(prop)) {
		                applyPropertySchema(prop);
		            }
		            else {
		                gen.if((0, code_1.propertyInData)(gen, data, prop, it.opts.ownProperties));
		                applyPropertySchema(prop);
		                if (!it.allErrors)
		                    gen.else().var(valid, true);
		                gen.endIf();
		            }
		            cxt.it.definedProperties.add(prop);
		            cxt.ok(valid);
		        }
		        function hasDefault(prop) {
		            return it.opts.useDefaults && !it.compositeRule && schema[prop].default !== undefined;
		        }
		        function applyPropertySchema(prop) {
		            cxt.subschema({
		                keyword: "properties",
		                schemaProp: prop,
		                dataProp: prop,
		            }, valid);
		        }
		    },
		};
		properties$1.default = def;
		
		return properties$1;
	}

	var patternProperties = {};

	var hasRequiredPatternProperties;

	function requirePatternProperties () {
		if (hasRequiredPatternProperties) return patternProperties;
		hasRequiredPatternProperties = 1;
		Object.defineProperty(patternProperties, "__esModule", { value: true });
		const code_1 = requireCode();
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const util_2 = requireUtil();
		const def = {
		    keyword: "patternProperties",
		    type: "object",
		    schemaType: "object",
		    code(cxt) {
		        const { gen, schema, data, parentSchema, it } = cxt;
		        const { opts } = it;
		        const patterns = (0, code_1.allSchemaProperties)(schema);
		        const alwaysValidPatterns = patterns.filter((p) => (0, util_1.alwaysValidSchema)(it, schema[p]));
		        if (patterns.length === 0 ||
		            (alwaysValidPatterns.length === patterns.length &&
		                (!it.opts.unevaluated || it.props === true))) {
		            return;
		        }
		        const checkProperties = opts.strictSchema && !opts.allowMatchingProperties && parentSchema.properties;
		        const valid = gen.name("valid");
		        if (it.props !== true && !(it.props instanceof codegen_1.Name)) {
		            it.props = (0, util_2.evaluatedPropsToName)(gen, it.props);
		        }
		        const { props } = it;
		        validatePatternProperties();
		        function validatePatternProperties() {
		            for (const pat of patterns) {
		                if (checkProperties)
		                    checkMatchingProperties(pat);
		                if (it.allErrors) {
		                    validateProperties(pat);
		                }
		                else {
		                    gen.var(valid, true); // TODO var
		                    validateProperties(pat);
		                    gen.if(valid);
		                }
		            }
		        }
		        function checkMatchingProperties(pat) {
		            for (const prop in checkProperties) {
		                if (new RegExp(pat).test(prop)) {
		                    (0, util_1.checkStrictMode)(it, `property ${prop} matches pattern ${pat} (use allowMatchingProperties)`);
		                }
		            }
		        }
		        function validateProperties(pat) {
		            gen.forIn("key", data, (key) => {
		                gen.if((0, codegen_1._) `${(0, code_1.usePattern)(cxt, pat)}.test(${key})`, () => {
		                    const alwaysValid = alwaysValidPatterns.includes(pat);
		                    if (!alwaysValid) {
		                        cxt.subschema({
		                            keyword: "patternProperties",
		                            schemaProp: pat,
		                            dataProp: key,
		                            dataPropType: util_2.Type.Str,
		                        }, valid);
		                    }
		                    if (it.opts.unevaluated && props !== true) {
		                        gen.assign((0, codegen_1._) `${props}[${key}]`, true);
		                    }
		                    else if (!alwaysValid && !it.allErrors) {
		                        // can short-circuit if `unevaluatedProperties` is not supported (opts.next === false)
		                        // or if all properties were evaluated (props === true)
		                        gen.if((0, codegen_1.not)(valid), () => gen.break());
		                    }
		                });
		            });
		        }
		    },
		};
		patternProperties.default = def;
		
		return patternProperties;
	}

	var not = {};

	var hasRequiredNot;

	function requireNot () {
		if (hasRequiredNot) return not;
		hasRequiredNot = 1;
		Object.defineProperty(not, "__esModule", { value: true });
		const util_1 = requireUtil();
		const def = {
		    keyword: "not",
		    schemaType: ["object", "boolean"],
		    trackErrors: true,
		    code(cxt) {
		        const { gen, schema, it } = cxt;
		        if ((0, util_1.alwaysValidSchema)(it, schema)) {
		            cxt.fail();
		            return;
		        }
		        const valid = gen.name("valid");
		        cxt.subschema({
		            keyword: "not",
		            compositeRule: true,
		            createErrors: false,
		            allErrors: false,
		        }, valid);
		        cxt.failResult(valid, () => cxt.reset(), () => cxt.error());
		    },
		    error: { message: "must NOT be valid" },
		};
		not.default = def;
		
		return not;
	}

	var anyOf = {};

	var hasRequiredAnyOf;

	function requireAnyOf () {
		if (hasRequiredAnyOf) return anyOf;
		hasRequiredAnyOf = 1;
		Object.defineProperty(anyOf, "__esModule", { value: true });
		const code_1 = requireCode();
		const def = {
		    keyword: "anyOf",
		    schemaType: "array",
		    trackErrors: true,
		    code: code_1.validateUnion,
		    error: { message: "must match a schema in anyOf" },
		};
		anyOf.default = def;
		
		return anyOf;
	}

	var oneOf = {};

	var hasRequiredOneOf;

	function requireOneOf () {
		if (hasRequiredOneOf) return oneOf;
		hasRequiredOneOf = 1;
		Object.defineProperty(oneOf, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const error = {
		    message: "must match exactly one schema in oneOf",
		    params: ({ params }) => (0, codegen_1._) `{passingSchemas: ${params.passing}}`,
		};
		const def = {
		    keyword: "oneOf",
		    schemaType: "array",
		    trackErrors: true,
		    error,
		    code(cxt) {
		        const { gen, schema, parentSchema, it } = cxt;
		        /* istanbul ignore if */
		        if (!Array.isArray(schema))
		            throw new Error("ajv implementation error");
		        if (it.opts.discriminator && parentSchema.discriminator)
		            return;
		        const schArr = schema;
		        const valid = gen.let("valid", false);
		        const passing = gen.let("passing", null);
		        const schValid = gen.name("_valid");
		        cxt.setParams({ passing });
		        // TODO possibly fail straight away (with warning or exception) if there are two empty always valid schemas
		        gen.block(validateOneOf);
		        cxt.result(valid, () => cxt.reset(), () => cxt.error(true));
		        function validateOneOf() {
		            schArr.forEach((sch, i) => {
		                let schCxt;
		                if ((0, util_1.alwaysValidSchema)(it, sch)) {
		                    gen.var(schValid, true);
		                }
		                else {
		                    schCxt = cxt.subschema({
		                        keyword: "oneOf",
		                        schemaProp: i,
		                        compositeRule: true,
		                    }, schValid);
		                }
		                if (i > 0) {
		                    gen
		                        .if((0, codegen_1._) `${schValid} && ${valid}`)
		                        .assign(valid, false)
		                        .assign(passing, (0, codegen_1._) `[${passing}, ${i}]`)
		                        .else();
		                }
		                gen.if(schValid, () => {
		                    gen.assign(valid, true);
		                    gen.assign(passing, i);
		                    if (schCxt)
		                        cxt.mergeEvaluated(schCxt, codegen_1.Name);
		                });
		            });
		        }
		    },
		};
		oneOf.default = def;
		
		return oneOf;
	}

	var allOf = {};

	var hasRequiredAllOf;

	function requireAllOf () {
		if (hasRequiredAllOf) return allOf;
		hasRequiredAllOf = 1;
		Object.defineProperty(allOf, "__esModule", { value: true });
		const util_1 = requireUtil();
		const def = {
		    keyword: "allOf",
		    schemaType: "array",
		    code(cxt) {
		        const { gen, schema, it } = cxt;
		        /* istanbul ignore if */
		        if (!Array.isArray(schema))
		            throw new Error("ajv implementation error");
		        const valid = gen.name("valid");
		        schema.forEach((sch, i) => {
		            if ((0, util_1.alwaysValidSchema)(it, sch))
		                return;
		            const schCxt = cxt.subschema({ keyword: "allOf", schemaProp: i }, valid);
		            cxt.ok(valid);
		            cxt.mergeEvaluated(schCxt);
		        });
		    },
		};
		allOf.default = def;
		
		return allOf;
	}

	var _if = {};

	var hasRequired_if;

	function require_if () {
		if (hasRequired_if) return _if;
		hasRequired_if = 1;
		Object.defineProperty(_if, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const util_1 = requireUtil();
		const error = {
		    message: ({ params }) => (0, codegen_1.str) `must match "${params.ifClause}" schema`,
		    params: ({ params }) => (0, codegen_1._) `{failingKeyword: ${params.ifClause}}`,
		};
		const def = {
		    keyword: "if",
		    schemaType: ["object", "boolean"],
		    trackErrors: true,
		    error,
		    code(cxt) {
		        const { gen, parentSchema, it } = cxt;
		        if (parentSchema.then === undefined && parentSchema.else === undefined) {
		            (0, util_1.checkStrictMode)(it, '"if" without "then" and "else" is ignored');
		        }
		        const hasThen = hasSchema(it, "then");
		        const hasElse = hasSchema(it, "else");
		        if (!hasThen && !hasElse)
		            return;
		        const valid = gen.let("valid", true);
		        const schValid = gen.name("_valid");
		        validateIf();
		        cxt.reset();
		        if (hasThen && hasElse) {
		            const ifClause = gen.let("ifClause");
		            cxt.setParams({ ifClause });
		            gen.if(schValid, validateClause("then", ifClause), validateClause("else", ifClause));
		        }
		        else if (hasThen) {
		            gen.if(schValid, validateClause("then"));
		        }
		        else {
		            gen.if((0, codegen_1.not)(schValid), validateClause("else"));
		        }
		        cxt.pass(valid, () => cxt.error(true));
		        function validateIf() {
		            const schCxt = cxt.subschema({
		                keyword: "if",
		                compositeRule: true,
		                createErrors: false,
		                allErrors: false,
		            }, schValid);
		            cxt.mergeEvaluated(schCxt);
		        }
		        function validateClause(keyword, ifClause) {
		            return () => {
		                const schCxt = cxt.subschema({ keyword }, schValid);
		                gen.assign(valid, schValid);
		                cxt.mergeValidEvaluated(schCxt, valid);
		                if (ifClause)
		                    gen.assign(ifClause, (0, codegen_1._) `${keyword}`);
		                else
		                    cxt.setParams({ ifClause: keyword });
		            };
		        }
		    },
		};
		function hasSchema(it, keyword) {
		    const schema = it.schema[keyword];
		    return schema !== undefined && !(0, util_1.alwaysValidSchema)(it, schema);
		}
		_if.default = def;
		
		return _if;
	}

	var thenElse = {};

	var hasRequiredThenElse;

	function requireThenElse () {
		if (hasRequiredThenElse) return thenElse;
		hasRequiredThenElse = 1;
		Object.defineProperty(thenElse, "__esModule", { value: true });
		const util_1 = requireUtil();
		const def = {
		    keyword: ["then", "else"],
		    schemaType: ["object", "boolean"],
		    code({ keyword, parentSchema, it }) {
		        if (parentSchema.if === undefined)
		            (0, util_1.checkStrictMode)(it, `"${keyword}" without "if" is ignored`);
		    },
		};
		thenElse.default = def;
		
		return thenElse;
	}

	var hasRequiredApplicator;

	function requireApplicator () {
		if (hasRequiredApplicator) return applicator;
		hasRequiredApplicator = 1;
		Object.defineProperty(applicator, "__esModule", { value: true });
		const additionalItems_1 = requireAdditionalItems();
		const prefixItems_1 = requirePrefixItems();
		const items_1 = requireItems();
		const items2020_1 = requireItems2020();
		const contains_1 = requireContains();
		const dependencies_1 = requireDependencies();
		const propertyNames_1 = requirePropertyNames();
		const additionalProperties_1 = requireAdditionalProperties();
		const properties_1 = requireProperties();
		const patternProperties_1 = requirePatternProperties();
		const not_1 = requireNot();
		const anyOf_1 = requireAnyOf();
		const oneOf_1 = requireOneOf();
		const allOf_1 = requireAllOf();
		const if_1 = require_if();
		const thenElse_1 = requireThenElse();
		function getApplicator(draft2020 = false) {
		    const applicator = [
		        // any
		        not_1.default,
		        anyOf_1.default,
		        oneOf_1.default,
		        allOf_1.default,
		        if_1.default,
		        thenElse_1.default,
		        // object
		        propertyNames_1.default,
		        additionalProperties_1.default,
		        dependencies_1.default,
		        properties_1.default,
		        patternProperties_1.default,
		    ];
		    // array
		    if (draft2020)
		        applicator.push(prefixItems_1.default, items2020_1.default);
		    else
		        applicator.push(additionalItems_1.default, items_1.default);
		    applicator.push(contains_1.default);
		    return applicator;
		}
		applicator.default = getApplicator;
		
		return applicator;
	}

	var format$1 = {};

	var format = {};

	var hasRequiredFormat$1;

	function requireFormat$1 () {
		if (hasRequiredFormat$1) return format;
		hasRequiredFormat$1 = 1;
		Object.defineProperty(format, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const error = {
		    message: ({ schemaCode }) => (0, codegen_1.str) `must match format "${schemaCode}"`,
		    params: ({ schemaCode }) => (0, codegen_1._) `{format: ${schemaCode}}`,
		};
		const def = {
		    keyword: "format",
		    type: ["number", "string"],
		    schemaType: "string",
		    $data: true,
		    error,
		    code(cxt, ruleType) {
		        const { gen, data, $data, schema, schemaCode, it } = cxt;
		        const { opts, errSchemaPath, schemaEnv, self } = it;
		        if (!opts.validateFormats)
		            return;
		        if ($data)
		            validate$DataFormat();
		        else
		            validateFormat();
		        function validate$DataFormat() {
		            const fmts = gen.scopeValue("formats", {
		                ref: self.formats,
		                code: opts.code.formats,
		            });
		            const fDef = gen.const("fDef", (0, codegen_1._) `${fmts}[${schemaCode}]`);
		            const fType = gen.let("fType");
		            const format = gen.let("format");
		            // TODO simplify
		            gen.if((0, codegen_1._) `typeof ${fDef} == "object" && !(${fDef} instanceof RegExp)`, () => gen.assign(fType, (0, codegen_1._) `${fDef}.type || "string"`).assign(format, (0, codegen_1._) `${fDef}.validate`), () => gen.assign(fType, (0, codegen_1._) `"string"`).assign(format, fDef));
		            cxt.fail$data((0, codegen_1.or)(unknownFmt(), invalidFmt()));
		            function unknownFmt() {
		                if (opts.strictSchema === false)
		                    return codegen_1.nil;
		                return (0, codegen_1._) `${schemaCode} && !${format}`;
		            }
		            function invalidFmt() {
		                const callFormat = schemaEnv.$async
		                    ? (0, codegen_1._) `(${fDef}.async ? await ${format}(${data}) : ${format}(${data}))`
		                    : (0, codegen_1._) `${format}(${data})`;
		                const validData = (0, codegen_1._) `(typeof ${format} == "function" ? ${callFormat} : ${format}.test(${data}))`;
		                return (0, codegen_1._) `${format} && ${format} !== true && ${fType} === ${ruleType} && !${validData}`;
		            }
		        }
		        function validateFormat() {
		            const formatDef = self.formats[schema];
		            if (!formatDef) {
		                unknownFormat();
		                return;
		            }
		            if (formatDef === true)
		                return;
		            const [fmtType, format, fmtRef] = getFormat(formatDef);
		            if (fmtType === ruleType)
		                cxt.pass(validCondition());
		            function unknownFormat() {
		                if (opts.strictSchema === false) {
		                    self.logger.warn(unknownMsg());
		                    return;
		                }
		                throw new Error(unknownMsg());
		                function unknownMsg() {
		                    return `unknown format "${schema}" ignored in schema at path "${errSchemaPath}"`;
		                }
		            }
		            function getFormat(fmtDef) {
		                const code = fmtDef instanceof RegExp
		                    ? (0, codegen_1.regexpCode)(fmtDef)
		                    : opts.code.formats
		                        ? (0, codegen_1._) `${opts.code.formats}${(0, codegen_1.getProperty)(schema)}`
		                        : undefined;
		                const fmt = gen.scopeValue("formats", { key: schema, ref: fmtDef, code });
		                if (typeof fmtDef == "object" && !(fmtDef instanceof RegExp)) {
		                    return [fmtDef.type || "string", fmtDef.validate, (0, codegen_1._) `${fmt}.validate`];
		                }
		                return ["string", fmtDef, fmt];
		            }
		            function validCondition() {
		                if (typeof formatDef == "object" && !(formatDef instanceof RegExp) && formatDef.async) {
		                    if (!schemaEnv.$async)
		                        throw new Error("async format in sync schema");
		                    return (0, codegen_1._) `await ${fmtRef}(${data})`;
		                }
		                return typeof format == "function" ? (0, codegen_1._) `${fmtRef}(${data})` : (0, codegen_1._) `${fmtRef}.test(${data})`;
		            }
		        }
		    },
		};
		format.default = def;
		
		return format;
	}

	var hasRequiredFormat;

	function requireFormat () {
		if (hasRequiredFormat) return format$1;
		hasRequiredFormat = 1;
		Object.defineProperty(format$1, "__esModule", { value: true });
		const format_1 = requireFormat$1();
		const format = [format_1.default];
		format$1.default = format;
		
		return format$1;
	}

	var metadata = {};

	var hasRequiredMetadata;

	function requireMetadata () {
		if (hasRequiredMetadata) return metadata;
		hasRequiredMetadata = 1;
		Object.defineProperty(metadata, "__esModule", { value: true });
		metadata.contentVocabulary = metadata.metadataVocabulary = void 0;
		metadata.metadataVocabulary = [
		    "title",
		    "description",
		    "default",
		    "deprecated",
		    "readOnly",
		    "writeOnly",
		    "examples",
		];
		metadata.contentVocabulary = [
		    "contentMediaType",
		    "contentEncoding",
		    "contentSchema",
		];
		
		return metadata;
	}

	var hasRequiredDraft7;

	function requireDraft7 () {
		if (hasRequiredDraft7) return draft7;
		hasRequiredDraft7 = 1;
		Object.defineProperty(draft7, "__esModule", { value: true });
		const core_1 = requireCore();
		const validation_1 = requireValidation();
		const applicator_1 = requireApplicator();
		const format_1 = requireFormat();
		const metadata_1 = requireMetadata();
		const draft7Vocabularies = [
		    core_1.default,
		    validation_1.default,
		    (0, applicator_1.default)(),
		    format_1.default,
		    metadata_1.metadataVocabulary,
		    metadata_1.contentVocabulary,
		];
		draft7.default = draft7Vocabularies;
		
		return draft7;
	}

	var discriminator = {};

	var types = {};

	var hasRequiredTypes;

	function requireTypes () {
		if (hasRequiredTypes) return types;
		hasRequiredTypes = 1;
		Object.defineProperty(types, "__esModule", { value: true });
		types.DiscrError = void 0;
		var DiscrError;
		(function (DiscrError) {
		    DiscrError["Tag"] = "tag";
		    DiscrError["Mapping"] = "mapping";
		})(DiscrError || (types.DiscrError = DiscrError = {}));
		
		return types;
	}

	var hasRequiredDiscriminator;

	function requireDiscriminator () {
		if (hasRequiredDiscriminator) return discriminator;
		hasRequiredDiscriminator = 1;
		Object.defineProperty(discriminator, "__esModule", { value: true });
		const codegen_1 = requireCodegen();
		const types_1 = requireTypes();
		const compile_1 = requireCompile();
		const ref_error_1 = requireRef_error();
		const util_1 = requireUtil();
		const error = {
		    message: ({ params: { discrError, tagName } }) => discrError === types_1.DiscrError.Tag
		        ? `tag "${tagName}" must be string`
		        : `value of tag "${tagName}" must be in oneOf`,
		    params: ({ params: { discrError, tag, tagName } }) => (0, codegen_1._) `{error: ${discrError}, tag: ${tagName}, tagValue: ${tag}}`,
		};
		const def = {
		    keyword: "discriminator",
		    type: "object",
		    schemaType: "object",
		    error,
		    code(cxt) {
		        const { gen, data, schema, parentSchema, it } = cxt;
		        const { oneOf } = parentSchema;
		        if (!it.opts.discriminator) {
		            throw new Error("discriminator: requires discriminator option");
		        }
		        const tagName = schema.propertyName;
		        if (typeof tagName != "string")
		            throw new Error("discriminator: requires propertyName");
		        if (schema.mapping)
		            throw new Error("discriminator: mapping is not supported");
		        if (!oneOf)
		            throw new Error("discriminator: requires oneOf keyword");
		        const valid = gen.let("valid", false);
		        const tag = gen.const("tag", (0, codegen_1._) `${data}${(0, codegen_1.getProperty)(tagName)}`);
		        gen.if((0, codegen_1._) `typeof ${tag} == "string"`, () => validateMapping(), () => cxt.error(false, { discrError: types_1.DiscrError.Tag, tag, tagName }));
		        cxt.ok(valid);
		        function validateMapping() {
		            const mapping = getMapping();
		            gen.if(false);
		            for (const tagValue in mapping) {
		                gen.elseIf((0, codegen_1._) `${tag} === ${tagValue}`);
		                gen.assign(valid, applyTagSchema(mapping[tagValue]));
		            }
		            gen.else();
		            cxt.error(false, { discrError: types_1.DiscrError.Mapping, tag, tagName });
		            gen.endIf();
		        }
		        function applyTagSchema(schemaProp) {
		            const _valid = gen.name("valid");
		            const schCxt = cxt.subschema({ keyword: "oneOf", schemaProp }, _valid);
		            cxt.mergeEvaluated(schCxt, codegen_1.Name);
		            return _valid;
		        }
		        function getMapping() {
		            var _a;
		            const oneOfMapping = {};
		            const topRequired = hasRequired(parentSchema);
		            let tagRequired = true;
		            for (let i = 0; i < oneOf.length; i++) {
		                let sch = oneOf[i];
		                if ((sch === null || sch === void 0 ? void 0 : sch.$ref) && !(0, util_1.schemaHasRulesButRef)(sch, it.self.RULES)) {
		                    const ref = sch.$ref;
		                    sch = compile_1.resolveRef.call(it.self, it.schemaEnv.root, it.baseId, ref);
		                    if (sch instanceof compile_1.SchemaEnv)
		                        sch = sch.schema;
		                    if (sch === undefined)
		                        throw new ref_error_1.default(it.opts.uriResolver, it.baseId, ref);
		                }
		                const propSch = (_a = sch === null || sch === void 0 ? void 0 : sch.properties) === null || _a === void 0 ? void 0 : _a[tagName];
		                if (typeof propSch != "object") {
		                    throw new Error(`discriminator: oneOf subschemas (or referenced schemas) must have "properties/${tagName}"`);
		                }
		                tagRequired = tagRequired && (topRequired || hasRequired(sch));
		                addMappings(propSch, i);
		            }
		            if (!tagRequired)
		                throw new Error(`discriminator: "${tagName}" must be required`);
		            return oneOfMapping;
		            function hasRequired({ required }) {
		                return Array.isArray(required) && required.includes(tagName);
		            }
		            function addMappings(sch, i) {
		                if (sch.const) {
		                    addMapping(sch.const, i);
		                }
		                else if (sch.enum) {
		                    for (const tagValue of sch.enum) {
		                        addMapping(tagValue, i);
		                    }
		                }
		                else {
		                    throw new Error(`discriminator: "properties/${tagName}" must have "const" or "enum"`);
		                }
		            }
		            function addMapping(tagValue, i) {
		                if (typeof tagValue != "string" || tagValue in oneOfMapping) {
		                    throw new Error(`discriminator: "${tagName}" values must be unique strings`);
		                }
		                oneOfMapping[tagValue] = i;
		            }
		        }
		    },
		};
		discriminator.default = def;
		
		return discriminator;
	}

	var $schema = "http://json-schema.org/draft-07/schema#";
	var $id = "http://json-schema.org/draft-07/schema#";
	var title = "Core schema meta-schema";
	var definitions = {
		schemaArray: {
			type: "array",
			minItems: 1,
			items: {
				$ref: "#"
			}
		},
		nonNegativeInteger: {
			type: "integer",
			minimum: 0
		},
		nonNegativeIntegerDefault0: {
			allOf: [
				{
					$ref: "#/definitions/nonNegativeInteger"
				},
				{
					"default": 0
				}
			]
		},
		simpleTypes: {
			"enum": [
				"array",
				"boolean",
				"integer",
				"null",
				"number",
				"object",
				"string"
			]
		},
		stringArray: {
			type: "array",
			items: {
				type: "string"
			},
			uniqueItems: true,
			"default": [
			]
		}
	};
	var type = [
		"object",
		"boolean"
	];
	var properties = {
		$id: {
			type: "string",
			format: "uri-reference"
		},
		$schema: {
			type: "string",
			format: "uri"
		},
		$ref: {
			type: "string",
			format: "uri-reference"
		},
		$comment: {
			type: "string"
		},
		title: {
			type: "string"
		},
		description: {
			type: "string"
		},
		"default": true,
		readOnly: {
			type: "boolean",
			"default": false
		},
		examples: {
			type: "array",
			items: true
		},
		multipleOf: {
			type: "number",
			exclusiveMinimum: 0
		},
		maximum: {
			type: "number"
		},
		exclusiveMaximum: {
			type: "number"
		},
		minimum: {
			type: "number"
		},
		exclusiveMinimum: {
			type: "number"
		},
		maxLength: {
			$ref: "#/definitions/nonNegativeInteger"
		},
		minLength: {
			$ref: "#/definitions/nonNegativeIntegerDefault0"
		},
		pattern: {
			type: "string",
			format: "regex"
		},
		additionalItems: {
			$ref: "#"
		},
		items: {
			anyOf: [
				{
					$ref: "#"
				},
				{
					$ref: "#/definitions/schemaArray"
				}
			],
			"default": true
		},
		maxItems: {
			$ref: "#/definitions/nonNegativeInteger"
		},
		minItems: {
			$ref: "#/definitions/nonNegativeIntegerDefault0"
		},
		uniqueItems: {
			type: "boolean",
			"default": false
		},
		contains: {
			$ref: "#"
		},
		maxProperties: {
			$ref: "#/definitions/nonNegativeInteger"
		},
		minProperties: {
			$ref: "#/definitions/nonNegativeIntegerDefault0"
		},
		required: {
			$ref: "#/definitions/stringArray"
		},
		additionalProperties: {
			$ref: "#"
		},
		definitions: {
			type: "object",
			additionalProperties: {
				$ref: "#"
			},
			"default": {
			}
		},
		properties: {
			type: "object",
			additionalProperties: {
				$ref: "#"
			},
			"default": {
			}
		},
		patternProperties: {
			type: "object",
			additionalProperties: {
				$ref: "#"
			},
			propertyNames: {
				format: "regex"
			},
			"default": {
			}
		},
		dependencies: {
			type: "object",
			additionalProperties: {
				anyOf: [
					{
						$ref: "#"
					},
					{
						$ref: "#/definitions/stringArray"
					}
				]
			}
		},
		propertyNames: {
			$ref: "#"
		},
		"const": true,
		"enum": {
			type: "array",
			items: true,
			minItems: 1,
			uniqueItems: true
		},
		type: {
			anyOf: [
				{
					$ref: "#/definitions/simpleTypes"
				},
				{
					type: "array",
					items: {
						$ref: "#/definitions/simpleTypes"
					},
					minItems: 1,
					uniqueItems: true
				}
			]
		},
		format: {
			type: "string"
		},
		contentMediaType: {
			type: "string"
		},
		contentEncoding: {
			type: "string"
		},
		"if": {
			$ref: "#"
		},
		then: {
			$ref: "#"
		},
		"else": {
			$ref: "#"
		},
		allOf: {
			$ref: "#/definitions/schemaArray"
		},
		anyOf: {
			$ref: "#/definitions/schemaArray"
		},
		oneOf: {
			$ref: "#/definitions/schemaArray"
		},
		not: {
			$ref: "#"
		}
	};
	var require$$3 = {
		$schema: $schema,
		$id: $id,
		title: title,
		definitions: definitions,
		type: type,
		properties: properties,
		"default": true
	};

	var hasRequiredAjv;

	function requireAjv () {
		if (hasRequiredAjv) return ajv.exports;
		hasRequiredAjv = 1;
		(function (module, exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.MissingRefError = exports$1.ValidationError = exports$1.CodeGen = exports$1.Name = exports$1.nil = exports$1.stringify = exports$1.str = exports$1._ = exports$1.KeywordCxt = exports$1.Ajv = void 0;
			const core_1 = requireCore$1();
			const draft7_1 = requireDraft7();
			const discriminator_1 = requireDiscriminator();
			const draft7MetaSchema = require$$3;
			const META_SUPPORT_DATA = ["/properties"];
			const META_SCHEMA_ID = "http://json-schema.org/draft-07/schema";
			class Ajv extends core_1.default {
			    _addVocabularies() {
			        super._addVocabularies();
			        draft7_1.default.forEach((v) => this.addVocabulary(v));
			        if (this.opts.discriminator)
			            this.addKeyword(discriminator_1.default);
			    }
			    _addDefaultMetaSchema() {
			        super._addDefaultMetaSchema();
			        if (!this.opts.meta)
			            return;
			        const metaSchema = this.opts.$data
			            ? this.$dataMetaSchema(draft7MetaSchema, META_SUPPORT_DATA)
			            : draft7MetaSchema;
			        this.addMetaSchema(metaSchema, META_SCHEMA_ID, false);
			        this.refs["http://json-schema.org/schema"] = META_SCHEMA_ID;
			    }
			    defaultMeta() {
			        return (this.opts.defaultMeta =
			            super.defaultMeta() || (this.getSchema(META_SCHEMA_ID) ? META_SCHEMA_ID : undefined));
			    }
			}
			exports$1.Ajv = Ajv;
			module.exports = exports$1 = Ajv;
			module.exports.Ajv = Ajv;
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.default = Ajv;
			var validate_1 = requireValidate();
			Object.defineProperty(exports$1, "KeywordCxt", { enumerable: true, get: function () { return validate_1.KeywordCxt; } });
			var codegen_1 = requireCodegen();
			Object.defineProperty(exports$1, "_", { enumerable: true, get: function () { return codegen_1._; } });
			Object.defineProperty(exports$1, "str", { enumerable: true, get: function () { return codegen_1.str; } });
			Object.defineProperty(exports$1, "stringify", { enumerable: true, get: function () { return codegen_1.stringify; } });
			Object.defineProperty(exports$1, "nil", { enumerable: true, get: function () { return codegen_1.nil; } });
			Object.defineProperty(exports$1, "Name", { enumerable: true, get: function () { return codegen_1.Name; } });
			Object.defineProperty(exports$1, "CodeGen", { enumerable: true, get: function () { return codegen_1.CodeGen; } });
			var validation_error_1 = requireValidation_error();
			Object.defineProperty(exports$1, "ValidationError", { enumerable: true, get: function () { return validation_error_1.default; } });
			var ref_error_1 = requireRef_error();
			Object.defineProperty(exports$1, "MissingRefError", { enumerable: true, get: function () { return ref_error_1.default; } });
			
		} (ajv, ajv.exports));
		return ajv.exports;
	}

	var ajvExports = requireAjv();
	var Ajv = /*@__PURE__*/getDefaultExportFromCjs(ajvExports);

	var dist = {exports: {}};

	var formats = {};

	var hasRequiredFormats;

	function requireFormats () {
		if (hasRequiredFormats) return formats;
		hasRequiredFormats = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.formatNames = exports$1.fastFormats = exports$1.fullFormats = void 0;
			function fmtDef(validate, compare) {
			    return { validate, compare };
			}
			exports$1.fullFormats = {
			    // date: http://tools.ietf.org/html/rfc3339#section-5.6
			    date: fmtDef(date, compareDate),
			    // date-time: http://tools.ietf.org/html/rfc3339#section-5.6
			    time: fmtDef(getTime(true), compareTime),
			    "date-time": fmtDef(getDateTime(true), compareDateTime),
			    "iso-time": fmtDef(getTime(), compareIsoTime),
			    "iso-date-time": fmtDef(getDateTime(), compareIsoDateTime),
			    // duration: https://tools.ietf.org/html/rfc3339#appendix-A
			    duration: /^P(?!$)((\d+Y)?(\d+M)?(\d+D)?(T(?=\d)(\d+H)?(\d+M)?(\d+S)?)?|(\d+W)?)$/,
			    uri,
			    "uri-reference": /^(?:[a-z][a-z0-9+\-.]*:)?(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'"()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'"()*+,;=:@]|%[0-9a-f]{2})*)*)?(?:\?(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'"()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i,
			    // uri-template: https://tools.ietf.org/html/rfc6570
			    "uri-template": /^(?:(?:[^\x00-\x20"'<>%\\^`{|}]|%[0-9a-f]{2})|\{[+#./;?&=,!@|]?(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?(?:,(?:[a-z0-9_]|%[0-9a-f]{2})+(?::[1-9][0-9]{0,3}|\*)?)*\})*$/i,
			    // For the source: https://gist.github.com/dperini/729294
			    // For test cases: https://mathiasbynens.be/demo/url-regex
			    url: /^(?:https?|ftp):\/\/(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)(?:\.(?:[a-z0-9\u{00a1}-\u{ffff}]+-)*[a-z0-9\u{00a1}-\u{ffff}]+)*(?:\.(?:[a-z\u{00a1}-\u{ffff}]{2,})))(?::\d{2,5})?(?:\/[^\s]*)?$/iu,
			    email: /^[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?$/i,
			    hostname: /^(?=.{1,253}\.?$)[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[-0-9a-z]{0,61}[0-9a-z])?)*\.?$/i,
			    // optimized https://www.safaribooksonline.com/library/view/regular-expressions-cookbook/9780596802837/ch07s16.html
			    ipv4: /^(?:(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)\.){3}(?:25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)$/,
			    ipv6: /^((([0-9a-f]{1,4}:){7}([0-9a-f]{1,4}|:))|(([0-9a-f]{1,4}:){6}(:[0-9a-f]{1,4}|((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){5}(((:[0-9a-f]{1,4}){1,2})|:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3})|:))|(([0-9a-f]{1,4}:){4}(((:[0-9a-f]{1,4}){1,3})|((:[0-9a-f]{1,4})?:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){3}(((:[0-9a-f]{1,4}){1,4})|((:[0-9a-f]{1,4}){0,2}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){2}(((:[0-9a-f]{1,4}){1,5})|((:[0-9a-f]{1,4}){0,3}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(([0-9a-f]{1,4}:){1}(((:[0-9a-f]{1,4}){1,6})|((:[0-9a-f]{1,4}){0,4}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:))|(:(((:[0-9a-f]{1,4}){1,7})|((:[0-9a-f]{1,4}){0,5}:((25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)(\.(25[0-5]|2[0-4]\d|1\d\d|[1-9]?\d)){3}))|:)))$/i,
			    regex,
			    // uuid: http://tools.ietf.org/html/rfc4122
			    uuid: /^(?:urn:uuid:)?[0-9a-f]{8}-(?:[0-9a-f]{4}-){3}[0-9a-f]{12}$/i,
			    // JSON-pointer: https://tools.ietf.org/html/rfc6901
			    // uri fragment: https://tools.ietf.org/html/rfc3986#appendix-A
			    "json-pointer": /^(?:\/(?:[^~/]|~0|~1)*)*$/,
			    "json-pointer-uri-fragment": /^#(?:\/(?:[a-z0-9_\-.!$&'()*+,;:=@]|%[0-9a-f]{2}|~0|~1)*)*$/i,
			    // relative JSON-pointer: http://tools.ietf.org/html/draft-luff-relative-json-pointer-00
			    "relative-json-pointer": /^(?:0|[1-9][0-9]*)(?:#|(?:\/(?:[^~/]|~0|~1)*)*)$/,
			    // the following formats are used by the openapi specification: https://spec.openapis.org/oas/v3.0.0#data-types
			    // byte: https://github.com/miguelmota/is-base64
			    byte,
			    // signed 32 bit integer
			    int32: { type: "number", validate: validateInt32 },
			    // signed 64 bit integer
			    int64: { type: "number", validate: validateInt64 },
			    // C-type float
			    float: { type: "number", validate: validateNumber },
			    // C-type double
			    double: { type: "number", validate: validateNumber },
			    // hint to the UI to hide input strings
			    password: true,
			    // unchecked string payload
			    binary: true,
			};
			exports$1.fastFormats = {
			    ...exports$1.fullFormats,
			    date: fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d$/, compareDate),
			    time: fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareTime),
			    "date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\dt(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)$/i, compareDateTime),
			    "iso-time": fmtDef(/^(?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoTime),
			    "iso-date-time": fmtDef(/^\d\d\d\d-[0-1]\d-[0-3]\d[t\s](?:[0-2]\d:[0-5]\d:[0-5]\d|23:59:60)(?:\.\d+)?(?:z|[+-]\d\d(?::?\d\d)?)?$/i, compareIsoDateTime),
			    // uri: https://github.com/mafintosh/is-my-json-valid/blob/master/formats.js
			    uri: /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/)?[^\s]*$/i,
			    "uri-reference": /^(?:(?:[a-z][a-z0-9+\-.]*:)?\/?\/)?(?:[^\\\s#][^\s#]*)?(?:#[^\\\s]*)?$/i,
			    // email (sources from jsen validator):
			    // http://stackoverflow.com/questions/201323/using-a-regular-expression-to-validate-an-email-address#answer-8829363
			    // http://www.w3.org/TR/html5/forms.html#valid-e-mail-address (search for 'wilful violation')
			    email: /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)*$/i,
			};
			exports$1.formatNames = Object.keys(exports$1.fullFormats);
			function isLeapYear(year) {
			    // https://tools.ietf.org/html/rfc3339#appendix-C
			    return year % 4 === 0 && (year % 100 !== 0 || year % 400 === 0);
			}
			const DATE = /^(\d\d\d\d)-(\d\d)-(\d\d)$/;
			const DAYS = [0, 31, 28, 31, 30, 31, 30, 31, 31, 30, 31, 30, 31];
			function date(str) {
			    // full-date from http://tools.ietf.org/html/rfc3339#section-5.6
			    const matches = DATE.exec(str);
			    if (!matches)
			        return false;
			    const year = +matches[1];
			    const month = +matches[2];
			    const day = +matches[3];
			    return (month >= 1 &&
			        month <= 12 &&
			        day >= 1 &&
			        day <= (month === 2 && isLeapYear(year) ? 29 : DAYS[month]));
			}
			function compareDate(d1, d2) {
			    if (!(d1 && d2))
			        return undefined;
			    if (d1 > d2)
			        return 1;
			    if (d1 < d2)
			        return -1;
			    return 0;
			}
			const TIME = /^(\d\d):(\d\d):(\d\d(?:\.\d+)?)(z|([+-])(\d\d)(?::?(\d\d))?)?$/i;
			function getTime(strictTimeZone) {
			    return function time(str) {
			        const matches = TIME.exec(str);
			        if (!matches)
			            return false;
			        const hr = +matches[1];
			        const min = +matches[2];
			        const sec = +matches[3];
			        const tz = matches[4];
			        const tzSign = matches[5] === "-" ? -1 : 1;
			        const tzH = +(matches[6] || 0);
			        const tzM = +(matches[7] || 0);
			        if (tzH > 23 || tzM > 59 || (strictTimeZone && !tz))
			            return false;
			        if (hr <= 23 && min <= 59 && sec < 60)
			            return true;
			        // leap second
			        const utcMin = min - tzM * tzSign;
			        const utcHr = hr - tzH * tzSign - (utcMin < 0 ? 1 : 0);
			        return (utcHr === 23 || utcHr === -1) && (utcMin === 59 || utcMin === -1) && sec < 61;
			    };
			}
			function compareTime(s1, s2) {
			    if (!(s1 && s2))
			        return undefined;
			    const t1 = new Date("2020-01-01T" + s1).valueOf();
			    const t2 = new Date("2020-01-01T" + s2).valueOf();
			    if (!(t1 && t2))
			        return undefined;
			    return t1 - t2;
			}
			function compareIsoTime(t1, t2) {
			    if (!(t1 && t2))
			        return undefined;
			    const a1 = TIME.exec(t1);
			    const a2 = TIME.exec(t2);
			    if (!(a1 && a2))
			        return undefined;
			    t1 = a1[1] + a1[2] + a1[3];
			    t2 = a2[1] + a2[2] + a2[3];
			    if (t1 > t2)
			        return 1;
			    if (t1 < t2)
			        return -1;
			    return 0;
			}
			const DATE_TIME_SEPARATOR = /t|\s/i;
			function getDateTime(strictTimeZone) {
			    const time = getTime(strictTimeZone);
			    return function date_time(str) {
			        // http://tools.ietf.org/html/rfc3339#section-5.6
			        const dateTime = str.split(DATE_TIME_SEPARATOR);
			        return dateTime.length === 2 && date(dateTime[0]) && time(dateTime[1]);
			    };
			}
			function compareDateTime(dt1, dt2) {
			    if (!(dt1 && dt2))
			        return undefined;
			    const d1 = new Date(dt1).valueOf();
			    const d2 = new Date(dt2).valueOf();
			    if (!(d1 && d2))
			        return undefined;
			    return d1 - d2;
			}
			function compareIsoDateTime(dt1, dt2) {
			    if (!(dt1 && dt2))
			        return undefined;
			    const [d1, t1] = dt1.split(DATE_TIME_SEPARATOR);
			    const [d2, t2] = dt2.split(DATE_TIME_SEPARATOR);
			    const res = compareDate(d1, d2);
			    if (res === undefined)
			        return undefined;
			    return res || compareTime(t1, t2);
			}
			const NOT_URI_FRAGMENT = /\/|:/;
			const URI = /^(?:[a-z][a-z0-9+\-.]*:)(?:\/?\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:]|%[0-9a-f]{2})*@)?(?:\[(?:(?:(?:(?:[0-9a-f]{1,4}:){6}|::(?:[0-9a-f]{1,4}:){5}|(?:[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){4}|(?:(?:[0-9a-f]{1,4}:){0,1}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){3}|(?:(?:[0-9a-f]{1,4}:){0,2}[0-9a-f]{1,4})?::(?:[0-9a-f]{1,4}:){2}|(?:(?:[0-9a-f]{1,4}:){0,3}[0-9a-f]{1,4})?::[0-9a-f]{1,4}:|(?:(?:[0-9a-f]{1,4}:){0,4}[0-9a-f]{1,4})?::)(?:[0-9a-f]{1,4}:[0-9a-f]{1,4}|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?))|(?:(?:[0-9a-f]{1,4}:){0,5}[0-9a-f]{1,4})?::[0-9a-f]{1,4}|(?:(?:[0-9a-f]{1,4}:){0,6}[0-9a-f]{1,4})?::)|[Vv][0-9a-f]+\.[a-z0-9\-._~!$&'()*+,;=:]+)\]|(?:(?:25[0-5]|2[0-4]\d|[01]?\d\d?)\.){3}(?:25[0-5]|2[0-4]\d|[01]?\d\d?)|(?:[a-z0-9\-._~!$&'()*+,;=]|%[0-9a-f]{2})*)(?::\d*)?(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*|\/(?:(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)?|(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})+(?:\/(?:[a-z0-9\-._~!$&'()*+,;=:@]|%[0-9a-f]{2})*)*)(?:\?(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?(?:#(?:[a-z0-9\-._~!$&'()*+,;=:@/?]|%[0-9a-f]{2})*)?$/i;
			function uri(str) {
			    // http://jmrware.com/articles/2009/uri_regexp/URI_regex.html + optional protocol + required "."
			    return NOT_URI_FRAGMENT.test(str) && URI.test(str);
			}
			const BYTE = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/gm;
			function byte(str) {
			    BYTE.lastIndex = 0;
			    return BYTE.test(str);
			}
			const MIN_INT32 = -2147483648;
			const MAX_INT32 = 2 ** 31 - 1;
			function validateInt32(value) {
			    return Number.isInteger(value) && value <= MAX_INT32 && value >= MIN_INT32;
			}
			function validateInt64(value) {
			    // JSON and javascript max Int is 2**53, so any int that passes isInteger is valid for Int64
			    return Number.isInteger(value);
			}
			function validateNumber() {
			    return true;
			}
			const Z_ANCHOR = /[^\\]\\Z/;
			function regex(str) {
			    if (Z_ANCHOR.test(str))
			        return false;
			    try {
			        new RegExp(str);
			        return true;
			    }
			    catch (e) {
			        return false;
			    }
			}
			
		} (formats));
		return formats;
	}

	var limit = {};

	var hasRequiredLimit;

	function requireLimit () {
		if (hasRequiredLimit) return limit;
		hasRequiredLimit = 1;
		(function (exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.formatLimitDefinition = void 0;
			const ajv_1 = requireAjv();
			const codegen_1 = requireCodegen();
			const ops = codegen_1.operators;
			const KWDs = {
			    formatMaximum: { okStr: "<=", ok: ops.LTE, fail: ops.GT },
			    formatMinimum: { okStr: ">=", ok: ops.GTE, fail: ops.LT },
			    formatExclusiveMaximum: { okStr: "<", ok: ops.LT, fail: ops.GTE },
			    formatExclusiveMinimum: { okStr: ">", ok: ops.GT, fail: ops.LTE },
			};
			const error = {
			    message: ({ keyword, schemaCode }) => (0, codegen_1.str) `should be ${KWDs[keyword].okStr} ${schemaCode}`,
			    params: ({ keyword, schemaCode }) => (0, codegen_1._) `{comparison: ${KWDs[keyword].okStr}, limit: ${schemaCode}}`,
			};
			exports$1.formatLimitDefinition = {
			    keyword: Object.keys(KWDs),
			    type: "string",
			    schemaType: "string",
			    $data: true,
			    error,
			    code(cxt) {
			        const { gen, data, schemaCode, keyword, it } = cxt;
			        const { opts, self } = it;
			        if (!opts.validateFormats)
			            return;
			        const fCxt = new ajv_1.KeywordCxt(it, self.RULES.all.format.definition, "format");
			        if (fCxt.$data)
			            validate$DataFormat();
			        else
			            validateFormat();
			        function validate$DataFormat() {
			            const fmts = gen.scopeValue("formats", {
			                ref: self.formats,
			                code: opts.code.formats,
			            });
			            const fmt = gen.const("fmt", (0, codegen_1._) `${fmts}[${fCxt.schemaCode}]`);
			            cxt.fail$data((0, codegen_1.or)((0, codegen_1._) `typeof ${fmt} != "object"`, (0, codegen_1._) `${fmt} instanceof RegExp`, (0, codegen_1._) `typeof ${fmt}.compare != "function"`, compareCode(fmt)));
			        }
			        function validateFormat() {
			            const format = fCxt.schema;
			            const fmtDef = self.formats[format];
			            if (!fmtDef || fmtDef === true)
			                return;
			            if (typeof fmtDef != "object" ||
			                fmtDef instanceof RegExp ||
			                typeof fmtDef.compare != "function") {
			                throw new Error(`"${keyword}": format "${format}" does not define "compare" function`);
			            }
			            const fmt = gen.scopeValue("formats", {
			                key: format,
			                ref: fmtDef,
			                code: opts.code.formats ? (0, codegen_1._) `${opts.code.formats}${(0, codegen_1.getProperty)(format)}` : undefined,
			            });
			            cxt.fail$data(compareCode(fmt));
			        }
			        function compareCode(fmt) {
			            return (0, codegen_1._) `${fmt}.compare(${data}, ${schemaCode}) ${KWDs[keyword].fail} 0`;
			        }
			    },
			    dependencies: ["format"],
			};
			const formatLimitPlugin = (ajv) => {
			    ajv.addKeyword(exports$1.formatLimitDefinition);
			    return ajv;
			};
			exports$1.default = formatLimitPlugin;
			
		} (limit));
		return limit;
	}

	var hasRequiredDist;

	function requireDist () {
		if (hasRequiredDist) return dist.exports;
		hasRequiredDist = 1;
		(function (module, exports$1) {
			Object.defineProperty(exports$1, "__esModule", { value: true });
			const formats_1 = requireFormats();
			const limit_1 = requireLimit();
			const codegen_1 = requireCodegen();
			const fullName = new codegen_1.Name("fullFormats");
			const fastName = new codegen_1.Name("fastFormats");
			const formatsPlugin = (ajv, opts = { keywords: true }) => {
			    if (Array.isArray(opts)) {
			        addFormats(ajv, opts, formats_1.fullFormats, fullName);
			        return ajv;
			    }
			    const [formats, exportName] = opts.mode === "fast" ? [formats_1.fastFormats, fastName] : [formats_1.fullFormats, fullName];
			    const list = opts.formats || formats_1.formatNames;
			    addFormats(ajv, list, formats, exportName);
			    if (opts.keywords)
			        (0, limit_1.default)(ajv);
			    return ajv;
			};
			formatsPlugin.get = (name, mode = "full") => {
			    const formats = mode === "fast" ? formats_1.fastFormats : formats_1.fullFormats;
			    const f = formats[name];
			    if (!f)
			        throw new Error(`Unknown format "${name}"`);
			    return f;
			};
			function addFormats(ajv, list, fs, exportName) {
			    var _a;
			    var _b;
			    (_a = (_b = ajv.opts.code).formats) !== null && _a !== void 0 ? _a : (_b.formats = (0, codegen_1._) `require("ajv-formats/dist/formats").${exportName}`);
			    for (const f of list)
			        ajv.addFormat(f, fs[f]);
			}
			module.exports = exports$1 = formatsPlugin;
			Object.defineProperty(exports$1, "__esModule", { value: true });
			exports$1.default = formatsPlugin;
			
		} (dist, dist.exports));
		return dist.exports;
	}

	var distExports = requireDist();
	var addFormats = /*@__PURE__*/getDefaultExportFromCjs(distExports);

	var styles = "@import url('https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,slnt,wdth,wght,GRAD,ROND@6..144,-10..0,25..151,1..1000,0..100,0..100&display=swap');\n\n:host {\n    display: block;\n    width: 100%;\n    height: 100%;\n    overflow: hidden;\n\n    /* Base variables - Dark Mode (Default) */\n    --bg: #202124;\n    --col-bg: #2d2e31;\n    --border: #3c4043;\n    --text: #e8eaed;\n    --accent: #8ab4f8;\n    --accent-active: #f28b82;\n    --hover: #303134;\n    --active-row: #3c4043;\n    --input-bg: rgba(255, 255, 255, 0.05);\n    --header-bg: #202124;\n    --output-bg: #202124;\n    --border-radius: 16px;\n    --shadow: 0 4px 8px rgba(0, 0, 0, 0.2);\n    --active-bg: rgba(66, 135, 245, 0.1);\n}\n\n:host([data-theme=\"light\"]) {\n    --bg: #f0f2f5;\n    --col-bg: #ffffff;\n    --border: #dadce0;\n    --text: #202124;\n    --accent: #1a73e8;\n    --accent-active: #fce8e6;\n    --hover: #f1f3f48e;\n    --active-row: #e8f0fe;\n    --input-bg: rgba(0, 0, 0, 0.05);\n    --header-bg: #ffffff;\n    --output-bg: #ffffff;\n}\n\n* {\n    box-sizing: border-box;\n}\n\n\n\n.json-miller-container {\n    display: flex;\n    flex-direction: column;\n    height: 100%;\n    overflow: hidden;\n    font-family: \"Google Sans Flex\", -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;\n    font-variation-settings: \"GRAD\" 0, \"slnt\" 0, \"wdth\" 100, \"wght\" 400;\n    background: var(--bg);\n    color: var(--text);\n    transition: background 0.3s, color 0.3s;\n}\n\n.json-miller-container header {\n    padding: 5px 20px;\n    border-bottom: 1px solid var(--border);\n    display: flex;\n    justify-content: space-between;\n    align-items: center;\n    background: var(--header-bg);\n    box-shadow: var(--shadow);\n    z-index: 10;\n}\n\n.json-miller-container header button {\n    background: transparent;\n    color: var(--text);\n    border: 1px solid var(--border);\n    width: 36px;\n    height: 36px;\n    padding: 0;\n    display: flex;\n    align-items: center;\n    justify-content: center;\n    border-radius: 50%;\n    cursor: pointer;\n    transition: all 0.2s;\n}\n\n.json-miller-container header button:hover {\n    background: var(--hover);\n    color: var(--accent);\n    border-color: var(--accent);\n}\n\n/* --- JsonMiller Library Styles --- */\n\n\n\n.json-miller-container .jm-breadcrumbs {\n    padding: 5px 20px;\n    background: var(--bg);\n    border-bottom: 1px solid var(--border);\n    display: flex;\n    align-items: center;\n    font-size: 0.9rem;\n    color: var(--text);\n    overflow-x: auto;\n    white-space: nowrap;\n}\n\n.json-miller-container .breadcrumb-item {\n    cursor: pointer;\n    color: var(--accent);\n    margin-right: 5px;\n}\n\n.json-miller-container .breadcrumb-item:hover {\n    text-decoration: underline;\n}\n\n.json-miller-container .breadcrumb-item.active {\n    color: var(--text);\n    cursor: default;\n    font-weight: 500;\n    pointer-events: none;\n}\n\n.json-miller-container .breadcrumb-separator {\n    margin: 0 8px;\n    color: var(--text);\n    opacity: 0.5;\n}\n\n.json-miller-container .breadcrumb-copy-btn {\n    background: transparent;\n    border: none;\n    color: var(--text);\n    opacity: 0.5;\n    cursor: pointer;\n    padding: 4px;\n    margin-left: 10px;\n    display: flex;\n    align-items: center;\n    border-radius: 4px;\n    transition: all 0.2s;\n}\n\n.json-miller-container .breadcrumb-copy-btn:hover {\n    opacity: 1;\n    background: rgba(var(--accent), 0.1);\n    color: var(--accent);\n}\n\n.json-miller-container .jm-workspace {\n    display: flex;\n    flex: 1;\n    min-height: 0;\n    overflow: hidden;\n}\n\n.json-miller-container .jm-editor {\n    display: flex;\n    flex: 1;\n    overflow-x: auto;\n    overflow-y: hidden;\n    scroll-behavior: smooth;\n    padding: 20px;\n    gap: 15px;\n    justify-content: center;\n}\n\n/* Columns */\n.json-miller-container .column {\n    width: 320px;\n    min-width: 320px;\n    border: 1px solid var(--border);\n    border-radius: var(--border-radius);\n    background: var(--col-bg);\n    overflow-y: auto;\n    display: flex;\n    flex-direction: column;\n    box-shadow: var(--shadow);\n}\n\n.json-miller-container .column-header {\n    padding: 15px;\n    font-weight: 500;\n    border-bottom: 1px solid var(--border);\n    color: var(--text);\n    opacity: 0.7;\n    font-size: 0.85rem;\n    text-transform: uppercase;\n    letter-spacing: 0.05em;\n    background: rgba(0, 0, 0, 0.02);\n}\n\n/* Rows */\n.json-miller-container .row {\n    display: flex;\n    flex-direction: column;\n    padding: 12px 15px;\n    border-bottom: 1px solid var(--border);\n    cursor: pointer;\n    transition: all 0.2s ease;\n    position: relative;\n    padding-right: 35px;\n}\n\n.json-miller-container .row:last-child {\n    border-bottom: none;\n}\n\n.json-miller-container .row:hover {\n    background: var(--hover);\n}\n\n.json-miller-container .row.active {\n    background: var(--active-bg);\n    border-left: none;\n    box-shadow: none;\n    font-weight: 500;\n}\n\n.json-miller-container .row-header {\n    display: flex;\n    justify-content: flex-start;\n    align-items: center;\n    margin-bottom: 8px;\n    gap: 8px;\n}\n\n.json-miller-container .key-label {\n    font-weight: 500;\n    font-size: 0.95rem;\n}\n\n/* Data Type Colors */\n.json-miller-container .type-string {\n    color: #5db075;\n}\n\n.json-miller-container .type-number {\n    color: #f2a53d;\n}\n\n.json-miller-container .type-boolean {\n    color: #a4508b;\n}\n\n.json-miller-container .type-object {\n    color: #4285f4;\n}\n\n.json-miller-container .type-array {\n    color: #fbbc04;\n}\n\n.json-miller-container .type-null {\n    color: #9aa0a6;\n}\n\n.json-miller-container .type-badge {\n    font-size: 0.85rem;\n    padding: 4px 6px;\n    border-radius: 6px;\n    background: transparent;\n    border: 1px solid transparent;\n    font-family: 'Fira Code', monospace;\n    font-weight: bold;\n    cursor: pointer;\n    appearance: none;\n    -webkit-appearance: none;\n    text-align: center;\n    max-width: max-content;\n}\n\n.json-miller-container .type-badge:hover {\n    background: rgba(0, 0, 0, 0.05);\n}\n\n/* Side-by-side layout for scalar fields */\n.json-miller-container[data-theme=\"light\"] {\n    --bg: #f0f2f5;\n    --col-bg: #ffffff;\n    --border: #dadce0;\n    --text: #202124;\n    --accent: #1a73e8;\n    --accent-active: #fce8e6;\n    --hover: #f1f3f48e;\n    --active-row: #e8f0fe;\n    --input-bg: rgba(0, 0, 0, 0.05);\n    --header-bg: #ffffff;\n    --output-bg: #ffffff;\n}\n\n.json-miller-container .row.scalar-row {\n    flex-direction: row;\n    align-items: center;\n    justify-content: space-between;\n    gap: 10px;\n}\n\n.json-miller-container .row.scalar-row .row-header {\n    margin-bottom: 0;\n    flex: 0 0 40%;\n    max-width: 140px;\n    overflow: visible;\n    position: relative;\n}\n\n.json-miller-container .row.scalar-row .key-label {\n    white-space: nowrap;\n    overflow: hidden;\n    text-overflow: ellipsis;\n    display: block;\n}\n\n.json-miller-container .row.scalar-row .input-wrapper {\n    flex: 1;\n    width: auto;\n}\n\n/* Inputs */\n.json-miller-container .input-wrapper {\n    display: flex;\n    gap: 8px;\n    align-items: center;\n}\n\n.json-miller-container input,\n.json-miller-container select {\n    background: var(--input-bg);\n    border: none;\n    border-bottom: 1px solid transparent;\n    color: var(--text);\n    padding: 8px;\n    border-radius: 4px;\n    width: 100%;\n    font-size: 0.9rem;\n    transition: all 0.2s;\n    font-family: inherit;\n}\n\n.json-miller-container input:focus,\n.json-miller-container select:focus {\n    outline: none;\n    background: rgba(var(--accent), 0.1);\n    border-bottom: 1px solid var(--accent);\n}\n\n/* Highlight label on focus */\n.json-miller-container .row:focus-within .key-label {\n    color: var(--accent);\n}\n\n/* Output Pane */\n.json-miller-container .jm-output {\n    width: 400px;\n    border-left: 1px solid var(--border);\n    padding: 25px;\n    background: var(--output-bg);\n    overflow-y: auto;\n    font-family: 'Fira Code', monospace;\n    font-size: 0.9rem;\n    white-space: pre-wrap;\n    color: var(--text);\n    box-shadow: -4px 0 10px rgba(0, 0, 0, 0.05);\n    transition: width 0.3s ease, padding 0.3s ease;\n}\n\n.json-miller-container .jm-output.collapsed {\n    width: 0;\n    padding: 0;\n    overflow: hidden;\n    border-left: none;\n}\n\n.json-miller-container .json-line {\n    display: block;\n    font-family: 'Fira Code', monospace;\n    white-space: pre;\n    padding: 0 4px;\n    border-radius: 4px;\n    cursor: pointer;\n}\n\n.json-miller-container .json-line:hover {\n    background: rgba(var(--accent), 0.1);\n}\n\n.json-miller-container .json-line.highlight {\n    background: rgba(255, 255, 0, 0.2);\n    border-left: 2px solid var(--accent);\n}\n\n[data-theme=\"dark\"] .json-miller-container .json-line.highlight {\n    background: rgba(255, 255, 0, 0.1);\n}\n\n/* Arrows for complex types */\n.json-miller-container .arrow {\n    margin-left: auto;\n    color: var(--text);\n    opacity: 0.5;\n    display: flex;\n    align-items: center;\n    transition: transform 0.2s, color 0.2s;\n}\n\n.json-miller-container .row.active .arrow {\n    color: var(--accent);\n    opacity: 1;\n    transform: translateX(2px);\n}\n\n/* Buttons */\n.json-miller-container button {\n    background: var(--accent);\n    color: var(--bg);\n    border: none;\n    padding: 8px 16px;\n    border-radius: 20px;\n    cursor: pointer;\n    font-weight: 500;\n    transition: opacity 0.2s;\n    font-family: inherit;\n}\n\n.json-miller-container button:hover {\n    opacity: 0.9;\n}\n\n/* Scrollbar styling */\n.json-miller-container ::-webkit-scrollbar {\n    width: 8px;\n    height: 8px;\n}\n\n.json-miller-container ::-webkit-scrollbar-track {\n    background: transparent;\n}\n\n.json-miller-container ::-webkit-scrollbar-thumb {\n    background: var(--border);\n    border-radius: 4px;\n}\n\n.json-miller-container ::-webkit-scrollbar-thumb:hover {\n    background: var(--accent);\n}\n\n/* Ghost Button for \"Add Item\" */\n.json-miller-container .add-item-btn {\n    background: transparent;\n    border: 1px solid transparent;\n    /* Prevent layout shift */\n    color: var(--accent);\n    margin: 10px;\n    width: calc(100% - 20px);\n    opacity: 0.5;\n    transition: all 0.2s;\n}\n\n.json-miller-container .add-item-btn:hover {\n    background: rgba(var(--accent), 0.1);\n    opacity: 0.7;\n    border: 1px dashed var(--accent);\n}\n\n/* Textarea for long text */\n.json-miller-container textarea {\n    background: transparent;\n    border: none;\n    border-bottom: 1px solid var(--border);\n    color: var(--text);\n    padding: 8px 0;\n    border-radius: 0;\n    width: 100%;\n    font-size: 0.9rem;\n    font-family: inherit;\n    resize: vertical;\n    min-height: 24px;\n    line-height: 1.4;\n    display: block;\n}\n\n.json-miller-container textarea:focus {\n    outline: none;\n    border-bottom: 2px solid var(--accent);\n    background: rgba(var(--accent), 0.05);\n}\n\n/* Optional Fields: \"+ Property\" Button */\n.json-miller-container .add-property-btn {\n    background: transparent;\n    border: 1px solid transparent;\n    color: var(--text);\n    margin: 10px;\n    width: calc(100% - 20px);\n    opacity: 0.5;\n    transition: all 0.2s;\n    font-size: 0.85rem;\n    padding: 6px 12px;\n}\n\n.json-miller-container .add-property-btn:hover {\n    opacity: 0.7;\n    background: rgba(0, 0, 0, 0.05);\n    border: 1px dashed var(--text);\n}\n\n/* Property Dropdown (Popover) */\n.json-miller-container .property-dropdown {\n    position: absolute;\n    background: var(--col-bg);\n    border: 1px solid var(--border);\n    border-radius: 8px;\n    box-shadow: var(--shadow);\n    z-index: 100;\n    min-width: 150px;\n    overflow: hidden;\n    animation: fadeIn 0.1s ease-out;\n}\n\n.json-miller-container .property-dropdown-item {\n    padding: 8px 12px;\n    cursor: pointer;\n    font-size: 0.9rem;\n    color: var(--text);\n    transition: background 0.2s;\n}\n\n.json-miller-container .property-dropdown-item:hover {\n    background: var(--hover);\n}\n\n@keyframes fadeIn {\n    from {\n        opacity: 0;\n        transform: translateY(-5px);\n    }\n\n    to {\n        opacity: 1;\n        transform: translateY(0);\n    }\n}\n\n/* Deletion: Hover-to-Reveal Trash Icon */\n.json-miller-container .delete-btn {\n    position: absolute;\n    right: 10px;\n    top: 50%;\n    transform: translateY(-50%);\n    background: transparent;\n    border: none;\n    color: var(--text);\n    opacity: 0;\n    cursor: pointer;\n    font-size: 1.1rem;\n    padding: 4px;\n    transition: all 0.2s;\n    pointer-events: none;\n}\n\n.json-miller-container .row:hover .delete-btn {\n    opacity: 0.4;\n    pointer-events: auto;\n}\n\n.json-miller-container .delete-btn:hover {\n    opacity: 1 !important;\n    color: #ef233c;\n}\n\n.json-miller-container .delete-btn.confirm {\n    opacity: 1 !important;\n    color: #ef233c;\n    animation: shake 0.3s;\n}\n\n@keyframes shake {\n    0% {\n        transform: translateY(-50%) translateX(0);\n    }\n\n    25% {\n        transform: translateY(-50%) translateX(-2px);\n    }\n\n    50% {\n        transform: translateY(-50%) translateX(2px);\n    }\n\n    75% {\n        transform: translateY(-50%) translateX(-2px);\n    }\n\n    100% {\n        transform: translateY(-50%) translateX(0);\n    }\n}\n\n/* Required Fields */\n.json-miller-container .key-label.required {\n    font-weight: 400;\n}\n\n.json-miller-container .key-label.optional {\n    font-weight: 400;\n}\n\n/* Lock Icon */\n.json-miller-container .lock-icon {\n    position: absolute;\n    right: 10px;\n    top: 50%;\n    transform: translateY(-50%);\n    color: var(--text);\n    opacity: 0.3;\n    font-size: 0.9rem;\n    cursor: not-allowed;\n    pointer-events: none;\n}\n\n/* Validation Errors */\n.json-miller-container .row.has-error {\n    border-left: 4px solid #ef233c;\n    background: rgba(239, 35, 60, 0.05);\n}\n\n.json-miller-container .row.child-error {\n    border-left: 4px solid rgba(239, 35, 60, 0.4);\n}\n\n.json-miller-container .row.has-error .key-label,\n.json-miller-container .row.child-error .key-label {\n    color: #ef233c;\n}\n\n.json-miller-container .input-error {\n    border-bottom: 2px solid #ef233c !important;\n}\n\n/* Tooltip for Lock */\n.json-miller-container .lock-icon:hover::after {\n    content: \"Required field\";\n    position: absolute;\n    right: 20px;\n    top: 50%;\n    transform: translateY(-50%);\n    background: #333;\n    color: white;\n    padding: 4px 8px;\n    border-radius: 4px;\n    font-size: 0.75rem;\n    white-space: nowrap;\n    z-index: 10;\n    pointer-events: none;\n}";

	/**
	 * JsonMiller - A Miller Column JSON Editor Library
	 */

	class JsonMiller {
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
	        this.showLockBtn = config.showLockBtn !== false; // Default true
	        this.enableJsonEdit = config.enableJsonEdit === true; // Default false
	        this.isJsonEditMode = false;

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
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>
                </button>
                </button>
                ${this.showLockBtn ? `<button class="jm-lock-btn" title="Lock/Unlock">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h80v80h-80v-160q0-50-35-85t-85-35q-50 0-85 35t-35 85v80H240v400h480v-240h80v240q0 33-23.5 56.5T720-80H240Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280Z"/></svg>
                </button>` : ''}
                ${this.enableJsonEdit ? `<button class="jm-json-edit-btn" title="Edit JSON">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>
                </button>` : ''}
                <button class="jm-copy-btn" title="Copy JSON">
                    <svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>
                </button>
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

	        this.wrapper.appendChild(this.header);
	        this.wrapper.appendChild(body);
	        this.shadowRoot.appendChild(this.wrapper);

	        this.breadcrumbsContainer = this.wrapper.querySelector('.jm-breadcrumbs');
	        this.editorContainer = this.wrapper.querySelector('.jm-editor');
	        this.outputContainer = this.wrapper.querySelector('.jm-output');

	        this.themeBtn = this.header.querySelector('.jm-theme-btn');
	        this.lockBtn = this.header.querySelector('.jm-lock-btn');
	        this.copyBtn = this.header.querySelector('.jm-copy-btn');
	        this.jsonEditBtn = this.header.querySelector('.jm-json-edit-btn');

	        // Bind events
	        this.themeBtn.onclick = () => this.toggleTheme();
	        if (this.lockBtn) this.lockBtn.onclick = () => this.toggleLock();
	        this.copyBtn.onclick = () => this.copyJson();
	        if (this.jsonEditBtn) this.jsonEditBtn.onclick = () => this.toggleJsonEditMode();
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
	        if (this.lockBtn) this.lockBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h40q33 0 56.5 23.5T800-560v400q0 33-23.5 56.5T720-80H240Zm0-80h480v-400H240v400Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280ZM360-640h240v-80q0-50-35-85t-85-35q-50 0-85 35t-35 85v80ZM240-160v-400 400Z"/></svg>';
	        this.render({ preserveScroll: true });
	    }

	    unlock() {
	        this.isLocked = false;
	        this.container.classList.remove('jm-locked');
	        if (this.lockBtn) this.lockBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M240-80q-33 0-56.5-23.5T160-160v-400q0-33 23.5-56.5T240-640h40v-80q0-83 58.5-141.5T480-920q83 0 141.5 58.5T680-720v80h80v80h-80v-160q0-50-35-85t-85-35q-50 0-85 35t-35 85v80H240v400h480v-240h80v240q0 33-23.5 56.5T720-80H240Zm240-120q33 0 56.5-23.5T560-360q0-33-23.5-56.5T480-440q-33 0-56.5 23.5T400-360q0 33 23.5 56.5T480-280Z"/></svg>';
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
	            if (this.themeBtn) this.themeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-120q-150 0-255-105T120-480q0-150 105-255t255-105q14 0 27.5 1t26.5 3q-41 29-65.5 75.5T444-660q0 90 63 153t153 63q55 0 101-24.5t75-65.5q2 13 3 26.5t1 27.5q0 150-105 255T480-120Z"/></svg>';
	        } else {
	            this.container.setAttribute('data-theme', 'light');
	            if (this.themeBtn) this.themeBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M480-280q-83 0-141.5-58.5T280-480q0-83 58.5-141.5T480-680q83 0 141.5 58.5T680-480q0 83-58.5 141.5T480-280ZM200-440H40v-80h160v80Zm720 0H760v-80h160v80ZM440-760v-160h80v160h-80Zm0 720v-160h80v160h-80ZM256-650l-101-97 57-59 96 100-52 56Zm492 496-97-101 53-55 101 97-57 59Zm-98-550 97-101 59 57-100 96-56-52ZM154-212l101-97 55 53-97 101-59-57Z"/></svg>';
	        }
	    }

	    copyJson() {
	        navigator.clipboard.writeText(JSON.stringify(this.data, null, 2));
	        alert("JSON copied to clipboard");
	    }

	    toggleJsonEditMode() {
	        if (this.isJsonEditMode) {
	            // Saving
	            const textarea = this.outputContainer.querySelector('textarea');
	            if (textarea) {
	                try {
	                    this.isJsonEditMode = false;
	                    const editIcon = `<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M200-200h57l391-391-57-57-391 391v57Zm-80 80v-170l528-527q12-11 26.5-17t30.5-6q16 0 31 6t26 18l55 56q12 11 17.5 26t5.5 30q0 16-5.5 30.5T817-647L290-120H120Zm640-584-56-56 56 56Zm-141 85-28-29 57 57-29-28Z"/></svg>`;
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
	            const saveIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="m20.71 9.29l-6-6a1 1 0 0 0-.32-.21A1.09 1.09 0 0 0 14 3H6a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h12a3 3 0 0 0 3-3v-8a1 1 0 0 0-.29-.71ZM9 5h4v2H9Zm6 14H9v-3a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1Zm4-1a1 1 0 0 1-1 1h-1v-3a3 3 0 0 0-3-3h-4a3 3 0 0 0-3 3v3H6a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1h1v3a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V6.41l4 4Z"/></svg>`;
	            this.jsonEditBtn.innerHTML = saveIcon;
	            this.jsonEditBtn.title = "Save JSON";
	            this.render();
	        }
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
	        if (this.isJsonEditMode) {
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
	        } else {
	            this.outputContainer.innerHTML = this.renderJsonHtml(this.data);
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

	        // Copy Path Button
	        if (this.selectionPath.length > 0) {
	            const copyBtn = document.createElement('button');
	            copyBtn.className = 'breadcrumb-copy-btn';
	            copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M360-240q-33 0-56.5-23.5T280-320v-480q0-33 23.5-56.5T360-880h360q33 0 56.5 23.5T800-800v480q0 33-23.5 56.5T720-240H360Zm0-80h360v-480H360v480ZM200-80q-33 0-56.5-23.5T120-160v-560h80v560h440v80H200Zm160-240v-480 480Z"/></svg>';
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
	                copyBtn.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="16" viewBox="0 -960 960 960" width="16" fill="currentColor"><path d="M382-240 154-468l57-57 171 171 367-367 57 57-424 424Z"/></svg>';
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
	                arrow.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" height="20" viewBox="0 -960 960 960" width="20" fill="currentColor"><path d="M504-480 320-664l56-56 240 240-240 240-56-56 184-184Z"/></svg>';
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
	                lockIcon.innerHTML = '<svg fill="currentColor" width="15" height="15" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24"><path d="M5 22h14a2 2 0 0 0 2-2v-9a2 2 0 0 0-2-2h-2V7A5 5 0 0 0 7 7v2H5a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2zm7-4.5a2 2 0 1 1 2-2 2 2 0 0 1-2 2zM9 9V7a3 3 0 0 1 6 0v2H9z"/></svg>';
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

	exports.JsonMiller = JsonMiller;

}));
//# sourceMappingURL=json-miller.js.map
