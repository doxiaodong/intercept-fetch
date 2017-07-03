import {
  Interceptor,
  IInterceptor
} from './interceptor'
import { RequestMethod } from './method'

let fetchInterceptor: { [key: string]: Array<(...param) => Promise<any>> }

export class FetchClient {
  private timeout = 10 * 1000
  private interceptors: Interceptor
  constructor() {
    if (typeof fetch !== 'function') {
      throw new Error('FetchClient based on fetch api!!')
    }
    this.clearInterceptors()
  }

  setTimeout(time: number): void {
    this.timeout = time
  }

  clearInterceptors(): void {
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

  setInterceptors(interceptors: Interceptor): void {
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
    let res
    let err

    const timeoutPromiseFn = () => new Promise((resolve, reject) => {
      setTimeout(async () => {
        try {
          // timeout interceptor
          err = await dealInterceptors(fetchInterceptor['timeout'], newUrl)
        } catch (error) {
          err = error
        }
        reject(err)
      }, this.timeout)
    })

    const fetchPromiseFn = async () => {
      try {
        res = await fetch(request)
        return res
      } catch (error) {
        // requestError interceptor
        err = await dealInterceptors(fetchInterceptor['requestError'], error)
        return Promise.reject(err)
      }
    }
    res = await Promise.race([timeoutPromiseFn(), fetchPromiseFn()])

    // response interceptor
    res = await dealInterceptors(fetchInterceptor['response'], res)
    if (res.ok) {
      let data = await res.json()
      // success interceptor
      data = await dealInterceptors(fetchInterceptor['success'], data)
      return data
    }
    // error interceptor
    res = await dealInterceptors(fetchInterceptor['error'], res)
    err = await res.json()
    return Promise.reject(err)
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
    if (param.hasOwnProperty(key) && param[key] != null) {
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
    copyData = data
  } else {
    copyData = data[0]
  }

  const len = interceptors.length
  let current = 0
  copyData = await recursion()
  return copyData

  async function recursion() {
    if (current < len) {
      copyData = isDoubleParams ?
        await interceptors[current](...copyData) :
        await interceptors[current](copyData)
      current++
      return recursion()
    }
    return copyData
  }
}
