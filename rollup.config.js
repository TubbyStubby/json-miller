import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import css from 'rollup-plugin-css-only';
import replace from '@rollup/plugin-replace';

export default {
    input: 'script.js',
    output: {
        file: 'dist/json-miller.bundle.js',
        format: 'esm',
    },
    plugins: [
        replace({
            'process.env.NODE_ENV': JSON.stringify('production'),
            preventAssignment: true
        }),
        resolve({
            browser: true,
            preferBuiltins: false
        }),
        commonjs(),
        json(),
        css({ output: 'json-miller.css' })
    ]
};
