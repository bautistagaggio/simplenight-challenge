import { test } from '../../fixtures/page_fixtures';
import { hotelTestData } from '../../test_data/hotels';

test.describe('Hotel Search and Filtering', { tag: '@regression' }, () => {

  test('HTL-001 | Search hotels in Miami, filter by price and guest score, and verify hotel card is elegible given the filters', async ({
    hotelFlow,
  }) => {
    const { filters } = hotelTestData;

    await hotelFlow.searchAndFilterOnMap(hotelTestData);

    await hotelFlow.hotelCardPage.assertPriceWithinRange(filters.priceMin, filters.priceMax);
    await hotelFlow.hotelCardPage.assertGuestScoreAbove(filters.guestScoreMinValue);
  });
});
