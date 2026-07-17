# QA Automation Take-Home Review

## Summary

A well-architected Playwright + TypeScript automation framework that demonstrates solid understanding of POM patterns, flow orchestration, and test data separation. The test is **stable** — 3/3 consecutive passes with consistent ~20s execution time and no retries. The code is clean, typed, and follows Playwright best practices for the most part, with a few areas for improvement around wait strategies and test coverage breadth.

---

## Scores

| Criterion | Weight | Score (1–5) | Weighted |
|-----------|--------|-------------|----------|
| Framework Architecture | 25% | 4.5 | 1.13 |
| Playwright Proficiency | 25% | 4.0 | 1.00 |
| Code Quality | 20% | 4.0 | 0.80 |
| Test Design | 15% | 3.5 | 0.53 |
| Documentation & Repo Hygiene | 15% | 4.0 | 0.60 |
| **TOTAL** | | | **4.05 / 5.0** |

---

## Strengths

- **Clean layered architecture (Pages → Flows → Fixtures → Tests)**: Each layer has a single responsibility. The `HotelFlow` orchestrates page objects, the test file itself is concise (12 lines of actual logic), and adding a new category requires no changes to existing code — just new parallel files.
- **Excellent locator strategy**: Every locator uses `getByRole`, `getByLabel`, or `getByTestId` — zero fragile CSS selectors or XPath. This is the gold standard for resilient automation.
- **`test.step` usage in the flow**: The flow wraps each logical phase in `test.step()`, producing excellent traceability in HTML reports and failure diagnostics.
- **Smart wait strategies**: Uses `waitForResponse(/poll/)` after search and filter actions instead of arbitrary timeouts. Uses `waitForFunction` to detect when map markers have rendered. The `waitForURL` on navigation is correct.
- **Typed test data with interface**: `HotelSearchConfig` cleanly separates data from test logic. Adding a new scenario is a one-liner config change.
- **Custom fixtures with `test.extend`**: Proper DI pattern — the flow is instantiated once per test with automatic page injection.
- **Meaningful assertion messages**: `assertPriceWithinRange` and `assertGuestScoreAbove` include actual values in failure messages (e.g., "Hotel card price $152 should be >= $100").
- **Environment-driven config**: dotenv with `ENV` variable switch enables multi-environment execution without code changes.
- **Proven stability**: 3/3 passes, 19–22s execution, no flakiness detected.
- **Honest AI tool disclosure**: README explicitly credits Kiro CLI and Playwright MCP, explaining how they were used. Shows professional transparency.
- **Screenshots/video on failure only**: Config captures evidence only when needed, keeping CI artifacts small.

---

## Concerns

- **`waitForTimeout(200)` in map zoom loop**: While the comment explains this is for Google Maps animation frames, it's still a hard sleep. The `waitForFunction` after the loop partially mitigates this, but the 200ms × 10 iterations adds 2s of fixed wait. A more robust approach would check marker count stabilization between zoom steps.
- **Single test / single scenario**: Only one test case exists. For a take-home that demonstrates "testing maturity," at least one additional scenario (no results, different city, boundary price values) or data-driven parameterization would strengthen the submission.
- **Price/score extraction via regex on `textContent()`**: `getPrice()` and `getGuestScore()` use regex parsing with fallback chains. This works but is fragile — if a "$20 off" badge or second numeric value appears in the card, the regex could grab wrong data. The `data-testid` path is preferred (and attempted first), but the fallback is risky.
- **Single git commit**: All code was delivered in one shot with no development history. A few logical commits (scaffold → pages → flow → test → polish) would demonstrate engineering discipline and make code review easier.
- **`filterByPriceRange` only moves min thumb**: The method accepts a `min` parameter (mapped from `config.filters.priceMin`) but uses it as an arrow-key press count, not a dollar value. If `priceMin = 100`, it presses ArrowRight 100 times — this is fragile and semantically confusing. The max thumb is never touched.
- **`playwright-report/` and `test-results/` present on disk**: While `.gitignore` excludes them from git, submitting the project directory includes these artifacts. Minor, but shows the project was run before submission without cleanup.
- **No negative/edge-case assertions**: What happens if no hotels match? The test would timeout or throw a confusing error. Defensive handling or a separate "empty results" test would improve robustness.
- **Headless set to `false` by default**: The `.env.staging` has `HEADLESS=false`, meaning CI/CD would open browser windows. Should default to `true` for pipeline compatibility with a headed override script.

---

## Test Execution Results

- [x] `npm install` — success (dependencies already installed)
- [x] `npx tsc --noEmit` — compiles cleanly, zero errors
- [x] `npx playwright test --list` — 1 test detected (`HTL-001`)
- [x] Run 1: **PASSED** (22.2s)
- [x] Run 2: **PASSED** (22.4s)
- [x] Run 3: **PASSED** (19.4s)

**Stability: 3/3 passes. No flakiness detected.**

---

## Follow-Up Interview Questions

1. **"Your `filterByPriceRange` presses ArrowRight 100 times to set the minimum price. How does that map to actual dollar values on the slider, and what would break if the slider's step size changed?"**
   — Tests understanding of slider interaction reliability and whether they considered the DOM's `aria-valuemin`/`aria-valuemax`/`aria-valuenow` attributes.

2. **"If the hotel card DOM changes and a promotional badge like '$50 off' is added, your regex-based price extraction could return the wrong number. How would you make the extraction more resilient?"**
   — Tests locator strategy depth and defensive parsing approaches (scoping to a specific child element, using `data-testid`, or asserting element position).

3. **"How would you add a data-driven variant — say, testing 5 different cities with different expected price ranges — without duplicating test logic?"**
   — Tests knowledge of Playwright's parameterization patterns (`test.describe` with loops, fixtures with multiple configs, or `@parametrize`-style approaches).

4. **"The `waitForTimeout(200)` in your zoom loop is necessary because Google Maps doesn't expose a programmatic zoom-complete signal. If you had to eliminate all hard sleeps, what alternative detection strategy would you use?"**
   — Tests deeper Playwright knowledge (polling `waitForFunction` checking `map.getZoom()` via `evaluate`, MutationObserver on marker container, or tile-load network interception).

5. **"You have one test covering the happy path. What are the top 3 failure scenarios you'd add next, and how would your framework's architecture accommodate them?"**
   — Tests test design thinking, risk analysis, and whether the architecture actually delivers on its extensibility promise.

---

## Overall Assessment

**Recommendation: PASS (with notes)**

This is a solid take-home submission. The architecture is clean and genuinely extensible, the Playwright usage is competent with mostly modern patterns, and — critically — the test is stable and passes consistently against the live staging environment. The main gaps are: limited test coverage breadth (single scenario), the slider interaction hack, and a single-commit history. These are reasonable discussion points for a follow-up interview rather than disqualifying issues. The candidate demonstrates they can build a maintainable automation framework from scratch.
