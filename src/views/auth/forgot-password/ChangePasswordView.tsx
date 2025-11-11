"use client";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { zodResolver } from "@hookform/resolvers/zod";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import z from "zod";

import {
  Card,
  CardContent,
  CardDescription,
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

import FormInput from "@/components/form/FormInput";
import AlertError from "@/components/ui/alert-error";
import { authClient } from "@/lib/authClient";

interface Props {
  email: string;
}

const formSchema = z
  .object({
    password: z.string().min(6, { error: "Minimum 6 characters" }),
    confirmPassword: z.string().min(6, { error: "Minimum 6 characters" }),
  })
  .refine((data) => data.password === data.confirmPassword, {
    error: "Password do not match",
    path: ["confirmPassword"],
  });

type FormData = z.infer<typeof formSchema>;

const ChangePasswordView = ({ email }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();
  const pathname = usePathname();
  const parts = pathname.split("/").filter(Boolean);

  // let key: keyof typeof pathnameMap | undefined;
  const title = parts.includes("profile")
    ? "Reset Password"
    : "Forgot Password";

  const otp = JSON.parse(localStorage.getItem("otp") || "{}");

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  async function onSubmit(data: FormData) {
    setPending(true);
    setError(null);

    await authClient.emailOtp.resetPassword(
      {
        email,
        password: data.confirmPassword,
        otp,
      },
      {
        onSuccess: () => {
          localStorage.removeItem("otp");
          setPending(false);
          router.back();
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      }
    );
  }

  return (
    <Card className="w-full h-full md:w-[486px] border-2 shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">{title}</CardTitle>
        <CardDescription>Please enter new password.</CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4 w-full"
          >
            <FormField
              control={form.control}
              name="password"
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

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormInput
                      type="password"
                      placeholder="Confirm Password"
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
              type="submit"
              disabled={pending}
              className="w-full"
            >
              {pending ? <Loader /> : "Reset Password"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default ChangePasswordView;
