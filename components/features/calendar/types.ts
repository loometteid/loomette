export type DiaryEntry = {
  id: string;
  worn_on: string;
  outfit: {
    id: string;
    cover_image_url: string | null;
  } | null;
};
