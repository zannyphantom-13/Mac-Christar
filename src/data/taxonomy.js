// Full taxonomy with Department > Category > Subcategory hierarchy
export const categoryTaxonomy = {};

// ─── Spec schema per category ─────────────────────────────────────────────────
// Each field: { id, label, type: 'text'|'select'|'number', options?, unit?, optional? }
// optional: true  ⟹ field is not required; greyed placeholder shown
export const categorySpecs = {

  // ── Computing ──────────────────────────────────────────────────────────────
  'Laptops': [
    { id: 'cpu',          label: 'Processor (CPU)',      type: 'text',   placeholder: 'e.g. Intel Core i7-13700H' },
    { id: 'ram',          label: 'RAM',                  type: 'select', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    { id: 'storage',      label: 'Storage',              type: 'select', options: ['128GB SSD', '256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD', '1TB HDD', '2TB HDD'] },
    { id: 'displaySize',  label: 'Display Size',         type: 'select', options: ['13.3"', '14"', '15.6"', '16"', '17.3"'] },
    { id: 'displayRes',   label: 'Display Resolution',   type: 'text',   placeholder: 'e.g. 1920x1080, 2560x1600', optional: true },
    { id: 'os',           label: 'Operating System',     type: 'select', options: ['Windows 11 Home', 'Windows 11 Pro', 'macOS', 'ChromeOS', 'Linux', 'No OS'] },
    { id: 'battery',      label: 'Battery',              type: 'text',   placeholder: 'e.g. 86Wh, Up to 18hrs', optional: true },
    { id: 'weight',       label: 'Weight',               type: 'text',   placeholder: 'e.g. 1.4kg', optional: true },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Space Grey, Midnight Black', optional: true },
    { id: 'modelYear',    label: 'Model Year',           type: 'text',   placeholder: 'e.g. 2025', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year', '2 Years'], optional: true },
  ],

  'Gaming Laptops': [
    { id: 'cpu',          label: 'Processor (CPU)',      type: 'text',   placeholder: 'e.g. Intel Core i9-14900HX' },
    { id: 'gpu',          label: 'Graphics Card (GPU)',  type: 'text',   placeholder: 'e.g. NVIDIA RTX 4080 12GB' },
    { id: 'ram',          label: 'RAM',                  type: 'select', options: ['16GB', '32GB', '64GB'] },
    { id: 'storage',      label: 'Storage',              type: 'select', options: ['512GB SSD', '1TB SSD', '2TB SSD', '4TB SSD'] },
    { id: 'displaySize',  label: 'Display Size',         type: 'select', options: ['15.6"', '16"', '17.3"', '18"'] },
    { id: 'refreshRate',  label: 'Screen Refresh Rate',  type: 'select', options: ['120Hz', '144Hz', '165Hz', '240Hz', '360Hz'] },
    { id: 'displayRes',   label: 'Display Resolution',   type: 'select', options: ['1080p FHD', '1440p QHD', '2160p 4K'], optional: true },
    { id: 'os',           label: 'Operating System',     type: 'select', options: ['Windows 11 Home', 'Windows 11 Pro', 'No OS'] },
    { id: 'cooling',      label: 'Cooling System',       type: 'text',   placeholder: 'e.g. Vapor Chamber + Dual Fan', optional: true },
    { id: 'battery',      label: 'Battery',              type: 'text',   placeholder: 'e.g. 99.9Wh', optional: true },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Eclipse Black', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year', '2 Years'], optional: true },
  ],

  'Computers & Desktops': [
    { id: 'cpu',          label: 'Processor (CPU)',      type: 'text',   placeholder: 'e.g. Intel Core i7-14700K' },
    { id: 'ram',          label: 'RAM',                  type: 'select', options: ['8GB', '16GB', '32GB', '64GB', '128GB'] },
    { id: 'storage',      label: 'Storage',              type: 'text',   placeholder: 'e.g. 1TB SSD + 2TB HDD' },
    { id: 'gpu',          label: 'Graphics Card',        type: 'text',   placeholder: 'e.g. NVIDIA RTX 4070 or Integrated', optional: true },
    { id: 'os',           label: 'Operating System',     type: 'select', options: ['Windows 11 Home', 'Windows 11 Pro', 'No OS'] },
    { id: 'formFactor',   label: 'Form Factor',          type: 'select', options: ['Tower', 'Mini PC', 'All-In-One', 'SFF'] },
    { id: 'psu',          label: 'Power Supply',         type: 'text',   placeholder: 'e.g. 650W 80+ Gold', optional: true },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Black', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year', '2 Years'], optional: true },
  ],

  'Tablets & iPads': [
    { id: 'displaySize',  label: 'Screen Size',          type: 'select', options: ['7"', '8"', '8.3"', '10.2"', '10.9"', '11"', '12.9"', '13"', '14.6"'] },
    { id: 'storage',      label: 'Storage',              type: 'select', options: ['32GB', '64GB', '128GB', '256GB', '512GB', '1TB'] },
    { id: 'ram',          label: 'RAM',                  type: 'select', options: ['2GB', '4GB', '6GB', '8GB', '12GB', '16GB'], optional: true },
    { id: 'os',           label: 'Operating System',     type: 'select', options: ['iPadOS', 'Android', 'Windows'] },
    { id: 'chip',         label: 'Chip / Processor',     type: 'text',   placeholder: 'e.g. Apple M2, Snapdragon 8 Gen 2' },
    { id: 'connectivity', label: 'Connectivity',         type: 'select', options: ['Wi-Fi Only', 'Wi-Fi + Cellular (4G)', 'Wi-Fi + Cellular (5G)'] },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Silver, Starlight', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year', '2 Years'], optional: true },
  ],

  // ── Phones & Wearables ─────────────────────────────────────────────────────
  'Smartphones': [
    { id: 'os',           label: 'Operating System',     type: 'select', options: ['iOS', 'Android'] },
    { id: 'chip',         label: 'Processor / Chip',     type: 'text',   placeholder: 'e.g. Apple A17 Pro, Snapdragon 8 Gen 3' },
    { id: 'ram',          label: 'RAM',                  type: 'select', options: ['4GB', '6GB', '8GB', '12GB', '16GB'] },
    { id: 'storage',      label: 'Internal Storage',     type: 'select', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
    { id: 'display',      label: 'Display',              type: 'text',   placeholder: 'e.g. 6.7" OLED, 120Hz' },
    { id: 'camera',       label: 'Main Camera',          type: 'text',   placeholder: 'e.g. 50MP + 12MP + 10MP' },
    { id: 'battery',      label: 'Battery',              type: 'text',   placeholder: 'e.g. 4500mAh, 45W charging' },
    { id: 'network',      label: 'Network',              type: 'select', options: ['4G LTE', '5G'] },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Titanium Black', optional: true },
    { id: 'simType',      label: 'SIM Type',             type: 'select', options: ['Single SIM', 'Dual SIM', 'Dual SIM + eSIM'], optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year'], optional: true },
  ],

  'Smartwatches & Wearables': [
    { id: 'compatibility', label: 'Compatibility',       type: 'select', options: ['iOS & Android', 'iOS Only', 'Android Only'] },
    { id: 'displaySize',   label: 'Case / Screen Size',  type: 'text',   placeholder: 'e.g. 44mm, 1.9" display' },
    { id: 'battery',       label: 'Battery Life',        type: 'text',   placeholder: 'e.g. Up to 18 hours' },
    { id: 'sensors',       label: 'Health Sensors',      type: 'text',   placeholder: 'e.g. Heart Rate, SpO2, ECG', optional: true },
    { id: 'gps',           label: 'GPS',                 type: 'select', options: ['Built-in GPS', 'Connected GPS', 'No GPS'], optional: true },
    { id: 'waterRating',   label: 'Water Resistance',    type: 'text',   placeholder: 'e.g. 50M WR, IP68', optional: true },
    { id: 'color',         label: 'Color / Finish',      type: 'text',   placeholder: 'e.g. Midnight, Starlight', optional: true },
    { id: 'warranty',      label: 'Warranty',            type: 'select', options: ['No Warranty', '6 Months', '1 Year'], optional: true },
  ],

  // ── TV, Audio & Home Theater ───────────────────────────────────────────────
  'Televisions': [
    { id: 'displaySize',  label: 'Screen Size',          type: 'select', options: ['32"', '43"', '50"', '55"', '65"', '75"', '85"', '98"'] },
    { id: 'resolution',   label: 'Resolution',           type: 'select', options: ['HD Ready (720p)', 'Full HD (1080p)', '4K UHD', '8K'] },
    { id: 'panel',        label: 'Panel Technology',     type: 'select', options: ['LED', 'OLED', 'QLED', 'Neo QLED', 'Mini-LED', 'AMOLED'] },
    { id: 'smartOs',      label: 'Smart TV OS',          type: 'select', options: ['webOS', 'Tizen', 'Android TV', 'Google TV', 'Fire TV', 'Roku'] },
    { id: 'refreshRate',  label: 'Refresh Rate',         type: 'select', options: ['60Hz', '120Hz', '144Hz'], optional: true },
    { id: 'hdr',          label: 'HDR Support',          type: 'text',   placeholder: 'e.g. HDR10, Dolby Vision', optional: true },
    { id: 'sound',        label: 'Sound System',         type: 'text',   placeholder: 'e.g. 40W Dolby Atmos', optional: true },
    { id: 'ports',        label: 'Ports & Connectivity', type: 'text',   placeholder: 'e.g. 4x HDMI 2.1, 3x USB', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year', '2 Years'], optional: true },
  ],

  'Audio': [
    { id: 'type',         label: 'Audio Type',           type: 'select', options: ['True Wireless Earbuds', 'In-Ear (Wired)', 'Over-Ear Headphones', 'On-Ear Headphones', 'Bluetooth Speaker', 'Soundbar', 'Home Theater'] },
    { id: 'connectivity', label: 'Connectivity',         type: 'select', options: ['Wireless (Bluetooth)', 'Wired (3.5mm)', 'Wired (USB-C)', 'Wired + Wireless'] },
    { id: 'anc',          label: 'Active Noise Cancelling', type: 'select', options: ['Yes', 'No'] },
    { id: 'battery',      label: 'Battery Life',         type: 'text',   placeholder: 'e.g. 8hrs earbuds + 30hrs case' },
    { id: 'driver',       label: 'Driver Size',          type: 'text',   placeholder: 'e.g. 10mm dynamic driver', optional: true },
    { id: 'freq',         label: 'Frequency Response',   type: 'text',   placeholder: 'e.g. 20Hz - 20kHz', optional: true },
    { id: 'codec',        label: 'Codec Support',        type: 'text',   placeholder: 'e.g. SBC, AAC, aptX', optional: true },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Midnight Black, Cream', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year'], optional: true },
  ],

  // ── Cameras & Photography ──────────────────────────────────────────────────
  'Cameras': [
    { id: 'cameraType',   label: 'Camera Type',          type: 'select', options: ['DSLR', 'Mirrorless', 'Point & Shoot', 'Action Camera', 'Instant Camera'] },
    { id: 'megapixels',   label: 'Resolution',           type: 'text',   placeholder: 'e.g. 61MP Full Frame' },
    { id: 'sensorType',   label: 'Sensor Type',          type: 'select', options: ['Full Frame', 'APS-C', 'Micro Four Thirds', '1-inch', '1/2.3"'] },
    { id: 'videoRes',     label: 'Max Video Resolution', type: 'select', options: ['1080p 60fps', '4K 30fps', '4K 60fps', '4K 120fps', '8K'] },
    { id: 'iso',          label: 'ISO Range',            type: 'text',   placeholder: 'e.g. 100-51200', optional: true },
    { id: 'autofocus',    label: 'Autofocus',            type: 'text',   placeholder: 'e.g. 759-point Phase Detection', optional: true },
    { id: 'stabilization', label: 'Image Stabilization', type: 'select', options: ['In-Body (IBIS)', 'Optical (OIS)', 'Both', 'None'], optional: true },
    { id: 'mount',        label: 'Lens Mount',           type: 'text',   placeholder: 'e.g. Sony E-Mount, Canon RF', optional: true },
    { id: 'battery',      label: 'Battery Life',         type: 'text',   placeholder: 'e.g. ~700 shots per charge', optional: true },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Black, Silver', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year'], optional: true },
  ],

  // ── Gaming ─────────────────────────────────────────────────────────────────
  'Consoles': [
    { id: 'consoleType',  label: 'Console Type',         type: 'select', options: ['Home Console', 'Handheld', 'Hybrid'] },
    { id: 'storage',      label: 'Storage',              type: 'select', options: ['256GB', '512GB', '825GB', '1TB', '2TB'] },
    { id: 'resolution',   label: 'Max Resolution',       type: 'select', options: ['720p', '1080p', '4K', '8K'] },
    { id: 'fps',          label: 'Max Frame Rate',        type: 'select', options: ['30fps', '60fps', '120fps'] },
    { id: 'rayTracing',   label: 'Ray Tracing',          type: 'select', options: ['Yes', 'No'] },
    { id: 'optical',      label: 'Optical Drive',        type: 'select', options: ['Yes', 'No (Digital Edition)'] },
    { id: 'online',       label: 'Online Service',       type: 'text',   placeholder: 'e.g. PlayStation Network (PS Plus)', optional: true },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Midnight Black', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year'], optional: true },
  ],

  // ── Home & Office Appliances ───────────────────────────────────────────────
  'Large Appliances': [
    { id: 'capacity',     label: 'Capacity',             type: 'text',   placeholder: 'e.g. 500L (Fridge), 8kg (Washer)' },
    { id: 'energyRating', label: 'Energy Rating',        type: 'select', options: ['A+++', 'A++', 'A+', 'A', 'B', 'C'] },
    { id: 'color',        label: 'Color / Finish',       type: 'text',   placeholder: 'e.g. Silver, Matt Black' },
    { id: 'voltage',      label: 'Voltage',              type: 'select', options: ['220V / 50Hz', '110V / 60Hz'], optional: true },
    { id: 'noise',        label: 'Noise Level',          type: 'text',   placeholder: 'e.g. 42 dB', optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year', '2 Years', '5 Years'], optional: true },
  ],

  'Small Kitchen Appliances': [
    { id: 'power',        label: 'Power (Watts)',        type: 'text',   placeholder: 'e.g. 1500W' },
    { id: 'capacity',     label: 'Capacity',             type: 'text',   placeholder: 'e.g. 4L, 12-place settings', optional: true },
    { id: 'color',        label: 'Color',                type: 'text',   placeholder: 'e.g. Stainless Steel, Black' },
    { id: 'voltage',      label: 'Voltage',              type: 'select', options: ['220V / 50Hz', '110V / 60Hz'], optional: true },
    { id: 'warranty',     label: 'Warranty',             type: 'select', options: ['No Warranty', '6 Months', '1 Year'], optional: true },
  ],
};

