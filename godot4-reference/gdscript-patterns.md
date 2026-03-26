# GDScript Patterns & Advanced Topics — Godot 4
_Supplemental reference. For deep dives, consult: https://docs.godotengine.org/en/stable/_

---

## Class Structure

### Minimal Node Script
```gdscript
extends Node
# Everything starts here
```

### Full Node with Lifecycle
```gdscript
extends Node2D

# Class name for global registration
class_name Player

# Signals
signal health_changed(old_value: int, new_value: int)
signal died()

# Enums
enum State { IDLE, RUNNING, JUMPING, FALLING, DEAD }
enum Facing { LEFT = -1, RIGHT = 1 }

# Constants
const MAX_HEALTH := 100
const MAX_SPEED := 400.0
const JUMP_VELOCITY := -600.0
const GRAVITY := 980.0

# Exports
@export_group("Movement")
@export var speed: float = MAX_SPEED
@export var jump_force: float = JUMP_VELOCITY
@export var gravity_scale: float = 1.0

@export_group("Visuals")
@export var sprite_frames: SpriteFrames
@export var dust_particles: PackedScene

@export_group("Audio")
@export var jump_sound: AudioStream
@export var land_sound: AudioStream

# Public variables
var current_state: State = State.IDLE
var facing: Facing = Facing.RIGHT

# Private variables
var _health: int = MAX_HEALTH
var _is_on_floor_prev: bool = false

# Onready — get node references without null checks
@onready var _sprite: AnimatedSprite2D = $AnimatedSprite2D
@onready var _hitbox: Area2D = $Hitbox
@onready var _hurtbox: Area2D = $Hurtbox
@onready var _jump_buffer_timer: Timer = $JumpBufferTimer
@onready var _coyote_timer: Timer = $CoyoteTimer

func _ready() -> void:
    _hitbox.area_entered.connect(_on_hitbox_entered)
    _coyote_timer.timeout.connect(_on_coyote_timeout)

func _physics_process(delta: float) -> void:
    _update_gravity(delta)
    _update_movement()
    _update_state()
    _move()

func _update_gravity(delta: float) -> void:
    if not is_on_floor():
        velocity.y += GRAVITY * gravity_scale * delta

func _update_movement() -> void:
    var input_dir := Input.get_axis("move_left", "move_right")
    velocity.x = input_dir * speed

func _update_state() -> void:
    # Coyote time detection
    if is_on_floor() and not _is_on_floor_prev:
        _coyote_timer.start()
    _is_on_floor_prev = is_on_floor()

func _move() -> void:
    move_and_slide()
    for i in range(get_slide_collision_count()):
        var col := get_slide_collision(i)
        if col.get_collider() is StaticBody2D:
            print("Collided with static: ", col.get_collider().name)

func take_damage(amount: int) -> void:
    var old := _health
    _health = maxi(0, _health - amount)
    health_changed.emit(old, _health)
    if _health <= 0:
        die()

func die() -> void:
    current_state = State.DEAD
    died.emit()
    queue_free()

func _on_hitbox_entered(area: Area2D) -> void:
    print("Hitbox hit: ", area.name)
```

---

## @export Patterns

### Basic to Advanced
```gdscript
# Simple
@export var damage: int = 10

# Range with slider
@export_range(0, 100, 1, "or_greater") var health_regen: int = 5

# Range with prefix/suffix display
@export_range(0, 10, 1, "or_greater", "suffix:x") var combo_count: int = 3

# File/resource pickers
@export var scene_file: PackedScene
@export var icon: Texture2D
@export var sfx: AudioStream
@export var font: Font
@export var shader: Shader

# NodePath reference
@export var target_node: NodePath

# Multiline string
@export_multiline var dialogue: String = ""

# Color with alpha
@export var tint: Color = Color.WHITE

# In a group
@export_group("Combat")
@export_subgroup("Melee")
@export var melee_damage: int = 20
@export var melee_range: float = 1.5
```

### Conditional Export
```gdscript
@export var weapon_type: String = "sword"
@export var damage: int = 15  # Always shown

# Tool script to hide based on weapon_type
@tool
func _get_property_list() -> Array[Dictionary]:
    var properties := []
    if weapon_type == "bow":
        properties.append({
            "name": "arrow_speed",
            "type": TYPE_FLOAT,
            "hint": PROPERTY_HINT_RANGE,
            "hint_string": "0.1,10.0"
        })
    return properties
```

---

## Typed Arrays and Containers

