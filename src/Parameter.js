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
    let type = this.schema?.getTypeByRow()
    let example = (typeof(this.example) !== 'string') ? JSON.stringify(this.example) : this.example
    let bounds = ' '
    let description = this.description
    if (this.schema) {
      bounds = this.schema.getBounds()
      if (!example) example = this.schema.default ? this.schema.default + '' : false
      description = this.schema.description || this.description
    }

    let cells = [
      this.name,
      this.in,
      type,
      (this.required || 'false'),
      bounds,
      (example || ' '),
      (description || ' ')
    ]
    return '|' + cells.join('|') + '|'
  }
}
Parameter.getTableHead = () => {
  return '|名称|位置|类型|必选|约束|示例|说明|\n|---|---|---|---|---|---|---|\n'
}


export default Parameter