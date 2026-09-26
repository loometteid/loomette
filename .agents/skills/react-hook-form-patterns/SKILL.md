---
name: react-hook-form-patterns
description: Enforces React Hook Form and Zod architecture conventions including dedicated schema files, explicit defaultValues, Controller for custom UI, useWatch for React Compiler optimization, and TanStack Query mutation integration.
---

# React Hook Form & Zod Patterns

This skill defines the architectural rules, directory conventions, and implementation patterns for all form state management and input validation across the application using `react-hook-form` and `zod` via `@hookform/resolvers/zod`.

---

## 1. Schema Organization (`schemas/*.schema.ts`)

Every form schema **MUST** be placed in a dedicated `schemas/` folder within its corresponding feature directory:

```
components/features/<feature>/
├── schemas/
│   └── <name>.schema.ts      <-- Zod schema and inferred type
├── <feature>-form.tsx        <-- Form component
└── ...
```

### Rules
- **Naming**: File name must follow `<name>.schema.ts` (e.g., `edit-profile.schema.ts`, `wardrobe-item.schema.ts`).
- **Exporting**: Always export both the Zod schema and the inferred TypeScript type (`z.infer<typeof schema>`).
- **Zod 4 Syntax**: Use `{ message: "..." }` for error messages (do not use legacy `{ errorMap: ... }`).
- **Optional vs Nullable**: Explicitly declare `.nullable()` and `.optional()` to match database types (e.g., Supabase columns).

### Example (`components/features/trip/schemas/edit-trip.schema.ts`)
```ts
import { z } from "zod";
import type { Season, TravelCompanion } from "@/lib/tripOptions";

export const editTripSchema = z
  .object({
    name: z.string(),
    startDate: z.string().min(1, "Please pick a start date."),
    endDate: z.string().min(1, "Please pick an end date."),
    season: z.custom<Season>().nullable().optional(),
    companion: z.custom<TravelCompanion>().nullable().optional(),
  })
  .refine(
    (data) => !data.startDate || !data.endDate || data.endDate >= data.startDate,
    {
      message: "End date can't be before the start date.",
      path: ["endDate"],
    },
  );

export type EditTripFormValues = z.infer<typeof editTripSchema>;
```

---

## 2. Form Initialization & `defaultValues`

Always provide explicit `defaultValues` matching every key in the Zod schema shape.

### Rules
- **No Missing Keys**: Every registered or controlled field must have a defined default value (e.g. `""`, `null`, `[]`, or a preset).
- **Initial Data**: When prefilling data from props or `useSuspenseQuery`, pass data directly into `defaultValues`. Because queries resolve before component render under Suspense, `defaultValues` will be reliably populated.
- **Type Safety**: Pass the inferred schema type to `useForm<FormValues>({ resolver: zodResolver(schema), defaultValues: { ... } })`.

### Example
```tsx
const {
  register,
  handleSubmit,
  control,
  formState: { errors, isSubmitting },
} = useForm<EditTripFormValues>({
  resolver: zodResolver(editTripSchema),
  defaultValues: {
    name: trip?.name ?? "",
    startDate: trip?.start_date ?? "",
    endDate: trip?.end_date ?? "",
    season: trip?.season ?? null,
    companion: trip?.travel_companion ?? null,
  },
});
```

---

## 3. Field Wiring: Uncontrolled vs Controlled

### Native / Text Inputs: `register`
Use `register("fieldName")` directly on native inputs (`<input>`, `<textarea>`) and custom input components that forward ref and accept HTML input props (like `@/components/ui/input`).

```tsx
<Input
  id="trip-start"
  type="date"
  {...register("startDate")}
/>
```

### Custom UI Components: `Controller`
Use `Controller` from `react-hook-form` for custom UI controls, toggle pill groups (`PillToggleGroup`), custom dropdowns (`Select`), and segmented buttons:

```tsx
<Controller
  name="season"
  control={control}
  render={({ field }) => (
    <PillToggleGroup
      options={SEASON_OPTIONS}
      isSelected={(value) => value === field.value}
      onToggle={(value) =>
        field.onChange(value === field.value ? null : value)
      }
    />
  )}
/>
```

---

## 4. Reactive Values: ALWAYS Use `useWatch` (React Compiler Rule)

> [!CAUTION]
> **NEVER use `watch(...)` destructured from `useForm()`.**
> 
> Destructuring and invoking `const value = watch("fieldName")` at the component level causes top-level re-renders and triggers React Compiler de-optimization warnings (`Compilation Skipped: Use of incompatible library - react-hooks/incompatible-library`).

### Rule
Always import and use `useWatch({ control, name: "fieldName" })` when you need to read form state reactively (for disabling submit buttons, showing dynamic titles, or rendering conditional inputs):