```gdscript
# Typed arrays (Godot 4)
var integers: Array[int] = [1, 2, 3, 4, 5]
var strings: Array[String] = ["a", "b", "c"]
var vectors: Array[Vector2] = []
var players: Array[Player] = []  # Custom class

# Dictionary with types
var stats: Dictionary[String, int] = {
    "hp": 100,
    "mp": 50,
    "str": 15
}

# Typed dictionary access (Godot 4.3+)
var hp: int = stats["hp"]  # Returns int if typed

# Regular arrays (untyped, runtime mixed)
var mixed: Array = [1, "hello", true, null, Vector2.ZERO]

# Filtering typed arrays
func get_wounded_players() -> Array[Player]:
    return players.filter(func(p): return p.health < p.max_health)

# Map over arrays
func get_player_names() -> Array[String]:
    return players.map(func(p): return p.name)

# Reducing
func total_damage() -> int:
    return inventory.reduce(func(acc, item): return acc + item.damage, 0)
```

---

## Static Functions

```gdscript
class_name MathUtil

# No instance needed — call directly: MathUtil.lerp(a, b, t)
static func lerp(from: float, to: float, weight: float) -> float:
    return from + (to - from) * weight

static func lerp_angle(from: float, to: float, weight: float) -> float:
    var diff := wrapf(to - from, -PI, PI)
    return from + diff * weight

static func approach(current: float, target: float, delta: float) -> float:
    if current < target:
        return minf(current + delta, target)
    else:
        return maxf(current - delta, target)

static func random_point_in_circle(radius: float) -> Vector2:
    var angle := randf() * TAU
    var r := sqrt(randf()) * radius
    return Vector2(cos(angle), sin(angle)) * r

static func direction_to_angle(direction: Vector2) -> float:
    return atan2(direction.y, direction.x)

static func angle_to_direction(angle: float) -> Vector2:
    return Vector2(cos(angle), sin(angle))
```

---

## Inner Classes

```gdscript
class_name Weapon
extends Resource

class MeleeWeapon:
    extends Weapon
    var slash_arc: float
    var recovery_time: float

    func get_damage_at(angle: float) -> float:
        var normalized := absf(angle) / (slash_arc * 0.5)
        return base_damage * (1.0 - normalized * 0.5)

class RangedWeapon:
    extends Weapon
    var projectile: PackedScene
    var projectile_speed: float

    func fire(direction: Vector2) -> void:
        var p = projectile.instantiate()
        p.velocity = direction * projectile_speed
```

---

## await / Async Patterns

```gdscript
# Wait for signal
func _ready() -> void:
    await $AnimationPlayer.animation_finished
    print("Animation done!")
    $Sprite2D.hide()

# Wait with timeout
func with_timeout(signal_to_wait: Signal, timeout: float) -> bool:
    var timer := get_tree().create_timer(timeout)
    var result = await timer.timeout or signal_to_wait
    timer.queue_free()
    return result == signal_to_wait  # True if signal fired first

# Async initialization
var _initialized := false
func _ready() -> void:
    _initialized = true
    await preload_setup()
    print("Setup complete!")

# Wait for scene load
func load_level(path: String) -> void:
    var scene := ResourceLoader.load_threaded_request(path)
    while ResourceLoader.load_threaded_get_status(path) == ResourceLoader.THREAD_LOAD_LOADING:
        await get_tree().process_frame
    var packed = ResourceLoader.load_threaded_get(path)
    get_tree().root.add_child(packed.instantiate())

# ToSignal — convert signal to async
func wait_for_button() -> void:
    var btn := Button.new()
    await ToSignal(btn, "pressed")  # Convert signal to await
```

---

## Duck Typing and Variants

```gdscript
# Godot uses Variant — any type can be stored
var data: Variant = 5
data = "hello"
data = Vector2(1, 2)

# Duck typing — check if it has the method
if object.has_method("take_damage"):
    object.take_damage(10)

# Check node type safely
if node is Player:
    var p := node as Player  # Cast
    p.take_damage(10)

# typeof() for runtime type checking
var t := typeof(data)
match t:
    TYPE_INT:
        print("Integer: ", data)
    TYPE_STRING:
        print("String: ", data)
    TYPE_OBJECT:
        print("Object: ", data.name)
```

---

## Match Statement

```gdscript
match state:
    State.IDLE:
        _play_idle()
    State.RUNNING:
        _play_run()
    State.JUMPING:
        _play_jump()
    _:
        pass  # Default

# With conditionals
match [is_grounded, is_moving]:
    [true, true]:
        play("run")
    [true, false]:
        play("idle")
    [false, _]:
        play("jump" if velocity.y < 0 else "fall")

# Pattern matching with types
match body:
    Player p:
        p.take_damage(damage)
    Enemy e:
        e.receive_attack(damage)
    null:
        pass
```

