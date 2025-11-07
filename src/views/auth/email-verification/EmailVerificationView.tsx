"use client";

import AlertError from "@/components/alert-error";
import Loader from "@/components/Loader";
import { Button } from "@/components/ui/button";
import useOTPExpire from "@/hooks/useOTPExpire";
import { authClient } from "@/lib/authClient";
import { zodResolver } from "@hookform/resolvers/zod";
import { REGEXP_ONLY_DIGITS } from "input-otp";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
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
  FormDescription,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";

interface Props {
  email: string;
}

const formSchema = z.object({
  pin: z.string().min(6, {
    message: "Your one-time password must be 6 characters.",
  }),
});

type FormData = z.infer<typeof formSchema>;

const EmailVerificationView = ({ email }: Props) => {
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [otpSent, setOtpSent] = useState(false);

  useEffect(() => {
    async function sent() {
      await authClient.emailOtp.sendVerificationOtp({
        email: email,
        type: "email-verification",
      });
      setOtpSent(true);
    }
    if (!otpSent) {
      sent();
    }
  }, [email, otpSent]);

  const router = useRouter();
  const { isExpired, minutes, seconds, reset } = useOTPExpire();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      pin: "",
    },
  });

  function onSubmit(data: FormData) {
    setPending(true);
    authClient.emailOtp.checkVerificationOtp({
      email: email!,
      type: "email-verification",
      otp: data.pin,
      fetchOptions: {
        onSuccess: () => {
          authClient.emailOtp.verifyEmail({
            email: email!,
            otp: data.pin,
            fetchOptions: {
              onSuccess: () => {
                setPending(false);
                router.replace("/");
              },
              onError: ({ error }) => {
                setPending(false);
                setError(error.message);
              },
            },
          });
        },
        onError: ({ error }) => {
          setPending(false);
          setError(error.message);
        },
      },
    });
  }

  return (
    <Card className="w-full h-full md:w-[486px] border-2 shadow-none">
      <CardHeader className="flex flex-col items-center justify-center text-center px-7 pt-1">
        <CardTitle className="text-2xl">Email Verification</CardTitle>
        <CardDescription>
          Please enter the one-time password sent to <br />
          {email}
        </CardDescription>
      </CardHeader>

      <CardContent className="px-7">
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-6 w-full justify-center flex flex-col"
          >
            <FormField
              control={form.control}
              name="pin"
              render={({ field }) => (
                <FormItem className="w-full flex flex-col justify-center items-center gap-y-2">
                  <FormControl>
                    <InputOTP
                      maxLength={6}
                      pattern={REGEXP_ONLY_DIGITS}
                      {...field}
                    >
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                        <InputOTPSlot index={4} />
                        <InputOTPSlot index={5} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>

                  <FormDescription className="flex flex-col gap-1">
                    <span>
                      OTP will expire in{" "}
                      <span className="font-semibold">
                        {minutes}:{seconds}
                      </span>
                    </span>
                    <Button
                      variant="ghost"
                      disabled={!isExpired}
                      onClick={async () => {
                        await authClient.emailOtp.sendVerificationOtp({
                          email: email!,
                          type: "email-verification",
                          fetchOptions: {
                            onSuccess: () => reset(),

                            onError: ({ error }) => {
                              setError(error.message);
                            },
                          },
                        });
                      }}
                    >
                      Resend OTP
                    </Button>
                  </FormDescription>

                  <FormMessage />
                </FormItem>
              )}
            />

            {!!error && <AlertError error={error} />}

            <Button
              type="submit"
              disabled={pending}
            >
              {pending ? <Loader /> : "Submit"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
};

export default EmailVerificationView;
