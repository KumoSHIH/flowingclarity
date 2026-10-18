import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const port = Number(process.argv[2] ?? 9231);
const origin = process.argv[3] ?? "http://127.0.0.1:3012";
const finalCheck = process.argv[4] === "final-check";
const outputDirectory = resolve("web/docs/design/review/about-ui-verified");

async function createSession(url = "about:blank") {
  const target = await fetch(
    `http://127.0.0.1:${port}/json/new?${encodeURIComponent(url)}`,
    { method: "PUT" },
  ).then((response) => response.json());
  const socket = new WebSocket(target.webSocketDebuggerUrl);
  await new Promise((resolveOpen, rejectOpen) => {
    socket.addEventListener("open", resolveOpen, { once: true });
    socket.addEventListener("error", rejectOpen, { once: true });
  });

  let requestId = 0;
  const pending = new Map();
  socket.addEventListener("message", (event) => {
    const message = JSON.parse(event.data);
    if (!message.id || !pending.has(message.id)) return;
    const request = pending.get(message.id);
    pending.delete(message.id);
    if (message.error) request.reject(new Error(message.error.message));
    else request.resolve(message.result);
  });
  const send = (method, params = {}) =>
    new Promise((resolveRequest, reject) => {
      const id = ++requestId;
      pending.set(id, { resolve: resolveRequest, reject });
      socket.send(JSON.stringify({ id, method, params }));
    });
  return { send, close: () => socket.close() };
}

async function evaluate(session, expression) {
  const { result } = await session.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.description);
  return result.value;
}

async function prepare(session, width, height, reducedMotion = false) {
  await session.send("Page.enable");
  await session.send("Runtime.enable");
  await session.send("Emulation.setDeviceMetricsOverride", {
    width,
    height,
    deviceScaleFactor: 1,
    mobile: width <= 768,
    screenWidth: width,
    screenHeight: height,
  });
  await session.send("Emulation.setEmulatedMedia", {
    features: [{
      name: "prefers-reduced-motion",
      value: reducedMotion ? "reduce" : "no-preference",
    }],
  });
  await session.send("Page.navigate", { url: `${origin}/about` });
  await new Promise((resolveWait) => setTimeout(resolveWait, 1800));
  await session.send("Page.bringToFront");
}

const metricsExpression = `(() => {
  const visible = element => {
    const rect = element.getBoundingClientRect()
    const style = getComputedStyle(element)
    return rect.width > 0 && rect.height > 0 && style.visibility !== 'hidden' && style.display !== 'none'
  }
  const controls = [...document.querySelectorAll('main a, main button')]
    .filter(visible)
    .map(element => {
      const rect = element.getBoundingClientRect()
      return {
        label: element.getAttribute('aria-label') || element.textContent.trim().slice(0, 40),
        width: Number(rect.width.toFixed(2)),
        height: Number(rect.height.toFixed(2)),
      }
    })
  const imageFailures = [...document.querySelectorAll('main img')]
    .filter(image => image.complete && image.naturalWidth === 0)
    .map(image => image.src)
  const rect = selector => {
    const element = document.querySelector(selector)
    if (!element) return null
    const box = element.getBoundingClientRect()
    return { top: box.top + scrollY, bottom: box.bottom + scrollY, width: box.width, height: box.height }
  }
  return {
    innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    h1Count: document.querySelectorAll('main h1').length,
    headings: [...document.querySelectorAll('main h1, main h2')].map(element => ({
      level: element.tagName,
      text: element.textContent.trim(),
    })),
    missingAlt: [...document.querySelectorAll('main img')].filter(image => !image.hasAttribute('alt')).length,
    imageFailures,
    controls,
    undersizedControls: controls.filter(control => control.width < 44 || control.height < 44),
    typography: {
      h1: getComputedStyle(document.querySelector('main h1')).fontSize,
      h2: getComputedStyle(document.querySelector('main h2')).fontSize,
      body: getComputedStyle(document.querySelector('.about-copy')).fontSize,
      bodyLineHeight: getComputedStyle(document.querySelector('.about-copy')).lineHeight,
    },
    layout: {
      heroColumns: getComputedStyle(document.querySelector('.about-hero')).gridTemplateColumns,
      momentsDisplay: getComputedStyle(document.querySelector('.about-moments')).display,
      placeMarginBottom: getComputedStyle(document.querySelector('.about-place')).marginBottom,
      contactMarginTop: getComputedStyle(document.querySelector('.about-contact')).marginTop,
      hero: rect('.about-hero'),
      brand: rect('.about-brand'),
      place: rect('.about-place'),
      moments: rect('.about-moments'),
      contact: rect('.about-contact'),
    },
    carousel: {
      count: document.querySelector('.about-carousel__controls span')?.textContent.trim(),
      transitionDuration: getComputedStyle(document.querySelector('.about-carousel__track')).transitionDuration,
      buttons: document.querySelectorAll('.about-carousel__controls button').length,
      playbackButtons: document.querySelectorAll('[aria-label*="播放精選片段"], [aria-label*="暫停精選片段"]').length,
    },
    currentNavigation: document.querySelector('header [aria-current="page"]')?.textContent.trim() ?? null,
  }
})()`;

async function scrollThrough(session, height) {
  await evaluate(
    session,
    `(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += ${height}) {
        window.scrollTo(0, y)
        await new Promise(resolve => setTimeout(resolve, 90))
      }
      window.scrollTo(0, 0)
      await new Promise(resolve => setTimeout(resolve, 300))
    })()`,
  );
}

