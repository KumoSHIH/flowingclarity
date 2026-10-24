import { mkdir, writeFile } from 'node:fs/promises'
import { resolve } from 'node:path'

const debuggerPort = Number(process.argv[2] ?? 9240)
const origin = process.argv[3] ?? 'http://127.0.0.1:3212'
const outputDirectory = resolve(process.argv[4] ?? 'web/docs/design/review/home-sections-ui-verified')

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
  socket.addEventListener('message', event => {
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

async function prepare(session, width, height, reducedMotion = false) {
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
  await session.send('Emulation.setEmulatedMedia', {
    features: [{
      name: 'prefers-reduced-motion',
      value: reducedMotion ? 'reduce' : 'no-preference',
    }],
  })
  await session.send('Page.navigate', { url: `${origin}/` })
  await new Promise(resolveWait => setTimeout(resolveWait, 1800))
}

async function scrollThrough(session, height) {
  await evaluate(session, `(async () => {
    for (let y = 0; y < document.documentElement.scrollHeight; y += ${height}) {
      window.scrollTo(0, y)
      await new Promise(resolve => setTimeout(resolve, 80))
    }
    window.scrollTo(0, 0)
    await new Promise(resolve => setTimeout(resolve, 250))
  })()`)
}

const metricsExpression = `(() => {
  const visible = element => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return rect.width > 0 && rect.height > 0 && style.display !== 'none' && style.visibility !== 'hidden'
  }
  const rect = selector => {
    const element = document.querySelector(selector)
    if (!element) return null
    const box = element.getBoundingClientRect()
    return { top: box.top + scrollY, bottom: box.bottom + scrollY, width: box.width, height: box.height }
  }
  const controls = [...document.querySelectorAll('main a, main button')]
    .filter(visible)
    .map(element => {
      const box = element.getBoundingClientRect()
      return {
        label: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 40),
        width: Number(box.width.toFixed(2)),
        height: Number(box.height.toFixed(2)),
      }
    })
  const sections = ['#course-map', '#about', '#events', '#courses', '#contact'].map(rect)
  return {
    innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(element => ({
      level: element.tagName,
      text: element.textContent.trim(),
    })),
    h1Count: document.querySelectorAll('main h1').length,
    sectionOrder: sections,
    eventCount: document.querySelectorAll('#events ol > li').length,
    courseCount: document.querySelectorAll('#courses article').length,
    eventPeriods: [...document.querySelectorAll('#events time > span:first-child')].map(element => element.textContent.trim()),
    missingAlt: [...document.querySelectorAll('main img')].filter(image => !image.hasAttribute('alt')).length,
    nonLazyContentImages: [...document.querySelectorAll('#about img, #courses img')].filter(image => image.loading !== 'lazy').length,
    imageFailures: [...document.querySelectorAll('main img')].filter(image => image.complete && image.naturalWidth === 0).map(image => image.src),
    controls,
    undersizedControls: controls.filter(control => control.width < 44 || control.height < 44),
    typography: {
      sectionTitle: getComputedStyle(document.querySelector('#events h2')).fontSize,
      itemTitle: getComputedStyle(document.querySelector('#events h3')).fontSize,
      body: getComputedStyle(document.querySelector('#events > div > div > p')).fontSize,
      period: getComputedStyle(document.querySelector('#events time > span:first-child')).fontSize,
    },
  }
})()`

async function capture(name, width, height, screenshot = false) {
  const session = await createSession()
  await prepare(session, width, height)
  await scrollThrough(session, height)
  const metrics = await evaluate(session, metricsExpression)
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

async function validateLongContent() {
  const session = await createSession()
  await prepare(session, 320, 720)
  const result = await evaluate(session, `(() => {
    const longChinese = '這是用來驗證首頁內容在長文字下仍能自然換行並保持閱讀順序的示意文字。'.repeat(10)
    document.querySelectorAll('#about p, #events p, #courses p, #contact p').forEach(element => {
      element.textContent = longChinese
    })
    document.querySelectorAll('#about h2, #events h2, #courses h2, #contact h2, #events h3, #courses h3').forEach(element => {
      element.textContent = '這是一段足以驗證窄螢幕自然換行的長標題'
    })
    const overflow = [...document.querySelectorAll('main *')].filter(element => {
      const box = element.getBoundingClientRect()
      return box.right > document.documentElement.clientWidth + 1 || box.left < -1
    }).map(element => element.className || element.tagName).slice(0, 20)
    return {
      clientWidth: document.documentElement.clientWidth,
      scrollWidth: document.documentElement.scrollWidth,
      overflow,
    }
  })()`)
  session.close()
  return result
}

async function validateFocusAndMotion() {
  const session = await createSession()
  await prepare(session, 390, 844, true)
  await evaluate(session, `(() => {
    const contact = document.querySelector('#contact a')
    const previous = document.querySelector('.hero-cta')
    previous.focus()
    contact.scrollIntoView({ block: 'center' })
  })()`)
  await session.send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Tab', code: 'Tab' })
  await session.send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Tab', code: 'Tab' })
  const result = await evaluate(session, `(() => {
    const contact = document.querySelector('#contact a')
    const focus = getComputedStyle(contact)
    const buttonIcon = contact.querySelector('svg')
    return {
      focusedLabel: document.activeElement?.textContent.trim(),
      outlineStyle: focus.outlineStyle,
      outlineWidth: focus.outlineWidth,
      outlineOffset: focus.outlineOffset,
      buttonTransition: focus.transitionDuration,
      iconTransition: getComputedStyle(buttonIcon).transitionDuration,
    }
  })()`)
  session.close()
  return result
}

await mkdir(outputDirectory, { recursive: true })
const viewports = []
for (const viewport of [
  ['home-320', 320, 720, false],
  ['home-390', 390, 844, true],
  ['home-768', 768, 1024, false],
  ['home-1023', 1023, 900, false],
  ['home-1024', 1024, 900, false],
  ['home-1440', 1440, 1000, true],
  ['home-200-percent-equivalent', 720, 900, false],
]) {
  viewports.push(await capture(...viewport))
}

const report = {
  generatedAt: new Date().toISOString(),
  origin,
  viewports,
  longContent: await validateLongContent(),
  focusAndReducedMotion: await validateFocusAndMotion(),
}

await writeFile(resolve(outputDirectory, 'results.json'), `${JSON.stringify(report, null, 2)}\n`)
process.stdout.write(`${JSON.stringify(report, null, 2)}\n`)
