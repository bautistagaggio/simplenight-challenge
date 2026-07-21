import { Locator, Page } from '@playwright/test';
import { config } from '../playwright.config';

export class HomePage {

  private navigation: Locator;
  private searchFormInput: Locator;

  constructor(private page: Page) {
    this.navigation = page.getByRole('navigation').first();
    this.searchFormInput = page.getByRole('textbox', { name: 'Going to' });
  }

  async navigate() {
    await this.page.goto(config.baseUrl);
    await this.navigation.waitFor({ state: 'visible' });
  }

  async selectCategory(category: string) {
    await this.page.getByRole('link', { name: category }).click();
    // Wait for the category search form to render
    await this.searchFormInput.waitFor({ state: 'visible' });
  }
}
