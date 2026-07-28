# Field Specifications

**FLL 2026 UNEARTHED Competition Field**

---

## 📐 Physical Dimensions

### Competition Mat

**Official FLL Mat:**
- **Total Size:** 2019mm × 1137mm (79.5" × 44.8")
- **Material:** Vinyl mat with printed grid and mission areas
- **Weight:** ~2-3 kg
- **Border:** White/colored border around playing field

**Playing Field (Competition Area):**
- **Size:** 2400mm × 1200mm (240cm × 120cm)
- **Units in Code:** 1 unit = 1 cm
- **Origin:** Bottom-left corner (0, 0)
- **Top-right corner:** (240, 120)

---

## 📊 Coordinate System

### Origin and Axes

```
     ┌─────────────────────────────────────┐
     │                                     │ 120 cm
     │                                     │
     │                                     │
     │                                     │
     │                                     │
     │          (120, 60) CENTER           │
     │                ●                    │
     │                                     │
     │                                     │
     │                                     │
  0  └─────────────────────────────────────┘
     0                                   240 cm

Coordinate System:
  - Origin: Bottom-left corner (0, 0)
  - X-axis: Left to right (0 → 240)
  - Y-axis: Bottom to top (0 → 120)
  - Units: 1 unit = 1 cm
  - Aspect ratio: 2:1 (width:height)
```

### Key Points

| Location | Coordinates | Description |
|----------|-------------|-------------|
| Origin | (0, 0) | Bottom-left corner |
| Center | (120, 60) | Middle of field |
| Top-left | (0, 120) | Top-left corner |
| Top-right | (240, 120) | Top-right corner |
| Bottom-right | (240, 0) | Bottom-right corner |

---

## 🔄 Coordinate Conversion

### Google Sheets → Field Coordinates

**Google Sheets Format:**
- Uses **center-origin** coordinate system
- (0, 0) = center of field
- Positive x = right, Negative x = left
- Positive y = top, Negative y = bottom
- Range: x ∈ [-120, 120], y ∈ [-60, 60]

**Field Format (Code):**
- Uses **corner-origin** coordinate system
- (0, 0) = bottom-left corner
- All coordinates positive
- Range: x ∈ [0, 240], y ∈ [0, 120]

**Conversion Formula:**

```python
# From Google Sheets to Field
field_x = sheet_x + 120  # Shift right by half width
field_y = sheet_y + 60   # Shift up by half height

# From Field to Google Sheets
sheet_x = field_x - 120  # Shift left by half width
sheet_y = field_y - 60   # Shift down by half height
```

**Example Conversions:**

| Google Sheets | Field Coords | Location |
|---------------|--------------|----------|
| (0, 0) | (120, 60) | Center |
| (-120, -60) | (0, 0) | Bottom-left |
| (120, 60) | (240, 120) | Top-right |
| (-60, 30) | (60, 90) | Left-top quadrant |
| (60, -30) | (180, 30) | Right-bottom quadrant |

---

## 🏁 Start Zones

### Red Start Zone (Left)

```
┌─────────────────┐
│   RED ZONE      │  Height: 20 cm
│   (LEFT SIDE)   │  Width:  80 cm
└─────────────────┘
0                80
```

**Coordinates:**
- X range: 0 → 80 cm
- Y range: 0 → 20 cm
- Area: 1,600 cm²
- Color: Red (rgba: 1, 0, 0, 0.2)

**Properties:**
- Robot back must be against y=0 line
- Robot front can extend into field
- Maximum 3 robots allowed (team + referee)

### Blue Start Zone (Right)

```
                  ┌─────────────────┐
                  │   BLUE ZONE     │  Height: 20 cm
                  │  (RIGHT SIDE)   │  Width:  80 cm
                  └─────────────────┘
                 160              240
```

**Coordinates:**
- X range: 160 → 240 cm
- Y range: 0 → 20 cm
- Area: 1,600 cm²
- Color: Blue (rgba: 0, 0, 1, 0.2)

**Properties:**
- Robot back must be against y=0 line
- Robot front can extend into field
- Teams choose red or blue before match

---

## 🤖 Robot Specifications

### Physical Dimensions (Typical)

**LEGO MINDSTORMS EV3 / Spike Prime:**
- **Length:** 15-25 cm (varies by design)
- **Width:** 15-20 cm (varies by design)
- **Height:** 10-30 cm (varies by design)
- **Weight:** 0.5-1.5 kg with batteries

### Starting Position

