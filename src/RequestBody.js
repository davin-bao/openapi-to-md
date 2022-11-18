import Schema from "./Schema.js"

class RequestBody {
  constructor (content) {
    for (let key in content) {
      this[key] = content[key]
    }
    // initContent
    if (this['content']) {
      for (let key in this['content']) {
        let body = this['content'][key]
        if (body.schema) {
          body.schema = Schema.getIns(body.schema)
        }
      }
    }
  }
  getRow () {
    let row = []
    for (let key in this.content) {
      let schema = this.content[key].schema
      row.push(schema.getRequestRow())
    }
    return row
  }
  getJsonExample() {
    for (let key in this.content) {
      if (key == 'application/json') {
        let example = this.content[key].example
        if (!example && this.content[key].schema) {
          example = this.content[key].schema.getExample()
        }
        if (example) return example
      }
    }
    return {}
  }
  getExamplesInfo () {
    let examples = []
    for (let key in this.content) {
      let example = this.content[key].example
      if (!example && this.content[key].schema) {
        example = this.content[key].schema.getExample()
      }
      if (example) {
        let exampleItem = '- 请求示例(' + key + ')\n\n'
        exampleItem += '```json\n' + JSON.stringify(example, null, 2) + '\n```\n'
        examples.push(exampleItem)
      }
    }
    return examples
  }
}


export default RequestBody