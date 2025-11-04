"use client";

import FormInput from "@/components/form/FormInput";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { authClient } from "@/lib/authClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import AlertError from "@/components/AlertError";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

const formSchema = z.object({
  email: z.email().min(1, { error: "Email is required" }),
});

const Page = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setError(null);
    setPending(true);

    await authClient.emailOtp.sendVerificationOtp(
      {
        email: values.email,
        type: "forget-password",
      },
      {
        onSuccess: () => {
          setPending(false);
          router.replace(`/forgot-password/verify-otp?email=${values.email}`);
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
        <CardTitle className="text-2xl">Forgot Password</CardTitle>
        <CardDescription>
          Enter the email associated with your account for verification
        </CardDescription>
      </CardHeader>
      <CardContent className="px-7">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-4"
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormInput
                      type="email"
                      placeholder="Email"
                      autoComplete="email"
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
              size="lg"
              className="w-full"
              disabled={pending}
            >
              {pending ? <Loader /> : "Send OTP"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <CardFooter className="mx-auto">
        <p
          onClick={() => {
            if (pending) return;
            router.back();
          }}
          className="cursor-pointer text-blue-700 text-sm hover:text-blue-500 transition"
        >
          Back to login
        </p>
      </CardFooter>
    </Card>
  );
};

export default Page;
