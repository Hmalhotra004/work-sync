"use client";

import AlertError from "@/components/alert-error";
import FormInput from "@/components/form/FormInput";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DottedSeparator from "@/components/ui/dotted-separator";
import { authClient } from "@/lib/authClient";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { FaGithub } from "react-icons/fa";
import { FcGoogle } from "react-icons/fc";
import { z } from "zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  name: z.string().min(1, { error: "name is required" }),
  email: z.email().min(2, { error: "Email is required" }).max(50),
  password: z.string().min(6, { error: "Minimum 6 Characters" }).max(50),
});

type FormData = z.infer<typeof formSchema>;

const SignUpView = () => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const router = useRouter();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
    },
  });

  async function onSubmit(values: FormData) {
    setError(null);
    setPending(true);

    await authClient.signUp.email(
      {
        email: values.email,
        name: values.name,
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

  return (
    <Card className="w-full h-full md:w-[486px] border-none shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Sign Up</CardTitle>
        {/* <CardDescription>
          By Signing up, you agree to our{" "}
          <span className="text-blue-700">Privacy Policy </span> and{" "}
          <span className="text-blue-700">Terms of Service</span>
        </CardDescription> */}
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
              name="name"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormControl>
                    <FormInput
                      type="text"
                      placeholder="Name"
                      field={field}
                      disabled={pending}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

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
              {pending ? <Loader /> : "Sign Up"}
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
        >
          <FcGoogle className="size-5" />
        </Button>
        <Button
          variant="secondary"
          size="lg"
          className="w-full"
          disabled={pending}
        >
          <FaGithub className="size-5" />
        </Button>
      </CardContent>

      <div className="px-7">
        <DottedSeparator />
      </div>

      <CardContent className="px-7 flex items-center justify-center">
        <p>
          Already have an account?{" "}
          <Link href={`/sign-in`}>
            <span className="text-blue-700">Sign In</span>
          </Link>
        </p>
      </CardContent>
    </Card>
  );
};

export default SignUpView;
