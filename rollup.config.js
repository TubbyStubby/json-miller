import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { string } from 'rollup-plugin-string';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';

const commonPlugins = [
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
    string({
        include: '**/*.css'
    })
];

export default [
    // UMD Bundle (for <script> tags)
    {
        input: 'src/index.js',
        output: {
            name: 'JsonMiller',
            file: 'dist/json-miller.js',
            format: 'umd',
            sourcemap: true
        },
        plugins: commonPlugins
    },
    // Minified UMD Bundle
    {
        input: 'src/index.js',
        output: {
            name: 'JsonMiller',
            file: 'dist/json-miller.min.js',
            format: 'umd',
            sourcemap: true
        },
        plugins: [...commonPlugins, terser()]
    },
    // ESM Bundle (for bundlers)
    {
        input: 'src/index.js',
        output: {
            file: 'dist/json-miller.esm.js',
            format: 'esm',
            sourcemap: true
        },
        plugins: commonPlugins
    },
    // Minified ESM Bundle
    {
        input: 'src/index.js',
        output: {
            file: 'dist/json-miller.esm.min.js',
            format: 'esm',
            sourcemap: true
        },
        plugins: [...commonPlugins, terser()]
    }
];
