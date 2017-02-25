[![Build Status](https://img.shields.io/travis/doxiaodong/intercept-fetch.svg?style=flat-square)](https://travis-ci.org/doxiaodong/intercept-fetch)
[![Downloads](https://img.shields.io/npm/dt/intercept-fetch.svg?style=flat-square)](https://www.npmjs.com/package/intercept-fetch)
[![Versions](https://img.shields.io/npm/v/intercept-fetch.svg?style=flat-square)]()
[![License](https://img.shields.io/npm/l/intercept-fetch.svg?style=flat-square)]()

# Add interceptors in fetch api

# Usage

* install `npm i intercept-fetch --save`

* add a interceptor
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
    error(error) {
      return Promise.resolve(error)
    }
  }
})

fetchClient.setInterceptors(interceptor)

fetchClient.get('http://google.com')

# Differences with https://github.com/werk85/fetch-intercept

* All interceptors(request, response, success, error) are Promise

* Provide a interceptor class

* Can add more than one interceptors ordered by id, and the smaller id is call first

* Support typescript

```
