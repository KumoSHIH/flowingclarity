import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const port = Number(process.argv[2] ?? 9224)
const pageUrl = process.argv[3] ?? 'http://127.0.0.1:3100/articles'
const captureImages = process.argv[4] !== 'metrics-only'
const outputDirectory = resolve('.impeccable/review/articles-prototype')

async function createSession() {
  const target = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(pageUrl)}`,
    { method: 'PUT' },
  ).then(response => response.json())
  const socket = new WebSocket(target.webSocketDebuggerUrl)
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener('open', resolveOpen, { once: true })
    socket.addEventListener('error', rejectOpen, { once: true })
  })

  let requestId = 0
  const pending = new Map()
  socket.addEventListener('message', (event) => {
    const message = JSON.parse(event.data)
    if (!message.id || !pending.has(message.id)) return
    const request = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) request.reject(new Error(message.error.message))
    else request.resolve(message.result)
  })
  const send = (method, params = {}) => new Promise((resolveRequest, reject) => {
    const id = ++requestId
    pending.set(id, { resolve: resolveRequest, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })
  return { send, close: () => socket.close() }
}

async function capture(name, width, height, screenshot = false) {
  const session = await createSession()
  await session.send('Page.enable')
  await session.send('Runtime.enable')
  await session.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768,
    screenWidth: width,
    screenHeight: height,
  })
  await session.send('Page.navigate', { url: pageUrl })
  await new Promise(resolveWait => setTimeout(resolveWait, 1800))
  const { result } = await session.send('Runtime.evaluate', {
    expression: `(() => {
      const controls = [...document.querySelectorAll('main a, main button, main label')]
        .map(element => element.getBoundingClientRect())
        .filter(rect => rect.width && rect.height)
      return {
        innerWidth,
        scrollWidth: document.documentElement.scrollWidth,
        bodyWidth: document.body.scrollWidth,
        scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
        h1Count: document.querySelectorAll('main h1').length,
        articleCount: document.querySelectorAll('.article-entry').length,
        checkedTags: document.querySelectorAll('.article-tags input:checked').length,
        minimumControlWidth: Math.min(...controls.map(rect => rect.width)),
        minimumControlHeight: Math.min(...controls.map(rect => rect.height)),
        lineLeft: document.querySelector('.article-list') ? getComputedStyle(document.querySelector('.article-list'), '::before').left : null,
        categoriesWrap: document.querySelector('.article-categories')?.getBoundingClientRect().height,
      }
    })()`,
    returnByValue: true,
  })
  const metrics = result.value

  if (screenshot) {
    const image = await session.send('Page.captureScreenshot', {
      format: 'png',
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: metrics.scrollHeight, scale: 1 },
    })
    await writeFile(resolve(outputDirectory, `${name}.png`), Buffer.from(image.data, 'base64'))
  }
  session.close()
  return { name, ...metrics }
}

async function validateInteraction() {
  const session = await createSession()
  await session.send('Page.enable')
  await session.send('Runtime.enable')
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: 390,
    height: 844,
    deviceScaleFactor: 1,
    mobile: true,
    screenWidth: 390,
    screenHeight: 844,
  })
  await session.send('Page.navigate', { url: pageUrl })
  await new Promise(resolveWait => setTimeout(resolveWait, 1200))
  const evaluate = expression => session.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  }).then(({ result }) => result.value)

  await evaluate(`(async () => {
    document.querySelector('.article-tags input')?.click()
    await new Promise(resolve => setTimeout(resolve, 250))
  })()`)
  const afterTag = await evaluate(`(() => ({
    path: location.pathname + location.search,
    checkedTags: document.querySelectorAll('.article-tags input:checked').length,
    focusedResult: document.activeElement?.id === 'article-results-heading',
  }))()`)

  await evaluate(`(async () => {
    [...document.querySelectorAll('.article-categories a')]
      .find(link => link.textContent.includes('愛身體'))?.click()
    await new Promise(resolve => setTimeout(resolve, 250))
  })()`)
  const afterCategory = await evaluate(`(() => ({
    path: location.pathname + location.search,
    checkedTags: document.querySelectorAll('.article-tags input:checked').length,
    articleCount: document.querySelectorAll('.article-entry').length,
    focusedResult: document.activeElement?.id === 'article-results-heading',
  }))()`)

  await evaluate(`(async () => {
    history.back()
    await new Promise(resolve => setTimeout(resolve, 350))
  })()`)
  const afterHistoryBack = await evaluate(`(() => ({
    path: location.pathname + location.search,
    checkedTags: document.querySelectorAll('.article-tags input:checked').length,
    activeCategory: document.querySelector('.article-categories [aria-current="page"]')?.textContent.trim(),
  }))()`)

  await session.send('Page.navigate', { url: `${pageUrl}?page=2` })
  await new Promise(resolveWait => setTimeout(resolveWait, 600))
  await evaluate(`(async () => {
    document.querySelector('.article-pagination a[rel="next"]')?.click()
    await new Promise(resolve => setTimeout(resolve, 250))
  })()`)
  const afterPaging = await evaluate(`(() => ({
    path: location.pathname + location.search,
    currentPage: document.querySelector('.article-pagination [aria-current="page"]')?.textContent.trim(),
    focusedResult: document.activeElement?.id === 'article-results-heading',
  }))()`)
  session.close()
  return { afterTag, afterCategory, afterHistoryBack, afterPaging }
}

await mkdir(outputDirectory, { recursive: true })
const results = []
for (const viewport of [
  ['desktop-1440', 1440, 1000, captureImages],
  ['tablet-1023', 1023, 900, false],
  ['tablet-768', 768, 900, false],
  ['text-zoom-200', 720, 900, false],
  ['mobile-390', 390, 844, captureImages],
  ['mobile-320', 320, 700, false],
]) {
  results.push(await capture(...viewport))
}
const interaction = await validateInteraction()
await writeFile(
  resolve(outputDirectory, 'metrics.json'),
  `${JSON.stringify({ viewports: results, interaction }, null, 2)}\n`,
)
console.log(JSON.stringify({ viewports: results, interaction }, null, 2))
