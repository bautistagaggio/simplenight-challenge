import { Locator, Page } from '@playwright/test';

export class SearchPage {

  private locationTrigger: Locator;
  private datesTrigger: Locator;
  private travelersTrigger: Locator;
  private searchButton: Locator;
  private addAdultButton: Locator;
  private addChildButton: Locator;
  private doneButton: Locator;

  constructor(private page: Page) {
    this.locationTrigger = page.getByRole('textbox', { name: 'Going to' });
    this.datesTrigger = page.getByRole('textbox', { name: 'Dates' });
    this.travelersTrigger = page.getByRole('textbox', { name: 'Travelers' });
    this.searchButton = page.getByRole('button', { name: 'Search' });
    this.addAdultButton = page.getByRole('button', { name: 'Add Adult' });
    this.addChildButton = page.getByRole('button', { name: 'Add Child' });
    this.doneButton = page.getByRole('button', { name: 'Done' });
  }

  async searchLocation(location: string) {
    await this.locationTrigger.click();

    const dialog = this.page.getByRole('dialog');
    await dialog.waitFor({ state: 'visible' });

    await dialog.getByRole('textbox').pressSequentially(location);

    const option = this.page.getByRole('option', { name: new RegExp(location) }).first();
    await option.waitFor({ state: 'visible' });
    await option.click();
  }

  async selectDates(checkIn: string, checkOut: string) {
    await this.datesTrigger.click();

    const checkInButton = this.page.getByRole('button', { name: checkIn, exact: true });
    const checkOutButton = this.page.getByRole('button', { name: checkOut, exact: true });

    // Wait for calendar dialog and target date to be available
    await this.page.getByRole('dialog').waitFor({ state: 'visible' });
    await checkInButton.waitFor({ state: 'visible' });
    await checkInButton.click();

    await checkOutButton.waitFor({ state: 'visible' });
    await checkOutButton.click();

    await this.doneButton.click();
  }

  async setGuests(adults: number, children: number, childAges?: number[]) {
    await this.travelersTrigger.click();
    await this.addAdultButton.waitFor({ state: 'visible' });

    for (let i = 1; i < adults; i++) {
      await this.addAdultButton.click();
    }

    for (let i = 0; i < children; i++) {
      await this.addChildButton.click();

      if (childAges && childAges[i] !== undefined) {
        const ageField = this.page.getByRole('textbox', { name: `Child ${i + 1} Age` });
        await ageField.waitFor({ state: 'visible' });
        await ageField.click();

        const ageOption = this.page.getByRole('option', { name: childAges[i].toString() });
        await ageOption.waitFor({ state: 'visible' });
        await ageOption.click();
      }
    }

    await this.page.keyboard.press('Escape');
  }

  async clickSearch() {
    const responsePromise = this.page.waitForResponse(/\/products\/hotels\/search\/poll/);
    await this.searchButton.click();
    await this.page.waitForURL('**/search/**');
    await responsePromise;
  }
}
