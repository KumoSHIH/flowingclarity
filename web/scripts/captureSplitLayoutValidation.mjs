import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const debuggerPort = Number(process.argv[2] ?? 9238)
const origin = process.argv[3] ?? 'http://127.0.0.1:3099'
const outputDirectory = resolve('web/docs/design/review/split-layout-2026-10-21')

const pages = [
  { name: 'course', path: '/course', layout: '.course-directory', rail: '.course-directory__index', content: '.course-directory__content' },
  { name: 'events', path: '/events', layout: '.event-directory', rail: '.event-directory__index', content: '.event-directory__content' },
  { name: 'session', path: '/session', layout: '.session-directory', rail: '.session-directory__aside', content: '.session-results' },
  { name: 'event-detail', path: '/events/test', layout: '.event-detail__layout', rail: '.event-detail__facts', content: '.event-detail__content', heroSpacing: '.event-detail__hero', contentSpacing: '.event-detail__section' },
  { name: 'session-detail', path: '/session/amoda', layout: '.session-detail__layout', rail: '.session-detail__rail', content: '.session-detail__content', heroSpacing: '.session-detail__hero', contentSpacing: '.session-detail__content' },
]

const viewports = [
  { width: 390, height: 844 },
  { width: 1024, height: 900 },
  { width: 1440, height: 1000 },
  { width: 1920, height: 1080 },
]

async function createSession() {
  const target = await fetch(
    `http://127.0.0.1:${debuggerPort}/json/new?${encodeURIComponent('about:blank')}`,
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

async function evaluate(session, expression) {
  const { result } = await session.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
  })
  if (result.exceptionDetails) throw new Error(result.description)
  return result.value
}

async function capture(page, viewport) {
  const session = await createSession()
  await session.send('Page.enable')
  await session.send('Runtime.enable')
  await session.send('Emulation.setDeviceMetricsOverride', {
    width: viewport.width,
    height: viewport.height,
    deviceScaleFactor: 1,
    mobile: viewport.width <= 768,
    screenWidth: viewport.width,
    screenHeight: viewport.height,
  })
  await session.send('Page.navigate', { url: `${origin}${page.path}` })
  await new Promise(resolveWait => setTimeout(resolveWait, 1200))
  await evaluate(session, 'window.scrollTo(0, 0)')
  await new Promise(resolveWait => setTimeout(resolveWait, 100))

  const metrics = await evaluate(session, `(() => {
    const layout = document.querySelector(${JSON.stringify(page.layout)})
    const rail = document.querySelector(${JSON.stringify(page.rail)})
    const content = document.querySelector(${JSON.stringify(page.content)})
    const alignWith = ${page.alignWith ? `document.querySelector(${JSON.stringify(page.alignWith)})` : 'null'}
    const heroSpacing = ${page.heroSpacing ? `document.querySelector(${JSON.stringify(page.heroSpacing)})` : 'null'}
    const contentSpacing = ${page.contentSpacing ? `document.querySelector(${JSON.stringify(page.contentSpacing)})` : 'null'}
    if (!layout || !rail || !content) return { error: 'layout, rail, or content not found', title: document.title }
    const layoutRect = layout.getBoundingClientRect()
    const railRect = rail.getBoundingClientRect()
    const contentRect = content.getBoundingClientRect()
    const layoutStyle = getComputedStyle(layout)
    return {
      title: document.title,
      viewportWidth: innerWidth,
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      layout: {
        display: layoutStyle.display,
        gridTemplateColumns: layoutStyle.gridTemplateColumns,
        borderTopStyle: layoutStyle.borderTopStyle,
        borderTopWidth: layoutStyle.borderTopWidth,
        width: Number(layoutRect.width.toFixed(2)),
        left: Number(layoutRect.left.toFixed(2)),
        right: Number(layoutRect.right.toFixed(2)),
      },
      rail: {
        width: Number(railRect.width.toFixed(2)),
        left: Number(railRect.left.toFixed(2)),
        position: getComputedStyle(rail).position,
      },
      content: {
        width: Number(contentRect.width.toFixed(2)),
        left: Number(contentRect.left.toFixed(2)),
        right: Number(contentRect.right.toFixed(2)),
      },
      alignment: alignWith ? {
        referenceLeft: Number(alignWith.getBoundingClientRect().left.toFixed(2)),
        delta: Number((railRect.left - alignWith.getBoundingClientRect().left).toFixed(2)),
      } : null,
      spacing: heroSpacing && contentSpacing ? {
        hero: [
          getComputedStyle(heroSpacing).paddingTop,
          getComputedStyle(heroSpacing).paddingRight,
          getComputedStyle(heroSpacing).paddingBottom,
          getComputedStyle(heroSpacing).paddingLeft,
        ],
        content: [
          getComputedStyle(contentSpacing).paddingTop,
          getComputedStyle(contentSpacing).paddingRight,
          getComputedStyle(contentSpacing).paddingBottom,
          getComputedStyle(contentSpacing).paddingLeft,
        ],
      } : null,
    }
  })()`)

  if (viewport.width === 1920 || (page.name === 'session-detail' && viewport.width === 390)) {
    const image = await session.send('Page.captureScreenshot', {
      format: 'png',
      fromSurface: true,
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width: viewport.width,
        height: viewport.height,
        scale: 1,
      },
    })
    await writeFile(
      resolve(outputDirectory, `${page.name}-${viewport.width}.png`),
      Buffer.from(image.data, 'base64'),
    )
  }

  session.close()
  return { page: page.name, path: page.path, ...viewport, ...metrics }
}

await mkdir(outputDirectory, { recursive: true })
const results = []
for (const page of pages) {
  for (const viewport of viewports) results.push(await capture(page, viewport))
}
await writeFile(
  resolve(outputDirectory, 'results.json'),
  `${JSON.stringify(results, null, 2)}\n`,
)

console.log(JSON.stringify(results, null, 2))
