import { z } from "zod";
export const passwordSchema=z.object({currentPassword:z.string().min(1,"رمز فعلی را وارد کنید"),newPassword:z.string().min(8,"رمز جدید حداقل ۸ کاراکتر باشد"),confirmation:z.string()}).refine((data)=>data.newPassword===data.confirmation,{path:["confirmation"],message:"تکرار رمز عبور یکسان نیست"});
export type PasswordValues=z.infer<typeof passwordSchema>;

