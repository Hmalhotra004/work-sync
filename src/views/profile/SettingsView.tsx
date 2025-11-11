"use client";

import ProfileForm from "@/components/form/ProfileFom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { useTRPC } from "@/trpc/client";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTheme } from "next-themes";
import Link from "next/link";

const SettingsView = () => {
  const { theme, setTheme } = useTheme();
  const trpc = useTRPC();

  const { data: user } = useSuspenseQuery(
    trpc.profile.getProfile.queryOptions()
  );

  return (
    <div className="max-w-5xl mx-auto container h-full w-full flex flex-col gap-y-2">
      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Profile Settings</CardTitle>
        </CardHeader>

        <CardContent>
          <ProfileForm user={user} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-xl font-bold">Other Settings</CardTitle>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="flex max-md:flex-col justify-center">
            <div className="flex flex-col">
              <h3 className="font-bold">Change Email</h3>
              <p className="text-sm text-muted-foreground">
                Deleting a account is irreversible and will remove all
                associated data
              </p>
            </div>

            <Button
              variant="teritary"
              type="button"
              className="max-md:mt-6 w-fit ml-auto"
            >
              Change Email
            </Button>
          </div>

          <div className="flex max-md:flex-col justify-center">
            <div className="flex flex-col">
              <h3 className="font-bold">Change Password</h3>
              <p className="text-sm text-muted-foreground">
                Changing Password will requrie verified email
              </p>
            </div>

            <Button
              variant="teritary"
              type="button"
              className="max-md:mt-6 w-fit ml-auto"
              asChild
            >
              <Link href={`/profile/reset-password`}>Change Password</Link>
            </Button>
          </div>

          <div className="flex justify-between">
            <h3 className="font-bold">Dark Mode</h3>
            <Switch
              checked={theme === "dark"}
              onCheckedChange={(val) => setTheme(val ? "dark" : "light")}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="w-full border-none shadow-none bg-background-100">
        <CardContent className="px-2">
          <div className="flex max-md:flex-col justify-center">
            <div className="flex flex-col">
              <h3 className="font-bold text-red-500">Danger Zone</h3>
              <p className="text-sm text-muted-foreground">
                Deleting a account is irreversible and will remove all
                associated data
              </p>
            </div>

            <Button
              variant="destructive"
              type="button"
              className="max-md:mt-6 w-fit ml-auto"
              asChild
            >
              <Link href={`/profile/delete-account`}>Delete Account</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
