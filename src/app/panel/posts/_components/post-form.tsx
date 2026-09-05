"use client";

import { useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery } from "@tanstack/react-query";
import { FileText, ImagePlus, Save, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";

import { savePost } from "@/app/panel/posts/_api/posts.service";
import { postsQueryOptions } from "@/app/panel/posts/_queries/posts.query";
import {
  postFormSchema,
  type PostDetail,
  type PostFormValues,
} from "@/app/panel/posts/_schemas/posts.schema";
import articleImage from "@/assets/images/card/apartman.webp";
import { ApiImage } from "@/components/shared/api-image";
import {
  FormBooleanField,
  FormDateField,
  FormTextField,
  FormTextareaField,
  LookupSelect,
  type FormContext,
} from "@/components/shared/form";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Spinner } from "@/components/ui/spinner";
import { Typography } from "@/components/ui/typography";
import { getApiErrorMessage } from "@/lib/api/api-error";
import { routes } from "@/lib/routes";

const TYPES = [
  { value: "post", title: "مطلب" },
  { value: "page", title: "برگه" },
];

const EMPTY: PostFormValues = {
  title: "",
  description: "",
  body: "",
  category_id: "",
  type: "post",
  lang: "",
  link_rewrite: "",
  meta_title: "",
  meta_description: "",
  expire_at: "",
  video: "",
  tags: "",
  active: true,
  access_expert: false,
};

const text = (value: unknown) =>
  value === null || value === undefined ? "" : String(value);

function defaultsFrom(post: PostDetail): PostFormValues {
  return {
    title: post.title,
    description: text(post.description),
    body: text(post.body),
    category_id: text(post.category_id),
    type: text(post.type) || "post",
    lang: text(post.lang),
    link_rewrite: text(post.link_rewrite),
    meta_title: text(post.meta_title),
    meta_description: text(post.meta_description),
    expire_at: text(post.expire_at),
    video: text(post.video),
    tags: post.tags
      .map((tag) => (typeof tag === "string" ? tag : tag.name))
      .join("، "),
    active: post.active,
    access_expert: post.access_expert,
  };
}

/**
 * The article form.
 *
 * Everything goes as multipart, because the cover picture rides in the same
 * body and the API describes the endpoint that way. Leaving the picture alone
 * means not sending the field at all — an empty one would not be "keep what is
 * there", it would be a file that is not a file.
 */
