# KNOW.md — Skarly's Godot 4 Knowledge Base

_This file is read at the start of every session. Keep it concise but complete — it's what Skarly "just knows."_
_Source: Godot 4.6 stable docs + practical experience_

---

## 🚀 Godot 4 Overview

- **Engine**: Open-source, MIT licensed, community-driven
- **Version**: 4.x (current stable)
- **Languages**: GDScript (native), C# (via Mono), GDExtension (C++), and more via third-party
- **Renderer**: Vulkan-based Forward+, with Mobile and Compatibility backends
- **2D and 3D**: Separate engines (not shared like Unity), both purpose-built
- **Scene system**: Everything is a scene — a tree of nodes
- **No exceptions**: Godot does not use C++ exceptions; use `push_error()` / `push_warning()` instead

---

## 🏗️ Core Architecture

### The Scene Tree
```
Engine Root
└── Main Loop
    └── SceneTree
        └── Root Node (Viewport)
            ├── Child Scenes (trees of nodes)
            └── Autoloads (singleton nodes)
```

- The **SceneTree** is the root of all active scenes
- Scenes are **trees of Nodes**
- Scenes can be **instanced** (added as a child node multiple times)
- Every node has exactly one **parent** and zero or more **children**

### Nodes
- The fundamental building block
- Every node inherits from `Node`
- Common node types:
  - `Node` — base class
  - `Node2D` — 2D transform node
  - `Node3D` — 3D transform node
  - `Control` — UI base class
  - `CharacterBody2D` / `CharacterBody3D` — player-controlled physics bodies
  - `RigidBody2D` / `RigidBody3D` — simulated physics bodies
  - `StaticBody2D` / `StaticBody3D` — immovable physics bodies
  - `Area2D` / `Area3D` — detection zones (overlap/enter/exit)
  - `Sprite2D` / `Sprite3D` — 2D/3D sprite rendering
  - `AnimatedSprite2D` / `AnimatedSprite3D` — sprite animation
  - `Camera2D` / `Camera3D` — viewport control
  - `Timer` — delayed/callback execution
  - `PathFollow2D` / `PathFollow3D` — follow a Path2D/Path3D

### Signals
- Observer pattern — nodes emit signals, other nodes connect to them
- Decouples systems — the emitter doesn't need to know who listens
- Defined with `signal my_signal` or via `Signal` class
- Connect: `node.signal.connect(callable)`
- Built-in signals on many nodes: `body_entered`, `tree_entered`, `ready`, etc.

```gdscript
# Define a signal
signal health_changed(new_value)

# Emit it
health_changed.emit(100)

# Connect to it
node.health_changed.connect(_on_health_changed)

# Built-in Node signals
func _ready() -> void:      # Node entered scene tree
    pass
func _enter_tree() -> void: # Node about to enter tree
    pass
func _exit_tree() -> void:  # Node exiting tree
    pass
func _process(delta) -> void:      # Every frame
    pass
func _physics_process(delta) -> void: # Every physics frame (fixed timestep)
    pass
func _input(event) -> void:  # Raw input event
    pass
func _unhandled_input(event) -> void: # Input not consumed by GUI
    pass
```

---

## 🎮 Physics

### Physics Process Order
1. `_physics_process(delta)` — fixed timestep (default 60 Hz), use for physics
2. `_process(delta)` — every frame, use for rendering/game logic

### Body Types
```gdscript
# CharacterBody2D — player-controlled (you write the movement)
extends CharacterBody2D

func _physics_process(delta) -> void:
    var speed := 400.0
    var direction := Input.get_axis("ui_left", "ui_right")
    velocity.x = direction * speed
    move_and_slide()

# RigidBody2D — simulated physics (engine controls motion)
extends RigidBody2D
# Set mode: RigidBody2D.MODE_STATIC, MODE_KINEMATIC, MODE_RIGID

# StaticBody2D — immovable (collides but doesn't move)
extends StaticBody2D

# Area2D — detection only (no physical push)
extends Area2D
func _on_area_entered(body: Node2D) -> void:
    print("Entered: ", body.name)
```

### Common Physics Methods
```gdscript
move_and_collide(delta)    # KinematicBody2D (deprecated, use CharacterBody)
move_and_slide()           # CharacterBody2D/3D — handles slope, wall collisions
move_and_slide_with_snapping()  # CharacterBody with floor snapping
get_slide_collision_count()    # How many collisions happened last slide
get_slide_collision(index)     # Collision data at index
force_update_transform()        # Push transform changes to physics engine
```

