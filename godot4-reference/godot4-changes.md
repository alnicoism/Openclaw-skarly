# Godot 4 Changelog — Version Differences
_Supplemental reference. Source: Godot docs + GitHub changelog (4.6-stable as of 2026-01-26)_

---

## Versions Covered
- **4.0** — Major release, rewritten renderer, GDScript overhaul
- **4.1** — Stability, async loading, MultiplayerSpawner
- **4.2** — TileMap improvements, Animation improvements
- **4.3** — New 2D physics engine (separate from 3D), cloth physics
- **4.4** — Enhanced editor, new rendering features, physics improvements
- **4.5** — Improved stability, editor UX, performance work
- **4.6** — Current stable (Jan 2026) — Jolt Physics default, major animation/IK overhaul

---

## Godot 4.6 — What's New (2026-01-26)

> **Release date:** January 26, 2026
> **Migration guide:** https://docs.godotengine.org/en/4.6/tutorials/migrating/upgrading_to_godot_4.6.html

### ⚠️ Breaking Changes in 4.6
- Jolt Physics is now the **default** physics engine for new 3D projects (was GodotPhysics in 4.4/4.5)
- `.NET 8.0` now required for C# (up from .NET 6.0 in 4.4/4.5)
- `SkeletonModifier3D` redesign — modifiers now inherit from `IKModifier3D` base class
- `OneShot` animation node: `request_fire()` can now override `ABORTED` state

---

### 🎮 GDScript Changes in 4.6

| Change | PR | Notes |
|---|---|---|
| Warning for calling coroutine without `await` | GH-107936 | Opt-in warning catches forgotten awaits |
| Integer division check | GH-110240 | Warns when dividing integers (potential precision loss) |
| `Dictionary.reserve()` added | GH-110709 | Pre-allocate dictionary capacity |
| Trailing comma in `preload()` | GH-110775 | `preload("res://scene.tscn",)` now valid |
| `debug/gdscript/warnings/directory_rules` | GH-93889 | Per-directory warning configuration |
| Performance: `notification` optimized | GH-94118 | Faster GDScriptInstance notification |
| Profiling support via Tracy | GH-113279 | Profile GDScript with `tracy` |
| `reserve()` for Dictionary, apply to VM constructors | GH-110709 | Less memory churn |
| Shallow script cache fix | GH-109345 | Prevents shallow scripts leaking into ResourceCache |

### LSP Improvements in 4.6
- GH-105236: Reworked LSP client-owned file management
- GH-111878: Variant type autocompletion
- GH-113099: BBCode → markdown docstring conversion for LSP
- GH-114401: Fixed infinite recursion in symbol calculation
- GH-114791: Reuses stale parsers across requests

---

### 🎯 C# Changes in 4.6

| Change | PR | Notes |
|---|---|---|
| **.NET 8.0 required** | GH-110799 | GodotTools updated from .NET 6.0 → 8.0 |
| `ReadOnlySpan<Variant>` overload for `Callable.Call` | GH-107800 | Better interop |
| Source generator improvements | GH-111524 | Godot.SourceGenerators packages updated |
| Fix source generation of statically imported members | GH-111570 | |
| `IsNormalized()` improvement | GH-108974 | |
| Enum from/to Variant conversion fix | GH-108527 | |
| Ensure .NET editor supports Visual Studio 2026 | GH-112961 | |
| Hide signals prefixed by underscore | GH-115199 | Cleaner API |
| `DisplayServer.TtsSpeak` compat method | GH-112798 | |

---

### 🔧 Physics Changes in 4.6

**Jolt Physics is now the default for new 3D projects** (was GodotPhysics in 4.4/4.5).

| Change | PR | Notes |
|---|---|---|
| **Jolt Physics default for new projects** | GH-105737 | Existing projects unchanged |
| **Jolt updated to 5.4.0** | GH-110965 | Latest Jolt version |
| MultiMesh physics interpolation (2D transforms) | GH-107666 | MultiMeshInstance2D now interpolates |
| `Generic6DOFJoint3D` angular limits fix | GH-111087 | |
| CCD bodies fix (multiple contact manifolds) | GH-110914 | |
| SoftBody3D position/physics fix in Jolt | GH-112483 | |
| Jolt incremental build crash fix | GH-111408 | |
| Crash fixes for `move_and_collide` with null body | GH-110964 | |

---

### 🦴 Animation / IK Overhaul in 4.6

**Major skeletal IK improvements:**

| New Feature | PR | Notes |
|---|---|---|
| `SkeletonModifier3D` → `IKModifier3D` base class | GH-110120 | All IKs now share a base |
| `JacobianIK3D` | — | Jacobian-based IK solver |
| `SpringBoneSimulator3D` | GH-111378 | Spring-based bone simulation |
| `LimitAngularVelocityModifier3D` | GH-111184 | Clamp angular velocity in IK |
| `BoneTwistDisperser3D` | GH-113284 | Propagate IK target's twist |
| `IterateIK3D` with Deterministic option | GH-112524 | |
| `ChainIK3D` | — | Multi-bone chain IK |
| `LookAtModifier3D` / `AimModifier3D` with relative option | GH-111367 | |
| `TwoBoneIK3D` mutable bone axes | GH-111055 | More control |
| `JointLimitationCone3D`: `radius_range` → `angle` | GH-114395 | Clarity improvement |
| `SpringBoneSimulator3D` with `p_reset` argument | GH-112867 | |

