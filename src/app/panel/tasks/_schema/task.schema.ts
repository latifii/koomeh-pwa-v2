import { z } from "zod";
export const taskSchema=z.object({title:z.string().trim().min(3,"عنوان وظیفه را وارد کنید"),description:z.string().trim().min(5,"توضیحات را وارد کنید"),dueAt:z.string().min(1,"زمان انجام را وارد کنید"),priority:z.enum(["low","normal","high"]),relatedTo:z.string(),assignee:z.string().min(1)});
export type TaskValues=z.infer<typeof taskSchema>;

