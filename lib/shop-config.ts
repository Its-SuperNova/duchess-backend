// Shop configuration settings
// Update these coordinates to match your actual shop location

export interface ShopLocation {
  latitude: number;
  longitude: number;
  name: string;
  address: string;
}

// Exact shop location coordinates
export const SHOP_LOCATION: ShopLocation = {
  latitude: 11.1062, // 11°06'22.3"N
  longitude: 77.0015, // 77°00'05.4"E
  name: "Duchess Pastries",
  address: "Coimbatore, Tamil Nadu, India",
};

// How to get your shop's exact coordinates:
// Method 1 - Google Maps (Recommended):
// 1. Go to Google Maps (maps.google.com)
// 2. Search for your exact shop address in Keeranatham
// 3. Right-click on your shop location on the map
// 4. Click "What's here?"
// 5. Copy the latitude and longitude from the popup
// 6. Update the SHOP_LOCATION coordinates above

// Method 2 - GPS App:
// 1. Stand at your shop entrance in Keeranatham
// 2. Use a GPS app like GPS Coordinates or Maps
// 3. Note down the exact coordinates
// 4. Update the coordinates above

// Method 3 - Test the current coordinates:
// Open this link to check if our current coordinates are correct:
// https://www.google.com/maps?q=11.0311,77.0469
// If it doesn't point to your shop, update the coordinates using Method 1

// Current coordinates for Keeranatham area:
// latitude: 11.0311 (North)
// longitude: 77.0469 (East)

export default SHOP_LOCATION;
