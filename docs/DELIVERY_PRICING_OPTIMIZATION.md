# Delivery Pricing System Optimization

## Current Issues with Existing Approach

### Problems:

1. **Range Overlap**: No validation prevents overlapping distance ranges
2. **Gap Handling**: No automatic handling of gaps between ranges
3. **Performance**: Multiple DB queries during checkout
4. **Limited Flexibility**: Can't handle complex pricing scenarios
5. **No Validation**: Admin can create invalid ranges

## Optimized Approaches

### 1. Enhanced Range-Based System

```sql
-- Improved delivery_charges table
CREATE TABLE delivery_charges (
    id SERIAL PRIMARY KEY,
    type VARCHAR(20) NOT NULL CHECK (type IN ('order_value', 'distance', 'zone')),

    -- Distance-based fields
    start_km DECIMAL(5, 2) NOT NULL,
    end_km DECIMAL(5, 2) NOT NULL,
    price DECIMAL(10, 2) NOT NULL,

    -- Zone-based fields
    zone_name VARCHAR(50),
    zone_multiplier DECIMAL(3, 2) DEFAULT 1.0,

    -- Order value fields
    order_value_threshold DECIMAL(10, 2),
    delivery_type VARCHAR(20),
    fixed_price DECIMAL(10, 2),

    -- Metadata
    priority INTEGER DEFAULT 0, -- Higher priority rules override lower ones
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW(),

    -- Constraints
    CONSTRAINT valid_distance_range CHECK (start_km < end_km),
    CONSTRAINT valid_price CHECK (price >= 0)
);

-- Indexes for performance
CREATE INDEX idx_delivery_charges_distance ON delivery_charges(start_km, end_km) WHERE type = 'distance';
CREATE INDEX idx_delivery_charges_priority ON delivery_charges(priority DESC, start_km);
```

### 2. Zone-Based Pricing System

```sql
-- Delivery zones table
CREATE TABLE delivery_zones (
    id SERIAL PRIMARY KEY,
    zone_name VARCHAR(50) NOT NULL,
    zone_type VARCHAR(20) NOT NULL, -- 'distance', 'pincode', 'area'
    base_charge DECIMAL(10, 2) NOT NULL,
    per_km_charge DECIMAL(10, 2) DEFAULT 0,
    min_charge DECIMAL(10, 2) DEFAULT 0,
    max_charge DECIMAL(10, 2),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT NOW()
);

-- Zone boundaries (for distance-based zones)
CREATE TABLE zone_boundaries (
    id SERIAL PRIMARY KEY,
    zone_id INTEGER REFERENCES delivery_zones(id),
    start_km DECIMAL(5, 2) NOT NULL,
    end_km DECIMAL(5, 2) NOT NULL,
    charge DECIMAL(10, 2) NOT NULL
);

-- Pincode-based zones
CREATE TABLE pincode_zones (
    id SERIAL PRIMARY KEY,
    pincode VARCHAR(10) NOT NULL,
    zone_id INTEGER REFERENCES delivery_zones(id),
    delivery_charge DECIMAL(10, 2) NOT NULL,
    is_active BOOLEAN DEFAULT true
);
```

### 3. Dynamic Pricing System

```sql
-- Base pricing rules
CREATE TABLE pricing_rules (
    id SERIAL PRIMARY KEY,
    rule_name VARCHAR(100) NOT NULL,
    rule_type VARCHAR(20) NOT NULL, -- 'distance', 'time', 'demand', 'weather'
    base_charge DECIMAL(10, 2) NOT NULL,
    multiplier DECIMAL(3, 2) DEFAULT 1.0,
    conditions JSONB, -- Flexible conditions
    is_active BOOLEAN DEFAULT true,
    priority INTEGER DEFAULT 0
);

-- Dynamic pricing factors
CREATE TABLE pricing_factors (
    id SERIAL PRIMARY KEY,
    factor_type VARCHAR(20) NOT NULL, -- 'time', 'weather', 'demand', 'distance'
    factor_value VARCHAR(50) NOT NULL,
    multiplier DECIMAL(3, 2) NOT NULL,
    valid_from TIMESTAMP,
    valid_until TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);
```

## Recommended Approach: Hybrid System

### Phase 1: Enhanced Current System

1. Add range validation
2. Implement priority system
3. Add caching layer
4. Improve performance

### Phase 2: Zone-Based System

1. Implement delivery zones
2. Add pincode-based pricing
3. Support multiple pricing models

### Phase 3: Dynamic Pricing

1. Add time-based pricing
2. Implement demand-based pricing
3. Add weather-based adjustments

## Implementation Benefits

### Performance Improvements:

- Single query with proper indexing
- Caching layer for frequently accessed data
- Batch processing for bulk operations

### Business Benefits:

- More flexible pricing models
- Better customer experience
- Increased revenue optimization
- Easier management and scaling

### Technical Benefits:

- Better data integrity
- Reduced complexity
- Improved maintainability
- Enhanced scalability
