/**
 * Shared browser utilities for Chrome DevTools scripts
 */
import puppeteer from 'puppeteer';
import debug from 'debug';
import fs from 'fs';

const log = debug('chrome-devtools:browser');

let browserInstance = null;
let pageInstance = null;

/**
 * Launch or connect to browser
 */
export async function getBrowser(options = {}) {
  if (browserInstance && browserInstance.isConnected()) {
    log('Reusing existing browser instance');
    return browserInstance;
  }

  let executablePath = options.executablePath;
  if (!executablePath && process.platform === 'win32') {
    const winChrome = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
    if (fs.existsSync(winChrome)) {
      executablePath = winChrome;
    }
  }

  const launchOptions = {
    headless: options.headless !== false,
    ...(executablePath ? { executablePath } : {}),
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      ...(options.args || [])
    ],
    defaultViewport: options.viewport || {
      width: 1440,
      height: 900
    },
    ...options
  };

  if (options.browserUrl || options.wsEndpoint) {
    log('Connecting to existing browser');
    browserInstance = await puppeteer.connect({
      browserURL: options.browserUrl,
      browserWSEndpoint: options.wsEndpoint
    });
  } else {
    log('Launching new browser');
    browserInstance = await puppeteer.launch(launchOptions);
  }

  return browserInstance;
}

/**
 * Get current page or create new one
 */
export async function getPage(browser) {
  if (pageInstance && !pageInstance.isClosed()) {
    log('Reusing existing page');
    return pageInstance;
  }

  const pages = await browser.pages();
  if (pages.length > 0) {
    pageInstance = pages[0];
  } else {
    pageInstance = await browser.newPage();
  }

  return pageInstance;
}

/**
 * Close browser
 */
export async function closeBrowser() {
  if (browserInstance) {
    await browserInstance.close();
    browserInstance = null;
    pageInstance = null;
  }
}

/**
 * Parse command line arguments
 */
export function parseArgs(argv, options = {}) {
  const args = {};

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];

    if (arg.startsWith('--')) {
      const key = arg.slice(2);
      const nextArg = argv[i + 1];

      if (nextArg && !nextArg.startsWith('--')) {
        args[key] = nextArg;
        i++;
      } else {
        args[key] = true;
      }
    }
  }

  return args;
}

/**
 * Output JSON result
 */
export function outputJSON(data) {
  console.log(JSON.stringify(data, null, 2));
}

/**
 * Output error
 */
export function outputError(error) {
  console.error(JSON.stringify({
    success: false,
    error: error.message,
    stack: error.stack
  }, null, 2));
  process.exit(1);
}
