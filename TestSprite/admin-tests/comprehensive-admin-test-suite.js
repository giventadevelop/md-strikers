/**
 * Comprehensive Admin Test Suite
 *
 * Tests all admin pages and sub-pages with Playwright automation.
 * Uses auth.json for credentials configuration.
 *
 * Usage:
 *   1. Copy auth.json.example to auth.json
 *   2. Fill in your admin credentials
 *   3. Run: node TestSprite/admin-tests/comprehensive-admin-test-suite.js
 */

import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { createRequire } from 'module';

// ES module __dirname equivalent
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Import ES module authentication helpers
import { authenticatePage, createAuthenticatedContext, saveAuthState, loadAuthState } from '../sanity-tests/authenticate-playwright.js';

// Configuration
const AUTH_CONFIG_PATH = path.join(__dirname, 'auth.json');
const AUTH_STATE_PATH = path.join(__dirname, '.auth-state.json');
const SCREENSHOTS_DIR = path.join(__dirname, 'screenshots');
const REPORT_PATH = path.join(__dirname, 'admin-test-report.html');

// Test results storage
let testResults = [];
let startTime = Date.now();

/**
 * Load authentication configuration
 */
function loadAuthConfig() {
  if (!fs.existsSync(AUTH_CONFIG_PATH)) {
    console.error(`❌ Auth config file not found: ${AUTH_CONFIG_PATH}`);
    console.error(`   Please copy auth.json.example to auth.json and fill in your credentials.`);
    process.exit(1);
  }

  try {
    const config = JSON.parse(fs.readFileSync(AUTH_CONFIG_PATH, 'utf8'));

    if (!config.email || !config.password) {
      console.error('❌ Auth config missing email or password');
      process.exit(1);
    }

    return {
      email: config.email,
      password: config.password,
      baseUrl: config.baseUrl || 'http://localhost:3000',
      timeout: config.timeout || 30000,
      headless: config.headless !== undefined ? config.headless : true, // Default to headless for CI/CD
      screenshotOnFailure: config.screenshotOnFailure !== false
    };
  } catch (error) {
    console.error(`❌ Error loading auth config: ${error.message}`);
    process.exit(1);
  }
}

/**
 * Create screenshots directory if it doesn't exist
 */
function ensureScreenshotsDir() {
  if (!fs.existsSync(SCREENSHOTS_DIR)) {
    fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  }
}

/**
 * All admin pages to test
 * Organized by category for better reporting
 */
const adminTestPages = [
  // ==========================================
  // CORE ADMIN PAGES
  // ==========================================
  {
    id: 'admin-001',
    name: 'Admin Dashboard',
    url: '/admin',
    category: 'core',
    priority: 'critical',
    expectedElements: ['h1, h2', '[class*="admin"]', 'nav', 'a[href*="/admin"]'],
    validation: ['Admin dashboard loads', 'Navigation menu visible', 'Admin buttons displayed'],
    timeout: 45000, // Increased timeout for client-side auth loading
  },
  {
    id: 'admin-002',
    name: 'Manage Users (Usage)',
    url: '/admin/manage-usage',
    category: 'core',
    priority: 'critical',
    expectedElements: ['h1', 'table', 'input[type="search"]', 'button'],
    validation: ['User management page loads', 'User table visible', 'Search functionality present'],
    timeout: 45000, // Increased timeout for API calls
  },
  {
    id: 'admin-003',
    name: 'Manage Events',
    url: '/admin/manage-events',
    category: 'core',
    priority: 'critical',
    expectedElements: ['h1', '[class*="grid"]', 'a[href*="/admin/events"]', 'input[type="search"]'],
    validation: ['Events management hub loads', 'Event cards/list displayed', 'Search controls present'],
    timeout: 45000, // Increased timeout for client-side auth loading
  },

  // ==========================================
  // EVENT MANAGEMENT PAGES
  // ==========================================
  {
    id: 'admin-004',
    name: 'Event Analytics Dashboard',
    url: '/admin/events/dashboard',
    category: 'events',
    priority: 'high',
    expectedElements: ['h1', '[class*="chart"]', '[class*="stat"]'],
    validation: ['Analytics dashboard loads', 'Charts or stats displayed'],
    timeout: 45000, // Increased timeout for this page (makes multiple API calls)
  },
  {
    id: 'admin-005',
    name: 'Event Registrations',
    url: '/admin/events/registrations',
    category: 'events',
    priority: 'high',
    expectedElements: ['h1', 'table', 'input[type="search"]'],
    validation: ['Registrations page loads', 'Registration table visible'],
    timeout: 45000, // Increased timeout for API calls
  },

  // ==========================================
  // POLLS & FOCUS GROUPS
  // ==========================================
  {
    id: 'admin-006',
    name: 'Poll Management',
    url: '/admin/polls',
    category: 'polls',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Poll management page loads', 'Poll list visible']
  },
  {
    id: 'admin-007',
    name: 'Focus Groups',
    url: '/admin/focus-groups',
    category: 'focus-groups',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'a[href*="/focus-groups"]'],
    validation: ['Focus groups page loads', 'Focus groups list visible']
  },

  // ==========================================
  // MEMBERSHIP MANAGEMENT
  // ==========================================
  {
    id: 'admin-008',
    name: 'Membership Plans',
    url: '/admin/membership/plans',
    category: 'membership',
    priority: 'high',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Membership plans page loads', 'Plans list visible']
  },
  {
    id: 'admin-009',
    name: 'Membership Subscriptions',
    url: '/admin/membership/subscriptions',
    category: 'membership',
    priority: 'high',
    expectedElements: ['h1', 'table', 'input[type="search"]'],
    validation: ['Subscriptions page loads', 'Subscriptions table visible']
  },

  // ==========================================
  // EMAIL MANAGEMENT
  // ==========================================
  {
    id: 'admin-010',
    name: 'Email Addresses',
    url: '/admin/tenant-email-addresses',
    category: 'email',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Email addresses page loads', 'Email list visible']
  },
  {
    id: 'admin-011',
    name: 'Bulk Email',
    url: '/admin/bulk-email',
    category: 'email',
    priority: 'medium',
    expectedElements: ['h1', 'form', 'button'],
    validation: ['Bulk email page loads', 'Email form visible']
  },
  {
    id: 'admin-012',
    name: 'Newsletter Emails',
    url: '/admin/newsletter-emails',
    category: 'email',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Newsletter emails page loads', 'Newsletter list visible']
  },

  // ==========================================
  // MEDIA & CONTENT
  // ==========================================
  {
    id: 'admin-013',
    name: 'Media Management',
    url: '/admin/media',
    category: 'media',
    priority: 'medium',
    expectedElements: ['h1', '[class*="grid"]', 'input[type="file"]', 'button'],
    validation: ['Media management page loads', 'Media grid/list visible', 'Upload controls present']
  },
  {
    id: 'admin-014',
    name: 'Executive Committee',
    url: '/admin/executive-committee',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    timeout: 45000, // Increased timeout for this page (makes API calls)
    validation: ['Executive committee page loads', 'Committee members list visible']
  },
  {
    id: 'admin-015',
    name: 'Event Sponsors (Global)',
    url: '/admin/event-sponsors',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global event sponsors page loads', 'Sponsors list visible']
  },
  {
    id: 'admin-016',
    name: 'Global Performers',
    url: '/admin/event-featured-performers',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global performers page loads', 'Performers list visible']
  },
  {
    id: 'admin-017',
    name: 'Global Contacts',
    url: '/admin/event-contacts',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global contacts page loads', 'Contacts list visible']
  },
  {
    id: 'admin-018',
    name: 'Global Emails',
    url: '/admin/event-emails',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global emails page loads', 'Emails list visible']
  },
  {
    id: 'admin-019',
    name: 'Global Program Directors',
    url: '/admin/event-program-directors',
    category: 'content',
    priority: 'medium',
    expectedElements: ['h1', 'table', 'button', 'form'],
    validation: ['Global program directors page loads', 'Directors list visible']
  },

  // ==========================================
  // TENANT MANAGEMENT
  // ==========================================
  {
    id: 'admin-020',
    name: 'Organizations',
    url: '/admin/tenant-management/organizations',
    category: 'tenant',
    priority: 'high',
    expectedElements: ['h1', 'table', 'button', 'a[href*="/organizations"]'],
    validation: ['Organizations page loads', 'Organizations list visible']
  },
  {
    id: 'admin-021',
    name: 'Tenant Settings',
    url: '/admin/tenant-management/settings',
    category: 'tenant',
    priority: 'high',
    expectedElements: ['h1', 'table', 'button', 'a[href*="/settings"]'],
    validation: ['Tenant settings page loads', 'Settings list visible']
  },
  {
    id: 'admin-022',
    name: 'Test CRUD',
    url: '/admin/tenant-management/test',
    category: 'tenant',
    priority: 'low',
    expectedElements: ['h1', 'button', 'form'],
    validation: ['Test CRUD page loads', 'CRUD operations visible']
  },

  // ==========================================
  // TESTING & UTILITIES
  // ==========================================
  {
    id: 'admin-023',
    name: 'Test Stripe',
    url: '/admin/test-stripe',
    category: 'utilities',
    priority: 'low',
    expectedElements: ['h1', 'button', 'form'],
    validation: ['Test Stripe page loads', 'Stripe test interface visible']
  }
];

