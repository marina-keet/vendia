CREATE TABLE IF NOT EXISTS sales (
  id INT AUTO_INCREMENT PRIMARY KEY,
  total_amount DECIMAL(12,2) NOT NULL,
  discount DECIMAL(12,2) DEFAULT 0,
  final_amount DECIMAL(12,2) NOT NULL,
  payment_method VARCHAR(32) NOT NULL,
  status VARCHAR(32) DEFAULT 'completed',
  notes TEXT,
  user_id INT,
  customer_id INT,
  customer_name VARCHAR(255) DEFAULT 'Client anonyme',
  amount_received DECIMAL(12,2) DEFAULT 0,
  amount_returned DECIMAL(12,2) DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);
