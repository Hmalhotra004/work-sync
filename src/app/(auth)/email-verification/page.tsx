import { Suspense } from "react";

import EmailVerificationView from "@/views/auth/email-verification/EmailVerificationView";

interface Props {
  searchParams: Promise<{ email: string }>;
}

const EmailVerification = async ({ searchParams }: Props) => {
  const email = (await searchParams).email;

  return (
    <Suspense>
      <EmailVerificationView email={email} />
    </Suspense>
  );
};

export default EmailVerification;
