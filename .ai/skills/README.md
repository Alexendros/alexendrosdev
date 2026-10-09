# Canon de skills · Protocolo Trifásico

> Las skills no viven en reposo: viven cuando se usan (Tizona) o cuando se afilan.
> Este canon es la **vaina**; el filo se ejerce en Cursor y se templa en CI.

Canon versionado de habilidades para madurar `alexendros.dev` bajo tres estándares
exigidos como umbral mínimo de calidad. Consumidor operativo: **Cursor**.
Gobernanza, métricas y matasellado: Notion → «Protocolo Trifásico».

## 1. Tres áreas

| Área | Estándar | Umbral mínimo |
| --- | --- | --- |
| **PROTECCIÓN** | OWASP ASVS v4.0.3 (L1 completo + L2 selectivo) | 0 secretos, 0 vulns high/critical, CSP sin `unsafe-inline` |
| **ACCESIBILIDAD** | WCAG 2.1 AA + EN 301 549 / RD 1112/2018 | 0 violaciones serious/critical axe, LHCI a11y/SEO 100, LCP ≤2.5s |
| **ORDEN** | Clean Code (R. C. Martin) | complejidad ≤10, 0 ciclos de dependencia, 0 código muerto |

## 2. Tres fases (Trifásico)

Cada área tiene **3 skills = 3 fases**. Cada fase lee **solo** el fichero limpio
de la anterior y produce el suyo, validado contra `schema/phase-report.schema.json`.

```
① Auditoría ──▶ ② Despliegue base ──▶ ③ Integración
(contexto+decisiones) (scaffolding reproducible) (contra código previo + gates)
   01-*.json              02-*.json                 03-*.json
```

- **① Auditoría** = contextualización + decisiones. Diagnostica superficie y fija umbrales.
- **② Despliegue base** = scaffolding limpio (configs, tests, tokens) desde cero.
- **③ Integración** = fusión con/contra el código previo y cierre en pipeline.

Ficheros limpios de ejecución: `.ai/skills/.phase/<area>/0N-*.json` (no se commitean).

## 3. Canon en GitHub, filo en Cursor

- Cada skill = carpeta con `SKILL.md` (instrucciones) + `skill.json` (manifiesto estricto).
- `skill.json` conforma `schema/skill.schema.json` (draft-07, `additionalProperties:false`).
- Cursor invoca cada skill por `cursor.invocation` (p. ej. `@proteccion-01-auditoria`).

## 4. Evaluación de fusiones antirredundancia

`scripts/check-redundancy.mjs` falla el pipeline si detecta:

1. `id` duplicado.
2. Dos skills en la misma `(area, fase)`.
3. Solapamiento de alcance (Jaccard de `antiRedundancy.keywords` ≥ 0.60)
   no declarado en `mergeableWith`.

## 5. Cierre draconiano

`.github/workflows/skills-canon.yml`:

1. Valida **todos** los `skill.json` con `ajv --strict --all-errors`.
2. Ejecuta la evaluación antirredundancia.

Un solo fallo tumba el merge. Sin excepciones.

## 6. Poblado posterior

Los manifiestos nacen con el esqueleto estricto. El poblado fino (métricas reales,
hallazgos, evidencias) se vuelca en los ficheros limpios `.phase/*.json` desde la
fuente, con el mínimo sacrificio de calidad para ser integrado, comprendido y ejercido.
