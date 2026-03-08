# Proposal: Fix dynamic routes, href={} pattern, y doble slash

## Intent

Después del fix anterior, al testear la extensión con un proyecto real se detectaron 3 bugs adicionales:

1. **`href={""}` no matchea** — En JSX es común `<Link href={"/path"}>` con `{}`, pero el regex solo cubría `href="`. (Parcialmente arreglado, falta consolidar y cubrir `redirect({""})`, etc.)
2. **`[[...item]]` genera `${[...item}]`** — El optional catch-all `[[...item]]` no se limpia correctamente. El regex `\[(.+?)\]` captura `[...item` dentro del doble bracket, produciendo `${[...item}]` en vez de `${item}`.
3. **Doble `//` al insertar** — Las rutas se almacenan como `/[locale]/lessons/...`. Si el usuario ya escribió `/` antes de seleccionar, el insertText agrega otro `/`, resultando en `//[locale]/...`.

### Tracing del bug #2

Ruta: `/[locale]/lessons/[[...item]]`

Regex actual: `route.replace(/\[(.+?)\]/g, '${$1}')`

| Input segment | Regex match | Capture `$1` | Resultado |
|---|---|---|---|
| `[locale]` | `[locale]` | `locale` | `${locale}` ✓ |
| `[[...item]]` | `[[...item]` | `[...item` | `${[...item}]` ✗ |

El `]` sobrante queda al final porque el regex non-greedy matchea el primer `]`.

### Tracing del bug #3

```
usuario escribe:  href={"/
insertText:       /[locale]/lessons/...
resultado:        href={"//[locale]/lessons/...
```

## Scope

### In Scope
- Normalizar el insertText de dynamic params: `[param]` → `${param}`, `[...param]` → `${param}`, `[[...param]]` → `${param}`
- Eliminar el leading `/` del `insertText` para evitar doble slash (el usuario ya tipea `/`)
- Asegurar que el regex del trigger cubre `href={""}`  y `redirect({""})` (JSX expression syntax)
- Tests unitarios para los 3 escenarios

### Out of Scope
- Soporte de rutas API
- i18n routing custom
- UI settings para el usuario

## Approach

### Fix 1: Regex de dynamic params en `completionProvider.ts`

Reemplazar el regex simple por un procesamiento en 2 pasos:

```ts
// Paso 1: Limpiar optional catch-all [[...param]] → [param]
let insert = route.replace(/\[\[\.\.\.(.+?)\]\]/g, '[$1]');
// Paso 2: Limpiar catch-all [...param] → [param]  
insert = insert.replace(/\[\.\.\.(.+?)\]/g, '[$1]');
// Paso 3: Convertir [param] → ${param}
insert = insert.replace(/\[(.+?)\]/g, '${$1}');
```

### Fix 2: Eliminar leading `/` del insertText

Detectar si el usuario ya tiene `/` antes del cursor. Si es así, generar insertText sin el `/` inicial:

```ts
// Opción simple: quitar siempre el "/" inicial del insertText
// porque el completion se activa DESPUÉS de que el usuario ya escribió "/" 
item.insertText = insert.startsWith('/') ? insert.slice(1) : insert;
```

Alternativamente usar un `range` en el CompletionItem para reemplazar desde la última `"` o `{`.

### Fix 3: Trigger patterns para JSX expression

Agregar `\{?\s*` opcional antes de las comillas en TODOS los patterns, no solo Link:

```ts
/router\.(push|replace|prefetch)\s*\(\s*\{?\s*['"`]/,
/redirect\s*\(\s*\{?\s*['"`]/,
```

## Affected Areas

| Area | Impact | Description |
|------|--------|-------------|
| `src/providers/completionProvider.ts` | Modified | Fix regex para dynamic/catch-all params, fix doble slash, consolidar JSX expression patterns |
| `test/nextjsParser.test.ts` | Modified | Agregar test cases para `[[...param]]` |

## Risks

| Risk | Likelihood | Mitigation |
|------|------------|------------|
| Quitar `/` del insertText puede romper si el usuario NO ha escrito `/` | Med | Usar `range` del CompletionItem para controlar qué se reemplaza en vez de asumir |
| Regex de 3 pasos puede no cubrir edge cases exóticos | Low | Tests cubren `[param]`, `[...param]`, `[[...param]]` |
| `redirect({""})` con llaves es poco común, puede haber falsos positivos | Low | El pattern sigue requiriendo `redirect(` antes |

## Rollback Plan

`git revert <commit>` — cambios localizados en 1 archivo de código + 1 de test.

## Dependencies

- Ninguna

## Success Criteria

- [ ] `[[...item]]` genera insertText `${item}` (no `${[...item}]`)
- [ ] `[...slug]` genera insertText `${slug}` (no `${...slug}`)
- [ ] `[locale]` sigue generando `${locale}`
- [ ] No hay doble `//` al insertar una ruta después de escribir `/`
- [ ] `<Link href={"/"}` es reconocido como contexto de ruta
- [ ] `redirect({"/"}` es reconocido como contexto de ruta
- [ ] Tests pasan para todos los escenarios
