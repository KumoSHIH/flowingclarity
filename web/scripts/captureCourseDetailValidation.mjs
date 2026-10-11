import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const slug = process.argv[2] ?? 'course-detail-validation-20261011'
const port = Number(process.argv[3] ?? 9223)
const outputLabel = process.argv[4] ?? 'course-detail-content-flow'
const pageUrl = `http://localhost:3100/course/${encodeURIComponent(slug)}`
const outputDirectory = resolve(`.impeccable/review/${outputLabel}`)

async function createSession(url) {
  const target = await fetch(`http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`, { method: 'PUT' }).then(response => response.json())
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
    const { resolve: resolveRequest, reject } = pending.get(message.id)
    pending.delete(message.id)
    if (message.error) reject(new Error(message.error.message))
    else resolveRequest(message.result)
  })

  const send = (method, params = {}) => new Promise((resolveRequest, reject) => {
    const id = ++requestId
    pending.set(id, { resolve: resolveRequest, reject })
    socket.send(JSON.stringify({ id, method, params }))
  })

  return { send, close: () => socket.close() }
}

async function capture(name, width, height, mobile) {
  const session = await createSession('about:blank')
  await session.send('Page.enable')
  await session.send('Runtime.enable')
  await session.send('Emulation.setDeviceMetricsOverride', {
    width,
    height,
    deviceScaleFactor: 1,
    mobile,
    screenWidth: width,
    screenHeight: height,
  })
  await session.send('Page.navigate', { url: `${pageUrl}?viewport=${name}` })
  await new Promise(resolveWait => setTimeout(resolveWait, 3000))
  await session.send('Runtime.evaluate', {
    expression: `(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += ${height}) {
        window.scrollTo(0, y)
        await new Promise(resolve => setTimeout(resolve, 120))
      }
      window.scrollTo(0, 0)
      await new Promise(resolve => setTimeout(resolve, 500))
    })()`,
    awaitPromise: true,
  })

  const { result } = await session.send('Runtime.evaluate', {
    expression: `(() => ({
      innerWidth,
      scrollWidth: document.documentElement.scrollWidth,
      bodyWidth: document.body.scrollWidth,
      scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
      h1Count: document.querySelectorAll('h1').length,
      bodyOrder: [...document.querySelectorAll('main section[id^="content-"]')].map(section => section.id),
      galleryLayouts: [...document.querySelectorAll('[class*="gallery-panel--"]')].map(element => [...element.classList].find(name => name.startsWith('gallery-panel--'))),
      missingImageAlt: [...document.querySelectorAll('main img')].filter(image => !image.alt.trim()).length,
      minimumControlHeight: Math.min(...[...document.querySelectorAll('main a, main button')].map(element => element.getBoundingClientRect().height).filter(Boolean)),
      titleRight: document.querySelector('.course-hero h1')?.getBoundingClientRect().right,
      preservedLineElements: [...document.querySelectorAll('.preserve-lines')].filter(element => getComputedStyle(element).whiteSpace === 'pre-line').length,
      authoredNewlineElements: [...document.querySelectorAll('.preserve-lines')].filter(element => element.textContent.includes('\\n')).length,
    }))()`,
    returnByValue: true,
  })
  const metrics = result.value
  const { result: anchorResult } = await session.send('Runtime.evaluate', {
    expression: `(async () => {
      const nav = document.querySelector('.course-chapters')
      const anchors = [...(nav?.querySelectorAll('a') ?? [])]
      if (!nav || anchors.length < 2) return null
      const clicked = anchors[Math.min(4, anchors.length - 2)]
      const clickedTarget = document.querySelector(clicked.getAttribute('href'))
      clicked.click()
      await new Promise(resolve => setTimeout(resolve, 2000))
      const headerHeight = parseFloat(getComputedStyle(document.querySelector('.course-detail')).getPropertyValue('--home-header-height')) || 87
      const expectedTop = headerHeight + nav.getBoundingClientRect().height + 16
      const activeAfterClick = nav.querySelector('[aria-current="location"]')
      const clickMetrics = {
        clickedHref: clicked.getAttribute('href'),
        activeHref: activeAfterClick?.getAttribute('href'),
        targetTop: clickedTarget?.getBoundingClientRect().top,
        expectedTop,
      }

      const next = anchors[Math.min(anchors.indexOf(clicked) + 1, anchors.length - 1)]
      const nextTarget = document.querySelector(next.getAttribute('href'))
      const nextTop = scrollY + nextTarget.getBoundingClientRect().top - expectedTop
      window.scrollTo({ top: nextTop, behavior: 'instant' })
      await new Promise(resolve => setTimeout(resolve, 500))
      const activeAfterVerticalScroll = nav.querySelector('[aria-current="location"]')
      const activeRect = activeAfterVerticalScroll?.getBoundingClientRect()
      const navRect = nav.getBoundingClientRect()
      return {
        ...clickMetrics,
        verticalScrollTargetHref: next.getAttribute('href'),
        activeAfterVerticalScrollHref: activeAfterVerticalScroll?.getAttribute('href'),
        activeAnchorVisible: Boolean(activeRect && activeRect.left >= navRect.left - 1 && activeRect.right <= navRect.right + 1),
        navScrollLeft: nav.scrollLeft,
      }
    })()`,
    awaitPromise: true,
    returnByValue: true,
  })
  metrics.anchorTracking = anchorResult.value
  const screenshot = await session.send('Page.captureScreenshot', {
    format: 'png',
    captureBeyondViewport: true,
    clip: { x: 0, y: 0, width, height: metrics.scrollHeight, scale: 1 },
  })
  await writeFile(resolve(outputDirectory, `${name}.png`), Buffer.from(screenshot.data, 'base64'))
  session.close()
  return { name, ...metrics }
}

await mkdir(outputDirectory, { recursive: true })
const results = []
results.push(await capture('desktop-1440', 1440, 1000, false))
results.push(await capture('mobile-390', 390, 844, true))
await writeFile(resolve(outputDirectory, 'metrics.json'), `${JSON.stringify(results, null, 2)}\n`)
console.log(JSON.stringify(results, null, 2))
