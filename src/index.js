#!/usr/bin/env node

import { program } from "commander"
import fs from "fs"
import Document from "./Document.js"

export const convertMarkdown = async function (source, dest, tags) {
  let index = source.lastIndexOf('\\')
  index = index > 0 ? index : source.lastIndexOf('/')
  let dir = source.substr(0, index + 1)

  if (tags) tags = tags.split(" ")
  
  const document = Document.readDocument(source)
  if (!document) return
  document.dir = dir
  const doc = new Document(document, tags)
  const output = doc.getOutput()
  const version = doc.getVersion()
  dest += (version ? ('.' + version) : '') + '.md'
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
  .action((src, dest) => {
    let tags = program.opts().tag
    convertMarkdown(src, dest, tags)
  })
program.parse(process.argv)