---

## Tool Mode

Run code in the editor for live preview.

```gdscript
@tool
extends Node2D

@export var line_length: float = 100.0:
    set(value):
        line_length = value
        queue_redraw()  # Trigger redraw when changed in Inspector

func _draw() -> void:
    draw_line(Vector2.ZERO, Vector2.RIGHT * line_length, Color.RED, 2.0)
    draw_arc(Vector2.ZERO, line_length, 0.0, PI * 0.5, 32, Color.GREEN)

# Property validation
@tool
func _get_configuration_warning() -> String:
    if line_length <= 0:
        return "Line length must be positive!"
    return ""
```

---

## Singleton / Autoload Pattern

```gdscript
# File: res://autoload/game_manager.gd
# Registered in: Project > Project Settings > Autoload

class_name GameManager
extends Node

signal score_changed(new_score: int)
signal game_over()

var score: int = 0
var is_paused: bool = false
var current_level: String = ""

func _ready() -> void:
    process_mode = Node.PROCESS_MODE_ALWAYS  # Run even when paused

func add_score(points: int) -> void:
    score += points
    score_changed.emit(score)

func load_level(level_name: String) -> void:
    current_level = level_name
    get_tree().change_scene_to_file("res://levels/" + level_name + ".tscn")

# Access from anywhere:
# GameManager.score += 100
# GameManager.game_over.connect(_on_game_over)
```

---

## Custom Resources

```gdscript
# Define
class_name ItemData
extends Resource
@export var name: String = "Unknown Item"
@export var description: String = ""
@export var icon: Texture2D
@export var max_stack: int = 99
@export var rarity: int = 1  # 1=common, 2=uncommon, 3=rare

class_name WeaponData
extends ItemData
@export var damage: int = 10
@export var attack_speed: float = 1.0
@export var range: float = 1.5

# Usage in editor:
# Create .tres file: res://resources/items/iron_sword.tres
# Attach as @export var weapon: WeaponData

# Programmatic creation:
var sword := WeaponData.new()
sword.name = "Iron Sword"
sword.damage = 15
sword.rarity = 2
sword.icon = preload("res://art/icons/sword.png")
ResourceSaver.save(sword, "res://data/sword.tres")
```

---

## Save/Load System

```gdscript
class_name SaveGame
extends Resource

@export var version: int = 1
@export var timestamp: int
@export var player_name: String
@export var score: int
@export var player_position: Vector2
@export var inventory: Array[String]
@export var quest_flags: Dictionary[String, bool]

static func save_to_file(path: String, data: SaveGame) -> Error:
    return ResourceSaver.save(data, path)

static func load_from_file(path: String) -> SaveGame:
    if FileAccess.file_exists(path):
        return ResourceLoader.load(path, "",
            ResourceLoader.CACHE_MODE_IGNORE) as SaveGame
    return null

# Usage:
var save := SaveGame.new()
save.timestamp = Time.get_unix_time_ms()
save.player_position = player.global_position
save.score = ScoreManager.score
var err := SaveGame.save_to_file("user://save_1.tres", save)
```

---

## Performance Tips

```gdscript
# Cache node references (don't search every frame)
@onready var _collider := $CollisionShape2D

# Use object pooling instead of instancing/freeing
var _pool: Array[Bullet] = []

func get_bullet() -> Bullet:
    if _pool:
        return _pool.pop_back()
    return preload("res://bullet.tscn").instantiate()

func return_bullet(b: Bullet) -> void:
    b.queue_free()  # Or hide and add to pool
    _pool.append(b)

# Use set_deferred for physics objects
collider.set_deferred("disabled", true)

# Batch array operations
for i in range(array.size()):
    array[i] *= 2

# Avoid string operations in tight loops
# Use StringName for node paths and group names
var group_name := &"enemies"  # StringName literal
get_tree().get_nodes_in_group(group_name)

# Use fixed_process for physics-heavy code
# Use process for rendering/game logic
```

---

## Callable Patterns

```gdscript
# Named method
something.connect(Callable(self, "_on_event"))

# Lambda / anonymous function (Godot 4)
something.connect(func():
    print("Event fired!")
)

something.connect(func(x):
    print("Value: ", x)
)

# With argument binding
func _on_damage(amount: int, source: Node) -> void:
    health -= amount

var cb := Callable(self, "_on_damage").bind(5)  # Pre-bind 5 as amount
cb.call(source_node)  # Calls _on_damage(5, source_node)

# Check validity before calling
if cb.is_valid():
    cb.call()
```
