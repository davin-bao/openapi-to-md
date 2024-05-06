import Reference from "./Reference.js"
import Property from "./Property.js"

class Schema {
  ref = ''
  name = ''
  type = ''
  example = ''
  required = []
  properties = []
  constructor (content, ref) {
    this.ref = ref
    let refKey = '$ref'
    if (typeof(content[refKey]) === 'string') {
      let reference = new Reference(content[refKey])
      content = reference.doc || content
    }
    if (content.name) {
      this.anchor = 'schemas' + this._convertAnchor(content.name)
    }

    for (let key in content) {
      if (Property.attributesKeys.indexOf(key) > -1) this[key] = content[key]
    }

    this.name = content.name
    this.type = content.type
    this.required = content.required
    this.example = content.example
    this.description = content.description

    if (content.enum) {
      this.enum = content.enum
    }
    
    if (content.properties) {
      for (let key in content.properties) {
        this.properties[key] = new Property(this, key, content.properties[key])
      }
    }

    if (content['allOf']) {
      this.properties = {}
      for (let item of content['allOf']) {
        if (item['$ref']) {
          let reference = new Reference(item['$ref'])
          if (reference._schema?.properties) {
            this.properties = {
              ...this.properties,
              ...reference._schema.properties
            }
          }
        }
        if (item.type === 'object' && item.properties) {
          this.type = item.type
          for (let key in item.properties) {
            this.properties[key] = new Property(this, key, item.properties[key])
          }
        }
      }
    }
  }

  _convertAnchor(type) {
    return type
      .replace(/[!@#$%^&*()+|~=`[\]{};':",./<>?]/g, "")
      .replace(/ /g, "-")
      .toLowerCase()
  }
  
  getBounds () {
    let bounds = []
    let includes = Property.attributesKeys
    for (let key in this) {
      if (includes.indexOf(key) > -1) {
        if(['number', 'boolean'].indexOf(typeof(this[key])) > -1) {
          bounds.push(key + ':' + this[key])
        }
        else if (typeof(this[key]) == 'string') {
          if (this[key] === '') this[key] = '&#39; &#39;'
          bounds.push(key + ':' + this[key].replace(/\|/g, '&#124;'))
        }
      }
    }
    return bounds.join(',')
  }

  getRequestRow () {
    return '|*anonymous*|body|' + this.getTypeByRow() + '| true | ' + this.getBounds() +' | | ' + (this.description || '') + '|'
  }

  getTypeByRow () {
    let type = this.name || this.type
    if (this.anchor) type = '[' + type + '](#' + this.anchor + ')'
    if (this['format'] === 'int64') {
      type = 'long'
    }
    return type
  }

  getResponseRow () {
    // let head = '|名称|类型|必选|约束|说明|\n'
    let type = this.name || this.type
    if (type === 'integer' || type === 'boolean' || type === 'string' || type === 'float' || type === 'double') {
      return [
        '|*anonymous*|' + type + '| ' + this.getBounds() +' |'+(this.description || '')+'|'
      ]
    }
    
    return [
        '|*anonymous*| '+ this.getTypeByRow() +'| ' + this.getBounds() +' |'+(this.description || '')+'|'
      ]
  }

  getExample () {
    return this.example
  }

  getDetail () {
    if (this.enum && Array.isArray(this.enum)) {
      let title = '### #/schemas/' + this.name + '\n\n'
      title += '\n|类型|选项|说明|\n|---|---|---|\n'
      let body = ['|' + this.type + '|' + this.enum.join(',') + '|' + this.description + '|']
      return title + body.join('\n') + '\n\n'
    }
    if (this.properties) {
      let title = '### #/schemas/' + this.name + '\n\n'
      title += '\n|名称|类型|必选|约束|说明|\n|---|---|---|---|---|\n'
      let body = []
      for(let name in this.properties) {
        let property = this.properties[name]
        body.push('|' + property.getByCols().join('|') + '|')
      }
      return title + body.join('\n') + '\n\n'
    }
    return ''
  }
}

Schema.getIns = (content, ref) => {
  if (content.type === 'array') {
    return new ArraySchema(content, ref)
  }
  return new Schema(content, ref)
}

class ArraySchema extends Schema {
  items = {}
  constructor (content, ref) {
    super(content, ref)
    if (typeof(content.items['$ref']) === 'string') {
      let ref = content.items['$ref']
      let reference = new Reference(ref)
      if(reference.doc) {
        this.name = reference.doc.name
        this.items = Schema.getIns(reference.doc, ref)
        this.anchor = this.items.anchor = 'schemas' + super._convertAnchor(this.name)
      }
    } else {
      this.items = Schema.getIns(content.items)
    }
  }
  
  getResponseRow () {
    // let head = '|名称|类型|约束|说明|\n'
    let item = this.items
    let description = item.description || ''

    return [
      '|*anonymous*|' + this.getTypeByRow() + '| |'+description+'|'
    ]
  }

  getTypeByRow () {
    if (this.anchor) {
      return '[['+this.name+'](#'+this.anchor+')]'
    }
    if (this['format'] === 'int64') {
      return '[long]'
    }
    return '[' + this.items.type + ']'
  }
  
  getExample () {
    if (!this.items.getExample) console.log(this)
    let example = this.items.getExample()
    return example ? [ example ] : null
  }
}

export default Schema