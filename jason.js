#!/usr/bin/env node
import * as fs from "fs"

const dataPath = process.argv[2] || "data.json"
const pagesPath = process.argv[3] || "pages.json"

const data = JSON.parse(fs.readFileSync(dataPath))
const pages = JSON.parse(fs.readFileSync(pagesPath))

const recursePages = (dir, parent = "") => {
    Object.keys(dir, parent).map((key) => {
        if (key.startsWith("/")) {
            if (typeof dir[key] === "object") {
                recursePages(dir[key], parent+key)
            }
        }

        if (key === "template") {
            console.log(parent)
        }
  })
}

recursePages(pages)
