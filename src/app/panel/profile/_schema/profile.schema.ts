import { z } from "zod";
export const profileSchema=z.object({firstName:z.string().trim().min(2,"نام را وارد کنید"),lastName:z.string().trim().min(2,"نام خانوادگی را وارد کنید"),mobile:z.string().regex(/^0?9\d{9}$/,"شماره همراه معتبر نیست"),email:z.email("ایمیل معتبر نیست").or(z.literal("")),city:z.string().min(1),bio:z.string().max(300)});
export type ProfileValues=z.infer<typeof profileSchema>;