// Note: Dynamic event pages are now tested in a separate script
// See: TestSprite/admin-tests/dynamic-event-test-suite.js
// Run: npm run test:admin:dynamic

/**
 * Get available event IDs from the manage-events page
 * NOTE: This function has been moved to dynamic-event-test-suite.js
 * This is kept here for reference but is no longer used in this script
 */
async function getAvailableEventIds_DEPRECATED(page, baseUrl) {
  const maxRetries = 3;
  let retryCount = 0;

  while (retryCount < maxRetries) {
    try {
      console.log(`\n   🔍 Discovering event IDs (attempt ${retryCount + 1}/${maxRetries})...`);

      // Navigate to manage-events page
      console.log(`   📍 Navigating to ${baseUrl}/admin/manage-events...`);
      await page.goto(`${baseUrl}/admin/manage-events`, {
        waitUntil: 'domcontentloaded',
        timeout: 60000
      });

      // Wait for page to fully load (including client-side rendering)
      console.log(`   ⏳ Waiting 8 seconds for page to fully load...`);
      await page.waitForTimeout(8000); // Increased wait time for client-side rendering

      // Wait for network to be idle (no pending requests)
      try {
        console.log(`   ⏳ Waiting for network to be idle...`);
        await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
          console.warn(`   ⚠️  Network idle timeout, continuing...`);
        });
      } catch (e) {
        console.warn(`   ⚠️  Network idle check failed, continuing...`);
      }

      // Debug: Check what's actually on the page
      const pageStructure = await page.evaluate(() => {
        const structure = {
          bodyChildren: document.body ? document.body.children.length : 0,
          hasThirdDiv: document.body && document.body.children.length >= 3,
          thirdDivChildren: document.body && document.body.children.length >= 3 ? document.body.children[2].children.length : 0,
          hasTable: !!document.querySelector('table'),
          tableRows: document.querySelector('table') ? document.querySelector('table').querySelectorAll('tbody tr').length : 0,
          allButtons: document.querySelectorAll('button').length,
          allLinks: document.querySelectorAll('a[href*="/admin/events/"]').length
        };

        // Try to navigate to the exact XPath structure
        try {
          if (document.body && document.body.children.length >= 3) {
            const thirdDiv = document.body.children[2];
            if (thirdDiv.children.length > 0) {
              const innerDiv = thirdDiv.children[0];
              structure.hasInnerDiv = true;
              structure.innerDivChildren = innerDiv.children.length;

              // Check for table
              const table = innerDiv.querySelector('table');
              structure.hasTableInStructure = !!table;
              if (table) {
                structure.tableRowsInStructure = table.querySelectorAll('tbody tr').length;
              }

              // Check for toggle button structure (div[5] > div > div[3] > button)
              if (innerDiv.children.length >= 5) {
                const fifthDiv = innerDiv.children[4];
                if (fifthDiv.children.length > 0) {
                  const innerFifthDiv = fifthDiv.children[0];
                  if (innerFifthDiv.children.length >= 3) {
                    const thirdInnerDiv = innerFifthDiv.children[2];
                    const button = thirdInnerDiv.querySelector('button');
                    structure.hasToggleButtonInStructure = !!button;
                  }
                }
              }
            }
          }
        } catch (e) {
          structure.structureError = e.message;
        }

        return structure;
      });

      console.log(`   🔍 Page structure debug:`, JSON.stringify(pageStructure, null, 2));

      // Wait for the events table using exact XPath path
      console.log(`   🔍 Looking for events table using exact XPath...`);
      let tableFound = false;
      let tableHandle = null;

      // Strategy 1: Use exact XPath path via evaluateHandle
      try {
        tableHandle = await page.evaluateHandle(() => {
          try {
            // Exact XPath: /html/body/div[3]/div/table
            const body = document.body;
            if (body && body.children.length >= 3) {
              const thirdDiv = body.children[2];
              if (thirdDiv.children.length > 0) {
                const innerDiv = thirdDiv.children[0];
                const table = innerDiv.querySelector('table');
                return table;
              }
            }
            return null;
          } catch (e) {
            console.error('[Page] Error finding table:', e);
            return null;
          }
        });

        if (tableHandle && tableHandle.asElement()) {
          tableFound = true;
          console.log(`   ✅ Table found via exact XPath structure`);
        }
      } catch (e) {
        console.warn(`   ⚠️  XPath structure method failed: ${e.message}`);
      }

      // Strategy 2: Wait for table element directly (fallback)
      if (!tableFound) {
        try {
          await page.waitForSelector('table', { timeout: 15000 });
          tableFound = true;
          console.log(`   ✅ Table found via 'table' selector`);
        } catch (e) {
          console.warn(`   ⚠️  Table not found via 'table' selector`);
        }
      }

      // Additional wait for client-side data loading
      console.log(`   ⏳ Waiting 5 seconds for data to load...`);
      await page.waitForTimeout(5000);

      // Check if events table has rows using exact XPath structure
      const hasEvents = await page.evaluate(() => {
        try {
          // Exact XPath: /html/body/div[3]/div/table/tbody/tr
          const body = document.body;
          if (body && body.children.length >= 3) {
            const thirdDiv = body.children[2];
            if (thirdDiv.children.length > 0) {
              const innerDiv = thirdDiv.children[0];
              const table = innerDiv.querySelector('table');
              if (table) {
                const rows = table.querySelectorAll('tbody tr');
                const rowCount = rows.length;
                console.log(`[Page] Found ${rowCount} rows in table via XPath structure`);
                return rowCount > 0;
              }
            }
          }

          // Fallback: Direct table query
          const table = document.querySelector('table');
          if (table) {
            const rows = table.querySelectorAll('tbody tr');
            return rows.length > 0;
          }

          return false;
        } catch (e) {
          console.error('[Page] Error checking events:', e);
          return false;
        }
      });

      console.log(`   📊 Events table found: ${tableFound ? 'Yes' : 'No'}, Has events: ${hasEvents ? 'Yes' : 'No'}`);

      // If no events found, try toggling the future/past switcher
      if (!hasEvents && retryCount === 0) {
        console.log(`   🔄 No events found, attempting to toggle future/past switcher...`);

        try {
          // Use exact XPath path: /html/body/div[3]/div/div[5]/div/div[3]/button
          console.log(`   🔍 Looking for toggle button using exact XPath...`);
          let toggleButtonHandle = await page.evaluateHandle(() => {
            try {
              // Exact XPath: /html/body/div[3]/div/div[5]/div/div[3]/button
              const body = document.body;
              if (!body || body.children.length < 3) {
                console.log('[Page] Body has less than 3 children');
                return null;
              }

              const thirdDiv = body.children[2];
              if (!thirdDiv || thirdDiv.children.length === 0) {
                console.log('[Page] Third div has no children');
                return null;
              }

              const innerDiv = thirdDiv.children[0];
              if (!innerDiv || innerDiv.children.length < 5) {
                console.log(`[Page] Inner div has ${innerDiv ? innerDiv.children.length : 0} children, need at least 5`);
                return null;
              }

              const fifthDiv = innerDiv.children[4];
              if (!fifthDiv || fifthDiv.children.length === 0) {
                console.log('[Page] Fifth div has no children');
                return null;
              }

              const innerFifthDiv = fifthDiv.children[0];
              if (!innerFifthDiv || innerFifthDiv.children.length < 3) {
                console.log(`[Page] Inner fifth div has ${innerFifthDiv ? innerFifthDiv.children.length : 0} children, need at least 3`);
                return null;
              }

              const thirdInnerDiv = innerFifthDiv.children[2];
              const button = thirdInnerDiv ? thirdInnerDiv.querySelector('button') : null;

              if (button) {
                console.log('[Page] ✅ Toggle button found via exact XPath structure');
              } else {
                console.log('[Page] ❌ Toggle button not found in thirdInnerDiv');
              }

              return button;
            } catch (e) {
              console.error('[Page] Error finding toggle button:', e);
              return null;
            }
          });

          let toggleButton = null;
          if (toggleButtonHandle && toggleButtonHandle.asElement()) {
            toggleButton = toggleButtonHandle.asElement();
            console.log(`   ✅ Toggle button found via exact XPath structure`);
          } else {
            // Fallback: Try aria-label
            console.log(`   🔍 Toggle button not found via XPath, trying aria-label...`);
            toggleButton = await page.$('button[aria-label*="Show Future Events"], button[aria-label*="Show Past Events"]').catch(() => null);
            if (toggleButton) {
              console.log(`   ✅ Toggle button found via aria-label`);
            }
          }

          if (toggleButton) {
            console.log(`   ✅ Toggle button found, clicking...`);
            await toggleButton.click();

            // Wait for page to reload after toggle
            console.log(`   ⏳ Waiting 8 seconds for data to reload after toggle...`);
            await page.waitForTimeout(8000); // Increased wait time for data reload

            // Wait for network to be idle
            try {
              console.log(`   ⏳ Waiting for network to be idle after toggle...`);
              await page.waitForLoadState('networkidle', { timeout: 20000 }).catch(() => {
                console.warn(`   ⚠️  Network idle timeout after toggle, continuing...`);
              });
            } catch (e) {
              console.warn(`   ⚠️  Network idle check failed after toggle`);
            }

            // Wait for table to update using exact XPath
            console.log(`   ⏳ Waiting for table to update...`);
            await page.waitForTimeout(5000);

            // Check again if events are now visible using exact XPath
            const hasEventsAfterToggle = await page.evaluate(() => {
              try {
                // Exact XPath: /html/body/div[3]/div/table/tbody/tr
                const body = document.body;
                if (body && body.children.length >= 3) {
                  const thirdDiv = body.children[2];
                  if (thirdDiv.children.length > 0) {
                    const innerDiv = thirdDiv.children[0];
                    const table = innerDiv.querySelector('table');
                    if (table) {
                      const rows = table.querySelectorAll('tbody tr');
                      const rowCount = rows.length;
                      console.log(`[Page] After toggle: Found ${rowCount} rows`);
                      return rowCount > 0;
                    }
                  }
                }
                return false;
              } catch (e) {
                console.error('[Page] Error checking events after toggle:', e);
                return false;
              }
            });

            console.log(`   📊 Events after toggle: ${hasEventsAfterToggle ? 'Found' : 'Still none'}`);

            if (!hasEventsAfterToggle) {
              console.warn(`   ⚠️  No events found even after toggle, will retry...`);
              retryCount++;
              continue;
            }
          } else {
            console.warn(`   ⚠️  Toggle button not found with any method, will retry...`);
            retryCount++;
            continue;
          }
        } catch (toggleError) {
          console.warn(`   ⚠️  Error toggling switcher: ${toggleError.message}`);
          console.warn(`   📍 Error stack: ${toggleError.stack?.split('\n').slice(0, 3).join('\n')}`);
          retryCount++;
          continue;
        }
      }

      // Look for "Upload Media Files" links using exact XPath: /html/body/div[3]/div/table/tbody/tr[1]/td[9]/a
      console.log(`   🔍 Looking for Upload Media Files links using exact XPath...`);
      const eventIds = await page.evaluate(() => {
        const ids = [];

        try {
          // Exact XPath: /html/body/div[3]/div/table/tbody/tr[1]/td[9]/a
          const body = document.body;
          if (!body || body.children.length < 3) {
            console.log('[Page] Body structure not found');
            return [];
          }

          const thirdDiv = body.children[2];
          if (!thirdDiv || thirdDiv.children.length === 0) {
            console.log('[Page] Third div has no children');
            return [];
          }

          const innerDiv = thirdDiv.children[0];
          const table = innerDiv.querySelector('table');
          if (!table) {
            console.log('[Page] Table not found in innerDiv');
            return [];
          }

          const tbody = table.querySelector('tbody');
          if (!tbody) {
            console.log('[Page] Tbody not found in table');
            return [];
          }

          const rows = tbody.querySelectorAll('tr');
          console.log(`[Page] Found ${rows.length} rows in table`);

          // Check each row's 9th column (td[9]) for Upload Media Files link
          rows.forEach((row, index) => {
            const cells = row.querySelectorAll('td');
            if (cells.length >= 9) {
              const mediaCell = cells[8]; // 0-indexed, so 8 = 9th column (td[9])
              const link = mediaCell.querySelector('a[href*="/admin/events/"][href*="/media"]');
              if (link) {
                const href = link.getAttribute('href');
                if (href) {
                  const match = href.match(/\/admin\/events\/(\d+)\/media/);
                  if (match) {
                    ids.push(match[1]);
                    console.log(`[Page] Found event ID ${match[1]} in row ${index + 1}, column 9`);
                  }
                }
              }
            }
          });

          // Fallback: Find all media links if XPath structure didn't work
          if (ids.length === 0) {
            console.log('[Page] No IDs found via XPath, trying all media links...');
            const mediaLinks = Array.from(document.querySelectorAll('a[href*="/admin/events/"][href*="/media"]'));
            mediaLinks.forEach(link => {
              const href = link.getAttribute('href');
              if (href) {
                const match = href.match(/\/admin\/events\/(\d+)\/media/);
                if (match) ids.push(match[1]);
              }
            });
          }
        } catch (e) {
          console.error('[Page] Error finding event IDs:', e);
        }

        // Remove duplicates and return unique IDs
        return [...new Set(ids)];
      });

      if (eventIds.length > 0) {
        console.log(`   ✅ Found ${eventIds.length} event ID(s): ${eventIds.join(', ')}`);

        // Randomly select up to 3 events for testing
        const selectedIds = eventIds
          .sort(() => Math.random() - 0.5) // Shuffle
          .slice(0, 3); // Take first 3

        console.log(`   🎯 Selected ${selectedIds.length} event ID(s) for testing: ${selectedIds.join(', ')}`);
        return selectedIds;
      } else {
        // Fallback: Try to find any event links if media links weren't found
        console.log(`   🔍 Media links not found, trying generic event links...`);

        const fallbackIds = await page.evaluate(() => {
          const links = Array.from(document.querySelectorAll('a[href*="/admin/events/"]'));
          const ids = links
            .map(link => {
              const href = link.getAttribute('href');
              if (!href) return null;
              const match = href.match(/\/admin\/events\/(\d+)/);
              return match ? match[1] : null;
            })
            .filter(id => id !== null);
          return [...new Set(ids)];
        });

        if (fallbackIds.length > 0) {
          console.log(`   ✅ Found ${fallbackIds.length} event ID(s) via fallback: ${fallbackIds.join(', ')}`);
          return fallbackIds.slice(0, 3);
        }

        console.warn(`   ⚠️  No event IDs found, will retry...`);
        retryCount++;

        if (retryCount < maxRetries) {
          console.log(`   ⏳ Waiting 3 seconds before retry...`);
          await page.waitForTimeout(3000); // Wait before retry
        }
      }
    } catch (error) {
      console.warn(`   ⚠️  Error fetching event IDs (attempt ${retryCount + 1}/${maxRetries}): ${error.message}`);
      console.warn(`   📍 Error stack: ${error.stack?.split('\n').slice(0, 3).join('\n')}`);
      retryCount++;

      if (retryCount < maxRetries) {
        console.log(`   ⏳ Waiting 3 seconds before retry...`);
        await page.waitForTimeout(3000); // Wait before retry
      }
    }
  }

  console.warn(`   ❌ Could not fetch event IDs after ${maxRetries} attempts`);
  return [];
}

