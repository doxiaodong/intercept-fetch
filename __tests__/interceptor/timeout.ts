import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src'
import { url as mockUrl } from '../../mock/github'

window.fetch = jest.fn().mockImplementation(() => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve({
        ok: true
      })
    }, 5000)
  })
})

const interceptor = new Interceptor({
  timeout1: {
    timeout(url) {
      return Promise.reject('error')
    }
  },
  timeout2: {
    timeout(url) {
      return Promise.resolve('timeout resolve')
    }
  },
  timeout3: {
    id: 1,
    timeout(url) {
      return Promise.reject(url)
    }
  }
})

const fetchClient = new FetchClient()

fetchClient.setInterceptors(interceptor)
fetchClient.setTimeout(1000)

describe('request timeout test', () => {
  test('timeout normal', async () => {
    try {
      await fetchClient.get(mockUrl)
    } catch (error) {
      expect(error).toEqual('error')
    }
  })
})
