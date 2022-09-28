import Schema from "./Schema.js"
import config from "./config.js"

class ResponsesBody {
  constructor (code, content) {
    this.code = code
    for (let key in content[code]) {
      this[key] = content[code][key]
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
  
  getInfo () {
    let title = '状态码 **' + this.code + '**\n\n'
    let body = []
    if (this.content) {
      for (let resType in this.content) {
        body.push(this.getContentDetail(resType, this.content[resType].schema) + this.getExample(this.content[resType]) + this.getExamples(this.content[resType]))
      }
    } else {
      body = [this.getExample({})]
    }
    return title + body.join('\n') + '\n\n'
  }

  getContentDetail (resType, schema) {
    if (!schema) return ''
    let type = '```Content-Type: ' + resType + '```\n\n'
    let head = '|名称|类型|约束|说明|\n|---|---|---|---|\n'
    let body = schema.getResponseRow()
    return type + head + body.join('\n') + '\n\n'
  }

  getExample (content) {
    let examples = []
    if (content.example) {
      examples.push('```json\n' + JSON.stringify(content.example, null, 2) + '\n```\n')
    } else if (content.schema instanceof Schema) {
      let example = content.schema.getExample()
      if (example) {
        example = { ...config.response.succcess, data: example }
      }
      example && examples.push('```json\n' + JSON.stringify(example, null, 2) + '\n```\n')
    } else {
      examples.push('```json\n' + JSON.stringify(config.response.succcess, null, 2) + '\n```\n')
    }
    return examples.length <= 0 ? '' : '- 响应示例\n\n' + examples.join('\n') + '\n\n'
  }

  getExamples (content) {
    let examples = []
    if (content.examples) {
      for (let title in content.examples) {
        let { value, summary } = content.examples[title]
        summary = summary || title
        examples.push('- 响应示例:' + summary + '\n\n```json\n' + JSON.stringify(value, null, 2) + '\n```')
      }
    }
    return examples.join('\n\n')
  }
}

export default ResponsesBody