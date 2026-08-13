"use client";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { CheckCircle2, Save } from "lucide-react";
import { FormSelectField,FormTextField,FormTextareaField,type FormContext } from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card,CardContent } from "@/components/ui/card";
import { Typography } from "@/components/ui/typography";
import { taskSchema,type TaskValues } from "../_schema/task.schema";
export function TaskForm(){const [saved,setSaved]=useState(false);const form=useForm<TaskValues>({resolver:zodResolver(taskSchema),defaultValues:{title:"",description:"",dueAt:"",priority:"normal",relatedTo:"",assignee:"current"}});const context:FormContext<TaskValues>={control:form.control,register:form.register,errors:form.formState.errors};return <Card><CardContent className="p-5 sm:p-6"><form onSubmit={form.handleSubmit(()=>setSaved(true))} className="space-y-5"><div className="grid gap-5 sm:grid-cols-2"><FormTextField {...context} name="title" label="عنوان وظیفه" required /><FormTextField {...context} name="dueAt" label="تاریخ و ساعت انجام" type="datetime-local" required /><FormSelectField {...context} name="priority" label="اولویت" placeholder="انتخاب اولویت" options={[{value:"low",label:"کم"},{value:"normal",label:"عادی"},{value:"high",label:"فوری"}]} /><FormSelectField {...context} name="assignee" label="مسئول انجام" placeholder="انتخاب مسئول" options={[{value:"current",label:"حامد کریمی"},{value:"ali",label:"علی محمدی"}]} /><FormTextField {...context} name="relatedTo" label="مرتبط با" placeholder="ملک یا متقاضی (اختیاری)" /></div><FormTextareaField {...context} name="description" label="توضیحات" required rows={5} /><div className="flex items-center gap-3"><Button><Save />ذخیره وظیفه</Button>{saved&&<Typography variant="small" className="flex items-center gap-1 text-emerald-600"><CheckCircle2 className="size-4" />وظیفه ذخیره شد.</Typography>}</div></form></CardContent></Card>}

