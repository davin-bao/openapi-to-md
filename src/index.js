import { program } from "commander"
import fs from "fs"
import Document from "./Document.js"

export const convertMarkdown = async function (source, dest) {
  let index = source.lastIndexOf('\\')
  index = index > 0 ? index : source.lastIndexOf('/')
  let dir = source.substr(0, index + 1)
  
  const document = Document.readDocument(source)
  if (!document) return
  document.dir = dir
  const doc = new Document(document)
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
  .option("-s", false)
  .arguments("<source> [destination]")
  .action((src, dest) => {
    convertMarkdown(src, dest)
  })
program.parse(process.argv)
