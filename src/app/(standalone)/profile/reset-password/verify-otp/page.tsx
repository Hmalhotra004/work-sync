import { Suspense } from "react";

import VerifyOtpView from "@/views/auth/forgot-password/VerifyOtpView";

interface Props {
  searchParams: Promise<{ email: string }>;
}

const VerifyOtp = async ({ searchParams }: Props) => {
  const email = (await searchParams).email;

  return (
    <Suspense>
      <VerifyOtpView email={email} />
    </Suspense>
  );
};

export default VerifyOtp;
