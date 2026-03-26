# Node API Reference — Godot 4 Common Nodes
_Supplemental reference. For deep dives, consult: https://docs.godotengine.org/en/stable/_

---

## CharacterBody2D / CharacterBody3D

Player-controlled physics bodies. You write the movement code; Godot handles collision resolution.

### CharacterBody2D

```gdscript
extends CharacterBody2D

@export var speed: float = 400.0
@export var jump_velocity: float = -400.0
@export var gravity: float = 980.0
@export var snap_length: float = 2.0  # For floor snapping
@export var max_slides: int = 4
@export var floor_stop_on_slope: bool = true
@export var floor_max_angle: float = deg_to_rad(45)

# Properties
velocity: Vector2           # Movement velocity (set this each frame)
max_slides: int             # Max slides on wall collision
up_direction: Vector2        # "Up" direction (default: Vector2.UP)
floor_stop_on_slope: bool    # Stop on shallow slopes
floor_max_angle: float       # Max floor angle (radians)
floor_global: bool           # Use global up direction
safe_margin: float           # Collision detection margin

# State helpers
is_on_floor() -> bool        # True if standing on something
is_on_ceiling() -> bool       # True if head hit ceiling
is_on_wall() -> bool         # True if side hit wall
get_floor_normal() -> Vector2 # Floor surface normal
get_wall_normal() -> Vector2  # Wall surface normal
```

### Basic Movement Pattern

```gdscript
extends CharacterBody2D

@export var speed: float = 400.0
@export var jump_velocity: float = -600.0
@export var gravity: float = 980.0

func _physics_process(delta: float) -> void:
    # Apply gravity
    if not is_on_floor():
        velocity.y += gravity * delta

    # Jump input
    if Input.is_action_just_pressed("ui_accept") and is_on_floor():
        velocity.y = jump_velocity

    # Horizontal movement
    var direction := Input.get_axis("ui_left", "ui_right")
    velocity.x = direction * speed if direction != 0 else 0.0

    # Move and slide
    move_and_slide()

    # Optional: snap to floor
    if is_on_floor():
        velocity.y = 0.0
```

### With Floor Snapping

```gdscript
func _physics_process(delta: float) -> void:
    var was_on_floor := is_on_floor()

    # Gravity
    if not is_on_floor():
        velocity.y += gravity * delta

    # Jump
    if Input.is_action_just_pressed("jump") and is_on_floor():
        velocity.y = jump_velocity
        # Break snap when jumping
        snap = Vector2.ZERO
    else:
        snap = Vector2.DOWN * snap_length

    # Direction
    var direction := Input.get_vector("left", "right", "up", "down")
    if direction:
        velocity.x = direction.x * speed
    else:
        velocity.x = move_toward(velocity.x, 0, speed * delta * 10.0)

    # Move with optional snap
    move_and_slide()

    # Re-engage snap if landing
    if is_on_floor() and not was_on_floor:
        snap = Vector2.DOWN * snap_length
```

---

## RigidBody2D / RigidBody3D

Simulated physics body. Engine controls motion; you apply forces.

### Properties
```gdscript
mass: float                 # kg (default 1.0)
inverse_mass: float        # 1.0/mass
linear_velocity: Vector2
angular_velocity: float
gravity_scale: float        # Multiply global gravity
linear_damp: float          # Velocity decay (default: 0.1 on 2D, 0.05 on 3D)
angular_damp: float
continuous_cd: bool         # Continuous collision detection
contacts_reported: int      # Max contact reports
max_contacts_reported: int
physics_material_override: PhysicsMaterial

# Modes
mode: MODE_RIGID            # MODE_STATIC, MODE_KINEMATIC, MODE_CHARACTER, MODE_RIGID
```

### Methods
```gdscript
apply_force(force: Vector2, position: Vector2)  # World-space force at position
apply_central_force(force: Vector2)              # Force through center of mass
apply_impulse(impulse: Vector2, position: Vector2)
apply_central_impulse(impulse: Vector2)
add_central_force(force: Vector2)               # Accumulates each frame
add_force(force: Vector2, position: Vector2)
```

### Example
```gdscript
extends RigidBody2D

func _integrate_forces(state: PhysicsDirectBodyState2D) -> void:
    # Called by physics engine — use instead of _physics_process
    var f := Input.get_vector("left", "right", "up", "down")
    apply_central_force(f * 500.0)
```

---

## Area2D / Area3D

Detection zone — detects bodies/areas entering or leaving. No physical push.

