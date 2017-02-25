import * as copy from 'deepcopy'
import {
  Interceptor,
  IInterceptor
} from './interceptor'
import { RequestMethod } from './method'
import assign from './assign'

let fetchInterceptor: { [key: string]: Array<(...param) => Promise<any>> }

export class FetchClient {
  interceptors: Interceptor
  constructor() {
    if (typeof fetch !== 'function') {
      throw new Error('FetchClient based on fetch api!!')
    }
    this.clearInterceptors()
  }

  clearInterceptors() {
    this.interceptors = null

    fetchInterceptor = {
      request: [],
      response: [],
      success: [],
      error: []
    }
  }

  getInterceptors() {
    return this.interceptors
  }

  setInterceptors(interceptors: Interceptor) {
    if (!(interceptors instanceof Interceptor)) {
      throw new Error('Error interceptors!!')
    }
    this.clearInterceptors()

    this.interceptors = interceptors
    const sortInterceptors: IInterceptor[] = []
    this.interceptors.forEach((value) => {
      // check id >= 0
      if (value.id != null && value.id < 0) {
        throw new Error('Interceptor\'s id is must >= 0!!')
      }
      sortInterceptors.push(value)
    })
    sortInterceptors.sort((a, b) => {
      // hack need id >= 0
      if (a.id == null) {
        a.id = -999
      }
      if (b.id == null) {
        b.id = -999
      }
      return b.id - a.id
    }).reverse()
    sortInterceptors.forEach((value) => {
      if (value.request) {
        fetchInterceptor['request'].push(value.request)
      }
      if (value.response) {
        fetchInterceptor['response'].push(value.response)
      }
      if (value.success) {
        fetchInterceptor['success'].push(value.success)
      }
      if (value.error) {
        fetchInterceptor['error'].push(value.error)
      }
    })
  }

  async request(url: string | Request, config?: RequestInit) {
    let newUrl
    let newConfig = assign({}, config)

    if (typeof url === 'string') {
      newUrl = url
    } else if (url instanceof Request) {
      newUrl = url.clone()
    } else {
      throw new Error('First argument must be a url string or Request instance.')
    }
    // request interceptor
    const ret = await dealInterceptors(fetchInterceptor['request'], newUrl, newConfig)
    newUrl = ret[0]
    newConfig = ret[1]

    let request: Request
    if (typeof newUrl === 'string') {
      request = new Request(newUrl, newConfig)
    } else if (newUrl instanceof Request) {
      request = newUrl
    } else {
      throw new Error('First argument must be a url string or Request instance.')
    }
    let res = await fetch(request)
    res = await dealInterceptors(fetchInterceptor['response'], res)
    if (res.ok) {
      let data = await res.json()
      data = await dealInterceptors(fetchInterceptor['success'], data)
      return data
    }
    res = await dealInterceptors(fetchInterceptor['error'], res)

    const errBody = await res.json()
    return Promise.reject(errBody)

  }

  // add params to get
  get(url: string, param?: { [key: string]: any }, config?: RequestInit) {
    if (param) {
      url = addQueryString(url, param)
    }
    return this.request(url, assign({ method: RequestMethod.Get }, config))
  }
  post(url: string, config?: RequestInit) {
    return this.request(url, assign({ method: RequestMethod.Post }, config))
  }
  put(url: string, config?: RequestInit) {
    return this.request(url, assign({ method: RequestMethod.Put }, config))
  }
  delete(url: string, config?: RequestInit) {
    return this.request(url, assign({ method: RequestMethod.Delete }, config))
  }
  options(url: string, config?: RequestInit) {
    return this.request(url, assign({ method: RequestMethod.Options }, config))
  }
  head(url: string, config?: RequestInit) {
    return this.request(url, assign({ method: RequestMethod.Head }, config))
  }
  patch(url: string, config?: RequestInit) {
    return this.request(url, assign({ method: RequestMethod.Patch }, config))
  }
}

function addQueryString(url: string, param: { [key: string]: any }): string {
  for (const key in param) {
    if (param.hasOwnProperty(key)) {
      url += url.indexOf('?') === -1 ? '?' : '&'
      url += `${encodeURIComponent(key)}=${encodeURIComponent(param[key])}`
    }
  }
  return url
}

async function dealInterceptors(interceptors, ...data): Promise<any> {
  let copyData = copy(data)
  const len = interceptors.length
  let current = 0
  return new Promise(async (resolve) => {
    copyData = await recursion()
    if (Array.isArray(copyData) && copyData.length === 1) {
      resolve(copyData[0])
    } else {
      resolve(copyData)
    }
  })

  async function recursion() {
    // todo: need to copy copyData?
    copyData = copy(copyData)
    if (current < len) {
      copyData = await interceptors[current](...copyData)
      if (!Array.isArray(copyData)) {
        copyData = [copyData]
      }
      current++
      return recursion()
    }
    return Promise.resolve(copyData)

  }
}
