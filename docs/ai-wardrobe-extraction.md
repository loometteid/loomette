# AI wardrobe extraction

The P0 flow keeps the Gemini key and all Gemini traffic in the
`extract-wardrobe-items` Supabase Edge Function.

## Flow

1. The signed-in user uploads one OOTD photo to their own Storage path.
2. The Edge Function verifies the user and accepts only that user's public
   `wardrobe-images` URL.
3. Gemini returns structured item attributes, bounding boxes, and contour
   masks. It does not generate replacement garment images.
4. The browser applies each contour to the original pixels and uploads the
   resulting transparent PNGs.
5. `create_wardrobe_extraction` creates all pending records atomically.
6. The temporary OOTD is removed and the user reviews each result on the
   existing approval page.

## Remote setup

Set `GEMINI_API_KEY` in **Supabase Dashboard > Edge Functions > Secrets**.
Optionally set `GEMINI_MODEL`; the default is `gemini-3.8-flash` because that
is the model used in Google's current segmentation documentation.

Apply the database migration and deploy the function from a linked Supabase
CLI project:

```sh
npx supabase db push
npx supabase functions deploy extract-wardrobe-items
```

Never put `GEMINI_API_KEY` in a `NEXT_PUBLIC_` environment variable or commit
it to Git.

## Manual acceptance test

1. Sign in and open **Wardrobe > Add item**.
2. Choose **Scan an outfit photo** and upload a JPG, PNG, or WebP under 10 MB.
3. Confirm the progress moves through upload, scanning, extraction, and save.
4. Confirm two or more visible garments appear separately on the approval
   page with editable name, category, color, and material.
5. Correct any uncertain attributes before approval; AI results are always
   suggestions, not authoritative data.
