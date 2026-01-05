# Formularios Accesibles y de Alta Performance: Mejores Prácticas

En el ecosistema de **CV-ConVos**, los formularios son el puente entre el usuario y su futuro profesional. Un formulario lento o difícil de usar no solo frustra, sino que excluye. Esta guía detalla cómo construimos formularios que cumplen con los más altos estándares de UX y accesibilidad.

## 1. Estructura y Navegación (Teclado)
La navegación por teclado es fundamental para usuarios con discapacidades motoras y para "power users" que prefieren no usar el mouse.

- **Foco Visible**: Nunca elimines el `outline` sin proporcionar una alternativa visual clara. Usamos `focus-visible:ring-2` de Tailwind para resaltar el elemento activo.
- **Orden Lógico (Tab Order)**: El orden de tabulación debe seguir el flujo visual de la página (generalmente de arriba a abajo, de izquierda a derecha).
- **Trampas de Foco**: Evita que el usuario quede atrapado en un componente (como un modal o un dropzone) sin poder salir con `Esc` o `Tab`.

### Ejemplo en Shadcn/UI:
```tsx
<FormItem>
  <FormLabel>Nombre Completo</FormLabel>
  <FormControl>
    <Input placeholder="Ej: Juan Pérez" className="focus-visible:ring-primary" />
  </FormControl>
</FormItem>
```

## 2. Accesibilidad para Lectores de Pantalla (Screen Readers)
Para que una persona ciega pueda usar la web, los elementos deben estar correctamente etiquetados.

- **Labels Explícitos**: Todo input debe tener un `<label>` asociado. Si el diseño pide no mostrarlo, usa la clase `sr-only` pero mantenlo en el DOM.
- **Aria-labels**: Para botones con solo iconos (como un botón de "Cerrar" o "Eliminar"), usa `aria-label="Cerrar"` o algo descriptivo.
- **Estados Dinámicos**: Usa `aria-live` para anunciar cambios importantes, como cuando un archivo termina de subirse o aparece un error.
- **Aria-describedby**: Vincula los mensajes de error o ayuda directamente con el input para que se lean automáticamente al enfocarlo.

## 3. Experiencia Móvil y Touch (Responsiveness)
- **Touch Targets**: Los elementos clickeables deben tener un tamaño mínimo de **44x44px** para evitar clicks accidentales en móviles.
- **Input Types**: Usa el `type` de input correcto (`email`, `tel`, `number`) para que el móvil muestre el teclado optimizado.
- **Feedback Háptico Visual**: Asegúrate de que los botones tengan estados `:active` claros para confirmar el toque.

## 4. Velocidad y Feedback
- **Validación Instantánea**: No esperes al submit. Valida en el evento `blur` o mediante `react-hook-form` con el modo `onChange`.
- **Estados de Carga**: Siempre muestra un spinner o barra de progreso (como el `Progress` de shadcn) durante procesos asíncronos.
- **Optimistic Updates**: Si es posible, muestra el cambio en la UI antes de que el servidor confirme (ej: agregar un archivo a la lista).

## Checklist de Calidad
1. [ ] ¿Puedo completar el formulario solo con el teclado?
2. [ ] ¿Todos los botones de icono tienen `aria-label`?
3. [ ] ¿Los campos obligatorios están marcados clara y programáticamente?
4. [ ] ¿El formulario se adapta a pantallas de 320px de ancho?
5. [ ] ¿Las instrucciones de formato (ej: fechas) son claras ANTES de que el usuario cometa un error?

---
*Este documento es parte de los estándares de ingeniería de CV-ConVos.*
