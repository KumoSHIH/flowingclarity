import { writeFile } from 'node:fs/promises'
import { getCliClient } from 'sanity/cli'

const projectId = process.env.SANITY_STUDIO_PROJECT_ID
if (!projectId) throw new Error('SANITY_STUDIO_PROJECT_ID is required')
const token = getCliClient({ apiVersion: '2026-03-01' }).config().token
if (!token) throw new Error('An authenticated Sanity CLI session is required')

const debuggerPort = Number(process.argv.at(-3) ?? 9241)
const studioUrl = process.argv.at(-2) ?? 'http://127.0.0.1:3333/structure/home-page'
const screenshotPath = process.argv.at(-1)
const origin = new URL(studioUrl).origin
const storageKey = `__studio_auth_token_${projectId}`

const target = await fetch(
  `http://127.0.0.1:${debuggerPort}/json/new?${encodeURIComponent('about:blank')}`,
  { method: 'PUT' },
).then(response => response.json())
const socket = new WebSocket(target.webSocketDebuggerUrl)
await new Promise((resolve, reject) => {
  socket.addEventListener('open', resolve, { once: true })
  socket.addEventListener('error', reject, { once: true })
})

let requestId = 0
const pending = new Map<number, { resolve: (value: Record<string, unknown>) => void, reject: (error: Error) => void }>()
socket.addEventListener('message', event => {
  const message = JSON.parse(String(event.data)) as { id?: number, error?: { message: string }, result?: Record<string, unknown> }
  if (!message.id || !pending.has(message.id)) return
  const request = pending.get(message.id)!
  pending.delete(message.id)
  if (message.error) request.reject(new Error(message.error.message))
  else request.resolve(message.result ?? {})
})
const send = (method: string, params: Record<string, unknown> = {}) => new Promise<Record<string, unknown>>((resolve, reject) => {
  const id = ++requestId
  pending.set(id, { resolve, reject })
  socket.send(JSON.stringify({ id, method, params }))
})

async function evaluate(expression: string) {
  const response = await send('Runtime.evaluate', { expression, awaitPromise: true, returnByValue: true })
  const result = response.result as { value?: unknown, description?: string } | undefined
  if (!result) throw new Error('Studio browser evaluation failed')
  return result.value
}

try {
  await send('Page.enable')
  await send('Runtime.enable')
  await send('Emulation.setDeviceMetricsOverride', { width: 1440, height: 1000, deviceScaleFactor: 1, mobile: false })
  await send('Page.navigate', { url: origin })
  await new Promise(resolve => setTimeout(resolve, 1500))
  await evaluate(`localStorage.setItem(${JSON.stringify(storageKey)}, ${JSON.stringify(JSON.stringify({ token }))})`)
  await send('Page.navigate', { url: studioUrl })
  await new Promise(resolve => setTimeout(resolve, 10000))
  const inspection = await evaluate(`(() => ({
    url: location.href,
    title: document.title,
    text: document.body.innerText.slice(0, 12000),
    editableInputs: [...document.querySelectorAll('input, textarea')].filter(element => !element.disabled).length,
    disabledInputs: [...document.querySelectorAll('input, textarea')].filter(element => element.disabled).length,
    fieldLabels: [...document.querySelectorAll('label')].map(element => element.textContent.trim()).filter(Boolean),
    buttons: [...document.querySelectorAll('button')].map(element => element.textContent.trim()).filter(Boolean),
  }))()`)
  if (screenshotPath) {
    const response = await send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: false })
    await writeFile(screenshotPath, Buffer.from(String(response.data), 'base64'))
  }
  process.stdout.write(`${JSON.stringify(inspection, null, 2)}\n`)
}
finally {
  try {
    await evaluate(`localStorage.removeItem(${JSON.stringify(storageKey)})`)
  }
  finally {
    socket.close()
  }
}
