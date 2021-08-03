import {DEFAULT_USAGE} from "./default"
import {PageType, Usage} from './types'
import { last }  from 'lodash'

class Page {
    module: string
    index: number
    pageDef: PageType

    constructor(module: string, index: number, pageDef: PageType) {
        this.module = module
        this.index = index
        this.pageDef = pageDef
    }

    listingPath(usage: Usage) {
        const path = []
        if (usage.community !== false) {
            const communities = []
            if (typeof usage.community === 'string') {
                communities.push(usage.community)
            } else if (Array.isArray(usage.community)) {
                communities.push(...usage.community)
            }
            if (communities.length) {
                path.push(':community')
            } else {
                path.push(`:community(${communities.join('|')})`)
            }
        }
        if (usage.datamodel !== false) {
            const datamodels = []
            if (typeof usage.datamodel === 'string') {
                datamodels.push(usage.datamodel)
            } else if (Array.isArray(usage.datamodel)) {
                datamodels.push(...usage.datamodel)
            } else {
            }
            if (datamodels.length) {
                path.push(':datamodels')
            } else {
                path.push(`:datamodels(${datamodels.join('|')})`)
            }
        }
        if (usage.state) {
            const states = []
            if (typeof usage.state === 'string') {
                states.push(usage.state)
            } else if (Array.isArray(usage.state)) {
                states.push(...usage.state)
            }
            if (states.length) {
                path.push(':states')
            } else {
                path.push(`:states(${states.join('|')})`)
            }
        }
        return path
    }

    get paths() {
        if (this.pageDef.path) {
            // TODO: better splitting of the path
            return [this.pageDef.path.split('/')]
        }
        return (this.pageDef.usages || [DEFAULT_USAGE]).map(usage => {
            switch (usage.type) {
                case 'listing':
                    return this.listingPath(usage)
                case 'detail':
                    return [...this.listingPath(usage), ':id']
                case 'edit':
                    return [...this.listingPath(usage), ':id', 'edit']
                case 'landing':
                    return []   // TODO: landing for communities
            }
        })
    }
}

class PathTree<T> {
    byPath: { [key: string]: PathTree<T> }
    entries: T[]
    parent?: PathTree<T>
    path: string

    constructor(path: string, parent?: PathTree<T>) {
        this.byPath = {}
        this.entries = []
        this.parent = parent
        this.path = path
    }

    add(path: string[], entry: T) {
        if (path.length == 0) {
            this.entries.push(entry)
        } else {
            let bp = this.byPath[path[0]]
            if (bp === undefined) {
                bp = this.byPath[path[0]] = new PathTree<T>(path[0], this)
            }
            bp.add(path.slice(1), entry)
        }
    }

    get relativePath() {
        const rp = [this.path]
        let p : PathTree<T> = this.parent
        while (p && p.entries.length == 0) {
            rp.unshift(p.path)
            p = p.parent
        }
        return rp
    }
}

class Partition {
    pages: Page[]
    name: string

    constructor(name: string) {
        this.name = name
        this.pages = []
    }

    addPage(module, index, pageDef) {
        this.pages.push(new Page(module, index, pageDef))
    }

    generate() {
        const pt = new PathTree<Page>('')
        this.pages.forEach(page => {
            page.paths.forEach(path => {
                pt.add(path, page)
            })
        })


        // TODO: layouts

        // and generate routes
        this.generateRoutes(pt)

        // add generated file to routes
    }

    generateRoutes(pt: PathTree<Page>) {
        const routeData = [
            `export const ${this.name}Routes = [`
        ]

        this.generateRouteForTreeNode(pt, routeData)

        routeData.push(']')
        return routeData.join('\n')
    }

    generateRouteForTreeNode(pt: PathTree<Page>, routeData: string[]) {
        const page = last(pt.entries)
        if (pt.entries.length>1) {
            console.warn('Too many pages on the same path. Selecting', page)
        }
        const relativePath = pt.relativePath.join('/')

    }
}

export class RouteGenerator {
    partitions: { [key: string]: Partition }

    constructor() {
        this.partitions = {}
    }

    addPage(module, index, pageDef) {
        const partition = pageDef.partition || 'default'
        let p = this.partitions[partition]
        if (!p) {
            p = this.partitions[partition] = new Partition(partition)
        }
        p.addPage(module, index, pageDef)
    }

    generate() {
        Object.values(this.partitions).forEach(partition => {
            partition.generate()
        })
    }
}
