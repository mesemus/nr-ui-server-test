import {RouteRecordRaw} from "vue-router";

export interface Usage {
    type: 'landing' | 'listing' | 'detail' | 'edit' | string,
    // one of false (use without community),
    // true (use with any community),
    // string (use with this community)
    // string[] (use with these communities)
    community: false | true | string | string[],
    // one of false (use without datamodel),
    // one of true (use with any datamodel),
    // string (use with this datamodel)
    // string[] (use with these datamodels)
    datamodel: false | true | string | string[]

    // state of the record
    // published - only for published records
    // draft - only for draft records
    // all - for 'all' collection (pseudocollection of published and draft records)
    // true - use for any of the above
    state: 'published' | 'draft' | 'all' | Array<'published' | 'draft' | 'all'>
}

export interface PageOptions {
    usages?: Usage[]
}

export type PageType = PageOptions & RouteRecordRaw

export interface Config {
    pages?: PageType[]
}

export type ConfigMap = { [key: string]: Config }
