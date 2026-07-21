import { expect, Locator, Page } from '@playwright/test';

export class HotelCardPage {

  private firstCard: Locator;
  private totalPrice: Locator;
  private guestScore: Locator;

  constructor(private page: Page) {
    this.firstCard = page.getByRole('article').first();
    this.totalPrice = this.firstCard.getByText(/^\$\d/);
    this.guestScore = this.firstCard.getByText(/^\d+\.\d+$/);
  }

  async getPrice(): Promise<number> {
    await this.firstCard.waitFor({ state: 'visible', timeout: 15000 });
    const text = await this.totalPrice.first().textContent() || '';
    const match = text.match(/\$(\d[\d,]*)/);
    return match ? parseInt(match[1].replace(',', ''), 10) : 0;
  }

  async getGuestScore(): Promise<number> {
    await this.firstCard.waitFor({ state: 'visible', timeout: 15000 });
    const text = await this.guestScore.first().textContent() || '';
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
