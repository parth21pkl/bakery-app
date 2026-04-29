const Database = require("better-sqlite3");
const path = require("path");

const dbPath = path.join(__dirname, "..", "bakery.db");
const db = new Database(dbPath);

db.pragma("journal_mode = WAL");

db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT NOT NULL,
    assigned_location_id INTEGER,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS locations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL UNIQUE,
    type TEXT,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS raw_materials (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    unit TEXT NOT NULL,
    reorder_level REAL DEFAULT 0,
    current_stock REAL DEFAULT 0,
    purchase_rate REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS raw_material_purchases (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    raw_material_id INTEGER NOT NULL,
    purchase_date TEXT NOT NULL,
    quantity REAL NOT NULL DEFAULT 0,
    unit_rate REAL NOT NULL DEFAULT 0,
    total_amount REAL NOT NULL DEFAULT 0,
    supplier_name TEXT DEFAULT '',
    invoice_no TEXT DEFAULT '',
    remarks TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(raw_material_id) REFERENCES raw_materials(id)
  );

  CREATE TABLE IF NOT EXISTS menu_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT,
    name TEXT NOT NULL UNIQUE,
    category TEXT,
    unit TEXT NOT NULL,
    selling_price REAL DEFAULT 0,
    is_active INTEGER DEFAULT 1
  );

  CREATE TABLE IF NOT EXISTS recipes (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER NOT NULL,
    raw_material_id INTEGER NOT NULL,
    qty_per_unit REAL NOT NULL,
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY(raw_material_id) REFERENCES raw_materials(id)
  );

  CREATE TABLE IF NOT EXISTS dispatch (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER,
    location_id INTEGER,
    quantity REAL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY(location_id) REFERENCES locations(id)
  );

  CREATE TABLE IF NOT EXISTS sales (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    menu_item_id INTEGER,
    location_id INTEGER,
    sold_qty REAL,
    returned_qty REAL,
    wasted_qty REAL,
    date TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id),
    FOREIGN KEY(location_id) REFERENCES locations(id)
  );

  CREATE TABLE IF NOT EXISTS staff_sales_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_date TEXT NOT NULL,
    location_id INTEGER NOT NULL,
    menu_item_id INTEGER NOT NULL,
    opening_qty REAL DEFAULT 0,
    received_qty REAL DEFAULT 0,
    sold_qty REAL DEFAULT 0,
    returned_qty REAL DEFAULT 0,
    wasted_qty REAL DEFAULT 0,
    closing_qty REAL DEFAULT 0,
    remarks TEXT DEFAULT '',
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(location_id) REFERENCES locations(id),
    FOREIGN KEY(menu_item_id) REFERENCES menu_items(id)
  );
`);

const defaultLocations = [
  ["Main Bakery", "main"],
  ["Extension Counter", "counter"],
  ["Cafe", "cafe"],
  ["Mobile Vehicle", "vehicle"],
];

for (const [name, type] of defaultLocations) {
  const exists = db.prepare("SELECT id FROM locations WHERE name = ?").get(name);
  if (!exists) {
    db.prepare(`
      INSERT INTO locations (name, type)
      VALUES (?, ?)
    `).run(name, type);
  }
}

function createUserIfMissing(fullName, username, password, role, assignedLocationId = null) {
  const exists = db.prepare("SELECT id FROM users WHERE username = ?").get(username);
  if (!exists) {
    db.prepare(`
      INSERT INTO users (full_name, username, password, role, assigned_location_id)
      VALUES (?, ?, ?, ?, ?)
    `).run(fullName, username, password, role, assignedLocationId);
  }
}

const mainBakery = db.prepare("SELECT id FROM locations WHERE name = ?").get("Main Bakery");
const extensionCounter = db.prepare("SELECT id FROM locations WHERE name = ?").get("Extension Counter");
const cafe = db.prepare("SELECT id FROM locations WHERE name = ?").get("Cafe");
const mobileVehicle = db.prepare("SELECT id FROM locations WHERE name = ?").get("Mobile Vehicle");

createUserIfMissing("Administrator", "admin", "admin123", "admin", null);
createUserIfMissing("Bakery Staff 1", "staff1", "staff123", "staff", mainBakery?.id || null);
createUserIfMissing("Bakery Staff 2", "staff2", "staff123", "staff", extensionCounter?.id || null);
createUserIfMissing("Cafe Staff", "cafestaff", "staff123", "staff", cafe?.id || null);
createUserIfMissing("Vehicle Staff", "vehiclestaff", "staff123", "staff", mobileVehicle?.id || null);

module.exports = db;