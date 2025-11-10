"use client";

import ProfileForm from "@/components/form/ProfileFom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { User } from "better-auth";
import { useTheme } from "next-themes";

interface Props {
  user: User;
}

const SettingsView = ({ user }: Props) => {
  const { theme, setTheme } = useTheme();

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
              // disabled={deleteWorkspace.isPending}
              // onClick={handleDelete}
            >
              {0 ? <Spinner /> : "Change Email"}
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
              // disabled={deleteWorkspace.isPending}
              // onClick={handleDelete}
            >
              {0 ? <Spinner /> : "Change Password"}
            </Button>
          </div>

          <div className="flex justify-between">
            <h3 className="font-bold">Dark Mode</h3>
            <Switch />
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
              // disabled={deleteWorkspace.isPending}
              // onClick={handleDelete}
            >
              {0 ? <Spinner /> : "Delete Account"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SettingsView;