async function capture(name, width, height, screenshot = false) {
  const session = await createSession();
  await prepare(session, width, height);
  await scrollThrough(session, height);
  const metrics = await evaluate(session, metricsExpression);
  if (screenshot) {
    const image = await session.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: { x: 0, y: 0, width, height: metrics.scrollHeight, scale: 1 },
    });
    await writeFile(
      resolve(outputDirectory, `${name}.png`),
      Buffer.from(image.data, "base64"),
    );
  }
  session.close();
  return { name, ...metrics };
}

async function validateCarousel() {
  const session = await createSession();
  await prepare(session, 390, 844);
  const result = await evaluate(
    session,
    `(async () => {
      const section = document.querySelector('.about-moments')
      const track = document.querySelector('.about-carousel__track')
      const previous = document.querySelector('[aria-label="上一張片段"]')
      const next = document.querySelector('[aria-label="下一張片段"]')
      const count = () => document.querySelector('.about-carousel__controls span').textContent.trim()
      const initial = count()
      next.focus()
      const focusStyle = getComputedStyle(next)
      const focusOutline = {
        style: focusStyle.outlineStyle,
        width: focusStyle.outlineWidth,
        offset: focusStyle.outlineOffset,
      }
      await new Promise(resolve => setTimeout(resolve, 2200))
      const whileFocused = count()
      next.blur()
      section.dispatchEvent(new MouseEvent('mouseenter'))
      await new Promise(resolve => setTimeout(resolve, 2200))
      const whileHovered = count()
      section.dispatchEvent(new MouseEvent('mouseleave'))
      await new Promise(resolve => setTimeout(resolve, 2200))
      const afterResume = count()
      next.focus()
      await new Promise(resolve => setTimeout(resolve, 1600))
      next.click()
      await new Promise(resolve => setTimeout(resolve, 1550))
      next.click()
      await new Promise(resolve => setTimeout(resolve, 1550))
      const afterForwardLoop = count()
      previous.click()
      await new Promise(resolve => setTimeout(resolve, 1550))
      const afterPrevious = count()
      return {
        initial,
        whileFocused,
        whileHovered,
        afterResume,
        afterForwardLoop,
        afterPrevious,
        transform: track.style.transform,
        focusedControl: document.activeElement?.getAttribute('aria-label') ?? null,
        focusOutline,
      }
    })()`,
  );
  session.close();
  return result;
}

async function validateLongContent() {
  const session = await createSession();
  await prepare(session, 320, 720);
  const result = await evaluate(
    session,
    `(() => {
      const longChinese = '這是一段用於驗證極長內容換行與版面穩定性的示意文字，'.repeat(12)
      const longEmail = 'very-long-contact-address-for-layout-validation@example-domain-with-long-name.com'
      document.querySelectorAll('.about-copy p').forEach(paragraph => { paragraph.textContent = longChinese })
      document.querySelectorAll('main h2').forEach(heading => { heading.textContent = '讓很長的章節標題在窄螢幕上自然換行並維持閱讀順序' })
      const email = document.querySelector('a[href^="mailto:"]')
      if (email) email.textContent = longEmail
      const overflow = [...document.querySelectorAll('main *')].filter(element => {
        const rect = element.getBoundingClientRect()
        return rect.right > document.documentElement.clientWidth + 1 || rect.left < -1
      }).map(element => element.className || element.tagName).slice(0, 20)
      return {
        clientWidth: document.documentElement.clientWidth,
        scrollWidth: document.documentElement.scrollWidth,
        overflow,
        emailWrap: email ? getComputedStyle(email).overflowWrap : null,
      }
    })()`,
  );
  session.close();
  return result;
}

async function validateReducedMotion() {
  const session = await createSession();
  await prepare(session, 390, 844, true);
  const result = await evaluate(
    session,
    `(async () => {
      const count = () => document.querySelector('.about-carousel__controls span').textContent.trim()
      const initial = count()
      await new Promise(resolve => setTimeout(resolve, 2300))
      return {
        initial,
        afterDelay: count(),
        transitionDuration: getComputedStyle(document.querySelector('.about-carousel__track')).transitionDuration,
      }
    })()`,
  );
  session.close();
  return result;
}

await mkdir(outputDirectory, { recursive: true });
if (finalCheck) {
  const report = {
    generatedAt: new Date().toISOString(),
    origin,
    viewport: await capture("final-320", 320, 720),
    carousel: await validateCarousel(),
    reducedMotion: await validateReducedMotion(),
    longContent: await validateLongContent(),
  };
  await writeFile(
    resolve(outputDirectory, "final-check.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
} else {
  const viewports = [];
  for (const viewport of [
    ["about-320", 320, 720, false],
    ["about-390", 390, 844, true],
    ["about-768", 768, 1024, false],
    ["about-1024", 1024, 900, false],
    ["about-1440", 1440, 1000, true],
    ["about-200-percent-equivalent", 720, 900, false],
  ]) {
    viewports.push(await capture(...viewport));
  }

  const report = {
    generatedAt: new Date().toISOString(),
    origin,
    viewports,
    carousel: await validateCarousel(),
    reducedMotion: await validateReducedMotion(),
    longContent: await validateLongContent(),
  };

  await writeFile(
    resolve(outputDirectory, "metrics.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
  process.stdout.write(`${JSON.stringify(report, null, 2)}\n`);
}
