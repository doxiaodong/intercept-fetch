import fetchJsonp from 'fetch-jsonp'

export class Interceptor {
  private interceptors: IInterceptors
  constructor(interceptors: IInterceptors) {
    this.interceptors = { ...interceptors }
  }
  set(key, value: IInterceptor): void {
    this.interceptors[key] = value
  }
  get(key): IInterceptor {
    return this.has(key) ? this.interceptors[key] : null
  }
  delete(key): void {
    if (this.has(key)) {
      delete this.interceptors[key]
    }
  }
  has(key): boolean {
    return this.interceptors.hasOwnProperty(key)
  }
  forEach(callback: (value?: IInterceptor, key?, target?: Interceptor) => void, thisArg?): void {
    for (const key in this.interceptors) {
      if (this.interceptors.hasOwnProperty(key)) {
        callback.call(thisArg, this.interceptors[key], key, this)
      }
    }
  }
  // like Object.assign(this, interceptors)
  merge(interceptors: Interceptor): Interceptor {
    if (interceptors instanceof Interceptor) {
      interceptors.forEach((value, key) => {
        if (!this.has(key)) {
          this.set(key, value)
        }
      })
    }
    return this
  }
}

export interface IInterceptors {
  [key: string]: IInterceptor
}

export interface IInterceptor {
  id?: number
  request?: (url: string | Request, config: RequestInit) => Promise<[string | Request, RequestInit]>
  requestError?: (error: any) => Promise<any>
  response?: (res: Response) => Promise<Response>
  success?: (data: any) => Promise<any>
  error?: (res: Response) => Promise<Response>
  timeout?: (url: string) => Promise<any>
  jsonpRequest?: (url: string, config?: fetchJsonp.Options) => Promise<[string, fetchJsonp.Options]>
  jsonpResponse?: (res: fetchJsonp.Response) => Promise<fetchJsonp.Response>
  jsonpSuccess?: (data: any) => Promise<any>
  jsonpError?: (error: any) => Promise<any>
}
