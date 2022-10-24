import Schema from './Schema.js'
import Reference from './Reference.js'

class Property {
  constructor(parent, name, content) {
    this.parent = parent
    this.name = name
    let refKey = '$ref'
    if (typeof(content[refKey]) === 'string') {
      let reference = new Reference(content[refKey])
      this.schema = new Schema(reference.doc)
    }

    for (let key in content) {
      this[key] = content[key]
    }
    
    if (this.type === 'array' && this.items && typeof(this.items['$ref']) === 'string') {
      let ref = this.items['$ref']
      if (ref != parent.ref) {
        let reference = new Reference(ref)
        if(reference.doc){
          this.items = new Schema(reference.doc, ref)
        }
      }
    }
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

  getByCols () {
    let cols = null
    let required = this.parent?.required ? this.parent.required.includes(this.name) : false
    let type = null
    let description = this.description

    if (this.items instanceof Schema) {
      type = '[[' + this.items.name + '](#' + this.items.anchor + ')]'
      description = description || this.items.description
    } else if (this.schema instanceof Schema) {
      type = '[' + this.schema.name + '](#' + this.schema.anchor + ')'
      description = description || this.schema.description
    } else if (this['format'] === 'int64') {
      type = 'long'
    } else {
      type = this.anchor ? '[' + this.type + '](#' + this.anchor + ')' : this.type
    }
    cols = cols = [this.name, type || ' ', required, this.getBounds() || ' ', description]
    return cols
  }
}

Property.attributesKeys = [
  'format',
  'multipleOf',
  'maximum',
  'exclusiveMaximum',
  'minimum',
  'exclusiveMinimum',
  'maxLength',
  'minLength',
  'pattern',
  'maxItems',
  'minItems',
  'uniqueItems',
  'maxProperties',
  'minProperties',
  'enum',
  'default'
]

export default Property