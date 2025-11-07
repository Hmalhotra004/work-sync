"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";

import DottedSeparator from "@/components/dotted-separator";
import FormInput from "@/components/form/FormInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createWorkspaceSchema } from "@/schemas/workspace/schema";
import { useTRPC } from "@/trpc/client";
import type { WorkspaceType } from "@/types";
import type z from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

interface Props {
  onSuccess?: () => void;
  onCancel?: () => void;
  initialValues?: WorkspaceType;
}

const WorkspaceForm = ({ onCancel, initialValues, onSuccess }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState(initialValues?.image ?? null);
  const [file, setFile] = useState<File | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      image: initialValues?.image ?? undefined,
    },
  });

  const isEdit = !!initialValues?.id;

  const createWorkspace = useMutation(
    trpc.workspace.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.workspace.getMany.queryOptions()
        );
        toast.success("Workspace Created");
        router.replace(`/workspaces/${data.id}`);
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const updateWorkspace = useMutation(
    trpc.workspace.update.mutationOptions({
      onSuccess: async () => {
        await queryClient.invalidateQueries(
          trpc.workspace.getMany.queryOptions()
        );
        await queryClient.invalidateQueries(
          trpc.workspace.getOne.queryOptions({
            workspaceId: initialValues!.id!,
          })
        );
        toast.success("Workspace Updated");
        onSuccess?.();
      },
      onError: (error) => toast.error(error.message),
    })
  );

  const deleteWorkspaceImage = useMutation(
    trpc.workspace.deleteWorkspaceImage.mutationOptions()
  );

  const getSignature = useMutation(
    trpc.cloudinary.getUploadSignature.mutationOptions()
  );

  async function uploadImageToCloudinary(file: File) {
    const { cloudName, apiKey, timestamp, signature, folder } =
      await getSignature.mutateAsync({ folder: "Workspace" });

    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp.toString());
    formData.append("signature", signature);
    formData.append("folder", folder);

    const uploadRes = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: "POST", body: formData }
    );

    if (!uploadRes.ok) throw new Error("Image upload failed");
    const uploadData = await uploadRes.json();
    return uploadData.secure_url as string;
  }

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const selected = e.target.files?.[0];
    if (!selected) return;

    if (!selected.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      return;
    }

    if (selected.size > 5 * 1024 * 1024) {
      toast.error("Image size must be less than 5MB");
      return;
    }

    setFile(selected);
    setPreview(URL.createObjectURL(selected));
    form.setValue("image", URL.createObjectURL(selected));
  }

  function clearImg() {
    setFile(null);
    setPreview(null);
    form.setValue("image", null);
    if (inputRef.current) inputRef.current.value = "";
  }

  const onSubmit = async (values: z.infer<typeof createWorkspaceSchema>) => {
    try {
      setIsPending(true);
      let imageUrl = values.image;

      if (file) {
        if (isEdit && initialValues.image) {
          await deleteWorkspaceImage.mutateAsync({
            workspaceId: initialValues.id,
          });
        }

        imageUrl = await uploadImageToCloudinary(file);
      } else if (isEdit && !file) {
        if (preview) {
          imageUrl = preview;
        } else {
          await deleteWorkspaceImage.mutateAsync({
            workspaceId: initialValues.id,
          });
          imageUrl = undefined;
        }
      }

      if (isEdit) {
        await updateWorkspace.mutateAsync({
          id: initialValues?.id,
          name: values.name,
          image: imageUrl ?? undefined,
          workspaceId: initialValues.id,
        });
      } else {
        await createWorkspace.mutateAsync({
          name: values.name,
          image: imageUrl ?? undefined,
        });
        setFile(null);
        setPreview(null);
        form.reset();
      }
    } catch (err) {
      if (err instanceof Error) {
        toast.error(err.message);
      } else {
        toast.error("An unknown error occurred");
      }
    } finally {
      setIsPending(false);
    }
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="flex flex-col gap-y-5"
      >
        <FormField
          name="name"
          control={form.control}
          render={({ field }) => (
            <FormItem>
              <FormLabel>Workspace Name</FormLabel>
              <FormControl>
                <FormInput
                  type="text"
                  placeholder="Enter workspace name"
                  autoComplete="off"
                  disabled={isPending}
                  field={field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          name="image"
          control={form.control}
          render={() => (
            <div className="flex flex-col gap-y-2">
              <div className="flex items-center gap-x-5">
                {preview ? (
                  <div className="relative size-[72px] rounded-md">
                    <Image
                      src={preview}
                      alt="Workspace Image"
                      fill
                      className="object-cover rounded-md"
                    />
                  </div>
                ) : (
                  <Avatar className="size-[72px]">
                    <AvatarFallback>
                      <ImageIcon className="size-[36px] text-foreground-400" />
                    </AvatarFallback>
                  </Avatar>
                )}

                <FormControl>
                  <div>
                    <p className="text-sm font-medium">Workspace Icon</p>
                    <p className="text-sm text-muted-foreground">
                      JPG, PNG, JPEG or SVG (max 5MB)
                    </p>
                    <input
                      ref={inputRef}
                      type="file"
                      accept=".jpg, .jpeg, .png, .svg"
                      className="hidden"
                      disabled={isPending}
                      onChange={handleImageSelect}
                    />
                    {preview ? (
                      <Button
                        type="button"
                        variant="destructive"
                        size="xs"
                        className="mt-2 w-fit"
                        onClick={clearImg}
                        disabled={isPending}
                      >
                        Remove Image
                      </Button>
                    ) : (
                      <Button
                        type="button"
                        variant="teritary"
                        size="xs"
                        className="mt-2 w-fit"
                        onClick={() => inputRef.current?.click()}
                        disabled={isPending}
                      >
                        Upload Image
                      </Button>
                    )}
                  </div>
                </FormControl>
              </div>
              <FormMessage />
            </div>
          )}
        />

        <DottedSeparator />

        <div className="flex items-center justify-between">
          <Button
            type="button"
            variant="secondary"
            size="lg"
            onClick={onCancel}
            disabled={isPending}
            className={cn(!onCancel && "invisible")}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="lg"
            disabled={isPending}
          >
            {isEdit ? "Update" : "Create"} Workspace
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkspaceForm;
