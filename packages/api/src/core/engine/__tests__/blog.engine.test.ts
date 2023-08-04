import { cwd } from 'process'
import { describe, expect, it } from 'vitest'
import { z } from 'zod'
import { BlogEngine } from '../blog.engine'

const blogEngine = new BlogEngine({
    sourcePath: `${cwd()}/packages/engine/src/core/engine/__mocks__` as const,
    fileNameExceptions: ['profile.json'],
    urlBasePath: 'https://example.com',
    postGenerationTimeMetaName: 'update',
    postTitleMetaName: 'title',
    tocExtractionDepthRange: {
        min: 1,
        max: 2,
    },
    postCountPerPage: 4,
    postMetaSchema: z.object({
        title: z.string(),
        preview: z.string(),
        author: z.string(),
        update: z.date(),
        color: z.string(),
        tags: z.array(z.string()),
    }),
    categorySchema: z.object({
        description: z.string(),
        emoji: z.string().emoji().optional(),
        color: z.string().optional(),
    }),
    mdxParserOption: {},
    blogTree: {
        blogFolderName: 'blog',
        postFolderName: 'posts',
        categoryDescriptionFileName: 'description.json',
    },
})

describe('BlogEngine - total test', () => {
    const allCategories = ['javascript', 'typescript']
    const categoryPostGroups: Array<{ category: string; posts: string[] }> = [
        {
            category: 'javascript',
            posts: ['js1'],
        },
        {
            category: 'typescript',
            posts: ['ts1', 'ts2'],
        },
    ]

    it('should extract category description json files and data', async () => {
        const categoryInfo = await Promise.all(
            allCategories.map(async (category) => await blogEngine.getCategoryDescription(category))
        )

        expect(categoryInfo).toStrictEqual([
            {
                category: 'javascript',
                color: '#FAF14A',
                description: 'javascript is amazing!',
                emoji: '🔮',
            },
            {
                category: 'typescript',
                color: '#3C87FF',
                description: 'typescript is amazing language!',
                emoji: '🦾',
            },
        ])
    })

    it('should extract all posts rendering data', async () => {
        const allPosts = await Promise.all(
            categoryPostGroups.map(
                async ({ category, posts }) =>
                    await Promise.all(
                        posts.map(async (postFileName) => await blogEngine.getPost({ category, postFileName }))
                    )
            )
        )

        expect(allPosts).toStrictEqual([
            [
                {
                    mdxSource:
                        'var Component=(()=>{var a=Object.create;var t=Object.defineProperty;var g=Object.getOwnPropertyDescriptor;var C=Object.getOwnPropertyNames;var j=Object.getPrototypeOf,m=Object.prototype.hasOwnProperty;var p=(e,n)=>()=>(n||e((n={exports:{}}).exports,n),n.exports),u=(e,n)=>{for(var h in n)t(e,h,{get:n[h],enumerable:!0})},l=(e,n,h,d)=>{if(n&&typeof n=="object"||typeof n=="function")for(let r of C(n))!m.call(e,r)&&r!==h&&t(e,r,{get:()=>n[r],enumerable:!(d=g(n,r))||d.enumerable});return e};var x=(e,n,h)=>(h=e!=null?a(j(e)):{},l(n||!e||!e.__esModule?t(h,"default",{value:e,enumerable:!0}):h,e)),_=e=>l(t({},"__esModule",{value:!0}),e);var o=p((b,c)=>{c.exports=_jsx_runtime});var D={};u(D,{default:()=>w,frontmatter:()=>f});var i=x(o()),f={title:"js1 title",preview:"this is javascript1 preview",author:"danpacho",update:new Date(16888608e5),color:"#6563c4",tags:["js","javascript"]};function s(e){let n=Object.assign({h1:"h1",h2:"h2",h3:"h3"},e.components);return(0,i.jsxs)(i.Fragment,{children:[(0,i.jsx)(n.h1,{children:"Post Title"}),`\n`,(0,i.jsx)(n.h2,{children:"Child1"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 1"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 2"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 3"}),`\n`,(0,i.jsx)(n.h1,{children:"Title2"}),`\n`,(0,i.jsx)(n.h2,{children:"Child2"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 4"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 5"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 6"}),`\n`,(0,i.jsx)(n.h2,{children:"Child3"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 7"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 8"}),`\n`,(0,i.jsx)(n.h3,{children:"Child ignored 9"})]})}function v(e={}){let{wrapper:n}=e.components||{};return n?(0,i.jsx)(n,Object.assign({},e,{children:(0,i.jsx)(s,e)})):s(e)}var w=v;return _(D);})();\n;return Component;',
                    meta: {
                        order: 1,
                        pageNumber: 1,
                        fileName: 'js1',
                        title: 'js1 title',
                        author: 'danpacho',
                        color: '#6563c4',
                        tags: ['js', 'javascript'],
                        preview: 'this is javascript1 preview',
                        link: '/javascript/1/js1',
                        update: new Date('2023-07-09T00:00:00.000Z'),
                    },
                    navigator: {
                        next: undefined,
                        prev: undefined,
                    },
                    tableOfContents: [
                        {
                            depth: 1,
                            text: 'Post Title',
                            href: '#Post Title',
                            children: [{ depth: 2, text: 'Child1', href: '#Child1', children: undefined }],
                        },
                        {
                            depth: 1,
                            text: 'Title2',
                            href: '#Title2',
                            children: [
                                { depth: 2, text: 'Child2', href: '#Child2', children: undefined },
                                { depth: 2, text: 'Child3', href: '#Child3', children: undefined },
                            ],
                        },
                    ],
                },
            ],
            [
                {
                    mdxSource:
                        'var Component=(()=>{var l=Object.create;var o=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var d=Object.getPrototypeOf,f=Object.prototype.hasOwnProperty;var j=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),p=(t,e)=>{for(var n in e)o(t,n,{get:e[n],enumerable:!0})},i=(t,e,n,c)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of x(e))!f.call(t,s)&&s!==n&&o(t,s,{get:()=>e[s],enumerable:!(c=m(e,s))||c.enumerable});return t};var _=(t,e,n)=>(n=t!=null?l(d(t)):{},i(e||!t||!t.__esModule?o(n,"default",{value:t,enumerable:!0}):n,t)),b=t=>i(o({},"__esModule",{value:!0}),t);var u=j((O,a)=>{a.exports=_jsx_runtime});var M={};p(M,{default:()=>D,frontmatter:()=>g});var r=_(u()),g={title:"ts1 title",preview:"this is test ts1",author:"\\uB2E8\\uD325\\uCD08",update:new Date(16892064e5),color:"#b38dac",tags:["test2","test3","test4"]};function h(t){let e=Object.assign({h1:"h1"},t.components);return(0,r.jsx)(e.h1,{children:"Post Title"})}function w(t={}){let{wrapper:e}=t.components||{};return e?(0,r.jsx)(e,Object.assign({},t,{children:(0,r.jsx)(h,t)})):h(t)}var D=w;return b(M);})();\n;return Component;',
                    meta: {
                        order: 2,
                        pageNumber: 1,
                        author: '단팥초',
                        fileName: 'ts1',
                        color: '#b38dac',
                        title: 'ts1 title',
                        preview: 'this is test ts1',
                        link: '/typescript/1/ts1',
                        tags: ['test2', 'test3', 'test4'],
                        update: new Date('2023-07-13T00:00:00.000Z'),
                    },
                    navigator: { prev: { title: 'ts2 title', link: '/typescript/1/ts2' }, next: undefined },
                    tableOfContents: [{ depth: 1, text: 'Post Title', href: '#Post Title', children: undefined }],
                },
                {
                    mdxSource:
                        'var Component=(()=>{var l=Object.create;var o=Object.defineProperty;var m=Object.getOwnPropertyDescriptor;var x=Object.getOwnPropertyNames;var d=Object.getPrototypeOf,f=Object.prototype.hasOwnProperty;var j=(t,e)=>()=>(e||t((e={exports:{}}).exports,e),e.exports),p=(t,e)=>{for(var n in e)o(t,n,{get:e[n],enumerable:!0})},i=(t,e,n,c)=>{if(e&&typeof e=="object"||typeof e=="function")for(let s of x(e))!f.call(t,s)&&s!==n&&o(t,s,{get:()=>e[s],enumerable:!(c=m(e,s))||c.enumerable});return t};var _=(t,e,n)=>(n=t!=null?l(d(t)):{},i(e||!t||!t.__esModule?o(n,"default",{value:t,enumerable:!0}):n,t)),b=t=>i(o({},"__esModule",{value:!0}),t);var u=j((O,a)=>{a.exports=_jsx_runtime});var M={};p(M,{default:()=>D,frontmatter:()=>g});var r=_(u()),g={title:"ts2 title",preview:"this is test ts2",author:"\\uB2E8\\uD325\\uCD08",update:new Date(1689552e6),color:"#b38dac",tags:["test2-2","test3-2","test4-2"]};function h(t){let e=Object.assign({h1:"h1"},t.components);return(0,r.jsx)(e.h1,{children:"Post Title"})}function w(t={}){let{wrapper:e}=t.components||{};return e?(0,r.jsx)(e,Object.assign({},t,{children:(0,r.jsx)(h,t)})):h(t)}var D=w;return b(M);})();\n;return Component;',
                    meta: {
                        order: 1,
                        pageNumber: 1,
                        author: '단팥초',
                        fileName: 'ts2',
                        color: '#b38dac',
                        title: 'ts2 title',
                        preview: 'this is test ts2',
                        link: '/typescript/1/ts2',
                        tags: ['test2-2', 'test3-2', 'test4-2'],
                        update: new Date('2023-07-17T00:00:00.000Z'),
                    },
                    navigator: {
                        prev: undefined,
                        next: { title: 'ts1 title', link: '/typescript/1/ts1' },
                    },
                    tableOfContents: [{ depth: 1, text: 'Post Title', href: '#Post Title', children: undefined }],
                },
            ],
        ])
    })

    it('should extract all posts meta data', async () => {
        const allPostMeta = await blogEngine.getAllPostMeta()

        expect(allPostMeta).toStrictEqual([
            {
                title: 'js1 title',
                preview: 'this is javascript1 preview',
                author: 'danpacho',
                update: new Date('2023-07-09T00:00:00.000Z'),
                color: '#6563c4',
                tags: ['js', 'javascript'],
                fileName: 'js1',
                order: 1,
                link: '/javascript/1/js1',
                pageNumber: 1,
            },
            {
                title: 'ts2 title',
                preview: 'this is test ts2',
                author: '단팥초',
                update: new Date('2023-07-17T00:00:00.000Z'),
                color: '#b38dac',
                tags: ['test2-2', 'test3-2', 'test4-2'],
                fileName: 'ts2',
                order: 1,
                link: '/typescript/1/ts2',
                pageNumber: 1,
            },
            {
                title: 'ts1 title',
                preview: 'this is test ts1',
                author: '단팥초',
                update: new Date('2023-07-13T00:00:00.000Z'),
                color: '#b38dac',
                tags: ['test2', 'test3', 'test4'],
                fileName: 'ts1',
                order: 2,
                link: '/typescript/1/ts1',
                pageNumber: 1,
            },
        ])
    })

    it('should show end-page number at category', async () => {
        const totalPageNumbers = await Promise.all(
            allCategories.map(async (category) => {
                const totalPageNumber = await blogEngine.getTotalPageNumberOfCategory(category)
                return {
                    category,
                    totalPageNumber,
                }
            })
        )
        expect(totalPageNumbers).toStrictEqual([
            {
                category: 'javascript',
                totalPageNumber: 1,
            },
            {
                category: 'typescript',
                totalPageNumber: 1,
            },
        ])
    })

    it('should extract all nextJs generateStaticParams build path', async () => {
        const staticBuildPathGroupsForPost = await blogEngine.generateStaticParamsForPost()

        expect(staticBuildPathGroupsForPost).toStrictEqual([
            { category: 'javascript', page: '1', postFileName: 'js1' },
            { category: 'typescript', page: '1', postFileName: 'ts2' },
            { category: 'typescript', page: '1', postFileName: 'ts1' },
        ])
    })

    it('should extract all nextJs sitemap url & lastModified data', async () => {
        const sitemap = await blogEngine.generateSitemap()
        expect(sitemap).toStrictEqual([
            // [category]
            { url: 'https://example.com/javascript' },
            { url: 'https://example.com/typescript' },
            { url: 'https://example.com/typescript' },
            // [category]/[page]
            { url: 'https://example.com/javascript/1' },
            { url: 'https://example.com/typescript/1' },
            { url: 'https://example.com/typescript/1' },
            // [category]/[page]/[postFileName]
            { url: 'https://example.com/javascript/1/js1', lastModified: new Date('2023-07-09T00:00:00.000Z') },
            { url: 'https://example.com/typescript/1/ts2', lastModified: new Date('2023-07-17T00:00:00.000Z') },
            { url: 'https://example.com/typescript/1/ts1', lastModified: new Date('2023-07-13T00:00:00.000Z') },
        ])
    })
})
