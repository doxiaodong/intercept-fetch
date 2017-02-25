export class Interceptor {
  interceptors: IInterceptors
  constructor(interceptors: IInterceptors) {
    this.interceptors = Object.assign({}, interceptors)
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
  request?: (url: string | Request, config: RequestInit) => { url: string | Request, config: RequestInit }
  response?: (res: Response) => Response
  success?: (data: any) => any
  error?: (res: Response) => Response
}
