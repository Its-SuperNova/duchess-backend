-- ============================================
-- SIMPLIFIED TEST DATA FOR ORDERS TABLE
-- Only Essential Fields - Works with Any Schema
-- ============================================
-- STEP 1: Get your user_id
-- SELECT id FROM users LIMIT 1;
-- STEP 2: Replace 'YOUR_USER_ID_HERE' with actual user_id
-- Order 1: October 5, 2024 - ₹500
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-001',
        'delivered',
        'paid',
        450.00,
        50.00,
        0.00,
        0.00,
        0.00,
        500.00,
        'Rajesh Kumar',
        '9876543210',
        'online',
        'immediate',
        '2024-10-05 10:30:00'
    );
-- Order 2: October 7, 2024 - ₹850
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-002',
        'delivered',
        'paid',
        800.00,
        50.00,
        0.00,
        0.00,
        0.00,
        850.00,
        'Priya Sharma',
        '9876543211',
        'upi',
        'schedule',
        '2024-10-07 15:20:00'
    );
-- Order 3: October 9, 2024 - ₹1,371.60
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-003',
        'delivered',
        'paid',
        1250.00,
        121.60,
        0.00,
        0.00,
        0.00,
        1371.60,
        'Amit Patel',
        '9876543212',
        'online',
        'schedule',
        '2024-10-09 12:00:00'
    );
-- Order 4: October 10, 2024 - ₹750
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-004',
        'delivered',
        'paid',
        700.00,
        50.00,
        0.00,
        0.00,
        0.00,
        750.00,
        'Sneha Reddy',
        '9876543213',
        'cod',
        'immediate',
        '2024-10-10 16:45:00'
    );
-- Order 5: October 12, 2024 - ₹2,000
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-005',
        'delivered',
        'paid',
        1850.00,
        150.00,
        0.00,
        0.00,
        0.00,
        2000.00,
        'Vikram Singh',
        '9876543214',
        'online',
        'schedule',
        '2024-10-12 09:30:00'
    );
-- Order 6: October 14, 2024 - ₹1,100
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-006',
        'delivered',
        'paid',
        1000.00,
        100.00,
        0.00,
        0.00,
        0.00,
        1100.00,
        'Meera Nair',
        '9876543215',
        'upi',
        'immediate',
        '2024-10-14 14:30:00'
    );
-- Order 7: October 15, 2024 - ₹1,200
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-007',
        'preparing',
        'paid',
        1100.00,
        100.00,
        0.00,
        0.00,
        0.00,
        1200.00,
        'Arjun Desai',
        '9876543216',
        'online',
        'schedule',
        '2024-10-15 17:00:00'
    );
-- Order 8: October 16, 2024 - ₹650
INSERT INTO orders (
        user_id,
        order_number,
        status,
        payment_status,
        item_total,
        delivery_charge,
        discount_amount,
        cgst,
        sgst,
        total_amount,
        contact_name,
        contact_number,
        payment_method,
        delivery_timing,
        created_at
    )
VALUES (
        'YOUR_USER_ID_HERE',
        'TEST-2024-10-008',
        'delivered',
        'paid',
        600.00,
        50.00,
        0.00,
        0.00,
        0.00,
        650.00,
        'Kavya Menon',
        '9876543217',
        'cod',
        'immediate',
        '2024-10-16 11:30:00'
    );
-- ============================================
-- VERIFICATION QUERY
-- ============================================
SELECT order_number,
    contact_name,
    total_amount,
    payment_status,
    status,
    created_at
FROM orders
WHERE order_number LIKE 'TEST-2024-10-%'
ORDER BY created_at;
-- ============================================
-- SUMMARY STATISTICS
-- ============================================
SELECT COUNT(*) as total_orders,
    SUM(total_amount) as total_revenue,
    ROUND(AVG(total_amount), 2) as average_order_value
FROM orders
WHERE order_number LIKE 'TEST-2024-10-%'
    AND payment_status = 'paid';
-- ============================================
-- CLEANUP (Uncomment to delete test data)
-- ============================================
-- DELETE FROM orders WHERE order_number LIKE 'TEST-2024-10-%';