// Dynamic filter attributes for Shop sidebar
export const categoryAttributes = {
  'Laptops': [
    { id: 'ram', label: 'RAM (Memory)', options: ['4GB', '8GB', '16GB', '32GB', '64GB'] },
    { id: 'cpu', label: 'Processor', options: ['Intel Core i3', 'Intel Core i5', 'Intel Core i7', 'Intel Core i9', 'AMD Ryzen 5', 'AMD Ryzen 7', 'Apple M2', 'Apple M3'] },
    { id: 'storage', label: 'Storage', options: ['256GB SSD', '512GB SSD', '1TB SSD', '2TB SSD'] },
    { id: 'displaySize', label: 'Display Size', options: ['13.3"', '14"', '15.6"', '16"', '17.3"'] },
    { id: 'os', label: 'Operating System', options: ['Windows 11', 'macOS', 'ChromeOS'] }
  ],
  'Gaming Laptops': [
    { id: 'ram', label: 'RAM (Memory)', options: ['16GB', '32GB', '64GB'] },
    { id: 'cpu', label: 'Processor', options: ['Intel Core i7', 'Intel Core i9', 'AMD Ryzen 7', 'AMD Ryzen 9'] },
    { id: 'gpu', label: 'Graphics Card (GPU)', options: ['NVIDIA RTX 4050', 'NVIDIA RTX 4060', 'NVIDIA RTX 4070', 'NVIDIA RTX 4080', 'NVIDIA RTX 4090', 'AMD Radeon RX 7600S'] },
    { id: 'storage', label: 'Storage', options: ['512GB SSD', '1TB SSD', '2TB SSD'] },
    { id: 'refreshRate', label: 'Screen Refresh Rate', options: ['120Hz', '144Hz', '165Hz', '240Hz'] }
  ],
  'Smartphones': [
    { id: 'os', label: 'Operating System', options: ['iOS', 'Android'] },
    { id: 'storage', label: 'Internal Storage', options: ['64GB', '128GB', '256GB', '512GB', '1TB'] },
    { id: 'ram', label: 'RAM', options: ['4GB', '6GB', '8GB', '12GB', '16GB'] },
    { id: 'network', label: 'Network', options: ['4G LTE', '5G'] }
  ],
  'Televisions': [
    { id: 'displaySize', label: 'Screen Size', options: ['32"', '43"', '50"', '55"', '65"', '75"', '85"'] },
    { id: 'resolution', label: 'Resolution', options: ['1080p Full HD', '4K UHD', '8K'] },
    { id: 'panel', label: 'Panel Technology', options: ['LED', 'OLED', 'QLED', 'Neo QLED'] },
    { id: 'smartOs', label: 'Smart OS', options: ['webOS', 'Tizen', 'Android TV', 'Google TV'] }
  ],
  'Audio': [
    { id: 'type', label: 'Type', options: ['True Wireless Earbuds', 'Over-Ear Headphones', 'Bluetooth Speaker', 'Soundbar'] },
    { id: 'connectivity', label: 'Connectivity', options: ['Wireless (Bluetooth)', 'Wired'] },
    { id: 'anc', label: 'Active Noise Cancelling', options: ['Yes', 'No'] }
  ],
  'Cameras': [
    { id: 'sensorType', label: 'Sensor Type', options: ['Full Frame', 'APS-C', 'Micro Four Thirds'] },
    { id: 'megapixels', label: 'Megapixels', options: ['12MP - 20MP', '20MP - 30MP', '30MP - 45MP', '45MP+'] },
    { id: 'videoRes', label: 'Max Video Resolution', options: ['1080p', '4K', '8K'] }
  ]
};

// Fallback filters for categories without deeply defined attributes
export const defaultAttributes = [
  { id: 'condition', label: 'Condition', options: ['Brand New', 'Refurbished', 'Used'] },
  { id: 'warranty', label: 'Warranty', options: ['None', '6 Months', '1 Year', '2 Years'] }
];
