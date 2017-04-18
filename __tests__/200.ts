import * as fetchMock from 'fetch-mock'
import 'whatwg-fetch'
import { FetchClient } from '../src/index'
import { url, user } from '../mock/github'

const fetchClient = new FetchClient()
fetchMock.get('*', user)

describe('request normal test', () => {
  test('normal', async () => {
    const data = await fetchClient.get(url)
    expect(data).toEqual(user)
  })
})
