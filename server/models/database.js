const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const DB_PATH = process.env.DATABASE_PATH || path.join(__dirname, '../../database.db');

class Database {
  constructor() {
    this.db = null;
  }

  async connect() {
    return new Promise((resolve, reject) => {
      this.db = new sqlite3.Database(DB_PATH, (err) => {
        if (err) {
          console.error('Database connection error:', err.message);
          reject(err);
        } else {
          console.log('✅ Connected to SQLite database');
          this.initializeTables().then(resolve).catch(reject);
        }
      });
    });
  }

  async initializeTables() {
    const tables = [
      // Clients table
      `CREATE TABLE IF NOT EXISTS clients (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        industry TEXT,
        target_roas REAL DEFAULT 3.0,
        avg_order_value REAL,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`,

      // Original ads table
      `CREATE TABLE IF NOT EXISTS ads (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        client_id INTEGER,
        ad_url TEXT,
        ad_platform TEXT DEFAULT 'facebook',
        ad_type TEXT DEFAULT 'standard', -- 'standard', 'call', 'lead_gen', 'app_install'
        headline TEXT,
        description TEXT,
        cta_text TEXT,
        image_url TEXT,
        video_url TEXT,
        phone_number TEXT, -- For call ads
        call_tracking_number TEXT, -- For call tracking
        business_hours TEXT, -- JSON string for call availability
        engagement_score REAL,
        estimated_spend REAL,
        ad_longevity_days INTEGER,
        performance_indicators TEXT, -- JSON string
        scraped_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (client_id) REFERENCES clients (id)
      )`,

      // Ad variations table
      `CREATE TABLE IF NOT EXISTS ad_variations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        original_ad_id INTEGER,
        variation_type TEXT, -- 'urgency', 'social_proof', 'benefit', 'problem_agitation', 'offer'
        headline TEXT,
        description TEXT,
        cta_text TEXT,
        image_url TEXT,
        phone_number TEXT, -- For call ad variations
        call_script TEXT, -- Suggested call script for call ads
        call_tracking_metrics TEXT, -- JSON: expected call volume, quality score
        roas_prediction_score REAL,
        conversion_elements TEXT, -- JSON string
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (original_ad_id) REFERENCES ads (id)
      )`,

      // Performance tracking table
      `CREATE TABLE IF NOT EXISTS performance_tracking (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        variation_id INTEGER,
        actual_roas REAL,
        actual_ctr REAL,
        actual_conversion_rate REAL,
        actual_cpa REAL,
        cost_per_call REAL, -- For call ads
        call_volume INTEGER, -- Number of calls received
        qualified_calls INTEGER, -- Calls that met criteria
        call_to_sale_rate REAL, -- Conversion rate from calls to sales
        spend_amount REAL,
        campaign_duration_days INTEGER,
        notes TEXT,
        tracked_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (variation_id) REFERENCES ad_variations (id)
      )`,

      // ROAS patterns table (for learning)
      `CREATE TABLE IF NOT EXISTS roas_patterns (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        industry TEXT,
        variation_type TEXT,
        element_type TEXT, -- 'headline', 'cta', 'image', 'copy'
        element_value TEXT,
        avg_roas REAL,
        success_count INTEGER DEFAULT 1,
        total_tests INTEGER DEFAULT 1,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
        updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
      )`
    ];

    for (const tableSQL of tables) {
      await this.run(tableSQL);
    }

    console.log('✅ Database tables initialized');
  }

  // Wrapper for database operations
  run(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.run(sql, params, function(err) {
        if (err) {
          console.error('Database run error:', err.message);
          reject(err);
        } else {
          resolve({ id: this.lastID, changes: this.changes });
        }
      });
    });
  }

  get(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.get(sql, params, (err, row) => {
        if (err) {
          console.error('Database get error:', err.message);
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  all(sql, params = []) {
    return new Promise((resolve, reject) => {
      this.db.all(sql, params, (err, rows) => {
        if (err) {
          console.error('Database all error:', err.message);
          reject(err);
        } else {
          resolve(rows);
        }
      });
    });
  }

  close() {
    return new Promise((resolve, reject) => {
      if (this.db) {
        this.db.close((err) => {
          if (err) {
            console.error('Database close error:', err.message);
            reject(err);
          } else {
            console.log('✅ Database connection closed');
            resolve();
          }
        });
      } else {
        resolve();
      }
    });
  }
}

// Singleton instance
const database = new Database();

module.exports = database;