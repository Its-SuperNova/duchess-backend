# Pricing Management System

This document describes the new pricing management system that allows administrators to configure tax rates and delivery charges dynamically.

## Features

### 1. Tax Rate Management

- **CGST (Central Goods and Services Tax)**: Configurable rate (default: 9%)
- **SGST (State Goods and Services Tax)**: Configurable rate (default: 9%)
- Real-time updates across the application

### 2. Delivery Charge Management

- **Distance-based tiers**: Configurable charges for different distance ranges
- **Tier structure**:
  - 0-5 km: ₹40 (configurable)
  - 5-10 km: ₹60 (configurable)
  - 10-15 km: ₹80 (configurable)
  - 15-20 km: ₹100 (configurable)
  - 20-25 km: ₹130 (configurable)
  - 25-30 km: ₹160 (configurable)
  - 30-35 km: ₹200 (configurable)
  - 35-40 km: ₹240 (configurable)
  - 40-45 km: ₹280 (configurable)
  - 45-50 km: ₹320 (configurable)
  - 50+ km: ₹320 (configurable)

## Database Schema

### pricing_config Table

```sql
CREATE TABLE pricing_config (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  config_type VARCHAR(50) NOT NULL, -- 'tax' or 'delivery'
  config_key VARCHAR(100) NOT NULL, -- 'cgst_rate', 'sgst_rate', 'delivery_tier_1', etc.
  config_value DECIMAL(10,2) NOT NULL,
  config_label VARCHAR(200) NOT NULL, -- Human readable label
  config_description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_by UUID REFERENCES users(id),
  updated_by UUID REFERENCES users(id)
);
```

## API Endpoints

### GET /api/admin/pricing

Fetch all pricing configurations grouped by type.

**Response:**

```json
{
  "success": true,
  "data": {
    "tax": [
      {
        "id": "uuid",
        "config_type": "tax",
        "config_key": "cgst_rate",
        "config_value": 9.00,
        "config_label": "CGST Rate (%)",
        "config_description": "Central Goods and Services Tax rate"
      }
    ],
    "delivery": [...]
  }
}
```

### POST /api/admin/pricing

Create or update a single pricing configuration.

**Request:**

```json
{
  "config_type": "tax",
  "config_key": "cgst_rate",
  "config_value": 9.0,
  "config_label": "CGST Rate (%)",
  "config_description": "Central Goods and Services Tax rate"
}
```

### PUT /api/admin/pricing

Bulk update multiple pricing configurations.

**Request:**

```json
{
  "configurations": [
    {
      "config_type": "tax",
      "config_key": "cgst_rate",
      "config_value": 9.0,
      "config_label": "CGST Rate (%)"
    }
  ]
}
```

### DELETE /api/admin/pricing/[id]

Soft delete a pricing configuration.

## Usage in Code

### Tax Calculations

```typescript
import { calculateTaxAmounts } from "@/lib/pricing-utils";

const taxableAmount = 1000; // ₹1000
const { cgstAmount, sgstAmount, totalTax } = await calculateTaxAmounts(
  taxableAmount
);
// Returns: { cgstAmount: 90, sgstAmount: 90, totalTax: 180 }
```

### Delivery Fee Calculations

```typescript
import { calculateDeliveryFee } from "@/lib/pricing-utils";

const distance = 12; // 12 km
const deliveryFee = await calculateDeliveryFee(distance);
// Returns: ₹80 (based on 10-15 km tier)
```

### Getting Tax Rates

```typescript
import { getTaxRates } from "@/lib/pricing-utils";

const { cgstRate, sgstRate, totalTaxRate } = await getTaxRates();
// Returns: { cgstRate: 9, sgstRate: 9, totalTaxRate: 18 }
```

## Caching

The pricing configuration system includes intelligent caching:

- **Cache duration**: 5 minutes
- **Automatic refresh**: When cache expires
- **Manual refresh**: Available via `clearPricingConfigCache()`
- **Fallback**: Default values if database is unavailable

## Setup Instructions

1. **Run the database migration:**

   ```sql
   -- Execute the contents of database/create-pricing-config-table.sql
   ```

2. **Access the admin panel:**

   - Navigate to `/admin/pricing`
   - Configure tax rates and delivery charges
   - Save changes

3. **Verify integration:**
   - Check checkout page calculations
   - Verify order creation uses new rates
   - Test delivery fee calculations

## Integration Points

The pricing management system is integrated into:

- **Checkout flow**: Real-time tax and delivery calculations
- **Order creation**: Uses configurable rates for new orders
- **Admin dashboard**: Management interface
- **API endpoints**: All order-related calculations

## Error Handling

- **Database failures**: Falls back to default values
- **Invalid configurations**: Uses hardcoded fallbacks
- **Network issues**: Cached values are used when available
- **Validation**: Input validation on all configuration updates

## Security

- **Admin-only access**: Pricing management requires admin authentication
- **Input validation**: All values are validated before storage
- **Soft deletes**: Configurations are soft-deleted, not permanently removed
- **Audit trail**: Created/updated timestamps and user tracking









