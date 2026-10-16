import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

const port = Number(process.argv[2] ?? 9225);
const origin = process.argv[3] ?? "http://127.0.0.1:3011";
const interactionOnly = process.argv[4] === "interaction-only";
const outputDirectory = resolve(
  "web/docs/design/review/articles-detail-ui-verified",
);

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

async function prepare(session, path, width, height, reducedMotion = false) {
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
    features: [
      {
        name: "prefers-reduced-motion",
        value: reducedMotion ? "reduce" : "no-preference",
      },
    ],
  });
  await session.send("Page.navigate", { url: `${origin}${path}` });
  await new Promise((resolveWait) => setTimeout(resolveWait, 1600));
  await session.send("Page.bringToFront");
}

const metricsExpression = `(() => {
  const controls = [...document.querySelectorAll('main a, main button')]
    .map(element => element.getBoundingClientRect())
    .filter(rect => rect.width && rect.height)
  const contrast = (foreground, background) => {
    const channels = color => color.match(/[\\d.]+/g).slice(0, 3).map(Number)
      .map(value => value / 255)
      .map(value => value <= 0.04045 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4)
    const luminance = color => {
      const [red, green, blue] = channels(color)
      return 0.2126 * red + 0.7152 * green + 0.0722 * blue
    }
    const first = luminance(foreground)
    const second = luminance(background)
    return Number(((Math.max(first, second) + 0.05) / (Math.min(first, second) + 0.05)).toFixed(2))
  }
  const colorPair = (selector, surfaceSelector) => {
    const element = document.querySelector(selector)
    const surface = document.querySelector(surfaceSelector)
    return element && surface ? contrast(getComputedStyle(element).color, getComputedStyle(surface).backgroundColor) : null
  }
  return {
    innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    scrollHeight: Math.max(document.documentElement.scrollHeight, document.body.scrollHeight),
    h1Count: document.querySelectorAll('main h1').length,
    headings: [...document.querySelectorAll('main h1, main h2, main h3')].map(element => ({ level: element.tagName, text: element.textContent.trim() })),
    bodySections: document.querySelectorAll('.article-body > *').length,
    relatedItems: document.querySelectorAll('.article-related__track > li').length,
    missingAlt: [...document.querySelectorAll('main img')].filter(image => !image.hasAttribute('alt')).length,
    emptyMeaningfulAlt: [...document.querySelectorAll('main img')].filter(image => image.hasAttribute('alt') && !image.alt.trim()).length,
    minimumControlWidth: Math.min(...controls.map(rect => rect.width)),
    minimumControlHeight: Math.min(...controls.map(rect => rect.height)),
    bodyLineHeight: document.querySelector('.article-section p') ? getComputedStyle(document.querySelector('.article-section p')).lineHeight : null,
    sectionTitleSize: document.querySelector('.article-section h2') ? getComputedStyle(document.querySelector('.article-section h2')).fontSize : null,
    transitionDuration: document.querySelector('.article-related__track') ? getComputedStyle(document.querySelector('.article-related__track')).transitionDuration : null,
    lazyImages: document.querySelectorAll('main img[loading="lazy"]').length,
    eagerImages: document.querySelectorAll('main img:not([loading="lazy"])').length,
    currentNavigation: document.querySelector('header [aria-current="page"]')?.textContent.trim(),
    contrast: {
      body: colorPair('.article-section p', '.article-detail'),
      metadata: colorPair('.article-meta li', '.article-meta'),
      relatedCategory: colorPair('.article-related small', '.article-detail'),
      fixtureNotice: colorPair('.article-prototype-notice', '.article-prototype-notice'),
    },
  }
})()`;

async function capture(name, path, width, height, screenshot = false) {
  const session = await createSession();
  await prepare(session, path, width, height);
  await evaluate(
    session,
    `(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += ${height}) {
        window.scrollTo(0, y)
        await new Promise(resolve => setTimeout(resolve, 80))
      }
      window.scrollTo(0, 0)
      await new Promise(resolve => setTimeout(resolve, 250))
    })()`,
  );
  const metrics = await evaluate(session, metricsExpression);
  if (screenshot) {
    const image = await session.send("Page.captureScreenshot", {
      format: "png",
      captureBeyondViewport: true,
      clip: {
        x: 0,
        y: 0,
        width,
        height: metrics.scrollHeight,
        scale: 1,
      },
    });
    await writeFile(
      resolve(outputDirectory, `${name}.png`),
      Buffer.from(image.data, "base64"),
    );
  }
  session.close();
  return { name, path, ...metrics };
}

