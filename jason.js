#!/usr/bin/env node
import * as fs from 'fs'

const dataPath = process.argv[2]
const data = JSON.parse(fs.readFileSync(dataPath))

console.log(data)
