[![Build Status](https://img.shields.io/travis/doxiaodong/intercept-fetch.svg?style=flat-square)](https://travis-ci.org/doxiaodong/intercept-fetch)
[![Downloads](https://img.shields.io/npm/dt/intercept-fetch.svg?style=flat-square)](https://www.npmjs.com/package/intercept-fetch)
[![Versions](https://img.shields.io/npm/v/intercept-fetch.svg?style=flat-square)]()
[![License](https://img.shields.io/npm/l/intercept-fetch.svg?style=flat-square)]()

# Add interceptors in fetch api

# Usage

* install `npm i intercept-fetch --save`

* add interceptors
```typescript
import {
  FetchClient,
  Interceptor
} from 'intercept-fetch'

const fetchClient = new FetchClient()
const interceptor = new Interceptor({
  cors: {
    id: 0,
    request(url, config) {
      url += '&a=1'
      config.mode = 'cors'
      return Promise.resolve([url, config])
    },
    success(data) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('res a', data)
          data.a = 'intercepta'
          resolve(data)
        }, 1000)
      })
    }
  },
  credentials: {
    id: 1,
    request(url, config) {
      url += '&b=2'
      config.credentials = 'include'
      return Promise.resolve([url, config])
    },
    requestError(fetchError) {
      return Promise.reject('requestError reject')
      // or return Promise.resolve('requestError resolve')
    },
    response(response) {
      return Promise.resolve(error)
    },
    success(data) {
      return new Promise((resolve) => {
        setTimeout(() => {
          console.log('res b', data)
          data.b = 'interceptb'
          resolve(data)
        }, 1000)
      })
    },
    error(res) {
      return Promise.resolve(res)
    },
    timeout(url) {
      return Promise.resolve('timeout')
      // default timeout is 10s
      // or return Promise.reject('timeout)
    }
  }
})

fetchClient.setInterceptors(interceptor)

fetchClient.get('https://google.com')

```

> Warning: at end of each interceptor, you can reject(any) to catch, if you want to complete the fetch flow, please resolve as ref example!!!

# class FetchClient

* getInterceptors(): IInterceptors
* setInterceptors(interceptors: Interceptor): void
* clearInterceptors(): void
* request(url: string | Request, config?: RequestInit): Promise<any>
* get(url: string, param?: { [key: string]: any }, config?: RequestInit): Promise<any>
```typescript
fetchClient.get('http://google.com', { date: Date.now() })
```
* post(url: string, config?: RequestInit): Promise<any>
* put(url: string, config?: RequestInit): Promise<any>
* delete(url: string, config?: RequestInit): Promise<any>
* options(url: string, config?: RequestInit): Promise<any>
* head(url: string, config?: RequestInit): Promise<any>
* patch(url: string, config?: RequestInit): Promise<any>

# class Interceptor

* interface
```typescript
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
export interface IInterceptors {
  [key: string]: IInterceptor
}
```

* set(key: string, value: IInterceptor): void
* get(key: string): IInterceptor
* delete(key: string): void
* has(key: string): boolean
* forEach(callback: (value?: IInterceptor, key?: string, target?: Interceptor) => void, thisArg?): void
* merge(interceptors: Interceptor): Interceptor // merge this Interceptor to param Interceptor
```typescript
const I = new Interceptor({
  a: {

  }
})
I.merge(new Interceptor({
  a: {
    request(url, config){
      return Promise.resolve([url, config])
    }
  }, 
  b: {}
}))

// I
// a: {
// }, 
// b: {}
```

# Differences with https://github.com/werk85/fetch-intercept

* All interceptors(request, response, success, error) are Promise

* Provide a interceptor class

* Can add more than one interceptors ordered by id, and the smaller id is call first

* Support typescript

