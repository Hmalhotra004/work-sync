import { Suspense } from "react";

import ChangePasswordView from "@/views/auth/forgot-password/ChangePasswordView";

interface Props {
  searchParams: Promise<{ email: string }>;
}

const ChangePassword = async ({ searchParams }: Props) => {
  const email = (await searchParams).email;

  return (
    <Suspense>
      <ChangePasswordView email={email} />
    </Suspense>
  );
};

export default ChangePassword;