### Layers and Masks
- **Layers**: "I exist on these layers" (what the body can be hit by)
- **Masks**: "I detect these layers" (what the body collides with)
- A collision only happens if **both** bodies have each other's layers in their masks

---

## 📜 GDScript

### Language Basics

```gdscript
# Variables
var speed: int = 100
var name := "Skarly"  # type inferred
var health: int = 100:
    set(value):
        health = clamp(value, 0, max_health)
var is_dead := false

# Constants
const MAX_SPEED := 500.0

# Enums
enum State { IDLE, RUN, JUMP }
var current_state: State = State.IDLE

# Functions
func _ready() -> void:
    pass

func take_damage(amount: int) -> void:
    health -= amount
    print("Took %d damage, now %d HP" % [amount, health])

# Type hints (recommended in Godot 4)
var player: Player = null
func heal(target: CharacterBody2D, amount: int) -> void:
    target.health += amount

#match (GDScript switch)
match state:
    State.IDLE:
        pass
    State.RUN:
        pass
    _:
        pass
```

### @export Variables
```gdscript
@export var speed: int = 400          # Editable in Inspector
@export_range(0, 100) var health: int = 100
@export_range(0, 100, 1, "or_greater") var damage: int = 10
@export var file_path: String = ""    # File picker in Inspector
@export var scene: PackedScene         # Scene picker in Inspector
@export var texture: Texture2D        # Resource picker
@export var node_path: NodePath       # Node reference in scene

# Tool mode — run code in Editor
@tool
func _get_configuration_warning() -> String:
    return "Configure me in the Inspector!" if speed == 0 else ""
```

### @onready — Delayed Node Reference
```gdscript
@onready var sprite: Sprite2D = $Sprite2D
@onready var anim: AnimationPlayer = $AnimationPlayer
@onready var label: Label = $Control/Label

# With path
@onready var enemy := $Enemies/SpawnPoint/Enemy as CharacterBody2D
```

### Static Typing in GDScript
```gdscript
extends Node

@export var base_damage: int = 10
@export var attack_speed: float = 1.5

# GDScript 4.0+ typed mode (strict)
var _current_combo: int = 0
var _combo_timer: float = 0.0

func perform_attack() -> void:
    var damage: int = base_damage * (_current_combo + 1)
    _current_combo = (_current_combo + 1) % 3
```

### Inheritance
```gdscript
class_name Player
extends CharacterBody2D

class_name Enemy
extends CharacterBody2D

# Inner classes
class HealthBar extends ProgressBar:
    var target: CharacterBody2D
```

### Arrays and Dictionaries
```gdscript
var items: Array = ["sword", "shield", "potion"]
var stats: Dictionary = {"hp": 100, "mp": 50, "str": 15}
var mixed: Array = [1, "hello", true, null]

# Typed arrays (Godot 4)
var ints: Array[int] = [1, 2, 3]
var strings: Array[String] = ["a", "b", "c"]
var bodies: Array[CharacterBody2D] = []
```

### await / Async
```gdscript
func _ready() -> void:
    # Wait for a signal
    await $Timer.timeout
    print("Timer done!")

    # Wait for a custom signal
    await health_changed
    update_ui()

    # Get node scene (when instanced)
    var scene = get_tree().current_scene
```

### Groups
```gdscript
# Add node to group
add_to_group("enemies")

# Get all nodes in group
func damage_all_enemies(amount: int) -> void:
    for enemy in get_tree().get_nodes_in_group("enemies"):
        enemy.take_damage(amount)
```

### @static_func — No Instance Needed
```gdscript
class_name MathUtils

static func lerp(a: float, b: float, t: float) -> float:
    return a + (b - a) * t

static func direction_to_angle(direction: Vector2) -> float:
    return direction.angle()
```

---

## 🎯 C# in Godot 4

### Setup
- Requires Mono version of Godot (download from godotengine.org)
- Requires .NET SDK installed
- Project must have `.cs` file as root script to enable C# globally

### Syntax Differences from GDScript

```csharp
using Godot;

public partial class Player : CharacterBody2D
{
    [Export] public int Speed { get; set; } = 400;
    [Export] public int JumpVelocity { get; set; } = -400;

    public override void _Ready()
    {
        // Node acquisition
        var sprite = GetNode<Sprite2D>("Sprite2D");
    }

    public override void _PhysicsProcess(double delta)
    {
        // Movement logic
        Vector2 velocity = Velocity;
        velocity.X = Input.GetAxis("ui_left", "ui_right") * Speed;
        Velocity = velocity;
        MoveAndSlide();
    }
}
```

