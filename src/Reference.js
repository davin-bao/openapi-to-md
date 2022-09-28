import Schema from './Schema.js'
import Parameter from './Parameter.js'
import Document from './Document.js'

class Reference {
  _schema = null
  doc = null
  constructor (str) {
    let strs = str.split('#')
    this._parameter = {}
    if (strs.length < 2) return
    this._source = strs[0]
    this._path = strs[1].split('/')
    if (this._path.length < 3) return
    this._refType = this._path[this._path.length - 2]
    this.doc = Document.searchDocs(this._source, this._path)
    if (this.doc) {
      this.doc.name = this._path[this._path.length - 1]
    }
  }
}

export default Reference