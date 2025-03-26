-- Create the database
CREATE DATABASE inventory_db;
USE inventory_db;

-- Create the products table with additional_info
CREATE TABLE products (
    product_id INT AUTO_INCREMENT PRIMARY KEY,
    vendor VARCHAR(100),
    vendor_part VARCHAR(50),
    location VARCHAR(100),
    additional_info TEXT
);

-- Create the lots table with a foreign key reference to products
CREATE TABLE lots (
    lot_id INT AUTO_INCREMENT PRIMARY KEY,
    product_id INT,
    lot_number VARCHAR(50),
    quantity INT,
    receipt_date DATE,
    expiration_date DATE,
    FOREIGN KEY (product_id) REFERENCES products(product_id) ON DELETE CASCADE
);