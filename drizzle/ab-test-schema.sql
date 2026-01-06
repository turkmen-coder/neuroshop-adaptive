-- A/B Test Tracking Table
-- Tracks which theme variant was shown to which user and conversion events

CREATE TABLE IF NOT EXISTS theme_impressions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(128) NOT NULL,
  theme_variant VARCHAR(64) NOT NULL, -- 'openness', 'conscientiousness', etc.
  personality_trait VARCHAR(64), -- dominant trait at time of impression
  page_url VARCHAR(512),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_theme_variant (theme_variant),
  INDEX idx_created_at (created_at)
);

CREATE TABLE IF NOT EXISTS conversion_events (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  session_id VARCHAR(128) NOT NULL,
  theme_variant VARCHAR(64) NOT NULL,
  personality_trait VARCHAR(64),
  event_type VARCHAR(64) NOT NULL, -- 'add_to_cart', 'purchase', 'view_product'
  product_id INT,
  value DECIMAL(10, 2), -- monetary value for purchase events
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_user_id (user_id),
  INDEX idx_session_id (session_id),
  INDEX idx_theme_variant (theme_variant),
  INDEX idx_event_type (event_type),
  INDEX idx_created_at (created_at)
);
