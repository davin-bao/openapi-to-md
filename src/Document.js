import fs from 'fs'
import YAML from 'yaml'
import Parameter from "./Parameter.js"
import Schema from './Schema.js'
import Path from "./Path.js"

class Document {
  openapi = ''
  info = ''
  servers = []
  tags = []
  paths = null
  parameters = {}
  components = {}
  security = []

  constructor (content, outputTags) {
    this.openapi = content.openapi
    this.info = content.info
    this.servers = content.servers
    this.tags = content.tags
    this.outputTags = outputTags
    this.security = content.security
    this.components = content.components
    this.content = content
    Document.dir = content.dir
  }
  getPaths () {
    if (this.paths) return this.paths
    let pathsContent = this.content.paths
    if (pathsContent) {
      for (let path in pathsContent) {
        for (let method in pathsContent[path]) {
          this.paths = this.paths || []
          if (Array.isArray(this.outputTags)) {
            let pathTags = pathsContent[path][method].tags
            if(this.outputTags.filter(v => pathTags.includes(v)).length <= 0) {
              continue
            }
          }
          this.paths.push(new Path({
            ...pathsContent[path][method],
            path, method
          }))
        }
      }
    }
    return this.paths
  }
  getVersion () {
    const { version } = this.info
    return version ? 'v' + version : null
  }
  getInfo () {
    let { title, description, version } = this.info
    description = typeof(description) === 'string' ? this.replaceAll('\\n', '\n', description) : ''
    return '# ' + (title || '') + '\n\n' + 
    '> v' + (version || '') + '\n\n' + 
    (description || '') + '\n\n'
  }
  replaceAll = function (find, replace, str) {
    var find = find.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
    return str.replace(new RegExp(find, 'g'), replace);
  }
  getServerInfo () {
    let title = '## Servers\n\n'
    let head = '| Endpoint | Description |\n| --- | --- |\n'
    let body = []
    for (let server of this.servers) {
      body.push('| ' + (server.url || '') + ' | ' + (server.description || '') + ' |')
    }
    return title + head + body.join('\n') + '\n\n'
  }
  getSecurity () {
    if (!this.security) return ''
    let title = '## Securities\n\n'
    let body = []
    for (let security of this.security) {
      for (let key in security) {
        body.push('### ' + key + ' \n\n```json\n' + JSON.stringify(security[key], null, 2) + '\n```\n\n')
      }
    }
    return title + body.join('\n') + '\n\n'
  }
  getSecuritySchemes () {
    if (!this.components.securitySchemes) return ''

    let title = '## Security Schemes\n\n'
    let body = []
    for (let key in this.components.securitySchemes) {
      let securitySchema = this.components.securitySchemes[key]
      body.push('### ' + key + ' \n\n```json\n' + JSON.stringify(securitySchema, null, 2) + '\n```\n\n')
    }
    return title + body.join('\n') + '\n\n'
  }
  getPathTableInfo () {
    let title = '## 目录\n\n'
    let head = '| Method | Path | Description |\n| --- | --- | --- |\n'
    let body = []
    for (let path of this.getPaths()) {
      body.push(path.getTableInfo())
    }
    return title + head + body.join('\n') + '\n\n'
  }
  getPathInfo() {
    let title = '## 接口详细定义\n\n'
    let body = []
    for (let path of this.getPaths()) {
      body.push(path.getInfo() + path.getRequestInfo() + path.getResponseInfo() + path.getResponseDetailInfo() + '\n')
    }

    return title + body.join('\n\n\n');
  }
  getSchema () {
    let title = '## Schema\n\n'
    let body = []
    let schemas = Document.getSchemas()
    for (let key in schemas) {
      // 当前文档未用到的Schema将不输出
      if(Document.schemaNames.indexOf(key) < 0) continue
      schemas[key].name = key
      let schema = Schema.getIns(schemas[key])
      body.push(schema.getDetail())
    }
    return title + body.join('\n\n');
  }
  getOutput () {
    return this.getInfo() +
      this.getServerInfo() +
      this.getSecurity() +
      this.getSecuritySchemes() +
      this.getPathTableInfo() +
      this.getPathInfo() +
      this.getSchema()
  }
  getCsv () {
    let title = 'method,path,queryStr,requestBody\n'
    let body = []
    for (let path of this.getPaths()) {
      if (path.deprecated) continue
      body.push(path.getCsvRow())
    }
    return title + body.join('\n');
  }
}
Document.dir = ''
Document.instances = {}
Document.schemaNames = []

Document.searchDocs = (source, paths) => {
  Document.readDocument(source)
  for (let docName in Document.instances) {
    let doc = { ...Document.instances[docName] }
    let count = paths.length
    for (let key of paths) {
      if (key == '') {
        count--
        continue
      }
      if (doc[key]) {
        count--
        doc = doc[key]
      } else {
        break
      }
    }
    if (count === 0) {
      return doc
    }
  }
  return null
}

Document.readDocument = (source) => {
  if (source == '') return null
  if(Document.instances[source]) return Document.instances[source]
  try {
    const src = fs.readFileSync(Document.dir + source, 'utf8')
    let document = YAML.parse(src)
    Document.instances[source] = document
    return document
  } catch (e) {
    console.error(e)
  }
  return null
}

Document.getSchemas = () => {
  let schemas = {}
  for (let docName in Document.instances) {
    let doc = { ...Document.instances[docName] }
    if (doc['components'] && doc['components']['schemas']) {
      schemas = { ...schemas, ...doc['components']['schemas'] }
    }
  }
  return schemas
}

export default Document