import { Page, test } from '@playwright/test';
import { HomePage } from '../pages/home_page';
import { SearchPage } from '../pages/search_page';
import { ResultsPage } from '../pages/results_page';
import { HotelCardPage } from '../pages/hotel_card_page';
import { HotelSearchConfig } from '../test_data/hotels';

export class HotelFlow {

  private homePage: HomePage;
  private searchPage: SearchPage;
  private resultsPage: ResultsPage;
  public hotelCardPage: HotelCardPage;

  constructor(private page: Page) {
    this.homePage = new HomePage(page);
    this.searchPage = new SearchPage(page);
    this.resultsPage = new ResultsPage(page);
    this.hotelCardPage = new HotelCardPage(page);
  }

  /**
   * Full hotel search flow:
   * 1. Navigate to homepage
   * 2. Select Hotels category
   * 3. Search by location, dates, guests
   * 4. Switch to Map view
   * 5. Filter by price range and guest score
   * 6. Zoom in and select a hotel from the map
   */
  async searchAndFilterOnMap(config: HotelSearchConfig) {
    await test.step('Navigate to homepage', async () => {
      await this.homePage.navigate();
    });

    await test.step('Select Hotels category', async () => {
      await this.homePage.selectCategory('Hotels');
    });

    await test.step('Search for hotels', async () => {
      await this.searchPage.searchLocation(config.location);
      await this.searchPage.selectDates(config.checkIn, config.checkOut);
      await this.searchPage.setGuests(config.guests.adults, config.guests.children, config.guests.childAges);
      await this.searchPage.clickSearch();
    });

    await test.step('Switch to Map view', async () => {
      await this.resultsPage.switchToMapView();
    });

    await test.step('Filter by price range and guest score', async () => {
      await this.resultsPage.filterByPriceRange(config.filters.priceMin);
      await this.resultsPage.filterByGuestScore(config.filters.guestScore);
    });

    await test.step('Zoom in and select hotel from map', async () => {
      await this.resultsPage.zoomInOnMap(10);
      await this.resultsPage.selectHotelFromMap(0);
    });
  }
}
