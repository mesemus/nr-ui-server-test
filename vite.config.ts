import {defineConfig} from 'vite'
import vue from '@vitejs/plugin-vue'

import {resolve} from 'path'

import fs from 'fs'
import os from 'os'

import {loadEnv} from 'vite'
import {minifyHtml, injectHtml} from 'vite-plugin-html'

const homedir = os.homedir();

function rfs(p: string) {
    try {
        return fs.readFileSync(p);
    } catch {
        return undefined;
    }
}


// https://vitejs.dev/config/
export default ({mode}) => {
    const env = {...loadEnv(mode, process.cwd())}
    return defineConfig({
        plugins: [
            vue(),
            minifyHtml(),
            injectHtml({
                injectData: {
                    title: env.VITE_TITLE,
                    icon: env.VITE_ICON
                },
            }),
        ],
        resolve: {
            alias: {
                '@': resolve(__dirname, '/src'),
                'src': resolve(__dirname, '/src'),
            },
        },
        server: {
            open: false, // opens browser window automatically,
            hot: true,
            host: 'localhost',
            port: 8080,
            http2: false,
            https: {
                key: rfs(`${homedir}/.ssh/dev/server-key.pem`),
                cert: rfs(`${homedir}/.ssh/dev/server.pem`),
                cacert: rfs(`${homedir}/.ssh/dev/ca.pem`),
            },
            proxy: {}
        }
    })
}
