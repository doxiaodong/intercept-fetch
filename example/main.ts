import {
  FetchClient,
  Interceptor
} from '../index'

const interceptor = new Interceptor({
  timeout: {
    id: 1,
    timeout(url) {
      console.error('timeout: ', url)
      return Promise.reject(url)
      // can also use Promise.resolve(url)
    },
    response(res) {
      console.log(res)
      return Promise.resolve(res)
    }
  }
})
const fetchClient = new FetchClient()
fetchClient.setInterceptors(interceptor)
// fetchClient.timeout = 10

async function req() {
  const data = await fetchClient.get('https://api.github.com/users/doxiaodong')
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
})()