### Properties
```gdscript
monitoring: bool            # Detect overlaps
monitorable: bool           # Be detected by others
gravity: float             # Local gravity override (0 = use global)
gravity_space_override: int  # OverrideMode
linear_damp: float
angular_damp: float
```

### Signals
```gdscript
signal body_entered(body: Node)      # PhysicsBody2D entered
signal body_exited(body: Node)        # PhysicsBody2D exited
signal area_entered(area: Area2D)     # Area2D entered
signal area_exited(area: Area2D)      # Area2D exited
signal body_shape_entered(body_rid: RID, body: Node, body_shape_index: int, local_shape_index: int)
signal body_shape_exited(body_rid: RID, body: Node, body_shape_index: int, local_shape_index: int)
signal area_shape_entered(area_rid: RID, area: Node, area_shape_index: int, local_shape_index: int)
signal area_shape_exited(area_rid: RID, area: Node, area_shape_index: int, local_shape_index: int)
```

### Usage Pattern
```gdscript
extends Area2D

@export var damage_value: int = 10

func _ready() -> void:
    body_entered.connect(_on_body_entered)

func _on_body_entered(body: Node) -> void:
    if body is Player:
        body.take_damage(damage_value)
```

---

## StaticBody2D / StaticBody3D

Immovable physics body. Used for walls, floors, platforms.

```gdscript
extends StaticBody2D

# PhysicsMaterial properties
physics_material_override: PhysicsMaterial
physics_material_override.friction: float     # 0.0-1.0
physics_material_override.bounce: float        # 0.0-1.0
physics_material_override.absorbent: bool
```

---

## Node2D / Node3D

Transform nodes — position, rotation, scale.

### Node2D Properties
```gdscript
position: Vector2
rotation: float              # Radians (2D)
rotation_degrees: float      # Degrees
scale: Vector2
skew: float                  # Shear
z_index: int                 # Sorting order
z_as_relative: bool
transform: Transform2D
global_position: Vector2
global_rotation: float
global_scale: Vector2
global_transform: Transform2D
```

### Node3D Properties
```gdscript
position: Vector3
rotation: Vector3            # Euler angles (XYZ order)
rotation_degrees: Vector3
scale: Vector3
transform: Transform3D
global_position: Vector3
global_rotation: Vector3
global_transform: Transform3D
```

### Transform Utilities
```gdscript
var pos := Vector2(100, 50)

# Rotate toward target (2D)
look_at(target_position: Vector2)
look_at_from_position(pos: Vector2, target: Vector2)

# Transform operations
to_local(global_point: Vector2) -> Vector2     # Global to local
to_global(local_point: Vector2) -> Vector2    # Local to global
get_global_mouse_position() -> Vector2         # Mouse in global coords
```

### Transform3D
```gdscript
var t := Transform3D.IDENTITY
t = Transform3D(Basis, origin)  # Basis = rotation/scale
t * Vector3(1, 0, 0)             # Transform a point
t.orthonormalized()              # Normalize rotation matrix
t.inverse()                      # Inverse transform
```

---

## Sprite2D / Sprite3D

2D image rendering.

```gdscript
extends Sprite2D

texture: Texture2D              # The image
region_enabled: bool            # Use region rect
region_rect: Rect2             # Region rectangle
hframes: int                   # Horizontal frames in texture sheet
vframes: int                   # Vertical frames in texture sheet
frame: int                     # Current frame (0-indexed)
animation: StringName           # Name of Animation from sub-Resources
speed_scale: float             # Animation speed multiplier
centered: bool                  # Center pivot at texture center
offset: Vector2                 # Pivot offset
flip_h: bool                   # Mirror horizontally
flip_v: bool                   # Mirror vertically
modulate: Color                 # Color tint applied to texture
self_modulate: Color            # Color tint applied to texture (including children)
```

### AnimatedSprite2D
```gdscript
extends AnimatedSprite2D

sprite_frames: SpriteFrames   # Animation library
animation: StringName           # Current animation
autoplay: StringName           # Start this animation on _ready
frame: int                     # Current frame
speed_scale: float
playing: bool

# Methods
play(name: StringName = &"", advance: bool = true)
stop()
pause()
is_playing() -> bool
```

### SpriteFrames Resource
```gdscript
# Create in code:
var frames := SpriteFrames.new()
frames.add_animation("idle")
frames.add_animation("run")
frames.set_animation_speed("idle", 8.0)
frames.set_frame("idle", 0, texture)  # frame_index, texture
```

---

## Camera2D / Camera3D

Viewport control — what the player sees.

