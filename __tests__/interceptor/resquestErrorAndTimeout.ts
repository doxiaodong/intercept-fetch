import * as fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import {
  FetchClient,
  Interceptor
} from '../../src'
import { url, user } from '../../mock/github'

let n = 0
const interceptor = new Interceptor({
  res: {
    id: 1,
    timeout(reqUrl) {
      n = 1
      return Promise.reject(reqUrl)
    },
    requestError(error) {
      n = 2
      return Promise.resolve(error)
    },
    response(res) {
      n = 3
      return Promise.resolve(res)
    }
  }
})

const fetchClient = new FetchClient()

describe('responseAndTimeout test', () => {
  beforeAll(() => {
    fetchMock.get('*', user)
  })

  test('response without timeout', async () => {
    fetchClient.setInterceptors(interceptor)
    fetchClient.setTimeout(2000)
    await fetchClient.get(url)
    expect(n).toEqual(3)
  })
})

describe('requestErrorAndTimeout test', () => {
  beforeAll(() => {
    window.fetch = jest.fn().mockImplementation(() => {
      return new Promise((resolve, reject) => {
        setTimeout(() => {
          reject({
            ok: false
          })
        }, 1000)
      })
    })
  })

  test('requestError without timeout', async () => {
    fetchClient.setInterceptors(interceptor)
    fetchClient.setTimeout(2000)
    try {
      await fetchClient.get('http://error_url')
    } catch (error) {
      expect(n).toEqual(2)
    }
  })

  test('timeout without requestError', async () => {
    fetchClient.clearInterceptors()
    fetchClient.setInterceptors(interceptor)
    fetchClient.setTimeout(10)
    try {
      await fetchClient.get('http://error_url')
    } catch (error) {
      expect(n).toEqual(1)
    }
  })
})
