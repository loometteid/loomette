export type FavoriteItem = {
  id: string;
  name: string | null;
  category: string | null;
  image_url: string | null;
};

export type AppNotification = {
  id: string;
  userId: string;
  title: string;
  description: string;
  isRead: boolean;
  createdAt: string;
};
