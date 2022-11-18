#!/usr/bin/env node

import { program } from "commander"
import fs from "fs"
import Document from "./Document.js"

export const convertMarkdown = async function (source, dest, tags, csv) {
  let index = source.lastIndexOf('\\')
  index = index > 0 ? index : source.lastIndexOf('/')
  let dir = source.substr(0, index + 1)

  if (tags) tags = tags.split(" ")
  
  const document = Document.readDocument(source)
  if (!document) return
  document.dir = dir
  const doc = new Document(document, tags)
  let output = ''
    const version = doc.getVersion()
  if (csv) {
    output = doc.getCsv()
    dest += (version ? ('.' + version) : '') + '.csv'
  } else {
    output = doc.getOutput()
    dest += (version ? ('.' + version) : '') + '.md'
  }
  if (dest) {
    fs.promises.writeFile(dest, output, "utf8")
  } else {
    console.log(output)
  }
}

program
  .version(process.env.npm_package_version || "unknown")
  .arguments("<source> [destination]")
  .option('-t, --tag <tags>', 'Split with "," give multi tags')
  .option('--csv', 'Export to csv file')
  .action((src, dest) => {
    let tags = program.opts().tag
    let csv = program.opts().csv
    convertMarkdown(src, dest, tags, csv)
  })
program.parse(process.argv)