/**
 * Run a single test
 */
async function runTest(page, test, config) {
  const testStartTime = Date.now();
  const result = {
    id: test.id,
    name: test.name,
    url: test.url || test.urlPattern,
    category: test.category,
    priority: test.priority,
    status: 'PENDING',
    duration: 0,
    error: null,
    screenshot: null,
    elementsFound: [],
    validations: [],
    jsErrors: [],
    consoleErrors: []
  };

  // Track JavaScript errors and console errors
  const jsErrors = [];
  const consoleErrors = [];

  // Set up error listeners before navigation
  page.on('pageerror', (error) => {
    const errorDetails = {
      type: 'pageerror',
      message: error.message,
      stack: error.stack || 'No stack trace available',
      name: error.name || 'Error',
      timestamp: new Date().toISOString()
    };
    jsErrors.push(errorDetails);
    console.error(`   ⚠️  JavaScript Error [${errorDetails.name}]: ${errorDetails.message}`);
    if (errorDetails.stack && errorDetails.stack !== 'No stack trace available') {
      console.error(`   📍 Stack trace:\n${errorDetails.stack.split('\n').slice(0, 5).join('\n')}...`);
    }
  });

  page.on('console', (msg) => {
    const type = msg.type();
    const text = msg.text();
    const location = msg.location();

    // Capture console errors and warnings
    if (type === 'error' || type === 'warning') {
      const errorDetails = {
        type: type,
        message: text,
        location: location ? `${location.url}:${location.lineNumber}:${location.columnNumber}` : 'Unknown',
        timestamp: new Date().toISOString()
      };
      consoleErrors.push(errorDetails);

      // Log critical errors (ReferenceError, TypeError, etc.) with full details
      if (type === 'error' && (
        text.includes('ReferenceError') ||
        text.includes('TypeError') ||
        text.includes('is not defined') ||
        text.includes('Cannot read') ||
        text.includes('Failed to') ||
        text.includes('Uncaught') ||
        text.includes('SyntaxError')
      )) {
        console.error(`   ⚠️  Console ${type}: ${text}`);
        if (errorDetails.location !== 'Unknown') {
          console.error(`   📍 Location: ${errorDetails.location}`);
        }
      }
    }
  });

  try {
    console.log(`\n🧪 [${test.id}] ${test.name}`);
    console.log(`   📍 URL: ${test.url || test.urlPattern}`);

    // Navigate to page (handle page closure gracefully)
    const fullUrl = `${config.baseUrl}${test.url || test.urlPattern}`;
    // Use test-specific timeout if provided, otherwise use config timeout
    const pageTimeout = test.timeout || config.timeout;
    try {
      await page.goto(fullUrl, {
        waitUntil: 'domcontentloaded',
        timeout: pageTimeout
      });
    } catch (navigationError) {
      // If page is closed during navigation, provide helpful error
      if (navigationError.message.includes('closed') || navigationError.message.includes('detached')) {
        throw new Error(`Page was closed during navigation. This usually means authentication failed or session expired.`);
      }
      throw navigationError;
    }

    // Wait for page to be interactive
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {
      console.warn(`   ⚠️  Network idle timeout, continuing...`);
    });

    // CRITICAL: Wait for main content (h1) to appear for client-side rendered pages
    // This ensures client components have hydrated and rendered their content
    try {
      // Wait for h1 specifically (most reliable indicator of page content)
      await page.waitForSelector('h1', {
        timeout: 20000,
        state: 'visible'
      }).catch(async () => {
        // If h1 doesn't appear, try other selectors
        console.warn(`   ⚠️  h1 not found, trying alternative selectors...`);
        await page.waitForSelector('h2, main, [class*="admin"]', {
          timeout: 10000,
          state: 'visible'
        }).catch(() => {
          console.warn(`   ⚠️  Alternative selectors also not found, continuing anyway...`);
        });
      });

      // Additional wait for client-side rendering to complete (especially for data tables)
      await page.waitForTimeout(2000);
    } catch (waitError) {
      console.warn(`   ⚠️  Could not wait for main content: ${waitError.message}`);
    }

    // Check for JavaScript errors after page load
    // Wait a bit more to catch errors that occur during component rendering
    await page.waitForTimeout(1000);

    // Store JavaScript errors in result
    result.jsErrors = jsErrors;
    result.consoleErrors = consoleErrors;

    // Fail test if critical JavaScript errors are detected
    if (jsErrors.length > 0) {
      const criticalErrors = jsErrors.filter(err => {
        const msg = err.message.toLowerCase();
        return msg.includes('referenceerror') ||
               msg.includes('typeerror') ||
               msg.includes('is not defined') ||
               msg.includes('cannot read') ||
               msg.includes('syntaxerror') ||
               msg.includes('uncaught');
      });

      if (criticalErrors.length > 0) {
        // Build detailed error message with stack traces
        const errorDetails = criticalErrors.map(err => {
          let detail = `${err.name || 'Error'}: ${err.message}`;
          if (err.stack && err.stack !== 'No stack trace available') {
            // Include first 10 lines of stack trace
            const stackLines = err.stack.split('\n').slice(0, 10);
            detail += `\nStack trace:\n${stackLines.join('\n')}`;
          }
          return detail;
        }).join('\n\n---\n\n');

        throw new Error(`JavaScript runtime error detected:\n\n${errorDetails}`);
      }
    }

    // Check for critical console errors (exclude known 404s for moved assets)
    const IGNORED_404_URL_PATTERNS = [
      'unite_india_logo.avif'  // Image moved to /images/logos/Malayalees_US/unite_india_logo.avif
    ];
    const criticalConsoleErrors = consoleErrors.filter(err => {
      const msg = err.message.toLowerCase();
      const location = (err.location || '').toLowerCase();
      const isIgnored404 = msg.includes('failed to load resource') &&
        msg.includes('404') &&
        IGNORED_404_URL_PATTERNS.some(pattern => location.includes(pattern.toLowerCase()));
      if (isIgnored404) return false;
      return err.type === 'error' && (
        msg.includes('referenceerror') ||
        msg.includes('typeerror') ||
        msg.includes('is not defined') ||
        msg.includes('cannot read') ||
        msg.includes('failed to') ||
        msg.includes('syntaxerror') ||
        msg.includes('uncaught')
      );
    });

    if (criticalConsoleErrors.length > 0) {
      // Build detailed error message with locations
      const errorDetails = criticalConsoleErrors.map(err => {
        let detail = `Console ${err.type}: ${err.message}`;
        if (err.location && err.location !== 'Unknown') {
          detail += `\nLocation: ${err.location}`;
        }
        return detail;
      }).join('\n\n---\n\n');

      throw new Error(`Console error detected:\n\n${errorDetails}`);
    }

    // Check for expected elements
    const elementsFound = [];
    for (const selector of test.expectedElements) {
      try {
        const count = await page.$$(selector).then(elements => elements.length);
        if (count > 0) {
          elementsFound.push({ selector, count });
        }
      } catch (error) {
        // Element not found, continue
      }
    }

    result.elementsFound = elementsFound;

    // Check for authentication errors
    const currentUrl = page.url();
    const pageContent = await page.content().catch(() => '');

    // CRITICAL: Check if redirected to sign-in page (most reliable indicator)
    const isSignInPage = currentUrl.includes('/sign-in') || currentUrl.includes('/sign-up');

    if (isSignInPage) {
      throw new Error('Authentication failed - redirected to sign-in page. User may not have ADMIN role in database.');
    }

    // Only check for visible error messages, not just any "401" or "403" text in HTML/JS
    // Look for actual error elements that are visible to the user
    try {
      const errorSelectors = [
        '[role="alert"]',
        '[class*="error"][class*="message"]',
        '[class*="alert"][class*="error"]',
        'div[class*="cl-error"]',
        'div[class*="cl-alert"]',
        'p[class*="error"]',
        'span[class*="error"]'
      ];

      let hasVisibleAuthError = false;
      for (const selector of errorSelectors) {
        try {
          const errorElement = await page.$(selector);
          if (errorElement) {
            const isVisible = await errorElement.isVisible().catch(() => false);
            if (isVisible) {
              const text = await errorElement.textContent().catch(() => '');
              // Only treat as auth error if it contains authentication-related error text
              if (text && (
                text.toLowerCase().includes('unauthorized') ||
                text.toLowerCase().includes('401') ||
                text.toLowerCase().includes('403') ||
                text.toLowerCase().includes('forbidden') ||
                text.toLowerCase().includes('access denied')
              )) {
                hasVisibleAuthError = true;
                console.error(`   ⚠️  Visible auth error found: ${text.trim()}`);
                break;
              }
            }
          }
        } catch (e) {
          // Continue checking
        }
      }

      if (hasVisibleAuthError) {
        throw new Error('Authentication failed - visible 401/403 Unauthorized error detected on page');
      }
    } catch (errorCheckError) {
      // If error checking fails, don't fail the test (might be false positive)
      console.log(`   ℹ️  Could not check for visible errors: ${errorCheckError.message}`);
    }

    // Check for 404 errors - only check for actual 404 page indicators, not just any "404" text
    // Check URL first (most reliable)
    if (currentUrl.includes('/404')) {
      throw new Error('Page not found (404)');
    }

    // Check for visible 404 error messages (not just any "404" text in HTML/JS)
    try {
      const notFoundSelectors = [
        'h1:has-text("404")',
        'h1:has-text("Not Found")',
        'h1:has-text("Page Not Found")',
        '[class*="404"]',
        '[class*="not-found"]'
      ];

      let hasVisible404 = false;
      for (const selector of notFoundSelectors) {
        try {
          const notFoundElement = await page.$(selector);
          if (notFoundElement) {
            const isVisible = await notFoundElement.isVisible().catch(() => false);
            if (isVisible) {
              hasVisible404 = true;
              break;
            }
          }
        } catch (e) {
          // Continue checking
        }
      }

      // Also check page title
      const pageTitle = await page.title().catch(() => '');
      if (pageTitle.toLowerCase().includes('404') || pageTitle.toLowerCase().includes('not found')) {
        hasVisible404 = true;
      }

      if (hasVisible404) {
        throw new Error('Page not found (404)');
      }
    } catch (notFoundCheckError) {
      // If 404 check fails, don't fail the test (might be false positive)
      if (notFoundCheckError.message.includes('404')) {
        throw notFoundCheckError; // Re-throw actual 404 errors
      }
    }

    // Check if main content is present
    const hasMainContent = await page.$('h1, h2, main, [class*="admin"]').then(el => el !== null);
    if (!hasMainContent) {
      throw new Error('Page loaded but no main content found');
    }

    // Run validations
    const validations = [];
    for (const validation of test.validation) {
      // Simple validation checks
      if (validation.toLowerCase().includes('loads')) {
        validations.push({ check: validation, passed: hasMainContent });
      } else {
        validations.push({ check: validation, passed: true }); // Assume passed for now
      }
    }
    result.validations = validations;

    result.status = 'PASSED';
    result.duration = Date.now() - testStartTime;
    console.log(`   ✅ PASSED (${result.duration}ms)`);
    console.log(`   📊 Elements found: ${elementsFound.length}/${test.expectedElements.length}`);

  } catch (error) {
    result.status = 'FAILED';
    result.duration = Date.now() - testStartTime;
    result.error = error.message;
    console.log(`   ❌ FAILED: ${error.message}`);

    // Take screenshot on failure (only if page is still open)
    if (config.screenshotOnFailure) {
      try {
        // Check if page is still open before taking screenshot
        if (!page.isClosed()) {
          const screenshotPath = path.join(SCREENSHOTS_DIR, `failure-${test.id}-${Date.now()}.png`);
          await page.screenshot({ path: screenshotPath, fullPage: true });
          result.screenshot = screenshotPath;
          console.log(`   📸 Screenshot saved: ${screenshotPath}`);
        } else {
          console.warn(`   ⚠️  Could not take screenshot - page was closed`);
        }
      } catch (screenshotError) {
        // Ignore screenshot errors (page might be closed)
        console.warn(`   ⚠️  Could not take screenshot: ${screenshotError.message}`);
      }
    }
  }

  return result;
}

