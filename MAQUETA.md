# Maqueta: Catálogo de Trámites (Michoacán)

Frontend-only clickable mockup. No backend; all data is fictitious and lives in `localStorage`.

## Run
```
npm install
npm run dev -- --host 127.0.0.1 --port 5173
```
Open http://127.0.0.1:5173/login and pick a demo user (no passwords). Use "Restablecer datos de ejemplo" (list or help page) to reseed.

## Statuses
| Status | Meaning |
|---|---|
| 785 ROMR (borrador) | Se está capturando. Todo trámite nace aquí. |
| 1668 Administrador (en revisión) | Lo revisa el administrador. |
| 787 Público | Publicado: lo ve la ciudadanía. |
| 783 Actualizar costos | Publicado reabierto solo para corregir montos. Al cambiar un monto pasa solo a 1668. |
| 789 Dado de baja | Fuera del catálogo. |

## Demo users and permission groups
Editar = datos generales. Apartados = modalidades, oficinas, pasos, costos, fundamentos y requisitos. "Edita en 785" = el rol ve el botón Editar solo cuando el trámite está en estatus 785.

| Role | User | Group | Scope | Editar / Apartados |
|---|---|---|---|---|
| Root | Usuario Root | Root | All | Everything |
| Administrador | Carlos Ortega | Administración | All | Only in 1668. Cannot create trámites. |
| ROMR | Laura Méndez | Captura restringida | Own unidad (Finanzas / Ingresos) | Editar in 785; Apartados in 785 and 783 (no Editar in 783). Dependencia and unidad fixed on create. |
| Auxiliar de ROMR | Marco Díaz | Captura amplia | Own dependencia (Finanzas) | Editar + Apartados in 785 and 783. |
| RUA | Ana Torres | Captura amplia | Own dependencia (Finanzas) | Same as Auxiliar de ROMR (no longer read-only). |
| Auxiliar de RUA | Elena Ruiz | Captura restringida | Own unidad (Finanzas / Ingresos) | Same as ROMR. |

Nobody (except Root) edits in 787 or 789. Saving a costo while the trámite is in 783 moves it to 1668 automatically (any role that can edit it). Create: Root, ROMR, Auxiliar de ROMR, RUA, Auxiliar de RUA; new trámites start in 785.

Turns: capture roles 785 -> 1668 (must be complete), 785 -> 789 (observation required), 783 -> 1668 (must be complete). Administrador/Root: 1668 -> 787, 1668 -> 785 (observation required), 787 -> 783 (observation required), 787 -> 789 (observation required), 783 -> 1668. Root can do any of them.

All rules live in `src/modules/mock/permissions.js` (`can`, `explain`, `allowedTransitions`, `completeness`, `autoPromotionTarget`, `fixedOrg`, `orgScope`, `matrixFor`). The role x status matrix on `/ayuda-maqueta` is generated from those functions. `node scripts/check-permissions.mjs` asserts the full matrix and exits non-zero on mismatch.

## Modalidades
A modalidad is `{ tipo, nombre, url, nota, gratuita, activo }`. `tipo` is one of `presencial`, `en_linea`, `hibrida`, `otra` (Presencial, En Línea, Híbrida (Presencial/En Línea), Otra (WhatsApp, teléfono, etc.)). `nombre` is free text (required, max 255); `nota` max 500; `url` is required and validated only for `en_linea` and `hibrida`. Completeness needs at least one active modalidad. Costos and requisitos only offer active modalidades. Deactivating the last active modalidad, or one with active costos/requisitos, asks for confirmation first.

## Captura parcial (guardado parcial)
The trámite form has a "Guardar y continuar después" button next to "Guardar trámite". It saves without full validation (minimum: `nombre` and `dependenciaId`; the API defaults the dependencia to the user's own and re-checks both) and stores `parcial: true` and `pasoActual` (index in `FORM_SECTIONS` of the step where the user was). The trámite stays in 785. A full "Guardar trámite" sets `parcial: false` and `pasoActual: 0`. Records without the field behave as not partial.

`completeness()` has a required item `captura` that fails while `parcial` is true, so 785 -> 1668 (and 783 -> 1668 for capture roles) is blocked with the message "Formulario de datos generales terminado (sin captura parcial)". The list card and the detail hub show "Captura parcial / Formulario incompleto" with the step name, and "Continuar edición" opens `/tramites/:id/editar` on the saved step (same edit permissions as "Editar"). The seed has two partial trámites (#101, #130).

## List cards
Each card in `/tramites` is clickable (stretched title link, no nested interactive elements); Editar / Apartados / Turnar / Ver sit above the overlay and keep their own behavior. Hover and keyboard focus (`:focus-visible` on the title link) are styled in `tramites.css`.

## Campos adicionales (alineación con el sistema real)
All optional, none affects completeness or permissions; absent values behave as "No".
- **Requisitos** (section "Más detalles del requisito", collapsed): descripción (max 1000), ¿es un documento?, ¿original?, ¿copias certificadas?, ¿requiere firma?, URL de descarga del formato (http/https), ¿es un trámite? (when Sí shows "Trámite vinculado", a search over trámites by `#id nombre`), institución que emite (max 255), ¿revisión por un tercero?, ¿parte de un formato?. The list shows the Sí flags as tags plus a "Descargar formato" link.
- **Fundamentos**: fracción, inciso, párrafo, número, letra (max 50 each), "Aplica a inspección" and "Aplica a respuesta ficta". Status chip: green "Vinculado a CELEM" (has leyId) or yellow "Sin vincular" (visual only). A fundamento can be saved without ley only while "simular CELEM no disponible" is on.
- **Pasos**: "URL del paso" (http/https), shown as a link.

## Seed version
`SEED_VERSION` in `src/modules/mock/seed.js` (now 4) is stored with the data; when it changes, old localStorage data is replaced automatically with the new seed.

## Routes
`/login`, `/tramites` (filters in URL), `/tramites/nuevo`, `/tramites/:id` (hub, `?tab=`), `/tramites/:id/editar`, `/ayuda-maqueta`. Template routes (`/inicio`, `/informacion`, `/ejemplo-crud`) still work.

## Structure
- `src/modules/mock/`: catalogs (legacy ids), seed, db (localStorage), permissions, CELEM fake, session store.
- `src/modules/tramites/{api,hooks,components,views}`: async adapter (200-400 ms latency), TanStack Query hooks, UI.

## Mocked
Database, users/session, API latency, CELEM law search (toggle "simular CELEM no disponible" in Fundamentos), 409 duplicate detection, audit trail.

## Known simplifications
- 33 form fields (not exactly 35); numeric fields stored as strings.
- Pasos are tramite-level (not per modalidad); numbering: A1/B1, subpaso A1.1.
- Rich text supports only `**bold**` and `- ` lists, rendered with React elements.
- No unit tests (vitest is not configured).
- Header user switcher also changes the active user while on a page; out-of-scope trámites show a 403 result.
- Disabled buttons use a focusable wrapper with aria-label + tooltip.
