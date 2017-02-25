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
    id: 0, // order
    request: (url, config) => {
      if (!config.mode) {
        config.mode = 'cors'
      }
      return {
        url,
        config
      }
    }
  }
})

fetchClient.setInterceptors(interceptor)

export default fetchClient

```
