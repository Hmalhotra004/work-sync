"use client";

import DottedSeparator from "@/components/DottedSeparator";
import FormInput from "@/components/form/FormInput";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { createWorkspaceSchema } from "@/schemas";
import { useTRPC } from "@/trpc/client";
import { WorkspaceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ImageIcon, X } from "lucide-react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import z from "zod";

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

const WorkspaceForm = ({ onCancel, initialValues }: Props) => {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const router = useRouter();

  const [isPending, setIsPending] = useState(false);
  const [preview, setPreview] = useState<string | null>(
    initialValues?.image ?? null
  );
  const [file, setFile] = useState<File | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);

  const createWorkspace = useMutation(
    trpc.workspace.create.mutationOptions({
      onSuccess: async (data) => {
        await queryClient.invalidateQueries(
          trpc.workspace.getMany.queryOptions()
        );

        toast.success("Workspace Created");
        router.replace(`/workspaces/${data.id}`);
      },

      onError: (error) => {
        toast.error(error.message);
      },
    })
  );

  const getSignature = useMutation(
    trpc.cloudinary.getUploadSignature.mutationOptions()
  );

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: initialValues?.name ?? "",
      image: initialValues?.image ?? undefined,
    },
  });

  const isEdit = !!initialValues?.id;

  const onSubmit = async (values: z.infer<typeof createWorkspaceSchema>) => {
    try {
      setIsPending(true);
      let imageUrl = values.image;

      if (file) {
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
          {
            method: "POST",
            body: formData,
          }
        );

        const uploadData = await uploadRes.json();
        imageUrl = uploadData.secure_url;
      }

      if (isEdit) {
        console.log("edit");
      } else {
        await createWorkspace.mutateAsync({
          name: values.name,
          image: imageUrl,
        });
      }

      form.reset();
      setPreview(null);
      setFile(null);
    } catch (error) {
      console.error(error);
      toast.error("Failed to create workspace");
    } finally {
      setIsPending(false);
    }
  };

  function handleImageSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Only image files are allowed");
      e.target.value = "";
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image size must be less than 10MB");
      e.target.value = "";
      return;
    }

    setFile(file);
    setPreview(URL.createObjectURL(file));
  }

  function clearImg() {
    setFile(null);
    setPreview(null);
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className=" flex flex-col gap-y-5"
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
                  placeholder="Enter Workspace Name"
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
                  <div className="size-[72px] relative rounded-md">
                    <div className="absolute z-[100] -right-1.5 -top-1.5">
                      <button
                        className="bg-destructive rounded-full p-0.5 cursor-pointer disabled:opacity-0"
                        type="button"
                        disabled={isPending}
                        onClick={clearImg}
                      >
                        <X className="size-3.5 text-white" />
                      </button>
                    </div>

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
                <div className="flex flex-col">
                  <p className="text-sm">Workspace Icon</p>
                  <p className="text-sm text-muted-foreground">
                    JPG, PNG, JPEG or SVG, max 10MB
                  </p>

                  <input
                    type="file"
                    accept=".jpg, .png, .jpeg, .svg"
                    ref={inputRef}
                    className="hidden"
                    disabled={isPending}
                    onChange={handleImageSelect}
                  />

                  <Button
                    type="button"
                    variant="teritary"
                    size="xs"
                    className="w-fit mt-2"
                    onClick={() => inputRef.current?.click()}
                    disabled={isPending}
                  >
                    Upload Image
                  </Button>
                </div>
              </div>
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
            {isEdit ? "Edit" : "Create"} Workspace
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default WorkspaceForm;