```tsx
// ❌ BAD: Triggers React Compiler memoization bailouts
const { register, watch } = useForm<FormValues>(...);
const name = watch("name");

// ✅ GOOD: Isolated reactive subscription, React Compiler friendly
import { useForm, useWatch } from "react-hook-form";

const { register, control } = useForm<FormValues>(...);
const name = useWatch({ control, name: "name" });
```

---

## 5. Inline Validation Error Feedback

Field validation errors must be rendered inline directly below the associated input field:

```tsx
<div className="flex flex-col gap-1.5">
  <Label htmlFor="trip-start" className="text-muted-foreground text-xs uppercase">
    Start Date
  </Label>
  <Input
    id="trip-start"
    type="date"
    {...register("startDate")}
  />
  {errors.startDate && (
    <p className="text-destructive text-xs">{errors.startDate.message}</p>
  )}
</div>
```

*Note: General network, API, or Supabase mutation errors belong to the mutation error handling layer (e.g. `toast.error(...)` inside `useMutation({ onError })`), not inline form validation.*

---

## 6. TanStack Query Mutation Integration

Follow these strict synchronization rules when wiring forms to `@tanstack/react-query` mutations:

1. **Direct Mutation Trigger**: Call `mutation.mutate(values)` inside `onSubmit(values)`.
2. **Submit Button State**: Combine both `mutation.isPending` and `formState.isSubmitting`:
   ```tsx
   <Button
     type="submit"
     disabled={mutation.isPending || isSubmitting}
   >
     {mutation.isPending ? "Saving…" : "Save"}
   </Button>
   ```
3. **No `useTransition` Wrapping**: Per `tanstack-query-patterns` Rule 6, never wrap TanStack Query mutations in React's `useTransition`. Rely on `mutation.isPending`.
4. **Callbacks in `useMutation`**: Keep success redirects, query cache invalidations, and toast notifications inside `useMutation({ onSuccess, onError })`.

---

## 7. Complete Reference Template

```tsx
"use client";

import { Controller, useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PillToggleGroup } from "@/components/features/onboarding/pill-toggle-group";
import {
  exampleFormSchema,
  type ExampleFormValues,
} from "./schemas/example.schema";
import { updateExampleMutationOptions } from "./mutation-options/update-example.mutation-option.client";

export function ExampleForm({ initialData }: { initialData?: ExampleFormValues }) {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
  } = useForm<ExampleFormValues>({
    resolver: zodResolver(exampleFormSchema),
    defaultValues: {
      name: initialData?.name ?? "",
      category: initialData?.category ?? null,
    },
  });

  const name = useWatch({ control, name: "name" });

  const mutation = useMutation({
    ...updateExampleMutationOptions(),
    onSuccess: (_data, _variables, _onMutateResult, context) => {
      void context.client.invalidateQueries({ queryKey: exampleQueryOptions().queryKey });
    },
  });

  function onSubmit(values: ExampleFormValues) {
    mutation.mutate(values);
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-xs uppercase">
          Name {name && `(${name})`}
        </Label>
        <Input id="name" {...register("name")} />
        {errors.name && (
          <p className="text-destructive text-xs">{errors.name.message}</p>
        )}
      </div>

      <div className="flex flex-col gap-2">
        <Label className="text-xs uppercase">Category</Label>
        <Controller
          name="category"
          control={control}
          render={({ field }) => (
            <PillToggleGroup
              options={[{ value: "a", label: "Option A" }]}
              isSelected={(val) => val === field.value}
              onToggle={(val) => field.onChange(val === field.value ? null : val)}
            />
          )}
        />
        {errors.category && (
          <p className="text-destructive text-xs">{errors.category.message}</p>
        )}
      </div>

      <Button
        type="submit"
        disabled={mutation.isPending || isSubmitting}
        className="w-full"
      >
        {mutation.isPending ? "Saving…" : "Save"}
      </Button>
    </form>
  );
}
```

---

## 8. Audit Checklist

When building or reviewing forms, verify:
- [ ] Schema is in a dedicated `components/features/<feature>/schemas/<name>.schema.ts` file.
- [ ] Schema and inferred type `z.infer<typeof schema>` are exported.
- [ ] `useForm` has explicit `defaultValues` for every field in the schema.
- [ ] Native inputs use `register(...)`.
- [ ] Custom controls use `<Controller ... />`.
- [ ] Dynamic / watched values use `useWatch({ control, name: ... })` instead of `watch(...)`.
- [ ] Validation errors are displayed inline with `<p className="text-destructive text-xs">`.
- [ ] Submit button disables on `mutation.isPending || isSubmitting`.
- [ ] No mutations are wrapped in `useTransition`.