export function PostForm({ post }: { post?: PostDetail }) {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  // The category list lives on the list response, which is cached anyway.
  const categories = useQuery(postsQueryOptions({}, 1));

  const form = useForm<PostFormValues>({
    resolver: zodResolver(postFormSchema),
    defaultValues: post ? defaultsFrom(post) : EMPTY,
  });

  const mutation = useMutation({
    mutationFn: (values: PostFormValues) => {
      const body = new FormData();
      const put = (key: string, value: string) => {
        if (value !== "") body.append(key, value);
      };

      body.append("title", values.title);
      put("description", values.description);
      put("body", values.body);
      put("category_id", values.category_id);
      put("type", values.type);
      put("lang", values.lang);
      put("link_rewrite", values.link_rewrite);
      put("meta_title", values.meta_title);
      put("meta_description", values.meta_description);
      put("expire_at", values.expire_at);
      put("video", values.video);
      body.append("active", values.active ? "1" : "0");
      body.append("access_expert", values.access_expert ? "1" : "0");

      for (const tag of values.tags
        .split(/[،,]/)
        .map((part) => part.trim())
        .filter(Boolean)) {
        body.append("tags[]", tag);
      }

      if (image) body.append("image", image);

      return savePost(body, post?.id);
    },
    onSuccess: () => {
      toast.success(post ? "مطلب ذخیره شد." : "مطلب ثبت شد.");
      startNavigation(() => {
        router.push(routes.panel.posts);
        router.refresh();
      });
    },
    onError: (error) => toast.error(getApiErrorMessage(error)),
  });

  const context: FormContext<PostFormValues> = {
    control: form.control,
    register: form.register,
    errors: form.formState.errors,
  };

  const chooseImage = (file: File | null) => {
    if (preview) URL.revokeObjectURL(preview);
    setImage(file);
    setPreview(file ? URL.createObjectURL(file) : null);
  };

  return (
    <form
      onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
      className="grid grid-cols-1 gap-4"
    >
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="size-4 text-brand" />
            متن
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <FormTextField {...context} name="title" label="عنوان" required />
          <FormTextareaField
            {...context}
            name="description"
            label="چکیده"
            rows={2}
          />
          <FormTextareaField
            {...context}
            name="body"
            label="متن کامل"
            rows={10}
          />

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
            <LookupSelect
              control={form.control}
              name="category_id"
              label="دسته"
              options={categories.data?.categories ?? []}
              allowEmpty
            />
            <LookupSelect
              control={form.control}
              name="type"
              label="نوع"
              options={TYPES}
            />
            <FormDateField
              {...context}
              name="expire_at"
              label="انقضا"
              placeholder="بی‌انقضا"
              hint="خالی یعنی بی‌انقضا"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ImagePlus className="size-4 text-brand" />
            تصویر و ویدیو
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-3">
            <Label>تصویر شاخص</Label>

            <div className="flex flex-wrap items-center gap-3">
              {(preview || post?.image) && (
                <div className="relative aspect-4/3 w-40 shrink-0 overflow-hidden rounded-lg border bg-muted">
                  {preview ? (
                    // A blob URL the optimizer cannot process.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={preview} alt="" className="size-full object-cover" />
                  ) : (
                    <ApiImage
                      src={post?.image ?? ""}
                      fallbackSrc={articleImage}
                      alt=""
                      fill
                      sizes="160px"
                      className="object-cover"
                    />
                  )}
                </div>
              )}

              <div className="flex flex-wrap items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => fileRef.current?.click()}
                >
                  <ImagePlus />
                  {post?.image ? "جایگزینی تصویر" : "انتخاب تصویر"}
                </Button>
                {image && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-destructive"
                    onClick={() => chooseImage(null)}
                  >
                    <Trash2 />
                    انصراف از تصویر تازه
                  </Button>
                )}
              </div>
            </div>

            <Typography variant="small">
              {post
                ? "تا وقتی تصویر تازه‌ای انتخاب نکنید، تصویر فعلی سر جایش می‌ماند."
                : "jpg، png یا webp."}
            </Typography>

            <input
              ref={fileRef}
              type="file"
              accept="image/jpeg,image/png,image/webp"
              hidden
              onChange={(event) => chooseImage(event.target.files?.[0] ?? null)}
            />
          </div>

          <FormTextField
            {...context}
            name="video"
            label="ویدیو (آپارات)"
            hint="نشانی ویدیو، نه فایل"
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="size-4 text-brand" />
            انتشار و سئو
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-5">
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormBooleanField {...context} name="active" label="منتشر شود" />
            <FormBooleanField
              {...context}
              name="access_expert"
              label="فقط برای مشاوران"
            />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormTextField {...context} name="link_rewrite" label="نشانی یکتا" />
            <FormTextField {...context} name="tags" label="برچسب‌ها" hint="با ویرگول" />
          </div>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <FormTextField {...context} name="meta_title" label="عنوان متا" />
            <FormTextField
              {...context}
              name="meta_description"
              label="توضیح متا"
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex flex-wrap items-center gap-3">
        <Button
          type="submit"
          size="lg"
          disabled={mutation.isPending || isNavigating}
        >
          {mutation.isPending || isNavigating ? (
            <Spinner data-icon="inline-start" />
          ) : (
            <Save data-icon="inline-start" />
          )}
          {post ? "ذخیره تغییرها" : "ثبت مطلب"}
        </Button>
      </div>
    </form>
  );
}
