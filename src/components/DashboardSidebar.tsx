import Image from "next/image";
import Link from "next/link";
import DottedSeparator from "./DottedSeparator";
import Navigation from "./Navigation";

const DashboardSidebar = () => {
  return (
    <aside className="h-full bg-sidebar p-4 w-full">
      <Link href={"/"}>
        <Image
          src={"/logo.svg"}
          width={164}
          height={48}
          alt="logo"
        />
      </Link>

      <DottedSeparator className="my-4" />

      <Navigation />
    </aside>
  );
};

export default DashboardSidebar;
