import * as fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import { FetchClient, Interceptor } from '../src/index'
import { url, user } from '../mock/github'

const fetchClient = new FetchClient()
fetchMock.get('*', user)

let tmp = 0
const interceptor = new Interceptor({
  error: {
    id: 1,
    error(res) {
      tmp = 1
      return Promise.resolve(res)
    }
  }
})

describe('request normal test', () => {
  test('normal', async () => {
    const data = await fetchClient.get(url)
    expect(data).toEqual(user)
  })

  test('normal without error', async () => {
    fetchClient.setInterceptors(interceptor)
    const data = await fetchClient.get(url)
    expect(data).toEqual(user)

    expect(tmp).toBe(0)
  })
})
