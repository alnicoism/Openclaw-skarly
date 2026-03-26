# Core API Reference — Godot 4
_Supplemental reference. For deep dives, consult: https://docs.godotengine.org/en/stable/_

---

## Node

Base class for everything. Every object in the scene tree is a Node.

### Properties
```gdscript
name: StringName          # Node's name in tree (unique among siblings)
unique_name_in_owner: bool
scene_file_path: String   # .tscn path this node was instanced from
multiline: bool
editable_instance: bool
process_mode: ProcessMode # Always, Pausable, When Paused, Disabled
process_priority: int
process_physics_priority: int
</variant>

### Key Methods
```gdscript
add_child(node: Node, force_readable_name: bool = false, internal: int = 0)
remove_child(node: Node, free_usage: bool = true)
get_child(index: int, include_internal: bool = false) -> Node
get_children(include_internal: bool = false) -> Array[Node]
get_parent() -> Node
get_node(path: NodePath) -> Node
has_node(path: NodePath) -> bool
find_child(pattern: String, recursive: bool = true, owned: bool = true) -> Node
find_children(pattern: String, recursive: bool = true, owned: bool = true) -> Array[Node]
get_tree() -> SceneTree
duplicate(flags: int = 15) -> Node
queue_free()           # Safe removal — deletes after current frame
free()                 # Immediate deletion (dangerous mid-frame)
reparent(new_parent: Node, keep_global_position: bool = true)
</variant>

### Lifecycle Signals
```gdscript
signal tree_entered()      # Node entered the SceneTree
signal tree_exiting()      # Node exiting the SceneTree
signal tree_exited()        # Node exited the SceneTree
signal ready()              # _ready() called, children are set up
signal child_entered_tree(child: Node)
signal child_exiting_tree(child: Node)
signal resized()            # Size changed
</variant>

### Processing
```gdscript
_process(delta: float)              # Every rendered frame
_physics_process(delta: float)      # Fixed timestep (60Hz default)
_input(event: InputEvent)
_unhandled_input(event: InputEvent)  # Not consumed by GUI
_unhandled_key_input(event: InputEvent)
</variant>

### Groups
```gdscript
add_to_group(group: String, persistent: bool = false) -> void
remove_from_group(group: String) -> void
is_in_group(group: String) -> bool
</variant>

### Notifications
```gdscript
# Notification codes (passed to _notification):
NOTIFICATION_ENTER_TREE = 10
NOTIFICATION_EXIT_TREE = 11
NOTIFICATION_READY = 13
NOTIFICATION_PHYSICS_PROCESS = 16
NOTIFICATION_PROCESS = 17
NOTIFICATION_INTERNAL_PROCESS = 18
NOTIFICATION_INTERNAL_PHYSICS_PROCESS = 19
NOTIFICATION_WM_ABOUT = 1007

_notification(what: int)  # Override for custom notification handling
</variant>
```

---

## SceneTree

Root of the active scene graph. Accessed via `get_tree()`.

### Properties
```gdscript
root: Window                    # The main viewport/window
current_scene: Node             # The active scene at root
paused: bool                    # Global pause state
debugger_enabled: bool
</variant>

### Methods
```gdscript
quit(exit_code: int = 0)              # Exit the application
reload_current_scene() -> Error       # Reload active scene
change_scene_to_file(path: String) -> Error
change_scene_to(packed_scene: PackedScene) -> Error

# Multiscene
get_nodes_in_group(group: String) -> Array[Node]
get_first_node_in_group(group: String) -> Node
call_group(group: String, method: String, ...)
call_group_flags(flags: int, group: String, method: String, ...)
notify_group(group: String, notification: int)
get_parent_count(node: Node) -> int
get_node_count() -> int

# Scene loading
create_tween() -> Tween
```

### SceneTree Multiplayer
```gdscript
root_multiplayer: MultiplayerAPI
multiplayer_peer: MultiplayerPeer
multiplayer: MultiplayerAPI  # Default MP API for this tree
```

---

## Resource

Data container. Resources can be saved to disk (.tres, .res) and shared between nodes.

### Properties
```gdscript
resource_local_to_scene: bool  # If true, each scene instance gets its own copy
resource_name: String
resource_path: String
resource_uid: int
</variant>

### Methods
```gdscript
setup_local_to_scene()            # Called when resource is duplicated for local use
take_over_path(new_path: String)   # Redirect future loads to this resource
duplicate(flags: int = 15) -> Resource
</variant>

### Custom Resources
```gdscript
class_name MyData
extends Resource
@export var hp: int = 100
@export var mp: int = 50

# Save
var data = MyData.new()
ResourceSaver.save(data, "res://data/my_data.tres")

# Load
var data = load("res://data/my_data.tres")
```

---

## PackedScene

A scene file (.tscn) stored as a binary resource.

```gdscript
var scene: PackedScene = preload("res://scenes/enemy.tscn")

# Instantiate
var instance = scene.instantiate()
add_child(instance)

# Or via ResourceLoader
var packed = ResourceLoader.load("res://scenes/enemy.tscn") as PackedScene
var inst = packed.instantiate()
```

---

## Signals — Full Reference