```
     0                       120                      240
  0  ┣━━━━━━━━━━━━━━━━━━━━━┫▲┣━━━━━━━━━━━━━━━━━━━━━┫
     │  RED ZONE           ROBOT          BLUE ZONE │
     └─────────────────────────────────────────────┘

Robot Start Position:
  - X: 120 cm (center of field)
  - Y: 0 cm (back flush with bottom wall)
  - Orientation: Facing upward (into field)
  - Symbol: Black triangle (▲)
```

**Starting Rules:**
1. Robot back must touch y=0 line (bottom wall)
2. Robot must be entirely within start zone (red or blue)
3. Robot can be oriented in any direction
4. All attachments must fit within size limits

### Movement Constraints

**Speed Estimates:**
- **Straight line:** ~40 cm/s (average)
- **With precision:** ~20 cm/s (slow)
- **Maximum:** ~60 cm/s (sprint, rare)

**Turning:**
- **90° turn:** ~0.5 seconds
- **180° turn:** ~1.0 seconds
- **Spin in place:** ~1.5 seconds for 360°

**Acceleration:**
- **Time to max speed:** ~1 second
- **Braking distance:** ~5 cm

---

## 📏 Mat Dimensions Overlay

### Visualization Box

**Purpose:**
- Show exact FLL mat size on field visualization
- Helps with spatial awareness during planning
- Indicates safe zone vs. off-mat areas

**Dimensions:**
```
Mat: 2019mm × 1137mm
Convert to cm: 201.9cm × 113.7cm
Convert to field units: 201.9 × 113.7

Center on field:
  mat_x = (240 - 201.9) / 2 = 19.05 cm offset
  mat_y = (120 - 113.7) / 2 = 3.15 cm offset

Rectangle:
  Bottom-left: (19.05, 3.15)
  Top-right: (220.95, 116.85)
  Width: 201.9 units
  Height: 113.7 units
```

**Rendering:**
```python
mat_rect = patches.Rectangle(
    (19.05, 3.15),      # Bottom-left corner
    201.9, 113.7,       # Width, height
    linewidth=2,
    edgecolor='orange',
    facecolor='none',
    linestyle='--',
    label='FLL Mat (2019×1137mm)'
)
```

---

## 🎯 Mission Positioning

### Typical Mission Locations

**Example Mission Coordinates (Field System):**

| Mission Name | X (cm) | Y (cm) | Quadrant |
|--------------|--------|--------|----------|
| Base Area | 120 | 10 | Center-bottom |
| Mission 1 | 60 | 90 | Top-left |
| Mission 2 | 180 | 90 | Top-right |
| Mission 3 | 30 | 60 | Left-center |
| Mission 4 | 210 | 60 | Right-center |
| Mission 5 | 120 | 100 | Top-center |

**Quadrants:**
```
┌─────────────┬─────────────┐
│  Top-Left   │  Top-Right  │
│   (Q2)      │    (Q1)     │  60-120 cm
│             │             │
├─────────────┼─────────────┤
│ Bottom-Left │Bottom-Right │
│   (Q3)      │    (Q4)     │  0-60 cm
└─────────────┴─────────────┘
  0-120 cm      120-240 cm
```

---

## 🧭 Navigation Grid

### Major Grid Lines

**X-axis Major Lines (every 30 cm):**
- 0, 30, 60, 90, 120, 150, 180, 210, 240 cm

**Y-axis Major Lines (every 30 cm):**
- 0, 30, 60, 90, 120 cm

### Minor Grid Lines

**X-axis Minor Lines (every 10 cm):**
- 10, 20, 40, 50, 70, 80, 100, ... cm

**Y-axis Minor Lines (every 10 cm):**
- 10, 20, 40, 50, 70, 80, 100, 110 cm

**Rendering:**
```python
# Major grid (dark)
self.ax.grid(True, which='major', color='#333333', 
             linewidth=1.0, alpha=0.4)

# Minor grid (light)
self.ax.grid(True, which='minor', color='#666666', 
             linewidth=0.5, alpha=0.2)

# Set tick positions
self.ax.set_xticks(range(0, 241, 30), minor=False)
self.ax.set_xticks(range(0, 241, 10), minor=True)
self.ax.set_yticks(range(0, 121, 30), minor=False)
self.ax.set_yticks(range(0, 121, 10), minor=True)
```

---

## 🎨 Color Specifications

### Start Zones

