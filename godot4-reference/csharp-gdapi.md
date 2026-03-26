# C# Godot 4 Integration Reference
_Supplemental reference. For deep dives, consult: https://docs.godotengine.org/en/stable/_

---

## Language Basics

### Hello World
```csharp
using Godot;

public partial class HelloWorld : Node
{
    public override void _Ready()
    {
        GD.Print("Hello, Godot!");
    }
}
```

### Variables and Types
```csharp
// Type inference
var speed = 400.0f;  // float
var name = "Skarly"; // string
var health = 100;    // int

// Explicit typing
private int _health = 100;
private float _speed = 400f;
private string _playerName = "Player";
private bool _isDead = false;
private Vector2 _direction = Vector2.Zero;

// Constants
private const int MAX_HEALTH = 100;
private const float GRAVITY = 980f;

// Property with backing field
private int _maxHealth = 100;
public int MaxHealth
{
    get => _maxHealth;
    set => _maxHealth = Mathf.Clamp(value, 0, 999);
}

// Export (Inspector-editable)
[Export] public int Speed { get; set; } = 400;
[Export] public float JumpVelocity { get; set; } = -600f;
[Export] private NodePath TargetNodePath;

// Export group
[ExportGroup("Movement")]
[Export] private float _gravity = 980f;

[ExportGroup("Combat")]
[Export] private int _baseDamage = 10;
[Export] private float _attackRange = 1.5f;
```

---

## Node Acquisition

```csharp
// Standard
private Sprite2D _sprite;
public override void _Ready()
{
    _sprite = GetNode<Sprite2D>("Sprite2D");
    _sprite.Modulate = Colors.Red;
}

// From child path
private AnimationPlayer _anim;
_anim = GetNode<AnimationPlayer>("States/AnimationPlayer");

// From exported NodePath
[Export] private NodePath _targetPath;
private Node _target;
_target = GetNode(_targetPath);

// Null-safe acquisition
var node = TryGetNode<Sprite2D>("Sprite2D", out var sprite);
if (sprite != null) { /* ... */ }

// Finding children
var enemies = GetTree().GetNodesInGroup("enemies");
var firstChild = GetNodeOrNull<AnimatedSprite2D>("AnimatedSprite2D");
```

---

## Lifecycle Methods

```csharp
public override void _Ready()           // Called when node enters scene tree
public override void _EnterTree()        // Called when node is about to enter tree
public override void _ExitTree()         // Called when node exits tree
public override void _Process(double delta)           // Every frame
public override void _PhysicsProcess(double delta)     // Fixed timestep (60Hz)
public override void _Input(InputEvent @event)         // Raw input
public override void _UnhandledInput(InputEvent @event)  // Unconsumed input
public override void _Draw()              // Custom rendering (CallDeferred equivalent)

[Export] private bool _showDebug = false;
public override void _DebugDraw()
{
    if (_showDebug)
    {
        DrawLine(Vector2.Zero, Vector2.Right * 100, Colors.Red, 2.0f);
    }
}
```

---

## Physics / Movement

```csharp
public partial class Player : CharacterBody2D
{
    [Export] private int Speed = 400;
    [Export] private int JumpVelocity = -600;
    [Export] private float Gravity = 980f;

    public override void _PhysicsProcess(double delta)
    {
        // Apply gravity
        if (!IsOnFloor())
        {
            Velocity = new Vector2(Velocity.X, Velocity.Y + Gravity * (float)delta);
        }

        // Jump input
        if (Input.IsActionJustPressed("ui_accept") && IsOnFloor())
        {
            Velocity = new Vector2(Velocity.X, JumpVelocity);
        }

        // Direction input
        float direction = Input.GetAxis("ui_left", "ui_right");
        Velocity = new Vector2(direction * Speed, Velocity.Y);

        // Move
        MoveAndSlide();
    }
}
```

---

## Signals in C#

