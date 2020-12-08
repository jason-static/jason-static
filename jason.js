#!/usr/bin/env node
import * as fs from "fs"

const dataPath = process.argv[2] || "data.json"
const pagesPath = process.argv[3] || "pages.json"

const data = JSON.parse(fs.readFileSync(dataPath))
const pages = JSON.parse(fs.readFileSync(pagesPath))

const recursePages = (dir, parent = "", variables = {}) => {
    Object.keys(dir, parent).forEach((key) => {
        if (key.startsWith("/")) {
            const pathData = dir[key]


            if (typeof pathData === "object" /* "always" true for child of /key */) {
                const localVariables = {}

                Object.keys(pathData).map(key => {
                    if (key.startsWith("_")) {
                        const name = key.slice("_".length)
                        const path = pathData[key].slice("data.".length)
                        localVariables[name] = data[path]
                    }
                })

                const pathVars = key.match(/\[.+?\]/g)
                if (pathVars) {
                    pathVars.map(stringToReplace => {
                        const replacementStrings = localVariables[stringToReplace.slice(1,-1)]
                        replacementStrings.map(newString => {
                            const newKey = key.replace(stringToReplace, newString)
                            recursePages(pathData, parent + newKey)
                        })
                    })
                } else {
                    recursePages(pathData, parent + key)
                }
            }
        }


        if (key === "template") {
            console.log(parent, '\t', dir[key])
            return
        }
  })
}

recursePages(pages)

// todo:
//   parse paths into work-list
//   use work-list to generate pages