**Animation Workflow:**
| Change | PR | Notes |
|---|---|---|
| `Tween.kill()` propagates to subtweens | GH-108227 | |
| Resize animation length by dragging timeline | GH-110623 | |
| `Animation.interpolate_via_rest()` static func | GH-107423 | |
| Animation snapping state remembered | GH-111952 | |
| Copy/paste animations in SpriteFrames | GH-107887 | |
| Bezier editor: marker lines/sections | GH-110676 | |
| AnimationPlayer: `is_valid()` exposed | GH-111178 | Detect paused animations |
| AnimationPlayer: StringName instead of String API | GH-110767 | |

---

### 🎨 Editor / 3D Improvements in 4.6

| Change | PR | Notes |
|---|---|---|
| **Orbit snapping in 3D viewport** | GH-111509 | |
| **"Use Local Space" option in 2D editor** | GH-107264 | |
| Transform Mode replaces Select Mode (3D) | GH-101168 | Gizmo behavior clarified |
| Default 3D editor to Transform mode | GH-113458 | Restores 4.5 behavior |
| Bresenham Line Algorithm in GridMap | GH-105292 | |
| Rotation arc when using transform gizmo | GH-108576 | Accumulated rotation feedback |
| `MeshInstance3D` upgrade code | GH-112607 | |
| Orbit snapping for 3D viewport | GH-111509 | |

### 2D Improvements in 4.6
| Change | PR | Notes |
|---|---|---|
| TileMap: rotate scene tiles | GH-108010 | |
| Camera2D: accepts resets only after entering tree | GH-112810 | |
| TileMap Dock: Vertical orientation | GH-113128 | |
| SpriteFrames: zoom to fit | GH-111471 | |
| TileMap: undo/redo for scene tiles | GH-114604 | |

---

### 🔊 Audio Changes in 4.6
- `minimp3` → `dr_mp3` (better MP3 support) GH-96547
- Random pitch in audio stream randomizer now in **semitones**, not frequency multiplier GH-103742
- `AudioServer` microphone buffer direct access GH-113288
- Pause audio when game is paused GH-104420

---

### 🖥️ Platform Changes in 4.6
- **macOS**: Visual Studio 2022 → 2026 support, Apple Silicon improvements
- **Android**: Storage Access Framework (SAF) support GH-112215
- **Wayland**: Game embedding, compose/dead key support
- **Web**: Clipboard text encoding fix GH-110544
- **Linux**: SSE4.2 runtime check GH-112279

---

## Godot 4.5 → 4.6 Summary

The biggest shifts in 4.6:

1. **Jolt Physics is now default** — new 3D projects get Jolt out of the box
2. **.NET 8 requirement** — C# projects need .NET 8 SDK
3. **Major IK/skeleton overhaul** — `SkeletonModifier3D` is now a proper hierarchy with `IKModifier3D` base; JacobianIK, spring bones, twist dispersers all added
4. **Animation workflow polish** — timeline drag-to-resize, bezier marker visibility, tween kill propagation
5. **Editor UX** — orbit snapping, local space toggle in 2D, transform gizmo improvements

---

## Godot 4.0 → 4.6 Summary by Area

### Physics
| Version | Change |
|---|---|
| 4.0 | CharacterBody2D/3D introduced, GodotPhysics3D |
| 4.3 | New 2D physics engine (Jolt-based) |
| 4.4 | Physics interpolation added |
| 4.5 | Jolt becomes default for new 3D projects |
| 4.6 | Jolt 5.4.0, MultiMesh 2D interpolation |

### GDScript
| Version | Change |
|---|---|
| 4.0 | `:=` inference, `@export`, `@onready`, `match`, signals with typed params |
| 4.1 | `await` improvements, async scene loading |
| 4.2 | Typed arrays fully supported |
| 4.3 | `@warning_ignore` annotation |
| 4.4 | Further performance work, LSP improvements |
| 4.5 | Integer division warning, coroutine warning |
| 4.6 | `Dictionary.reserve()`, `.preload()` trailing comma, Tracy profiling |

### C#
| Version | Change |
|---|---|
| 4.0 | Full Mono/GodotSharp integration |
| 4.1 | Async/await with `ToSignal` |
| 4.2 | Source generators introduced |
| 4.3 | Further source generator improvements |
| 4.4 | Better `IDisposable` handling |
| 4.5 | |
| 4.6 | **.NET 8.0 required**, source generators updated, VS2026 support |

---

## Version Selection Guidance

| Project Type | Recommendation |
|---|---|
| New project (3D) | **4.6 stable** — Jolt default |
| New project (2D) | **4.6 stable** |
| Ongoing 4.4/4.5 project | Stay put, test 4.6 before upgrading |
| Mobile/low-end | Consider 4.2 LTS if 4.6 is too heavy |
| C# project | .NET 8 SDK required for 4.6 |

### Current Stable as of 2026-03
- **4.6.x** is the latest stable release
- Godot 3.x LTS still maintained (3.6, 3.5) for legacy projects
- Godot 2.x EOL — do not use

---

## Migrating from Godot 3.x to 4.x

### Key Migration Steps
1. **Export → @export**: Update all `export var` to `@export var`
2. **`_ready` returns `void`**: Add `-> void`
3. **`onready var` → @onready**: `onready var x = $Y` → `@onready var x: Type = $Y`
4. **`KinematicBody2D` → CharacterBody2D**: API changed significantly
5. **`move_and_collide` → CharacterBody**: Now uses `velocity` property + `move_and_slide()`
6. **Physics layers**: Layer numbers changed — verify all collision layers/masks
7. **File paths**: Generally compatible, but test saves/loads
8. **Shaders**: Some syntax changes (gdscript-based shaders largely compatible)
9. **Plugins**: GDScript plugins mostly compatible; C# plugins may need updates
10. **Resources**: Generally compatible; `.tres` format improved but backwards compatible

### Automated Migration
- Godot 4 editor has a migration wizard when opening a 3.x project
- Opens project, converts what it can, flags what needs manual work
- **Always backup before migrating**
