import { inferRouterOutputs } from "@trpc/server";
import { LucideProps } from "lucide-react";
import { ForwardRefExoticComponent, RefAttributes } from "react";
import { type IconType as ReactIconType } from "react-icons/lib";
import { UrlObject } from "url";
import { AppRouter } from "./trpc/routers/_app";

export type WorkspaceType =
  inferRouterOutputs<AppRouter>["workspace"]["getOne"];

export type IconType =
  | ReactIconType
  | ForwardRefExoticComponent<
      Omit<LucideProps, "ref"> & RefAttributes<SVGSVGElement>
    >;

export type HrefType =
  | UrlObject
  | __next_route_internal_types__.RouteImpl<UrlObject>;
