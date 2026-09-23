'use server';

import { updateTag } from "next/cache";

export default async function revalidateCalendarCache(userId: string): Promise<void> {
    updateTag(`diary-${userId}`)
}