### Key Differences: GDScript vs C#

| Feature | GDScript | C# |
|---|---|---|
| Type inference | `:=` | `var` (or explicit) |
| Null | `null` | `null` |
| Inheritance | `extends Node2D` | `: Node2D` |
| Virtual _Ready | `_ready()` | `public override void _Ready()` |
| Signal connection | `signal X` + `.X.connect()` | `[Signal]` + `EmitSignal(SignalName.X)` |
| Export | `@export` | `[Export]` attribute |
| No `func` keyword | `func _process(delta)` | `public override void _Process(double delta)` |
| Property | `var x := 5` | `public int X { get; set; } = 5` |
| Override virtual | automatic | `public override` |
| Dispose | `free()` | `QueueFree()` |

### C# Godot-Specific Notes
- **EmitSignal** — use string name: `EmitSignal(SignalName.MySignal, arg1, arg2);`
- **Callable** — use `new Callable(instance, "method_name")`
- **GodotObject subclasses** — use `GetNode<T>()` / `new()` pattern
- **No dynamic arrays** — use `Godot.Collections.Array`
- **StringName** preferred over `string` for node paths
- **Dispose pattern** — `QueueFree()` for nodes, `Dispose()` for resources

---

## 🆚 GDScript vs C# — When to Use Which

### GDScript — Use When:
- Prototyping or indie projects
- You want fastest iteration (hot reload in editor)
- The codebase is mostly game logic, not performance-critical
- You're working alone or with a small team
- You want seamless editor integration out of the box
- Most game logic, UI, simple tools, plugins

### C# — Use When:
- You're from a .NET background (C# is natural)
- Need to integrate with existing C# libraries
- Large team with clear separation of concerns
- Complex systems that benefit from OOP tooling
- Async/await patterns (`await ToSignal(timer, Timer.SignalName.Timeout)`)

### Performance Reality
- **C# is faster** for CPU-intensive operations (physics calculations, pathfinding, heavy math)
- **GDScript is fast enough** for most game logic
- Godot 4's GDScript is significantly faster than Godot 3
- For truly performance-critical code: GDExtension (C++) or `static func` compiled sections

---

## 🧩 Common Patterns

### Autoload (Singleton)
```gdscript
# Project > Project Settings > Autoload
# Add: GameState (path: res://autoload/game_state.gd)
# Access anywhere:
GameState.score += 10
GameState.player_died.emit()
```

### Scene Instancing
```gdscript
# In code:
var enemy_scene = preload("res://scenes/enemy.tscn")
var enemy = enemy_scene.instantiate()
enemy.position = Vector2(100, 200)
add_child(enemy)

# Or via PackedScene:
@export var enemy_scene: PackedScene
func spawn() -> void:
    var e = enemy_scene.instantiate()
    add_child(e)
```

### State Machine
```gdscript
enum State { IDLE, RUN, JUMP, FALL }

func _physics_process(delta) -> void:
    var new_state = get_next_state()
    if new_state != state:
        exit_state(state)
        state = new_state
        enter_state(state)
    physics_update(state, delta)

func get_next_state() -> State:
    if not is_on_floor():
        return State.FALL if velocity.y > 0 else State.JUMP
    if absf(velocity.x) > 0:
        return State.RUN
    return State.IDLE
```

### Resource-Based Data
```gdscript
# Define a Resource
class_name Item
extends Resource
@export var name: String
@export var damage: int
@export var icon: Texture2D

# Create via .tres file or code:
var sword = Item.new()
sword.name = "Iron Sword"
sword.damage = 15
```

### Custom Resource for Save/Load
```gdscript
class_name SaveData
extends Resource
@export var score: int
@export var player_position: Vector2
@export var inventory: Array[String]

# Save:
var save := SaveData.new()
save.score = Score.current
ResourceSaver.save(save, "user://savegame.tres")

# Load:
var save = ResourceLoader.load("user://savegame.tres", "",
    ResourceLoader.CACHE_MODE_IGNORE)
```

### Dependency Injection via @export
```gdscript
@export var health_component: HealthComponent
@export var hurtbox: Area2D

func _ready() -> void:
    hurtbox.area_entered.connect(_on_hurtbox_entered)
```

