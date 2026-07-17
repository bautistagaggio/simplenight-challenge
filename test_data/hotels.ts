export interface HotelSearchConfig {
  location: string;
  checkIn: string;
  checkOut: string;
  guests: {
    adults: number;
    children: number;
    childAges?: number[];
  };
  filters: {
    priceMin: number;
    priceMax: number;
    guestScore: string;
    guestScoreMinValue: number;
  };
}

export const hotelTestData: HotelSearchConfig = {
  location: 'Miami, FL, USA',
  checkIn: '1 August 2026',
  checkOut: '3 August 2026',
  guests: {
    adults: 1,
    children: 1,
    childAges: [8],
  },
  filters: {
    priceMin: 100,
    priceMax: 1000,
    guestScore: 'Very Good',
    guestScoreMinValue: 7.0,
  },
};