### Camera2D
```gdscript
extends Camera2D

# Positioning
position: Vector2               # Camera position
zoom: Vector2                    # 1.0 = 100%, 2.0 = 200%
anchor_mode: AnchorMode          # FIXED_TOPLEFT, DRAG_CENTER, DRAG_MARGIN
drag_margin_left: float          # 0-1, drag margin
drag_margin_top: float
drag_margin_right: float
drag_margin_bottom: float

# Smoothing
editor_draw_screen_offset: bool
ignore_rotation: bool            # Don't rotate with parent
drag_enabled: bool               # Mouse drag
drag_smooth_enabled: bool
drag_margin_h_enabled: bool
drag_margin_v_enabled: bool

# Limiting
limit_left: int
limit_top: int
limit_right: int
limit_bottom: int
limit_smoothed: bool
position_smoothing_speed: float  # Smoothing when following

# Methods
make_current()                   # Become the current camera
clear_current()                  # Remove as current
reset_smoothing()                # Snap to target

# Common pattern: follow player
func _ready() -> void:
    position = player.position

func _process(delta) -> void:
    position = position.lerp(player.position, 5.0 * delta)
```

### Camera3D
```gdscript
extends Camera3D

fov: float                  # Field of view (degrees, default 75)
size: float                 # Orthographic size
projection: PROJECTION      # PERSPECTIVE, ORTHOGONAL, FRUSTUM
near: float                 # Near clip plane
far: float                  # Far clip plane
current: bool               # Is this the active camera?
doppler_tracking: int      # How to handle doppler effect
shadow_enabled: bool
</variant>

Methods:
make_current()
</variant>

---

## Timer

Executes a callback after a delay or at intervals.

```gdscript
extends Node

@onready var timer: Timer = $Timer

func _ready() -> void:
    timer.timeout.connect(_on_timer_timeout)
    timer.start(2.0)           # Start with 2 second delay

func _on_timer_timeout() -> void:
    print("Timer fired!")

# Properties:
wait_time: float           # Seconds (default 1.0)
one_shot: bool             # If true, runs once then stops
autostart: bool            # Start automatically on _ready
paused: bool               # Pause/resume
process_callback: int      # TIMER_PROCESS_PHYSICS or TIMER_PROCESS_IDLE
time_left: float           # Remaining time
```

### One-shot with callback
```gdscript
func delayed_call() -> void:
    var t := create_timer(1.0)
    t.timeout.connect(func(): print("1 second later!"))

func create_timer(duration: float) -> Timer:
    var t := Timer.new()
    t.wait_time = duration
    t.one_shot = true
    add_child(t)
    t.start()
    t.timeout.connect(func():
        t.queue_free()  # Clean up
    )
    return t
```

---

## PathFollow2D / PathFollow3D

Move a node along a Path2D/Path3D curve.

```gdscript
extends PathFollow3D

@export var speed: float = 5.0
@export var loop: bool = true
@export var rotate: bool = true  # Align to path tangent

var progress_ratio: float  # 0.0 to 1.0 along entire path
h_offset: float            # Horizontal offset from path
v_offset: float            # Vertical offset from path

func _process(delta: float) -> void:
    progress_ratio += (speed / path_length) * delta
    if progress_ratio >= 1.0:
        if loop:
            progress_ratio = 0.0
        else:
            queue_free()
```

---

## NavigationAgent2D / NavigationAgent3D

Pathfinding and navigation.

```gdscript
extends NavigationAgent2D

var target_position: Vector2

func _ready() -> void:
    velocity_computed.connect(_on_velocity_computed)
    add_to_group("navigation")

func _physics_process(delta) -> void:
    if is_navigation_finished():
        return
    var target = get_next_path_position()
    var velocity = (target - global_position).normalized() * speed
    if velocity_computed:
        set_velocity_forced(velocity)  # Deprecated
    else:
        # Use computed velocity from signal
        pass

func _on_velocity_computed(safe_velocity: Vector2) -> void:
    global_position = global_position.move_toward(
        global_position + safe_velocity * delta, delta * speed)
```

### NavigationServer2D
```gdscript
NavigationServer2D.map_get_path(map: RID, from: Vector2, to: Vector2, 
    navigation_layers: int) -> PackedVector2Array
NavigationServer2D.agent_set_needs_map_update(agent: RID, enabled: bool)
NavigationServer2D.agent_set_target_location(agent: RID, location: Vector2)
```

---

## CollisionShape2D / CollisionShape3D

Define collision geometry. Must be child of a physics body.

### Common 2D Shapes
```gdscript
# RectangleShape2D
extends CollisionShape2D
shape = RectangleShape2D.new()
shape.size = Vector2(64, 64)

# CircleShape2D
shape = CircleShape2D.new()
shape.radius = 32.0

