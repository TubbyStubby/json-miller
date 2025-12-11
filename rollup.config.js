import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import { string } from 'rollup-plugin-string';
import replace from '@rollup/plugin-replace';
import terser from '@rollup/plugin-terser';
import serve from 'rollup-plugin-serve';
import livereload from 'rollup-plugin-livereload';

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

const libraryConfigs = [];

if (process.env.ROLLUP_WATCH) {
    // Add a new, dedicated config object just for serving the example
    libraryConfigs.push({
        // Input is your example file that uses your library
        input: 'src/index.js',
        output: {
            // Output the development bundle directly into your example folder
            file: 'example/dist/bundle.js',
            format: 'umd', // UMD or IIFE works best for browser testing
            name: 'JsonMiller',
            sourcemap: true
        },
        plugins: [
            ...commonPlugins, // Use your existing plugins
            serve({
                // Serve the root directory of your example folder
                contentBase: 'example', // Serve files from 'example' and 'dist' folders
                open: true, // Open the browser automatically
                host: 'localhost',
                port: 8080,
            }),
            livereload({
                watch: ['example', 'src'] // Watch these folders for changes to reload the page
            })
        ]
    });
} else {
    libraryConfigs.push(
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
    );
}

export default libraryConfigs;
