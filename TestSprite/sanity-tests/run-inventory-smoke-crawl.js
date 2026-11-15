#!/usr/bin/env node

/**
 * Inventory-driven smoke crawl for all routes (or a kind filter).
 *
 * Usage:
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --kind=public
 *   node TestSprite/sanity-tests/run-inventory-smoke-crawl.js --limit=50
 *
 * Public-only tenant: default is --kind=public. Admin auth is not used.
 */

import { chromium } from 'playwright';
import {
  assertDemoTenant,
  assertAppReachable,
  loadInventory,
  resolveBaseUrl,
  loadAuthJson,
  discoverDemoIds,
  resolveDynamicPath,
  smokeCheckPage,
  CoverageTracker,
  shouldSkipSmokePath,
} from '../lib/e2e-harness.js';
/** Log a heartbeat while a single route is still loading (ms). */
const ROUTE_HEARTBEAT_MS = 15000;

function startRouteHeartbeat(tested, total, target, start) {
  return setInterval(() => {
    const sec = Math.round((Date.now() - start) / 1000);
    console.log(`  … still on (${tested}/${total}) ${target} (${sec}s)`);
  }, ROUTE_HEARTBEAT_MS);
}

function parseListArg(prefix) {
  const arg = process.argv.find((a) => a.startsWith(prefix));
  if (!arg) return null;
  return arg
    .slice(prefix.length)
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseKinds() {
  return parseListArg('--kind=');
}

function parseExclude() {
  return parseListArg('--exclude=') || [];
}

function parseLimit() {
  const arg = process.argv.find((a) => a.startsWith('--limit='));
  if (!arg) return Infinity;
  const n = parseInt(arg.slice('--limit='.length), 10);
  return Number.isFinite(n) && n > 0 ? n : Infinity;
}

async function main() {
  assertDemoTenant();
  const kinds = parseKinds() || ['public'];
  const exclude = parseExclude();
  const limit = parseLimit();
  const inventory = loadInventory();
  const authFile = loadAuthJson();
  const baseUrl = resolveBaseUrl(authFile?.baseUrl || 'http://localhost:3000');
  await assertAppReachable(baseUrl);

  const suiteLabel = kinds
    ? `smoke-${kinds.filter((k) => !exclude.includes(k)).join('+') || 'none'}`
    : exclude.length
      ? `smoke-all-except-${exclude.join('+')}`
      : 'smoke-all';
  const tracker = new CoverageTracker(suiteLabel);

  let routes = inventory.routes;
  if (kinds) {
    routes = routes.filter((r) => kinds.includes(r.kind));
  }
  if (exclude.length) {
    routes = routes.filter((r) => !exclude.includes(r.kind));
    console.log(`[smoke] Excluding kinds: ${exclude.join(', ')}`);
  }

  const config = {
    baseUrl,
    timeout: 45000,
    headless: true,
  };

  const ids = await discoverDemoIds(baseUrl);
  const idBag = {
    ...ids,
    id: ids.eventId || ids.planId || ids.pollId || ids.sponsorId,
    slug: ids.focusGroupSlug || 'demo',
  };

  const browser = await chromium.launch({ headless: config.headless !== false });
  let context;
  try {
    context = await browser.newContext({
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
    });

    const page = await context.newPage();

    let tested = 0;
    const totalPlanned = Number.isFinite(limit)
      ? Math.min(routes.length, limit)
      : routes.length;
    console.log(
      `\n[smoke] Crawling ${routes.length} routes (limit=${limit}, planned≈${totalPlanned})…`
    );
    console.log(
      `[smoke] Progress: log every route; heartbeat every ${ROUTE_HEARTBEAT_MS / 1000}s while waiting`
    );

    for (const route of routes) {
      if (tested >= limit) break;

      if (shouldSkipSmokePath(route.path)) {
        tracker.record({
          path: route.path,
          status: 'skip',
          kind: route.kind,
          message: 'Excluded from smoke (redirect / non-content route)',
        });
        console.log(`  ○ skip ${route.path}`);
        continue;
      }

      let target = route.path;
      if (route.dynamic) {
        const localIds = { ...idBag };
        if (route.path.includes('/membership/subscribe')) {
          localIds.id = ids.planId;
          localIds.planId = ids.planId;
        } else if (route.path.includes('/polls/')) {
          localIds.id = ids.pollId;
        } else if (route.path.includes('/sponsors/')) {
          localIds.id = ids.sponsorId;
        } else if (route.path.includes('/focus-groups/')) {
          localIds.slug = ids.focusGroupSlug || 'demo';
        } else if (route.path.includes('/events/')) {
          localIds.id = ids.eventId;
          localIds.eventId = ids.eventId;
        }

        target = resolveDynamicPath(route.path, localIds);
        if (!target) {
          tracker.record({
            path: route.path,
            status: 'skip',
            kind: route.kind,
            message: 'Missing demo ID for dynamic segment',
          });
          console.log(`  ○ skip ${route.path} (missing demo ID)`);
          continue;
        }
      }

      const start = Date.now();
      tested += 1;
      console.log(`  → (${tested}/${totalPlanned}) ${target}`);
      const heartbeat = startRouteHeartbeat(tested, totalPlanned, target, start);
      try {
        if (tested > 1) {
          await page.waitForTimeout(150);
        }

        const allowSignIn =
          route.kind === 'public' ||
          target.includes('/sign-in') ||
          target.includes('/sign-up') ||
          target.includes('/pricing') ||
          target.includes('/profile') ||
          target.includes('/dashboard') ||
          target.includes('/membership/manage') ||
          target.includes('/auth/') ||
          target.includes('/sso-callback');

        let response = null;
        let lastErr = null;
        for (let attempt = 1; attempt <= 2; attempt++) {
          try {
            response = await page.goto(`${baseUrl}${target}`, {
              waitUntil: 'domcontentloaded',
              timeout: Math.min(config.timeout, 30000),
            });
            lastErr = null;
            break;
          } catch (err) {
            lastErr = err;
            await page.waitForTimeout(1000 * attempt);
          }
        }
        if (lastErr) throw lastErr;

        await page.waitForLoadState('networkidle', { timeout: 5000 }).catch(() => {});

        const status = response?.status?.() ?? 0;
        const durationMs = Date.now() - start;
        if (status >= 500) {
          tracker.record({
            path: route.path,
            status: 'fail',
            kind: route.kind,
            message: `HTTP ${status}`,
            durationMs,
            meta: { resolved: target },
          });
          console.log(`  ✗ (${tested}/${totalPlanned}) [${status}] ${target} (${durationMs}ms)`);
          continue;
        }

        const finalUrl = page.url();
        if (
          route.kind === 'public' &&
          finalUrl.includes('/sign-in') &&
          !target.includes('/sign-in')
        ) {
          tracker.record({
            path: route.path,
            status: 'pass',
            kind: route.kind,
            message: 'auth-gated (redirect to sign-in)',
            durationMs,
            meta: { resolved: target, http: status },
          });
          console.log(
            `  ✓ (${tested}/${totalPlanned}) ${target} [auth-gated] (${durationMs}ms)`
          );
          continue;
        }

        const check = await smokeCheckPage(page, {
          allowSignInRedirect: allowSignIn,
          urlHint: target,
        });
        tracker.record({
          path: route.path,
          status: check.ok ? 'pass' : 'fail',
          kind: route.kind,
          message: check.message,
          durationMs,
          meta: { resolved: target, http: status },
        });
        console.log(
          `  ${check.ok ? '✓' : '✗'} (${tested}/${totalPlanned}) ${target} (${durationMs}ms)`
        );
      } catch (err) {
        const durationMs = Date.now() - start;
        tracker.record({
          path: route.path,
          status: 'fail',
          kind: route.kind,
          message: err.message,
          durationMs,
          meta: { resolved: target },
        });
        console.log(
          `  ✗ (${tested}/${totalPlanned}) ${target}: ${err.message} (${durationMs}ms)`
        );
      } finally {
        clearInterval(heartbeat);
      }
    }

    await page.close();
  } finally {
    if (context) await context.close();
    await browser.close();
  }

  tracker.write();
  const s = tracker.summary();
  if (s.fail > 0) process.exitCode = 1;
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
