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
  // const queryClient = useQueryClient();

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

  const form = useForm<z.infer<typeof createWorkspaceSchema>>({
    resolver: zodResolver(createWorkspaceSchema),
    defaultValues: {
      name: "",
    },
  });

  const isEdit = !!initialValues?.id;
  const isPending = createWorkspace.isPending;

  const onSubmit = async (values: z.infer<typeof createWorkspaceSchema>) => {
    if (isEdit) {
      console.log("edit");
    } else {
      form.reset();
      createWorkspace.mutateAsync(values);
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
