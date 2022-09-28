import Parameter from "./Parameter.js"
import RequestBody from "./RequestBody.js"
import ResponsesBody from "./ResponsesBody.js"

class Path {
  tags = []
  anchor = ''
  summary = ''
  operationId = ''
  parameters = []
  requestBody = null
  responses = []

  constructor (content) {
    this.path = content.path
    this.method = content.method
    this.tags = content.tags
    this.summary = content.summary
    this.description = content.description
    this.operationId = content.operationId
    this.anchor = this.method.toLowerCase() + '-' + this.convertPath(this.path)

    // initParameters
    let parameters = content['parameters']
    if (parameters) {
      this.parameters = []
      for (let content of parameters) {
        let parameter = new Parameter(content)
        this.parameters.push(parameter)
      }
    }
    // initRequestBody
    if (content['requestBody']) {
      this.requestBody = new RequestBody(content['requestBody'])
    }
    // initResponseBody
    this.responses = []
    for (let k in content['responses']) {
      this.responses.push(new ResponsesBody(k, content['responses']))
    }
  }
  
  convertPath(path) {
    return path
      .replace(/[!@#$%^&*()+|~=`[\]{};':",./<>?]/g, "")
      .replace(/ /g, "-")
      .toLowerCase()
  }

  getInfo () {
    let description = this.description
    let output = '### [' + this.method.toUpperCase() + '] ' + this.path + ' \n ' + this.summary + '\n\n'
    if(description) {
      output += '描述: ' + description + '\n\n'
    }
    return output
  }
  getRequestInfo () {
    let title = '#### 请求参数' + '\n\n'
    let head = Parameter.getTableHead()
    let body = []
    let reqExamples = []
    for (let parameter of this.parameters) {
      body.push(parameter.getRow())
    }
    let requestBody = this.requestBody
    if (requestBody) {
      body = [
        ...body,
        ...requestBody.getRow()
      ]
      reqExamples = requestBody.getExamplesInfo()
    }
    if (body.length <= 0) return '#### 请求参数' + '\n\n无\n\n'
    return title  + head + body.join('\n') + '\n' + reqExamples.join('\n') + '\n\n'
  }
  getResponseInfo () {
      let title = '#### 返回结果\n\n'
      let head = '|状态码|说明|\n|---|---|\n'
      let body = []
      for (let response of this.responses) {
        body.push('|' + response.code + ' | ' + response.description + '|')
      }

      return title  + head + body.join('\n') + '\n\n'
    }

  getResponseDetailInfo () {
      let title = '#### 返回数据结构\n\n'
      let body = []
      for (let responsesBody of this.responses) {
        body.push(responsesBody.getInfo())
      }
      return title + body.join('\n') + '\n\n'
    }
}

export default Path