```python
RED_ZONE_COLOR   = (1.0, 0.0, 0.0, 0.2)  # Red, 20% opacity
BLUE_ZONE_COLOR  = (0.0, 0.0, 1.0, 0.2)  # Blue, 20% opacity
ZONE_EDGE_COLOR  = '#000000'              # Black border
ZONE_LINE_WIDTH  = 2                      # Border thickness
```

### Mat Outline

```python
MAT_EDGE_COLOR   = 'orange'               # Contrasting color
MAT_LINE_WIDTH   = 2                      # Border thickness
MAT_LINE_STYLE   = '--'                   # Dashed line
MAT_FILL         = 'none'                 # Transparent fill
```

### Mission Dots

```python
SELECTED_COLOR   = '#00ff00'              # Bright green
UNSELECTED_COLOR = '#ff0000'              # Bright red
DOT_SIZE         = 100                    # Marker size
DOT_EDGE_COLOR   = '#000000'              # Black outline
DOT_EDGE_WIDTH   = 2                      # Outline thickness
```

---

## ⚙️ Field Configuration

### Viewport Calibration

**Purpose:**
- Align background image with coordinate system
- Handle different image resolutions
- Account for borders/margins in field map

**Calibration File (`calibration.json`):**
```json
{
  "x_min": -18.0,   // Image extends 18cm left of field
  "x_max": 216.0,   // Image extends to 216cm (field is 240cm)
  "y_min": -21.5,   // Image extends 21.5cm below field
  "y_max": 157.0    // Image extends to 157cm (field is 120cm)
}
```

**Usage:**
```python
with open('calibration.json', 'r') as f:
    cal = json.load(f)

extent = [
    cal['x_min'],   # Left edge
    cal['x_max'],   # Right edge
    cal['y_min'],   # Bottom edge
    cal['y_max']    # Top edge
]

self.ax.imshow(img, extent=extent, aspect='auto')
```

---

## 📝 Measurement Reference

### Common Distances

| Description | Distance (cm) | Distance (mm) |
|-------------|---------------|---------------|
| Field width | 240 | 2400 |
| Field height | 120 | 1200 |
| Mat width | 201.9 | 2019 |
| Mat height | 113.7 | 1137 |
| Start zone width | 80 | 800 |
| Start zone height | 20 | 200 |
| Grid major spacing | 30 | 300 |
| Grid minor spacing | 10 | 100 |
| Robot typical length | 15-25 | 150-250 |
| Robot typical width | 15-20 | 150-200 |

### Conversion Factors

```python
# Millimeters to centimeters
cm = mm / 10

# Centimeters to field units (already in cm)
field_units = cm * 1

# Inches to centimeters
cm = inches * 2.54

# Field diagonal
diagonal = sqrt(240**2 + 120**2) ≈ 268.3 cm
```

---

## 🔍 Validation Checks

### Coordinate Range Checks

```python
def validate_coordinates(x, y):
    """Check if coordinates are within field bounds."""
    if not (0 <= x <= 240):
        raise ValueError(f"X coordinate {x} out of range [0, 240]")
    if not (0 <= y <= 120):
        raise ValueError(f"Y coordinate {y} out of range [0, 120]")
    return True
```

### Mission Position Validation

```python
def validate_mission_position(x, y):
    """Check if mission is accessible (not in start zones during match)."""
    # Check field bounds
    validate_coordinates(x, y)
    
    # Warn if in start zone (y < 20)
    if y < 20:
        print(f"Warning: Mission at ({x}, {y}) is in start zone")
    
    return True
```

---

## 📐 Aspect Ratio and Scaling

### Display Aspect Ratio

**Field Aspect:** 2:1 (width:height)  
**Window Size:** Typically 1200×600 pixels or larger  
**DPI:** 100 (default matplotlib)

```python
# Force equal aspect ratio
self.ax.set_aspect('equal')

# Lock limits to prevent distortion
self.ax.set_xlim(0, 240)
self.ax.set_ylim(0, 120)
```

### Image Scaling

**Field map image:**
- Recommended: 2400×1200 pixels (10 px/cm)
- Minimum: 1200×600 pixels (5 px/cm)
- Maximum: 4800×2400 pixels (20 px/cm)

**Brightness adjustment:**
```python
# Increase brightness 30%
enhancer = ImageEnhance.Brightness(img)
img = enhancer.enhance(1.3)
```

---

This specification document should be referenced when:
- Planning mission coordinates
- Validating robot paths
- Debugging coordinate conversion issues
- Creating field visualizations
- Writing documentation
