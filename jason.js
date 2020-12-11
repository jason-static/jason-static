#!/usr/bin/env node
import * as fs from "fs"

import { crossObject } from "./crossObject.js"

const dataPath = process.argv[2] || "data.json"
const pagesPath = process.argv[3] || "pages.json"

const data = JSON.parse(fs.readFileSync(dataPath))
const pages = JSON.parse(fs.readFileSync(pagesPath))

const getDottedPath = (data, dataPath) => {
    return dataPath.split('.').reduce((data, pathSeg) => {
        return data[pathSeg]
    }, data)
}

const recursePaths = (parentPath, parentPathData, context) => {
    const templateFile = parentPathData["template"]
    if (typeof templateFile === "string") {
        console.log(parentPath, "\t", templateFile)
    }

    Object.keys(parentPathData)
        .filter((key) => key.startsWith("/"))
        .forEach((key) => {
            const pathData = parentPathData[key]
            const innerVars = {}

            Object.keys(pathData)
                .filter(innerKey => innerKey.startsWith("_"))
                .forEach((innerKey) => {
                    const name = innerKey.slice("_".length)
                    const dataPath = pathData[innerKey]
                    innerVars[name] = getDottedPath(context, dataPath)
            })

            const paths = []

            const pathPatterns = key.match(/\[.+?\]/g)
            if (pathPatterns) {
                const innerPatterns = pathPatterns.map(outerPattern => {
                    const pattern = outerPattern.slice(1,-1)
                    const replacement = getDottedPath({ ...innerVars, ...context}, pattern)
                    const replacements = typeof(replacement) === 'string' ? [replacement] : replacement
                    return {
                        [pattern]: replacements
                    }
                })

                console.log('ip', innerPatterns)



                // validate pathPatterns
                // - does data exist at path?
                //   - accepatable:
                //     - direct data reference to usable string
                //       - (eg /[data.company.title])
                //     - variable assigned to useable string
                //       - (eg /[title].html :: _title: data.company.title)
                //     - subpath of variable assigned to useable string
                //       - (eg /[company.title].html :: _company: data.company)
                //     - variable assigned to array of usable strings
                //       - (eg /[name].html :: _name: data.company.employee_names)
                //     - subpath of variable assigned to array of objects where that subpath is a direct path to usable string
                //       - (eg /[employee.name].html :: _employee: data.company.employees)
                //   - not acceptable:
                //     - path containing an array not directly assigned to a variable
                //       - (eg /[data.company.employee.name].html)
                //       - (eg /[company.employee.name].html :: [_comapny]: data.company)
                //       - (eg /[company.employee_names].html :: [_company]: data.company)
                // - ultimate data type must be valid url string



                // const newPaths = innerPatterns.reduce((urlDef, {pattern, replacements}) => {
                //     return urlDef.replace(`[${pattern}]`, replacements[0])
                // }, key)

                // console.log('\tnp',newPaths)



                pathPatterns.map((outerPattern) => {
                    const innerPattern = outerPattern.slice(1, -1)
                    const replacement = getDottedPath({ ...innerVars, ...context}, innerPattern)

                    if(typeof(replacement) === 'string') {
                        const currentPath = key.replace(outerPattern, replacement)
                        recursePaths(parentPath + currentPath, pathData, {
                            ...innerVars,
                            ...context
                        })
                    } else {
                        replacement.map((replacementString) => {
                            const currentPath = key.replace(outerPattern, replacementString)
                            // TODO: pass specific variable instance as context...
                            // TODO: move this outside...
                            // recursePaths(parentPath + currentPath, pathData, {
                            //     ...innerVars,
                            //     ...context
                            // })
                        })
                    }
                })


            } else {
                paths.push(
                    {
                        path: parentPath + key,
                        context: {
                            ...innerVars,
                            ...context
                        }
                    }
                )
            }

            paths.map(({ path, context }) => {
                recursePaths(
                    path,
                    pathData,
                    context
                )
            })
        })
}

recursePaths("", pages, { data })

// + apply template if exists
// + for each path ('/...')
//   - define path's internal variables
//   - find path template patterns
//   - replace path patterns with values to create set of true paths
//     - for each path, define context based on local variables, pass along
