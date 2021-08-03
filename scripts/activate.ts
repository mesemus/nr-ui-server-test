import fs from 'fs'
import yargs from 'yargs'
import {RouteGenerator} from './pages'
import {ConfigMap} from './types'

const ACTIVATED_MODULES_FILE = '.activated-modules.json'

function parseArgs() {
    const argv = yargs(process.argv.slice(2)).argv
    return argv
}

async function run() {

    const activatedModules = parseArgs()._

    // TODO: pridat po skonceni ladeni
    // if (fs.existsSync(ACTIVATED_MODULES_FILE)) {
    //     console.error('\nThis directory contains work in progress, please call deactivate first\n')
    //     process.exit(1)
    // }

    fs.writeFileSync(ACTIVATED_MODULES_FILE, JSON.stringify(activatedModules))

    // for each module, require the module's plugin.js or plugin.ts file
    const configs = (await Promise.all(
        activatedModules.map(async m => [m, (await import(m)).UIPlugin])
    )).reduce<ConfigMap>((p, k) => {
        p[k[0]] = k[1]
        return p
    }, {})

    const routeGenerator = new RouteGenerator()
    Object.entries(configs).forEach(([module, config]) => {
        (config.pages || []).forEach((pageDef, index) => {
            routeGenerator.addPage(module, index, pageDef)
        })
    })

    routeGenerator.generate()
}

run()
