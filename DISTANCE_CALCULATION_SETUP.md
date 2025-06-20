# Distance Calculation Setup Guide

This guide explains how to set up and use the distance calculation feature for your pastry shop. The system calculates the distance between your shop location and customer addresses to provide accurate delivery estimates.

## Features

- **Real-time distance calculation** between shop and customer addresses
- **Estimated travel time** based on distance
- **Multiple geocoding options** (Google Maps API + free fallback)
- **Admin interface** for shop location configuration
- **Integration with existing address management**

## Setup Instructions

### 1. Configure Shop Location

#### Option A: Environment Variables (Recommended)

Add these variables to your `.env.local` file:

```env
# Shop Location Configuration
SHOP_LATITUDE=28.6139
SHOP_LONGITUDE=77.2090
SHOP_NAME=Duchess Pastries
SHOP_ADDRESS=123 Main Street, New Delhi, Delhi 110001, India

# Google Maps API Key (optional - for more accurate geocoding)
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key_here
```

#### Option B: Admin Interface

1. Navigate to `/admin/settings/shop-location`
2. Enter your shop details:
   - Shop name
   - Complete address
   - Latitude and longitude coordinates

### 2. Get Your Shop Coordinates

1. Go to [Google Maps](https://maps.google.com)
2. Search for your shop location
3. Right-click on the exact location
4. Click on the coordinates that appear (e.g., "28.6139, 77.2090")
5. Copy the latitude and longitude values

### 3. Google Maps API Key (Optional)

For more accurate geocoding, you can set up a Google Maps API key:

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Enable the "Geocoding API"
4. Create credentials (API Key)
5. Add the API key to your environment variables

**Note:** If no API key is provided, the system will use free geocoding services (less accurate but functional).

## How It Works

### Distance Calculation

The system uses the **Haversine formula** to calculate the great-circle distance between two points on Earth:

```typescript
// Example calculation
const distance = calculateDistance(shopCoordinates, customerAddressCoordinates);
// Returns distance in kilometers
```

### Geocoding Process

1. **Customer address** → **Coordinates** (using Google Maps API or fallback)
2. **Shop coordinates** → **Distance calculation** (using Haversine formula)
3. **Distance** → **Travel time estimation** (assuming 30 km/h average speed)

### API Endpoints

- `POST /api/distance` - Calculate distance for a given address
- `GET /api/distance` - Get shop location information

## Usage Examples

### In Address Management

The distance is automatically displayed for each saved address:

```tsx
import AddressDistanceDisplay from "@/components/address-distance-display";

<AddressDistanceDisplay address={customerAddress} />;
```

### Programmatic Usage

```typescript
import { calculateAddressDistance } from "@/lib/distance-utils";

const distanceResult = await calculateAddressDistance({
  full_address: "123 Customer St",
  city: "New Delhi",
  state: "Delhi",
  zip_code: "110001",
});

console.log(distanceResult.formattedDistance); // "2.3km"
console.log(distanceResult.formattedDuration); // "5min"
```

### API Usage

```javascript
// Calculate distance for an address
const response = await fetch("/api/distance", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    address: {
      full_address: "123 Customer St",
      city: "New Delhi",
      state: "Delhi",
      zip_code: "110001",
    },
  }),
});

const data = await response.json();
console.log(data.distance.formattedDistance);
```

## Configuration Options

### Travel Time Estimation

The system estimates travel time based on an average speed of 30 km/h. You can modify this in `lib/distance-utils.ts`:

```typescript
export function estimateTravelTime(distance: number): number {
  const averageSpeed = 30; // km/h - adjust this value
  return Math.round((distance / averageSpeed) * 60);
}
```

### Distance Formatting

Customize how distances are displayed:

```typescript
export function formatDistance(distance: number): string {
  if (distance < 1) {
    return `${Math.round(distance * 1000)}m`;
  } else if (distance < 10) {
    return `${distance.toFixed(1)}km`;
  } else {
    return `${Math.round(distance)}km`;
  }
}
```

## Error Handling

The system includes robust error handling:

- **Geocoding failures** → Fallback to free services
- **Invalid coordinates** → Clear error messages
- **Network issues** → Graceful degradation
- **API rate limits** → Automatic retry logic

## Performance Considerations

- **Caching**: Consider implementing Redis caching for frequently requested addresses
- **Batch processing**: For multiple addresses, consider batch geocoding
- **Rate limiting**: Respect API rate limits for Google Maps API

## Troubleshooting

### Common Issues

1. **"Distance unavailable" message**

   - Check if the address is valid
   - Verify internet connection
   - Check API key if using Google Maps

2. **Inaccurate distances**

   - Verify shop coordinates are correct
   - Check if using the right coordinate system (WGS84)
   - Consider using Google Maps API for better accuracy

3. **Slow loading**
   - Geocoding can take 1-3 seconds
   - Consider implementing loading states
   - Use caching for repeated addresses

### Debug Mode

Enable debug logging by adding to your environment:

```env
DEBUG_DISTANCE=true
```

## Security Considerations

- **API Keys**: Never expose API keys in client-side code
- **Rate Limiting**: Implement rate limiting for distance API calls
- **Input Validation**: Always validate address inputs
- **Error Messages**: Don't expose sensitive information in error messages

## Future Enhancements

Potential improvements you can implement:

1. **Database storage** for shop location
2. **Caching layer** for distance calculations
3. **Multiple shop locations** support
4. **Real-time traffic** integration
5. **Delivery zones** with pricing
6. **Route optimization** for multiple deliveries

## Support

If you encounter issues:

1. Check the browser console for error messages
2. Verify your environment variables are set correctly
3. Test with a known address first
4. Check API quotas if using Google Maps API

---

**Note:** This feature is designed to work with your existing address management system and provides a foundation for delivery estimation and logistics planning.
