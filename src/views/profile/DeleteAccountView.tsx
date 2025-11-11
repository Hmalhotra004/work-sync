"use client";

import FormInput from "@/components/form/FormInput";
import AlertError from "@/components/ui/alert-error";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/authClient";
import { useTRPC } from "@/trpc/client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  password: z.string().min(6, { error: "Minimum 6 characters" }),
});

const DeleteAccountView = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const trpc = useTRPC();
  const router = useRouter();

  const { data: user } = useSuspenseQuery(
    trpc.profile.getProfile.queryOptions()
  );

  const deleteUser = useMutation(
    trpc.profile.deleteAccount.mutationOptions({
      onSuccess: () => {
        authClient.signOut({
          fetchOptions: {
            onSuccess: () => router.replace("/sign-in"),
          },
        });
      },
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      {
        email: user.email,
        password: values.password,
      },
      {
        onSuccess: async () => {
          deleteUser.mutate();
        },
        onError: ({ error }) => {
          setError(error.message);
          setPending(false);
        },
      }
    );
  }

  return (
    <Card className="w-full h-full md:w-[486px] border-none shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Delete Account</CardTitle>
        <CardDescription>
          Enter your account password to delete account permanently.
        </CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              name="password"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormInput
                      type="password"
                      placeholder="Password"
                      disabled={pending}
                      field={field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!!error && <AlertError error={error} />}

            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              disabled={pending}
            >
              {pending ? <Spinner /> : "Delete Account"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="mx-auto">
        <Button
          variant="ghost"
          size="lg"
          className="cursor-pointer text-blue-700 text-sm hover:text-blue-500 transition"
          disabled={pending}
          onClick={() => {
            if (pending) return;
            router.back();
          }}
        >
          Cancel
        </Button>
      </CardFooter>
    </Card>
  );
};

export default DeleteAccountView;
