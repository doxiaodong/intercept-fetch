// import cloneDeep from 'lodash-es/cloneDeep'
import {
  Interceptor,
  IInterceptor
} from './interceptor'
import { RequestMethod } from './method'

let fetchInterceptor: { [key: string]: Array<(...param) => Promise<any>> }

export class FetchClient {
  timeout = 10 * 1000
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
      requestError: [],
      response: [],
      success: [],
      error: [],
      timeout: []
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
      const {
        request,
        requestError,
        response,
        success,
        error,
        timeout
      } = value
      if (request) {
        fetchInterceptor['request'].push(request)
      }
      if (requestError) {
        fetchInterceptor['requestError'].push(requestError)
      }
      if (response) {
        fetchInterceptor['response'].push(response)
      }
      if (success) {
        fetchInterceptor['success'].push(success)
      }
      if (error) {
        fetchInterceptor['error'].push(error)
      }
      if (timeout) {
        fetchInterceptor['timeout'].push(timeout)
      }
    })
  }

  async request(url: string | Request, config?: RequestInit): Promise<any> {
    let newUrl
    let newConfig = { ...config }

    if (typeof url === 'string') {
      newUrl = url
    } else if (url instanceof Request) {
      newUrl = url.clone()
    } else {
      throw new Error('First argument must be a url string or Request instance.')
    }
    // request interceptor
    let ret
    try {
      ret = await dealInterceptors(fetchInterceptor['request'], newUrl, newConfig)
    } catch (error) {
      return Promise.reject(error)
    }
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

    return new Promise(async (resolve, reject) => {
      let err
      let isTimeout = false
      const time = setTimeout(async () => {
        try {
          err = await dealInterceptors(fetchInterceptor['timeout'], newUrl)
        } catch (error) {
          err = error
        }
        isTimeout = true
        reject(err)
      }, this.timeout)

      try {
        let res
        try {
          res = await fetch(request)
          clearTimeout(time)
        } catch (error) {
          clearTimeout(time)
          err = await dealInterceptors(fetchInterceptor['requestError'], error)
          reject(err)
          return
        }
        if (isTimeout) {
          return
        }

        res = await dealInterceptors(fetchInterceptor['response'], res)
        if (res.ok) {
          let data = await res.json()
          data = await dealInterceptors(fetchInterceptor['success'], data)
          resolve(data)
          return
        }
        res = await dealInterceptors(fetchInterceptor['error'], res)
        try {
          err = await res.json()
        } catch (error) {
          err = error
        }
      } catch (error) {
        err = error
      }
      reject(err)
    })
  }

  // add params to get
  get(url: string, param?: { [key: string]: any }, config?: RequestInit) {
    if (param) {
      url = addQueryString(url, param)
    }
    return this.request(url, { ...config, method: RequestMethod.Get })
  }
  post(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: RequestMethod.Post })
  }
  put(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: RequestMethod.Put })
  }
  delete(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: RequestMethod.Delete })
  }
  options(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: RequestMethod.Options })
  }
  head(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: RequestMethod.Head })
  }
  patch(url: string, config?: RequestInit) {
    return this.request(url, { ...config, method: RequestMethod.Patch })
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
  let isDoubleParams = false
  const dataLen = data.length
  let copyData
  if (dataLen === 2) {
    isDoubleParams = true
    // copyData = cloneDeep(data)
    copyData = data
  } else {
    // copyData = cloneDeep(data[0])
    copyData = data[0]
  }

  const len = interceptors.length
  let current = 0
  copyData = await recursion()
  return copyData

  async function recursion() {
    // todo: need to copy copyData?
    // copyData = cloneDeep(copyData)
    if (current < len) {
      if (isDoubleParams) {
        copyData = await interceptors[current](...copyData)
      } else {
        copyData = await interceptors[current](copyData)
      }
      current++
      return recursion()
    }
    return copyData

  }
}
