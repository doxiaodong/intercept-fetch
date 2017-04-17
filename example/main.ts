import { FetchClient } from '../index'
const fetchClient = new FetchClient()

async function a() {
  const data = await fetchClient.get('https://api.github.com/users/defunkt')
  return data
}

(async () => {
  try {
    await a()
  } catch (error) {
    console.log('last', error)
  }
})()