async function validateInteractions() {
  const session = await createSession();
  await prepare(session, "/articles/prototype-article-01", 390, 844);
  const initial = await evaluate(
    session,
    `(() => {
      const live = document.querySelector('.article-related [aria-live="polite"]')
      const next = document.querySelector('[aria-label="下一篇相關文章"]')
      const track = document.querySelector('.article-related__track')
      const links = [...track.querySelectorAll('a')]
      next.focus()
      return {
        live: live.textContent.trim(),
        transform: track.style.transform,
        visibleTabbableLinks: links.filter(link => !link.hasAttribute('tabindex')).length,
        hiddenLinks: links.filter(link => link.getAttribute('tabindex') === '-1').length,
        focusedNextButton: document.activeElement === next,
      }
    })()`,
  );
  await session.send("Input.dispatchKeyEvent", {
    type: "rawKeyDown",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
    nativeVirtualKeyCode: 13,
  });
  await session.send("Input.dispatchKeyEvent", {
    type: "char",
    text: "\r",
    unmodifiedText: "\r",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
    nativeVirtualKeyCode: 13,
  });
  await session.send("Input.dispatchKeyEvent", {
    type: "keyUp",
    key: "Enter",
    code: "Enter",
    windowsVirtualKeyCode: 13,
    nativeVirtualKeyCode: 13,
  });
  await new Promise((resolveWait) => setTimeout(resolveWait, 1650));
  const afterKeyboardActivation = await evaluate(
    session,
    `(() => {
      const links = [...document.querySelectorAll('.article-related__track a')]
      return {
        live: document.querySelector('.article-related [aria-live="polite"]').textContent.trim(),
        transform: document.querySelector('.article-related__track').style.transform,
        previousDisabled: document.querySelector('[aria-label="上一篇相關文章"]').disabled,
        visibleTabbableLinks: links.filter(link => !link.hasAttribute('tabindex')).length,
        hiddenLinks: links.filter(link => link.getAttribute('tabindex') === '-1').length,
        firstLinkHidden: links[0].getAttribute('aria-hidden') === 'true' || links[0].closest('li').getAttribute('aria-hidden') === 'true',
        secondLinkTabbable: !links[1].hasAttribute('tabindex'),
      }
    })()`,
  );
  const atEnd = await evaluate(
    session,
    `(async () => {
      const next = document.querySelector('[aria-label="下一篇相關文章"]')
      for (let index = 0; index < 3; index += 1) {
        next.click()
        await new Promise(resolve => setTimeout(resolve, 20))
      }
      return {
        live: document.querySelector('.article-related [aria-live="polite"]').textContent.trim(),
        nextDisabled: next.disabled,
        tabbableLinks: [...document.querySelectorAll('.article-related__track a')].filter(link => !link.hasAttribute('tabindex')).length,
      }
    })()`,
  );
  session.close();
  return { initial, afterKeyboardActivation, atEnd };
}

async function validateReducedMotion() {
  const session = await createSession();
  await prepare(session, "/articles/prototype-article-01", 390, 844, true);
  const result = await evaluate(
    session,
    `(() => ({
      transitionDuration: getComputedStyle(document.querySelector('.article-related__track')).transitionDuration,
      skeletonAnimation: getComputedStyle(document.querySelector('.article-state__skeleton') ?? document.body).animationDuration,
    }))()`,
  );
  session.close();
  return result;
}

await mkdir(outputDirectory, { recursive: true });
const viewports = [];
if (!interactionOnly) {
  for (const viewport of [
    ["overlay-320", "/articles/prototype-article-01", 320, 700, false],
    ["overlay-390", "/articles/prototype-article-01", 390, 844, true],
    ["overlay-768", "/articles/prototype-article-01", 768, 900, false],
    ["overlay-1023", "/articles/prototype-article-01", 1023, 900, false],
    ["overlay-1024", "/articles/prototype-article-01", 1024, 900, false],
    ["overlay-1440", "/articles/prototype-article-01", 1440, 1000, true],
    [
      "text-zoom-200-equivalent",
      "/articles/prototype-article-01",
      720,
      900,
      false,
    ],
    ["split-390", "/articles/prototype-article-02", 390, 844, true],
    ["minimal-390", "/articles/prototype-article-minimal", 390, 844, false],
    ["long-390", "/articles/prototype-article-long", 390, 844, false],
  ]) {
    viewports.push(await capture(...viewport));
  }
}

const routeStatus = {
  known: await fetch(`${origin}/articles/prototype-article-01`).then(
    (response) => response.status,
  ),
  missing: await fetch(`${origin}/articles/missing-article`).then(
    (response) => response.status,
  ),
};
const serverMarkup = await fetch(
  `${origin}/articles/prototype-article-01`,
).then((response) => response.text());
const relatedMarkup =
  serverMarkup.split('id="article-related-track"')[1]?.split("</ul>")[0] ?? "";
const noScriptFallback = {
  enhancedClassPresent: serverMarkup.includes("article-related--enhanced"),
  controlsPresent: serverMarkup.includes("article-related__controls"),
  relatedLinks: (relatedMarkup.match(/閱讀文章/g) ?? []).length,
  hiddenItems: (relatedMarkup.match(/<li[^>]*aria-hidden="true"/g) ?? [])
    .length,
  removedFromTabOrder: (relatedMarkup.match(/tabindex="-1"/g) ?? []).length,
};
const report = {
  ...(interactionOnly ? {} : { viewports }),
  interactions: await validateInteractions(),
  reducedMotion: await validateReducedMotion(),
  routeStatus,
  noScriptFallback,
};
if (!interactionOnly) {
  await writeFile(
    resolve(outputDirectory, "metrics.json"),
    `${JSON.stringify(report, null, 2)}\n`,
  );
}
console.log(JSON.stringify(report, null, 2));
