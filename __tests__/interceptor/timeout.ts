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
        ok: true,
        json() {
          return Promise.resolve({data: 'here'})
        }
      })
    }, 1000)
  })
})

const timeoutInterceptor = new Interceptor({
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
function timeout(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms))
}

describe('request timeout test', () => {
  test('timeout normal', async () => {
    const fetchClient = new FetchClient()

    fetchClient.setInterceptors(timeoutInterceptor)
    fetchClient.setTimeout(500)
    try {
      await fetchClient.get(mockUrl)
    } catch (error) {
      expect(error).toEqual('error')
    }
  })
  test('clear timeout', async () => {
    const fetchClient = new FetchClient()
    const spy = jest.fn()

    fetchClient.setTimeout(1500)
    fetchClient.setInterceptors(new Interceptor({
      timeout: {
        id: 1,
        timeout: spy.mockImplementation((url) => Promise.reject('timeout'))
      },
      success: {
        id: 2,
        success: spy.mockImplementation((data) => Promise.resolve(data))
      }
    }))

    try {
      await fetchClient.get(mockUrl)
      await timeout(1000)  // ensure elapsed more time than fetchClient timeout config
      expect(spy.mock.calls.length).toBe(1)
      expect(spy.mock.calls[0][0].data).toBeTruthy()
    } catch (error) {
      expect(error).toBeFalsy()
    }
  })
})
