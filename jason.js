#!/usr/bin/env node
import * as fs from "fs"
import fsExtra from "fs-extra"
import * as os from "os"
import * as path from "path"

import Mustache from 'mustache'

import { crossObject } from "./crossObject.js"

const dataPath = (process.argv[2] || "./") + "data.json"
const pagesPath = (process.argv[2] || "./") + "pages.json"

const data = JSON.parse(fs.readFileSync(dataPath))
const pages = JSON.parse(fs.readFileSync(pagesPath))

const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'jason-build-'))
console.log(`Building in ${tempDir}/`)

const getDottedPath = (data, dataPath) => {
    return dataPath.split(".").reduce((data, pathSeg) => {
        return data[pathSeg]
    }, data)
}

const createFileAtPath = (filePath, contents) => {
    const pathComponents = filePath.split('/')
    if (pathComponents.length > 1) {
        const dirPath = pathComponents.slice(0, -1).join('/')
        fs.mkdirSync(dirPath, { recursive: true })
    }
    fs.writeFileSync(filePath, contents, { flag: 'wx' })
}

const recursePaths = (parentPath, parentPathData, context) => {
    const templateFile = parentPathData["template"]
    if (typeof templateFile === "string") {
        const templatePath = (process.argv[2] || "./") + "templates/" + templateFile
        const templateString = fs.readFileSync(templatePath).toString()
        const renderedString = Mustache.render(templateString, context)
        console.log(`Creating ${parentPath}`)
        createFileAtPath(
            path.join(tempDir, parentPath),
            renderedString
        )
    }

    Object.keys(parentPathData)
        .filter((key) => key.startsWith("/"))
        .forEach((key) => {
            const pathData = parentPathData[key]
            const innerVars = {}

            Object.keys(pathData)
                .filter((innerKey) => innerKey.startsWith("_"))
                .forEach((innerKey) => {
                    const name = innerKey.slice("_".length)
                    const dataPath = pathData[innerKey]
                    innerVars[name] = getDottedPath(context, dataPath)
                })

            const paths = []

            const pathPatterns = key.match(/\[.+?\]/g)
            if (pathPatterns) {

                // Step 1: Define URL patterns from URL template:

                const innerPatterns = pathPatterns.map((outerPattern) =>
                    outerPattern.slice(1, -1)
                )

                // Step 2:
                //     For each pattern, get array of possibilities
                //     Create a dictionary matching patterns to assigned (top-level) variables
                //     Do not resolve pattern dots yet

                const patternValueDict = innerPatterns.reduce((acc, pattern) => {
                    const firstPattern = pattern.split(".")[0]
                    const localValue = getDottedPath(
                        { ...innerVars, ...context },
                        firstPattern
                    )

                    return {
                        ...acc,
                        [firstPattern]: Array.isArray(localValue)
                            ? localValue
                            : [localValue],
                    }
                }, {})

                // Step 3: Resolve pattern-data dictionary of combinations

                const combinations = crossObject(patternValueDict)

                // Step 4: Create permuted URL dictionary with assigned variable contexts

                const finished_urls = combinations.map((dataCombination) => {
                    let url = key
                    innerPatterns.forEach((pattern) => {
                        const instanceData = getDottedPath(dataCombination, pattern)
                        const stringFragment = instanceData
                            .toLowerCase()
                            .split(" ")
                            .join("_")
                        url = url.replace(`[${pattern}]`, stringFragment)
                    })
                    return { url, instances: dataCombination }
                })

                // Step 5: For each url, recurse in and pass context

                finished_urls.forEach(({ url, instances }) => {
                    paths.push({
                        path: parentPath + url,
                        context: {
                            ...context,
                            ...innerVars,
                            ...instances,
                        },
                    })
                })
            } else {
                paths.push({
                    path: parentPath + key,
                    context: {
                        ...context,
                        ...innerVars,
                    },
                })
            }

            paths.map(({ path, context }) => {
                recursePaths(path, pathData, context)
            })
        })
}

recursePaths("", pages, { data })

console.log('Copying files to ./build/')
fsExtra.removeSync('build')
fsExtra.moveSync(tempDir, 'build')