```csharp
// Declare signal
[Signal]
public delegate void HealthChangedEventHandler(int oldValue, int newValue);

[Signal]
public delegate void DiedEventHandler();

// Declare event field (for external connection)
[Export] private int _maxHealth = 100;
private int _health = 100;

public int Health
{
    get => _health;
    set
    {
        int old = _health;
        _health = Mathf.Clamp(value, 0, _maxHealth);
        EmitSignal(SignalName.HealthChanged, old, _health);
    }
}

// Connect signal (from another node)
public override void _Ready()
{
    var player = GetNode<Player>("/root/Main/Player");
    player.HealthChanged += OnPlayerHealthChanged;
    player.Connect(SignalName.Died, new Callable(this, MethodName.OnPlayerDied));
}

private void OnPlayerHealthChanged(int oldVal, int newVal)
{
    GD.Print($"Health: {oldVal} -> {newVal}");
}

private void OnPlayerDied()
{
    GD.Print("Player died!");
}
```

---

## Common C# Patterns

### Async / Await
```csharp
// Using ToSignal to convert Godot signals to async
using Godot;

public async Awaitable MyAsyncMethod()
{
    GD.Print("Starting...");
    await ToSignal(GetTree().CreateTimer(1.0), Timer.SignalName.Timeout);
    GD.Print("1 second later!");
    await ToSignal(GetTree().CreateTimer(1.0), Timer.SignalName.Timeout);
    GD.Print("2 seconds total!");
}

// Fire and forget with async
_ = MyAsyncMethod();

// Loading a scene asynchronously
public async Awaitable LoadSceneAsync(string path)
{
    var loader = ResourceLoader.LoadThreadedRequest(path);
    while (ResourceLoader.LoadThreadedGetStatus(path) == ResourceLoader.ThreadedStatus.Loading)
    {
        await ToSignal(GetTree(), SceneTree.SignalName.ProcessFrame);
    }
    var packedScene = ResourceLoader.LoadThreadedGet(path) as PackedScene;
    var instance = packedScene.Instantiate();
    GetTree().Root.AddChild(instance);
}
```

### Inheritance
```csharp
public abstract class Actor : CharacterBody2D
{
    [Export] public int MaxHealth { get; set; } = 100;
    [Export] public float Speed { get; set; } = 400f;

    protected int _currentHealth;

    public override void _Ready()
    {
        _currentHealth = MaxHealth;
    }

    public virtual void TakeDamage(int amount)
    {
        _currentHealth = Mathf.Clamp(_currentHealth - amount, 0, MaxHealth);
    }
}

public partial class Player : Actor
{
    [Export] private int JumpVelocity { get; set; } = -600;

    public override void _PhysicsProcess(double delta)
    {
        // Player-specific physics
    }

    public override void TakeDamage(int amount)
    {
        base.TakeDamage(amount);
        // Player-specific damage logic
    }
}
```

### Interfaces
```csharp
public interface IDamageable
{
    void TakeDamage(int amount);
    int CurrentHealth { get; }
}

public partial class Enemy : CharacterBody2D, IDamageable
{
    public int CurrentHealth { get; private set; } = 50;

    public void TakeDamage(int amount)
    {
        CurrentHealth = Mathf.Clamp(CurrentHealth - amount, 0, 999);
        if (CurrentHealth <= 0)
        {
            QueueFree();
        }
    }
}

// Usage
public void OnHitboxAreaEntered(Area2D area)
{
    if (area is IDamageable damageable)
    {
        damageable.TakeDamage(10);
    }
}
```

---

## Null Handling

```csharp
// Null coalescing
var sprite = GetNodeOrNull<Sprite2D>("Sprite2D") ?? GetDefaultSprite();

// Null conditional
var pos = GetNodeOrNull<Node2D>("Target")?.Position;

// Pattern matching
if (GetNodeOrNull<Node>("Enemy") is Enemy enemy)
{
    enemy.TakeDamage(10);
}

// TryGetNode
if (TryGetNode("Sprite2D", out var node))
{
    // node is Node
}
```

---

## Collections

