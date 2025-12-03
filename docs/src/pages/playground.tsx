import React, { useEffect, useRef } from 'react';
import Layout from '@theme/Layout';
import BrowserOnly from '@docusaurus/BrowserOnly';

function Playground() {
    const containerRef = useRef<HTMLDivElement>(null);
    const editorRef = useRef<any>(null);

    useEffect(() => {
        if (!containerRef.current) return;

        // Load the library dynamically
        // @ts-ignore
        import(/* webpackIgnore: true */ '/dist/json-miller.bundle.js').then((module) => {
            const { JsonMiller } = module;

            if (editorRef.current) {
                editorRef.current.destroy();
            }

            const data = {
                "name": "JsonMiller",
                "version": "1.0.0",
                "features": [
                    "Miller Columns",
                    "JSON Schema Validation",
                    "Theming"
                ],
                "config": {
                    "theme": "dark",
                    "locked": false
                }
            };

            editorRef.current = new JsonMiller(containerRef.current, {
                data: data,
                title: "Playground",
                enableJsonEdit: true,
                showLockBtn: true
            });

        }).catch(err => console.error("Failed to load JsonMiller", err));

        return () => {
            if (editorRef.current) {
                editorRef.current.destroy();
            }
        };
    }, []);

    return (
        <Layout title="Playground" description="Try JsonMiller">
            <div
                ref={containerRef}
                style={{ height: 'calc(100vh - 60px)', border: '1px solid #ccc', margin: '0' }}
            />
        </Layout>
    );
}

export default function PlaygroundPage() {
    return (
        <BrowserOnly>
            {() => <Playground />}
        </BrowserOnly>
    );
}
