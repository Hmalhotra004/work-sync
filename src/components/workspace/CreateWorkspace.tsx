"use client";

import DottedSeparator from "@/components/DottedSeparator";
import FormInput from "@/components/form/FormInput";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { createWorkspaceSchema } from "@/schemas";
import { useTRPC } from "@/trpc/client";
import { WorkspaceType } from "@/types";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import Image from "next/image";
import { useState } from "react";
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

const CreateWorkspace = ({ onCancel, onSuccess, initialValues }: Props) => {
  const trpc = useTRPC();
  const [isPending, setIsPending] = useState(false);

  const [preview, setPreview] = useState<string | null>(
    initialValues?.image ?? null
  );

  const [file, setFile] = useState<File | null>(null);

  const createWorkspace = useMutation(
    trpc.workspace.create.mutationOptions({
      onSuccess: async () => {
        // await queryClient.invalidateQueries(
        //   trpc.workspace.getMany.queryOptions()
        // );
        toast.success("Workspace Created");
        onSuccess?.();
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
      setIsPending(true);
    }
  };

  return (
    <Card className="w-full h-full border-none shadow-none">
      <CardHeader className="flex px-7">
        <CardTitle className="text-xl font-bold">
          {isEdit ? "Edit workspace" : "Create a new workspace"}
        </CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="px-7">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
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
                <FormItem>
                  <FormLabel>Workspace Image</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-3">
                      {preview && (
                        <Image
                          src={preview}
                          alt="Workspace Preview"
                          width={64}
                          height={64}
                          className="rounded-md border object-cover"
                        />
                      )}
                      <input
                        type="file"
                        accept="image/*"
                        disabled={isPending}
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;

                          // ✅ Validate type
                          if (!file.type.startsWith("image/")) {
                            toast.error("Only image files are allowed");
                            e.target.value = "";
                            return;
                          }

                          // ✅ Validate size (<5MB)
                          if (file.size > 5 * 1024 * 1024) {
                            toast.error("Image size must be less than 5MB");
                            e.target.value = "";
                            return;
                          }

                          setFile(file);
                          setPreview(URL.createObjectURL(file));
                        }}
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
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
      </CardContent>
    </Card>
  );
};

export default CreateWorkspace;