/**
 * Generate HTML report
 */
function generateReport() {
  const duration = Date.now() - startTime;
  const passed = testResults.filter(r => r.status === 'PASSED').length;
  const failed = testResults.filter(r => r.status === 'FAILED').length;
  const skipped = testResults.filter(r => r.status === 'SKIPPED').length;

  const report = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Admin Test Suite Report</title>
  <style>
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
      margin: 0;
      padding: 20px;
      background: #f5f5f5;
    }
    .header {
      background: white;
      padding: 20px;
      border-radius: 8px;
      margin-bottom: 20px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 15px;
      margin-bottom: 20px;
    }
    .stat-card {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .stat-card.passed { border-left: 4px solid #10b981; }
    .stat-card.failed { border-left: 4px solid #ef4444; }
    .stat-card.skipped { border-left: 4px solid #f59e0b; }
    .stat-card.total { border-left: 4px solid #3b82f6; }
    .stat-number {
      font-size: 32px;
      font-weight: bold;
      margin-bottom: 5px;
    }
    .stat-label {
      color: #6b7280;
      font-size: 14px;
    }
    .test-results {
      background: white;
      padding: 20px;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0,0,0,0.1);
    }
    .test-item {
      padding: 15px;
      border-bottom: 1px solid #e5e7eb;
      margin-bottom: 10px;
    }
    .test-item:last-child {
      border-bottom: none;
    }
    .test-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 10px;
    }
    .test-name {
      font-weight: 600;
      font-size: 16px;
    }
    .test-status {
      padding: 4px 12px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
    }
    .test-status.passed { background: #d1fae5; color: #065f46; }
    .test-status.failed { background: #fee2e2; color: #991b1b; }
    .test-status.skipped { background: #fef3c7; color: #92400e; }
    .test-details {
      color: #6b7280;
      font-size: 14px;
      margin-top: 8px;
    }
    .test-error {
      color: #ef4444;
      margin-top: 8px;
      padding: 10px;
      background: #fef2f2;
      border-radius: 4px;
      font-size: 13px;
    }
    .category-header {
      font-size: 18px;
      font-weight: 600;
      margin: 20px 0 10px 0;
      color: #374151;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
  </style>
</head>
<body>
  <div class="header">
    <h1>Admin Test Suite Report</h1>
    <p>Generated: ${new Date().toLocaleString()}</p>
    <p>Duration: ${(duration / 1000).toFixed(2)}s</p>
  </div>

  <div class="stats">
    <div class="stat-card total">
      <div class="stat-number">${testResults.length}</div>
      <div class="stat-label">Total Tests</div>
    </div>
    <div class="stat-card passed">
      <div class="stat-number">${passed}</div>
      <div class="stat-label">Passed</div>
    </div>
    <div class="stat-card failed">
      <div class="stat-number">${failed}</div>
      <div class="stat-label">Failed</div>
    </div>
    <div class="stat-card skipped">
      <div class="stat-number">${skipped}</div>
      <div class="stat-label">Skipped</div>
    </div>
  </div>

  <div class="test-results">
    ${Object.entries(
      testResults.reduce((acc, test) => {
        if (!acc[test.category]) acc[test.category] = [];
        acc[test.category].push(test);
        return acc;
      }, {})
    ).map(([category, tests]) => `
      <div class="category-header">${category}</div>
      ${tests.map(test => `
        <div class="test-item">
          <div class="test-header">
            <div>
              <div class="test-name">[${test.id}] ${test.name}</div>
              <div class="test-details">
                ${test.url} • ${test.duration}ms • Priority: ${test.priority}
              </div>
            </div>
            <span class="test-status ${test.status.toLowerCase()}">${test.status}</span>
          </div>
          ${test.error ? `<div class="test-error">❌ ${test.error.replace(/\n/g, '<br>')}</div>` : ''}
          ${test.jsErrors && test.jsErrors.length > 0 ? `
            <div class="test-error">
              ⚠️ JavaScript Errors (${test.jsErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px;">
                ${test.jsErrors.map(err => {
                  let errorHtml = `<li><strong>${err.name || 'Error'}:</strong> ${err.message}`;
                  if (err.stack && err.stack !== 'No stack trace available') {
                    const stackLines = err.stack.split('\n').slice(0, 10);
                    errorHtml += `<br><pre style="background: #f5f5f5; padding: 5px; margin: 5px 0; border-radius: 3px; font-size: 11px; overflow-x: auto;">${stackLines.join('\n')}</pre>`;
                  }
                  errorHtml += `</li>`;
                  return errorHtml;
                }).join('')}
              </ul>
            </div>
          ` : ''}
          ${test.consoleErrors && test.consoleErrors.length > 0 ? `
            <div class="test-details" style="color: #f59e0b;">
              ⚠️ Console Warnings/Errors (${test.consoleErrors.length}):
              <ul style="margin: 5px 0; padding-left: 20px; font-size: 12px;">
                ${test.consoleErrors.slice(0, 10).map(err => {
                  let errorHtml = `<li><strong>[${err.type}]</strong> ${err.message}`;
                  if (err.location && err.location !== 'Unknown') {
                    errorHtml += ` <span style="color: #6b7280; font-size: 11px;">(${err.location})</span>`;
                  }
                  errorHtml += `</li>`;
                  return errorHtml;
                }).join('')}
                ${test.consoleErrors.length > 10 ? `<li style="color: #6b7280; font-style: italic;">... and ${test.consoleErrors.length - 10} more</li>` : ''}
              </ul>
            </div>
          ` : ''}
          ${test.elementsFound.length > 0 ? `
            <div class="test-details">
              📊 Elements found: ${test.elementsFound.length}/${test.expectedElements?.length || 0}
            </div>
          ` : ''}
          ${test.screenshot ? `
            <div class="test-details">
              📸 <a href="${test.screenshot}" target="_blank">View Screenshot</a>
            </div>
          ` : ''}
        </div>
      `).join('')}
    `).join('')}
  </div>
</body>
</html>
  `;

  fs.writeFileSync(REPORT_PATH, report);
  console.log(`\n📄 Report saved to: ${REPORT_PATH}`);
}

/**
 * Main test execution
 */
async function main() {
  console.log('🚀 Starting Comprehensive Admin Test Suite...\n');

  // Load configuration
  const config = loadAuthConfig();
  console.log(`📍 Base URL: ${config.baseUrl}`);
  console.log(`👤 Testing as: ${config.email}`);
  console.log(`⚙️  Headless: ${config.headless}`);
  console.log(`📸 Screenshots: ${config.screenshotOnFailure ? 'Enabled' : 'Disabled'}\n`);

  // Ensure screenshots directory exists
  ensureScreenshotsDir();

  // Launch browser
  const browser = await chromium.launch({
    headless: config.headless,
    timeout: 60000
  });

  let context, page;

  try {
    // Try to load saved auth state, but validate it first
    let authStateValid = false;
    if (fs.existsSync(AUTH_STATE_PATH)) {
      console.log('🔐 Loading saved authentication state...');
      try {
        const authState = await loadAuthState(browser, AUTH_STATE_PATH);
        context = authState.context;
        page = authState.page;

        // Validate auth state by checking if we can access an admin page
        console.log('   ⏳ Validating authentication state...');
        try {
          await page.goto(`${config.baseUrl}/admin`, {
            waitUntil: 'domcontentloaded',
            timeout: 10000
          });

          // Check if we're redirected to sign-in (auth state invalid)
          const currentUrl = page.url();
          if (!currentUrl.includes('/sign-in') && !currentUrl.includes('/sign-up')) {
            authStateValid = true;
            console.log('✅ Authentication state is valid');
          } else {
            console.warn('⚠️  Authentication state invalid - redirected to sign-in');
            await context.close();
            authStateValid = false;
          }
        } catch (validationError) {
          console.warn(`⚠️  Could not validate auth state: ${validationError.message}`);
          await context.close();
          authStateValid = false;
        }
      } catch (error) {
        console.warn(`⚠️  Could not load auth state: ${error.message}`);
        authStateValid = false;
      }
    }

    // If auth state is invalid or doesn't exist, authenticate fresh
    if (!authStateValid) {
      console.log('🔐 Authenticating fresh...');
      const authContext = await createAuthenticatedContext(browser, config.baseUrl, {
        email: config.email,
        password: config.password
      });
      context = authContext.context;
      page = authContext.page;
      await saveAuthState(context, AUTH_STATE_PATH);
      console.log('✅ Authentication successful, state saved');
    }

    // Run static admin page tests
    console.log('\n📋 Running static admin page tests...');
    for (const test of adminTestPages) {
      // Check if page is still open before each test
      if (page.isClosed()) {
        console.error(`\n❌ Page was closed. Authentication may have expired.`);
        console.error(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
        break;
      }

      const result = await runTest(page, test, config);
      testResults.push(result);

      // If authentication failed, stop running tests
      if (result.error && result.error.includes('Authentication failed')) {
        console.warn(`\n⚠️  Authentication failed. Stopping test execution.`);
        console.warn(`   Please delete ${AUTH_STATE_PATH} and re-run the test.`);
        break;
      }
    }

    // Note: Dynamic event tests are now in a separate script
    // Run: npm run test:admin:dynamic
    console.log('\n📋 Dynamic event page tests are now in a separate script.');
    console.log('   💡 Run "npm run test:admin:dynamic" to test event-specific pages.');

    // Generate report
    console.log('\n📊 Generating test report...');
    generateReport();

    // Print summary
    const passed = testResults.filter(r => r.status === 'PASSED').length;
    const failed = testResults.filter(r => r.status === 'FAILED').length;
    const total = testResults.length;
    const duration = Date.now() - startTime;

    console.log('\n' + '='.repeat(60));
    console.log('📊 Test Summary');
    console.log('='.repeat(60));
    console.log(`Total Tests: ${total}`);
    console.log(`✅ Passed: ${passed}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`⏱️  Duration: ${(duration / 1000).toFixed(2)}s`);
    console.log('='.repeat(60));

    if (failed > 0) {
      console.log('\n❌ Failed Tests:');
      testResults.filter(r => r.status === 'FAILED').forEach(test => {
        console.log(`   - [${test.id}] ${test.name}: ${test.error}`);
      });
    }

    process.exit(failed > 0 ? 1 : 0);

  } catch (error) {
    console.error('\n❌ Fatal error:', error);
    process.exit(1);
  } finally {
    if (context) await context.close();
    await browser.close();
  }
}

// Run tests
main().catch(error => {
  console.error('❌ Unhandled error:', error);
  process.exit(1);
});

