import { test as base } from '@playwright/test';
import { HotelFlow } from '../flows/hotel_flow';

type Fixtures = {
  hotelFlow: HotelFlow;
};

export const test = base.extend<Fixtures>({
  hotelFlow: async ({ page }, use) => {
    await use(new HotelFlow(page));
  },
});