### Tween Animation (Code-Based)
```gdscript
func _ready() -> void:
    var tween := create_tween()
    tween.tween_property(sprite, "modulate:a", 0.0, 0.5)
    tween.tween_callback(remove_child.bind(sprite))
    tween.play()

# Chaining
var tween := create_tween().set_parallel(true)
tween.tween_property(sprite, "position", Vector2(100, 0), 0.5)
tween.tween_property(label, "modulate:a", 0.0, 0.3)
```

---

## 🔧 Godot 4 Specifics

### New in Godot 4
- **`move_and_slide()`** — now has built-in velocity, no need to set `velocity` property separately (though you still set it)
- **Typed arrays**: `Array[int]`, `Array[String]`, etc.
- **`@export_range`** with prefix/suffix and sliders
- **Static functions** in classes (no instance needed)
- **`match`** statement (pattern matching)
- **`class_name`** for global type registration
- **`super()`** keyword instead of `.`
- **`UUID`** class for generating unique IDs
- **4.1+**: Scene inheritance improvements, `MultiplayerSpawner`, `MultiplayerSynchronizer`
- **4.2+**: TileMap improvements, Cloth2D,货车
- **4.3+**: New 2D physics (separate from 3D), `CharacterBody3D` improvements
- **4.4+**: Enhanced editor tooling, new rendering features

### Physics Layers (Godot 4)
```gdscript
# In code, use layer_number (1-indexed):
physics_object.layer = 1 << 0  # Layer 1
physics_object.mask = 1 << 2    # Detect layer 3

# Or use names (set in project settings > layer names)
# Then in code:
collision_layer = 0b0001        # Layer 1
collision_mask = 0b0100         # Layer 3
```

### Signal Syntax (Godot 4)
```gdscript
# Define
signal health_changed(old: int, new: int)

# Connect (multiple ways)
node.health_changed.connect(_on_health_changed)
node.health_changed.connect(_on_health_changed, CONNECT_ONE_SHOT)
node.health_changed.connect(Callable(self, "_on_health_changed"))

# Auto-connect in Editor: set Autoload + enable "Make Mutable" in script
```

---

## 📁 Project Structure

```
project.godot          # Project configuration
project.icon.png       # Editor icon
scenes/                # .tscn files
    player/
        Player.tscn
        PlayerController.gd
    enemies/
        Enemy.tscn
    ui/
        HUD.tscn
        PauseMenu.tscn
scripts/                # Optional: pure .gd files
    autoload/
        GameState.gd
        AudioManager.gd
    utilities/
        MathUtils.gd
        SaveLoad.gd
resources/
    items/
        Item.tres
    characters/
        PlayerStats.tres
export_presets.cfg     # Export templates
```

---

## ⚠️ Common Gotchas

1. **`_ready` vs `_enter_tree`**: `_enter_tree` fires when entering tree, `_ready` when both self AND all children entered
2. **`move_and_slide()`** changes the `velocity` vector — it doesn't take velocity as an argument
3. **Group names are strings** — "Enemies" ≠ "enemies"
4. **`@onready` variables are null until `_ready` is called**
5. **Signals must be connected before emitting** (unless one-shot or deferred)
6. **Static typing is optional** but recommended — Godot 4 makes it easy with `:=`
7. **GDScript arrays/dicts are value types in some contexts** — use `.duplicate()` for copies
8. **File paths on disk** use `user://` for save data (AppData), `res://` for game resources
9. **Tween callbacks** must be `Callable` — raw function references won't work
10. **C# requires .NET SDK** — without it, C# scripts won't compile (use Mono build of Godot)
11. **C# in Godot 4.6 requires .NET 8.0** — .NET 6 is no longer supported for C# scripting

---

## 🆕 What's New in Godot 4.6

- **Jolt Physics is now the default** for new 3D projects (was GodotPhysics in 4.4/4.5)
- **.NET 8.0 required** for C# scripting (upgrade from .NET 6)
- **Major IK overhaul**: `SkeletonModifier3D` → `IKModifier3D` base class, new JacobianIK, SpringBoneSimulator3D, LimitAngularVelocityModifier3D, BoneTwistDisperser3D
- **`Dictionary.reserve()`** — pre-allocate dictionary capacity
- **`Tween.kill()`** now kills subtweens too
- **Coroutine warning**: opt-in warning when calling coroutine without `await`
- **Integer division warning**: warns when dividing integers
- **Animation timeline** drag-to-resize on the timeline track
- **Orbit snapping** in 3D viewport
- **"Use Local Space"** option in 2D editor
- Random pitch in audio randomizer now uses **semitones**, not frequency multiplier
- For full changelog: https://docs.godotengine.org/en/4.6/about/docs_changelog.html
