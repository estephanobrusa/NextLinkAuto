# Proposal: Fix — Al escribir "/" se muestran archivos del proyecto en vez de rutas

## Intent

Al testear la extensión y escribir `/` dentro de un contexto de ruta (ej. `<Link href="/`), el autocomplete muestra **todos los archivos fuente del proyecto** en lugar de las rutas Next.js detectadas. Esto hace que la extensión sea inútil en la práctica porque las sugerencias nativas de VS Code (path intellisense) dominan o se mezclan con las rutas reales.

### Análisis de causa raíz

Se identifican **3 causas concurrentes**:

#### 1. VS Code Path IntelliSense nativo compite con la extensión
VS Code tiene un feature builtin llamado **Path IntelliSense** que autocompleta rutas de archivos cuando detecta `/` dentro de un string literal. Al registrar `/` como trigger character en `extension.ts:26`, ambos providers (el nativo y el de la extensión) se activan simultáneamente. El provider nativo muestra **todos los archivos del workspace**, eclipsando las rutas Next.js.

**Evidencia** — En `src/extension.ts` línea 24-27:
```ts
const provider = vscode.languages.registerCompletionItemProvider(
    selector,
    provideRouteCompletions(),
    '"', "'", '/'   // <-- '/' activa TAMBIÉN el path intellisense nativo
);
```

#### 2. No se usa `sortText` ni `preselect` para priorizar rutas
Incluso cuando las rutas Next.js SÍ aparecen en la lista, no tienen `sortText` ni `preselect = true`, por lo que VS Code las ordena al final, detrás de las sugerencias de archivos.

#### 3. Los route groups `(group)` se filtran erróneamente
En `routeUtils.ts`, la función `fileToRoute()` retorna `null` para cualquier segmento entre paréntesis:
```ts
if (seg.startsWith('(') && seg.endsWith(')')) return null;
```
En App Router, las carpetas como `(marketing)`, `(auth)` son **route groups** que NO afectan la URL — simplemente se omiten del path. El code actual descarta toda la ruta en vez de solo omitir el segmento del grupo. Esto causa que muchas rutas legítimas nunca aparezcan.

## Scope

### In Scope
- Eliminar o condicionar el trigger character `/` para evitar conflicto con path intellisense nativo
- Agregar `sortText` y `preselect` a los `CompletionItem` para que las rutas Next.js aparezcan primero
- Corregir `fileToRoute()` para que route groups `(group)` se omitan del path pero no descarten la ruta completa
- Agregar `filterText` al CompletionItem para que filtrar por `/about` funcione correctamente
- Actualizar los tests unitarios para cubrir route groups

### Out of Scope
- Soporte para rutas de API (`/api/*`)
- Soporte para internationalized routing (`i18n`)
- Configuración de usuario para habilitar/deshabilitar path intellisense nativo

## Approach

### Fix 1: Trigger characters y contexto
Remover `/` de los trigger characters. Mantener solo `"` y `'` (y `` ` ``). Cuando el usuario escribe `href="` o `push("`, el provider se activa. A partir de ahí, mientras el usuario escribe `/dashboard`, VS Code filtra las sugerencias usando el texto ya escrito. No necesitamos `/` como trigger.

### Fix 2: CompletionItem con prioridad
Agregar a cada `CompletionItem`:
- `sortText = '0' + route` — para que aparezcan antes que las sugerencias nativas (que típicamente empiezan con letras)
- `preselect = true` — para la ruta `/` (home)
- `filterText = route` — para que el filtrado funcione con el texto parcial

### Fix 3: Route groups
Cambiar la lógica de `fileToRoute()` para que los segmentos `(group)` se **omitan** (skip) en vez de descartar la ruta entera:
```ts
// ANTES: return null
// DESPUÉS: continue (skip el segmento del grupo)
if (seg.startsWith('(') && seg.endsWith(')')) continue;
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/extension.ts` | Modified | Remover `/` de trigger characters, agregar `` ` `` |
| `src/providers/completionProvider.ts` | Modified | Agregar `sortText`, `preselect`, `filterText` a CompletionItems |
| `src/utils/routeUtils.ts` | Modified | Corregir manejo de route groups `(group)` — skip en vez de reject |
| `src/utils/nextjsParser.ts` | No change | Los glob patterns ya capturan archivos dentro de route groups |
| `test/nextjsParser.test.ts` | Modified | Agregar casos de test para route groups |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Remover `/` como trigger puede romper flujo para usuarios que escriben `href=/` sin comillas primero | Low | El pattern regex ya requiere comilla/backtick antes; sin `/` trigger no cambia el flujo real |
| `sortText` con prefijo `'0'` puede no ser suficiente si otras extensiones también priorizan | Low | Usar `'\0'` (null char) como prefijo para máxima prioridad |
| Route groups anidados `(a)/(b)/page.tsx` podrían generar paths inesperados | Med | Agregar tests para nested groups y validar output |

## Rollback Plan

Los cambios son aditivos y localizados en 3 archivos. Para revertir:
1. `git revert <commit>` revierte todos los cambios
2. Alternativamente, re-agregar `/` a trigger chars en `extension.ts` y revertir `routeUtils.ts`
3. No hay cambios en schema, storage ni configuración de usuario

## Dependencies

- Ninguna dependencia externa nueva
- No requiere cambio en `package.json`

## Success Criteria

- [ ] Al escribir `href="` en un componente, las sugerencias muestran SOLO rutas Next.js (no archivos del proyecto)
- [ ] Las rutas Next.js aparecen primero en la lista de autocompletado
- [ ] Rutas bajo route groups `(marketing)/about/page.tsx` generan `/about` correctamente
- [ ] Rutas bajo route groups anidados `(a)/(b)/dashboard/page.tsx` generan `/dashboard`
- [ ] Tests unitarios pasan para route groups: `app/(admin)/dashboard/page.tsx` → `/dashboard`
- [ ] No hay regresiones en los tests existentes
