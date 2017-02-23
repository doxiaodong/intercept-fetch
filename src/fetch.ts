import {
  Interceptor,
  IInterceptor
} from './interceptor'

let fetchInterceptor: {[key: string]: Array<(...param) => any>}

export class FetchClient {
  interceptors: Interceptor
  constructor() {
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

  request(url: string | Request, config?: RequestInit) {
    let request: Request
    if (typeof url === 'string') {
      request = new Request(url, config)
    } else if (url instanceof Request) {
      request = url
    } else {
      throw new Error('First argument must be a url string or Request instance.')
    }
    // request interceptor
    fetchInterceptor['request'].forEach((requestFn) => {
      request = requestFn(request)
    })
    const response = fetch(request)
    .then((res: Response) => {
      fetchInterceptor['response'].forEach((resposeFn) => {
        res = resposeFn(res)
      })
      return res
    })
    .then((res: Response) => {
      if (res.ok) {
        return res.json()
        .then((data: any) => {
          // success interceptor
          fetchInterceptor['success'].forEach((successFn) => {
            data = successFn(data)
          })
          return data
        })
      } else {
        // error interceptor
        fetchInterceptor['error'].forEach((errorFn) => {
          res = errorFn(res)
        })
        return res.json().then((errorBody: any) => {
          return Promise.reject(errorBody)
        })
      }
    })
    return response
  }

  // add params to get
  get(url: string, param?: {[key: string]: any}, config?: RequestInit) {
    if (param) {
      url = addQueryString(url, param)
    }
    const request = new Request(url, config)
    return this.request(request)
  }
  post(url: string, config?: RequestInit) {
    const request = new Request(url, config)
    return this.request(request)
  }
  put(url: string, config?: RequestInit) {
    const request = new Request(url, config)
    return this.request(request)
  }
  delete(url: string, config?: RequestInit) {
    const request = new Request(url, config)
    return this.request(request)
  }
  options(url: string, config?: RequestInit) {
    const request = new Request(url, config)
    return this.request(request)
  }
  head(url: string, config?: RequestInit) {
    const request = new Request(url, config)
    return this.request(request)
  }
  patch(url: string, config?: RequestInit) {
    const request = new Request(url, config)
    return this.request(request)
  }
}

function addQueryString(url: string, param: {[key: string]: any}): string {
  for (const key in param) {
    if (param.hasOwnProperty(key)) {
      url += url.indexOf('?') === -1 ? '?' : '&'
      url += `${encodeURIComponent(key)}=${encodeURIComponent(param[key])}`
    }
  }
  return url
}
