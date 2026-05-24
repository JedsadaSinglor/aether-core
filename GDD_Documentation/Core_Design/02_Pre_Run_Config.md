# Aether-Core GDD: Pre-Run System (Build Configuration)

Players must create a `PlayerBuildConfig` Object before starting the game, which consists of 4 parts:

## 2.1. Attribute Points (Custom Stat Allocation)
Players have starting points (e.g., 10 points) to upgrade Base Stats:
*   **ATK (Attack):** 1 point = +2 Base Damage
*   **AGI (Agility):** 1 point = +5% Movement Speed, +2% Attack Speed
*   **DEF (Defense):** 1 point = Reduce Damage taken by 2% (Max 80%)
*   **HP (Health):** 1 point = +50 Max Health
*   **LUK (Luck):** 1 point = +2% Critical Chance, +1% High-Tier Skill Drop
*   **INT (Intelligence):** 1 point = +5% Skill Damage, -2% Skill Cooldown

## 2.2. Automaton Selection (Characters)
| ID | Class Name | Base Stats Focus | Unique Perk Logic |
| :--- | :--- | :--- | :--- |
| `CHR_01` | **Aegis-01 (Knight)** | HP/DEF | `OnTakeDamage`: 15% chance to `Block()`, then `DealDamage(Attacker, BlockedAmount * 0.5)` |
| `CHR_02` | **Zephyr-V (Scout)** | AGI | `OnEvade`: `SpawnEntity(DecoyBomb, CurrentPosition)` |
| `CHR_03` | **Nova-X (Mage)** | INT | `OnSkillCast`: `CastCount++`. If `CastCount == 3`, `NextSkillDamage *= 2`; `CastCount = 0` |
| `CHR_04` | **Shadow-9 (Assassin)** | LUK/ATK | `OnKill`: `ApplyBuff(Invisible, Duration=1.5s)` (Aggro = null) |
| `CHR_05` | **Titan-K (Heavy)** | HP | `OnTakeDamage`: `Energy += Damage`. If `Energy >= Max`, `CastAOE(Energy)` |
| `CHR_06` | **Oracle-Z (Support)** | INT/AGI | `OnInit`: `SpawnEntity(Drone, FollowPlayer)` (Drone auto-attacks) |

## 2.3. Aether Weapon Selection (Weapons)
| ID | Weapon Name | Attack Pattern (Logic) |
| :--- | :--- | :--- |
| `WEP_01` | **Aether Repeater** | `FireRate`: High, `DamageMultiplier`: 0.5, `Projectile`: Fast Line |
| `WEP_02` | **Arcane Cannon** | `FireRate`: Low, `DamageMultiplier`: 2.0, `Projectile`: Slow Line, `Piercing`: True |
| `WEP_03` | **Chrono-Boomerang**| `Projectile`: Move to Target -> Return to Player. `HitCount`: Infinite on path. |
| `WEP_04` | **Tesla Chain** | `HitLogic`: `FindClosestEnemy(CurrentTarget, Radius)`. Max Bounces: 3 |
| `WEP_05` | **Aether Sawblades**| `Projectile`: Orbit around Player. `Duration`: 3s, `Cooldown`: 2s. |

## 2.4. AI Core State (Artificial Intelligence System)
Uses the State Machine Pattern to control movement:
*   **Kiting Core:** `if (DistanceToNearestEnemy < SafeZone) { MoveAwayFrom(Enemy); } else { StandAndShoot(); }`
*   **Aggressive Core:** `Target = FindEnemyWithLowestHP(); MoveTowards(Target); Shoot();`
*   **Adaptive Core:** `if (HP < 30%) { SwitchTo(Kiting); } else { SwitchTo(Aggressive); }`

## 2.5. Mathematical Models & Scaling

### EXP & Level Scaling
*   `BaseEXPRequired`: 100
*   `EXP_Formula`: `RequiredEXP(Level) = BaseEXPRequired * (Level^1.2)`
*   *Note: Ensure exponential scaling so late-game levels require significantly more Orbs.*

### Enemy Wave Scaling (Per Stage)
*   `StageBaseHP`: 50
*   `StageBaseATK`: 5
*   `EnemyHP_Formula`: `StageBaseHP * (1 + (Stage * 0.15))`
*   `EnemyATK_Formula`: `StageBaseATK * (1 + (Stage * 0.08))`