# CapsuleShape2D
shape = CapsuleShape2D.new()
shape.radius = 16.0
shape.height = 48.0

# WorldBoundaryShape2D (infinite plane)
shape = WorldBoundaryShape2D.new()
shape.plane = Plane(Vector3.UP, 0.0)
```

---

## TileMap / TileSet

Grid-based 2D level editor.

```gdscript
extends TileMap

@export var tile_set: TileSet
cell_quadrant_size: int    # Chunks for rendering
format: int                # Tile data format
layer_0/name: StringName
layer_0/enabled: bool
layer_0/z_index: int

# Placing tiles
func _ready() -> void:
    set_cell(0, Vector2i(5, 3), 0, Vector2i(1, 0))  # layer, coords, source, atlas_coords
    erase_cell(0, Vector2i(5, 3))  # Remove tile

# Getting tile at position
func _process(delta) -> void:
    var cell := local_to_map(get_global_mouse_position())
    var tile_data := get_cell_tile_data(0, cell)
```

### TileSet Structure
```
TileSet
├── 0: Single Tile
├── 1: Atlas Tile (spritesheet)
└── 2: Source (gives different variants)
```

---

## Label / RichTextLabel

Text display.

### Label
```gdscript
extends Label

text: String
text_direction: Control.TextDirection
horizontal_alignment: HorizontalAlignment  # LEFT, CENTER, RIGHT, FILL
vertical_alignment: VerticalAlignment        # TOP, CENTER, BOTTOM, FILL
autowrap_mode: TextServer.AutowrapMode
clip_text: bool
max_lines_visible: int
```

### RichTextLabel
```gdscript
extends RichTextLabel

bbcode_enabled: bool
text: String

# Append with BBCode
append_text("[color=red]damage![/color]\n")
push_font(font: Font)
push_color(color: Color)
pop()  # End effect

# BBCode tags:
# [b]bold[/b], [i]italic[/i], [u]underline[/u]
# [color=#ff0000]red[/color]
# [url=link]click[/url]
# [img]path[/img]
# [center]...[/center]
```

---

## Control / Container Nodes

### Control basics
```gdscript
extends Control

# Anchoring
anchor_left, anchor_right, anchor_top, anchor_bottom: float
size_flags_horizontal: int   # SIZE_EXPAND_FILL, etc.
size_flags_vertical: int
custom_minimum_size: Vector2  # Minimum dimensions

# Layout
offset_left, offset_right, offset_top, offset_bottom: float
position: Vector2
size: Vector2
global_position: Vector2
global_size: Vector2
rect_size = size              # Legacy alias

# Pivot
pivot_offset: Vector2         # Rotation/scale pivot in local space
```

### Containers
```
HBoxContainer      # Horizontal row
VBoxContainer      # Vertical column
GridContainer      # Grid (columns property)
HFlowContainer     # Flow wrap horizontally
VFlowContainer     # Flow wrap vertically
CenterContainer    # Centers child
MarginContainer    # Adds margin to child
PanelContainer     # Background + margins
ScrollContainer    # Scrollable child
SplitContainer     # [H/V]SplitContainer
TabContainer       # Tabbed panels
```

```gdscript
extends HBoxContainer

func _ready() -> void:
    var label := Label.new()
    label.text = "Score: 0"
    add_child(label)

    var button := Button.new()
    button.text = "Click Me"
    add_child(button)
```

### Buttons
```gdscript
extends Button

pressed.connect(_on_pressed)
button_pressed: bool
toggle_mode: bool
action_mode: Button.ActionMode  # BUTTON_PRESS, BUTTON_RELEASE
shortcut: Shortcut
shortcut_in_tooltip: bool

# CheckBox / CheckButton
set_pressed_no_signal(true)
toggled.connect(_on_toggled)

# LinkButton
extends LinkButton
```

---

## Reference: Important Classes

| Class | Purpose |
|---|---|
| `Node` | Base for all scene objects |
| `Resource` | Data container, savable to .tres |
| `PackedScene` | .tscn file loaded as binary |
| `SceneTree` | Root scene graph manager |
| `Engine` | Engine time/process info |
| `Input` | Input state and events |
| `Time` | Date/time utilities |
| `Tween` | Property animation |
| `DisplayServer` | Window/screen management |
| `ProjectSettings` | Global project config |
| `ClassDB` | Runtime class information |
| `ResourceLoader` | Async resource loading |
| `ResourceSaver` | Save resources to disk |
| `FileAccess` | Low-level file I/O |
| `JSON` | JSON parsing |
| `Marshalls` | Base64 encode/decode |
