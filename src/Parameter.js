import Schema from "./Schema.js"
import Reference from "./Reference.js"

class Parameter {
  constructor (content) {
    if (content['$ref']) {
      let reference = new Reference(content['$ref'])
      content = reference.doc || content
    }
    
    for (let key in content) {
      this[key] = content[key]
    }
    if (this['schema']) {
      this['schema'] = Schema.getIns(content['schema'])
    }
  }
  getRow () {
    let name = this._name || this.name
    let type = this.schema?.getTypeByRow()
    let example = this.getExample()
    let bounds = ' '
    let description = this.description
    if (this.schema) {
      bounds = this.schema.getBounds()
      description = this.schema.description || this.description
    }

    let cells = [
      name,
      this.in,
      type,
      (this.required || 'false'),
      bounds,
      (example || ' '),
      (description || ' ')
    ]
    return '|' + cells.join('|') + '|'
  }
  getExample () {
    let name = this._name || this.name
    let example = (typeof(this.example) !== 'string') ? JSON.stringify(this.example) : this.example
    if (this.schema) {
      if (!example) example = this.schema.default ? this.schema.default + '' : false
    }
    return example || ' ';
  }
  getQueryExample() {
    let example = this.example
    if (this.schema) {
      if (!example) example = this.schema.default ? this.schema.default + '' : false
    }

    if (Array.isArray(this.example)) {
      example = ''
      for (let ex of this.example) {
        example += '&' + name + '=' + ex
      }
    } else {
      example = name + '=' + example
    }
    
    return example || ' ';
  }
}
Parameter.getTableHead = () => {
  return '|名称|位置|类型|必选|约束|示例|说明|\n|---|---|---|---|---|---|---|\n'
}


export default Parameter