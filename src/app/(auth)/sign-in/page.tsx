"use client";
import { useState } from "react";

import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

import FormInput from "@/components/form/FormInput";
import Loader from "@/components/Loader";
import AlertError from "@/components/ui/alert-error";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedSeparator from "@/components/ui/dotted-separator";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { authClient } from "@/lib/authClient";

const formSchema = z.object({
  email: z.email().min(2, { error: "Email is required" }).max(50),
  password: z.string().min(6, { error: "Minimum 6 Characters" }).max(50),
});

type FormData = z.infer<typeof formSchema>;

const SignInView = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormData) {
    setError(null);
    setPending(true);

    await authClient.signIn.email(
      {
        email: values.email,
        password: values.password,
      },
      {
        onSuccess: () => {
          router.replace("/");
        },
        onError: ({ error }) => {
          setError(error.message);
        },
        onResponse: () => {
          setPending(false);
        },
      }
    );
  }

  function onSocial(provider: "google" | "github") {
    setError(null);
    setPending(true);

    authClient.signIn.social(
      {
        provider: provider,
        callbackURL: "/",
      },
      {
        onError: ({ error }) => {
          setError(error.message);
        },
        onResponse: () => {
          setPending(false);
        },
      }
    );
  }

  return (
    <Card className="w-full h-full md:w-[486px] border-none shadow-none">
      <CardHeader className="flex items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Welcome back!</CardTitle>
      </CardHeader>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="px-7">
        <Form {...form}>
          <form
            className="space-y-4"
            onSubmit={form.handleSubmit(onSubmit)}
          >
            <FormField
              name="email"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormInput
                      type="email"
                      autoComplete="email"
                      placeholder="Email"
                      disabled={pending}
                      field={field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
                  <FormDescription>
                    <Link href={`/forgot-password`}>Forgot Password</Link>
                  </FormDescription>
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
              {pending ? <Loader /> : "Sign In"}
            </Button>
          </form>
        </Form>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="px-7 flex flex-col gap-y-4">
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={pending}
          onClick={() => onSocial("google")}
        >
          <FcGoogle className="size-5" />
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={pending}
          onClick={() => onSocial("github")}
        >
          <FaGithub className="size-5" />
        </Button>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="px-7 flex items-center justify-center">
        <p>
          Don&apos;t have an account?{" "}
          <Link href={`/sign-up`}>
            <span className="text-blue-700">Sign Up</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignInView;
