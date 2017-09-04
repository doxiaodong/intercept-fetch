import {
  FetchClient,
  Interceptor
} from '../src'

const interceptor = new Interceptor({
  timeout: {
    id: 1,
    timeout(url) {
      console.error('timeout: ', url)
      return Promise.reject(url)
      // can also use Promise.resolve(url)
    },
    response(res) {
      return Promise.resolve(res)
    },
    jsonpRequest(url, config) {
      return Promise.resolve([
        url,
        { jsonpCallback: 'jsonpCallback', ...config }
      ] as any)
    },
    jsonpSuccess(body) {
      if (body.code === 0) {
        return Promise.resolve(body.data)
      }
      return Promise.reject('jsonp error')
    }
  }
})
const fetchClient = new FetchClient()
fetchClient.setInterceptors(interceptor)
// fetchClient.setTimeout(10)

async function req() {
  const data = await fetchClient.get('https://api.github.com/users/doxiaodong')
  return data
}
async function jsonp() {
  const data = await fetchClient.jsonp('https://c.y.qq.com/splcloud/fcgi-bin/smartbox_new.fcg', {
    key: '周杰伦'
  })
  return data
}

// Promise catch
req().catch((err) => console.log('catch error: ', err));

// trycatch
(async () => {
  let data
  try {
    data = await req()
    console.log('last data: ', data)
  } catch (error) {
    console.log('last error: ', error)
  }
  try {
    data = await jsonp()
    console.log('last jsonp: ', data)
  } catch (error) {
    console.log('last jsonp error: ', error)
  }
})()