```csharp
// Arrays
var items = new Godot.Collections.Array {"sword", "shield", 10};
var typedArray = new Godot.Collections.Array<int> {1, 2, 3};
var vectorArray = new Godot.Collections.Array<Vector2>
{
    new Vector2(0, 1),
    new Vector2(1, 0)
};

// Dictionaries
var dict = new Godot.Collections.Dictionary
{
    {"hp", 100},
    {"mp", 50},
    {"name", "Skarly"}
};
int hp = (int)dict["hp"];

// Standard C# collections
var list = new List<Player>();
list.Add(player);
list.RemoveAt(0);

var dict2 = new Dictionary<string, int>
{
    {"strength", 15},
    {"agility", 12}
};
```

---

## Scene Loading / Instantiation

```csharp
// Preload and instantiate
private PackedScene _enemyScene;
public override void _Ready()
{
    _enemyScene = GD.Load<PackedScene>("res://scenes/enemy.tscn");
}

public void SpawnEnemy(Vector2 position)
{
    var enemy = _enemyScene.Instantiate<Enemy>();
    enemy.Position = position;
    GetParent().AddChild(enemy);
}

// Direct load
var scene = ResourceLoader.Load<PackedScene>("res://scenes/player.tscn");
var instance = scene.Instantiate();
AddChild(instance);

// Queue-free
instance.QueueFree();
```

---

## Tween (C#)

```csharp
// Property tween
var tween = CreateTween();
tween.TweenProperty(GetNode<Sprite2D>("Sprite2D"), "position",
    new Vector2(100, 0), 0.5f)
    .SetTrans(Tween.TransitionType.Linear)
    .SetEase(Tween.EaseType.InOut);
tween.TweenCallback(new Callable(this, MethodName.OnTweenComplete));
tween.Play();

// Method tween
var tween2 = CreateTween();
tween2.TweenMethod(Callable.From<float>(SetHealthBar),
    0f, 100f, 0.3f);
tween2.Play();

private void SetHealthBar(float value)
{
    _healthBar.Value = value;
}

// Chain
CreateTween()
    .TweenProperty(sprite, "modulate:a", 0.0f, 0.3f)
    .TweenCallback(new Callable(this, MethodName.HideSprite))
    .TweenInterval(0.5f)
    .TweenProperty(sprite, "position:x", 100.0f, 0.5f);
```

---

## File I/O

```csharp
// Save resource
public void Save(string path)
{
    var data = new MySaveData
    {
        Score = Score,
        PlayerName = PlayerName,
        Position = Position
    };
    var err = ResourceSaver.Save(data, path);
    if (err != Error.Ok)
        GD.PrintErr("Save failed: ", err);
}

// Load resource
public MySaveData Load(string path)
{
    if (FileAccess.FileExists(path))
    {
        return ResourceLoader.Load<MySaveData>(path, "",
            ResourceLoader.CacheMode.Ignore);
    }
    return null;
}

// FileAccess for raw I/O
public void WriteFile(string path, string content)
{
    using var file = FileAccess.Open(path, FileAccess.ModeFlags.Write);
    file.StoreString(content);
}

public string ReadFile(string path)
{
    using var file = FileAccess.Open(path, FileAccess.ModeFlags.Read);
    return file.GetAsText();
}
```

---

## Common Gotchas (C#)

1. **Override keyword is mandatory** for virtual methods (`_Ready`, `_Process`, etc.)
2. **No automatic signal registration** — must use `[Signal]` attribute and `EmitSignal(SignalName.X)`
3. **`ToSignal()` returns `Awaitable`** — use `await ToSignal(...)` not `await signal`
4. **Godot.Collections.Array** — not `System.Collections.ArrayList`
5. **`new Vector2()` vs `Vector2.Zero`** — prefer static constructors for performance
6. **`QueueFree()` not `Free()`** — `Free()` is dangerous in Godot
7. **C# uses `.` for inheritance access** (`base._Ready()`), not `.` like GDScript
8. **`EmitSignal` takes `Variant` arguments** — types are automatically boxed
9. **No dynamic typing** — all variables must be declared or use `var`
10. **Use `TryGetNode`** for optional node references to avoid null reference errors
11. **StringName vs string** — use `StringName` for node paths, `string` for display text
12. **Dispose resources** — implement `_ExitTree()` or use `Dispose()` for non-Node resources