```gdscript
# Declaration
signal my_signal(value: int)
signal clicked(position: Vector2, button: MouseButton)

# Built-in Node signals
signal body_entered(body: Node2D)           # PhysicsBody2D entered
signal body_exited(body: Node2D)            # PhysicsBody2D exited
signal area_entered(area: Area2D)           # Area2D entered
signal area_exited(area: Area2D)            # Area2D exited
signal body_shape_entered(body_rid: RID, body: Node2D, body_shape_index: int, local_shape_index: int)
signal input_event(viewport: Node, event: InputEvent, shape_idx: int)
signal mouse_entered()
signal mouse_exited()
signal tree_entered()
signal tree_exited()
signal ready()
signal visibility_changed()
signal screen_entered()      # Visible on screen
signal screen_exited()       # No longer visible
```

### Signal Connection Options
```gdscript
CONNECT_DEFERRED = 1      # Connect at end of frame (safe for adding/removing nodes)
CONNECT_ONE_SHOT = 2     # Auto-disconnect after first emit
CONNECT_RETAINED = 4      # Retain connection when node is queued/free'd
CONNECT_LOCAL = 8         # Only call methods defined in this class

# Deferred connection
signal_connected.connect(callable, CONNECT_DEFERRED)
```

---

## Input

```gdscript
# Action-based input
Input.is_action_pressed(action: String) -> bool
Input.is_action_just_pressed(action: String) -> bool  # True for 1 frame only
Input.is_action_just_released(action: String) -> bool

# Input map actions defined in Project Settings > Input Map
Input.get_axis(negative_action: String, positive_action: String) -> float

# Raw input
Input.event_scancode_pressed(scancode: int) -> bool
Input.event_pressed(event: InputEvent) -> bool

# Mouse
Input.get_global_mouse_position() -> Vector2
Input.get_global_mouse_delta() -> Vector2
Input.set_global_mouse_mode(mode: DisplayServer.MouseMode)
Input.warp_mouse_to_position(pos: Vector2)

# Joypad
Input.get_joy_axis(device: int, axis: JoyAxis) -> float
Input.get_joy_name(device: int) -> String
```

### InputEvent Types
```gdscript
InputEvent                # Base class
├── InputEventAction      # InputMap action
├── InputEventKey         # Keyboard
├── InputEventMouseButton # Mouse buttons
├── InputEventMouseMotion # Mouse movement
├── InputEventJoypadButton
├── InputEventJoypadMotion
├── InputEventScreenTouch
├── InputEventGesture
└── InputEventShortcut
```

---

## Tween

Animate properties over time without writing per-frame code.

```gdscript
var tween = create_tween()  # On Node, returns SceneTreeTween

# Property animation
tween.tween_property(node, "position", Vector2(100, 0), 0.5)
tween.tween_property(sprite, "modulate:a", 0.0, 0.3)
tween.tween_property(label, "text", "Hello!", 0.2)

# Interpolate
tween.tween_method(callable, from: float, to: float, duration: float)

# Chain
tween.tween_property(...).from(...)
tween.tween_callback(callable)  # Execute code at this point
tween.tween_interval(0.5)      # Wait

# Control
tween.set_parallel(true)        # Animations run simultaneously
tween.set_trans(Tween.TRANS_SINE)  # Easing type
tween.set_ease(Tween.EASE_IN_OUT)  # Easing direction

# Sequences
var seq = create_tween().set_parallel(false)
seq.tween_property(...)  # Runs sequentially
seq.play()

# Binding (prevent reference issues)
tween.bind(node)

# KILL
tween.kill()              # Cancel
tween.custom_step(delta)  # Manual stepping (for deterministic animation)
```

### Tween Easing Types
```
TRANS_LINEAR
TRANS_SINE       # Smooth in/out
TRANS_QUINT      # Strong smooth
TRANS_QUAD       # Moderate smooth
TRANS_ELASTIC    # Bouncy
TRANS_CUBIC      # Moderate
TRANS_BOUNCE     # Physical bounce
TRANS_BACK       # Overshoot then settle
```

### Tween Callback
```gdscript
tween.tween_callback(func():
    print("Animation complete!")
).set_delay(0.5)
```

---

## File System Paths

```gdscript
res://              # Project root (read-only in exported games)
user://             # Save data directory (writable, per-user)
user://saves/       # Custom save folder

# Examples
"res://scenes/player.tscn"
"user://savegame_" + str(current_slot) + ".tres"

# Path utilities
get_project_document_dir()  # OS-specific documents folder
```

---

## Display / Window

```gdscript
DisplayServer.window_set_title("My Game")
DisplayServer.window_set_size(Vector2i(1280, 720))
DisplayServer.window_set_mode(DisplayServer.WINDOW_MODE_WINDOWED)
DisplayServer.window_set_flag(DisplayServer.WINDOW_FLAG_RESIZEABLE, true)

# Screen
DisplayServer.screen_get_size()
DisplayServer.screen_get_position()
DisplayServer.window_get_size()
```

---

## Time / Engine

```gdscript
Engine.time_scale        # 1.0 = normal, 0.0 = paused, 2.0 = fast
Engine.max_fps           # Target FPS
Engine.physics_ticks_per_second  # Default 60
Engine.get_frames_per_second()
Engine.get_process_time()  # CPU time in seconds

Time.get_ticks_msec()     # Milliseconds since start
Time.get_unix_time_ms()   # Unix timestamp
Time.get_time_string_from_system()  # Human-readable time
```

---

## SceneTree vs Tree Lifecycle

```
Application Start
    ↓
Engine Init
    ↓
SceneTree.root enters tree
    ↓
_autoload_setup()        # Autoloads created
    ↓
SceneTree.enter_tree()
    ↓
For each root node:
  _enter_tree()           # About to enter tree
  _ready() (if ready)     # Children set up, signals connected
  _process(_)
    ↓
SceneTree.exit_tree()     # Scene ending
```
