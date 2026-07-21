import { expect, Locator, Page } from '@playwright/test';

export class HotelCardPage {

  private firstCard: Locator;
  private priceByTestId: Locator;
  private ratingByTestId: Locator;

  constructor(private page: Page) {
    this.firstCard = page.getByRole('article').first();
    this.priceByTestId = this.firstCard.locator('[data-testid$="_price"]');
    this.ratingByTestId = this.firstCard.locator('[data-testid$="_rating"]');
  }

  /**
   * Extract price from the hotel card using a targeted locator.
   * The price element contains text like "$152" and is preceded by "Total".
   */
  async getPrice(): Promise<number> {
    await this.firstCard.waitFor({ state: 'visible', timeout: 15000 });

    // Target the price element: look for text matching $XXX pattern within the card
    // In grid view: [data-testid$="_price"], in map popup: element after "Total"
    if (await this.priceByTestId.count() > 0) {
      const text = await this.priceByTestId.textContent() || '';
      const match = text.match(/\$(\d[\d,]*)/);
      return match ? parseInt(match[1].replace(',', ''), 10) : 0;
    }

    // Map popup fallback: price is in the element right after "Total"
    const priceElement = this.firstCard.locator(':text-matches("^\\\\$\\\\d")').last();
    const text = await priceElement.textContent() || '';
    const match = text.match(/\$(\d[\d,]*)/);
    return match ? parseInt(match[1].replace(',', ''), 10) : 0;
  }

  /**
   * Extract guest score from the hotel card using a targeted locator.
   * The score element contains a decimal like "10.0" or "9.4".
   */
  async getGuestScore(): Promise<number> {
    await this.firstCard.waitFor({ state: 'visible', timeout: 15000 });

    // Target the rating element: [data-testid$="_rating"] in grid view
    if (await this.ratingByTestId.count() > 0) {
      const text = await this.ratingByTestId.textContent() || '';
      const match = text.match(/(\d+\.\d+)/);
      return match ? parseFloat(match[1]) : 0;
    }

    // Map popup fallback: score is the element containing X.X format
    // followed by a rating label (Excellent, Very Good, etc.)
    const scoreElement = this.firstCard.locator(':text-matches("^\\\\d+\\\\.\\\\d+$")').first();
    const text = await scoreElement.textContent() || '';
    const match = text.match(/(\d+\.\d+)/);
    return match ? parseFloat(match[1]) : 0;
  }

  async assertPriceWithinRange(min: number, max: number) {
    await this.firstCard.waitFor({ state: 'visible', timeout: 15000 });
    const price = await this.getPrice();
    expect(price, `Hotel card price $${price} should be >= $${min}`).toBeGreaterThanOrEqual(min);
    if (max < 1000) {
      expect(price, `Hotel card price $${price} should be <= $${max}`).toBeLessThanOrEqual(max);
    }
  }

  async assertGuestScoreAbove(minScore: number) {
    const score = await this.getGuestScore();
    expect(score, `Hotel card guest score ${score} should be >= ${minScore}`).toBeGreaterThanOrEqual(minScore);
  }
}
