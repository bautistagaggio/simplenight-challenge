import { Page } from '@playwright/test';
import { config } from '../playwright.config';

export class HomePage {

  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto(config.baseUrl);
    await this.page.getByRole('navigation').first().waitFor({ state: 'visible' });
  }

  async selectCategory(category: string) {
    await this.page.getByRole('link', { name: category }).click();
    // Wait for the category search form to render
    await this.page.getByRole('textbox', { name: 'Going to' }).waitFor({ state: 'visible' });
  }
}
