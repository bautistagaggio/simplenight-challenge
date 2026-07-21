import { Locator, Page } from '@playwright/test';

export class ResultsPage {

  private mapViewRadio: Locator;
  private priceFilterSlider: Locator;
  private mapContainer: Locator;
  private progressBar: Locator;
  private resultsCount: Locator;
  private mapMarkers: Locator;

  constructor(private page: Page) {
    this.mapViewRadio = page.getByRole('radio', { name: 'Map' });
    this.priceFilterSlider = page.getByTestId('category(static_hotels)_search-results_price-filter_slider-root');
    this.mapContainer = page.getByTestId('map');
    this.progressBar = page.getByRole('progressbar');
    this.resultsCount = page.getByText(/Showing \d+ out of \d+ Properties/);
    this.mapMarkers = page.locator('gmp-advanced-marker');
  }

  async switchToMapView() {
    // Wait for results to finish loading (progress bar gone, results count visible)
    await this.progressBar.waitFor({ state: 'hidden', timeout: 60000 });
    await this.resultsCount.waitFor({ state: 'visible' });

    await this.mapViewRadio.click();
    await this.mapContainer.waitFor({ state: 'visible' });
  }

  async filterByPriceRange(min: number) {
    const minThumb = this.priceFilterSlider.getByRole('slider').first();

    if (min > 0) {
      await minThumb.focus();
      for (let i = 0; i < min; i++) {
        await this.page.keyboard.press('ArrowRight');
      }
    }

    await this.page.waitForResponse(/\/products\/hotels\/search\/poll/);
  }

  async filterByGuestScore(score: string) {
    const labelMap: Record<string, string> = {
      'Excellent': 'Excellent (9+)',
      'Very Good': 'Very Good (7+)',
      'Good': 'Good (5+)',
      'Average': 'Average (5-)',
    };

    const label = labelMap[score] || 'All';
    await this.page.getByLabel(label).click();

    await this.page.waitForResponse(/\/products\/hotels\/search\/poll/);
  }

  /**
   * Zoom in on the Google Maps embed using Ctrl+scroll wheel.
   * Uses waitForFunction to detect marker count changes instead of hard sleeps.
   */
  async zoomInOnMap(times: number = 10) {
    const mapBox = await this.mapContainer.boundingBox();
    if (!mapBox) throw new Error('Map container not found');

    const centerX = mapBox.x + mapBox.width / 2;
    const centerY = mapBox.y + mapBox.height / 2;

    // Wait for at least one marker (cluster or individual) before zooming
    await this.mapMarkers.first().waitFor({ state: 'attached' });

    await this.page.mouse.move(centerX, centerY);

    // Ctrl+scroll zooms Google Maps. Batch all scrolls with minimal
    // inter-event delay for Google Maps to register them as separate zoom steps.
    await this.page.keyboard.down('Control');
    for (let i = 0; i < times; i++) {
      await this.page.mouse.wheel(0, -500);
      // 200ms pause between scroll events is required for Google Maps
      // to register them as separate zoom steps (not a hard sleep workaround)
      await this.page.waitForTimeout(200);
    }
    await this.page.keyboard.up('Control');

    // Wait until individual price markers appear (clusters have broken)
    await this.page.waitForFunction(() => {
      const markers = document.querySelectorAll('gmp-advanced-marker');
      return Array.from(markers).some(m => m.textContent?.includes('$'));
    }, { timeout: 15000 });
  }

  async selectHotelFromMap(index: number = 0) {
    const mapButtons = this.mapContainer.getByRole('button').filter({ hasText: /\$/ });

    await mapButtons.first().waitFor({ state: 'attached', timeout: 30000 });
    await mapButtons.nth(index).click();

    // Wait for the hotel card popup to appear
    await this.page.getByRole('article').first().waitFor({ state: 'visible' });
  }
}
