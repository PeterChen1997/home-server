"use client";

import dynamic from "next/dynamic";
import { useSession } from "next-auth/react";

const FunctionCallSection = dynamic(
  () => import("@/components/FunctionCallSection"),
  { ssr: false }
);

export default function FunctionCallArea() {
  const { data: session, status } = useSession();

  if (status !== "authenticated") return null;

  const functions = [
    {
      name: "获取百度图标",
      func: async () => {
        const { fetchIconOnClient } = await import("@/lib/client-utils");
        return fetchIconOnClient("https://www.baidu.com");
      },
    },
    {
      name: "WOL-PC",
      func: async () => {
        const res = await fetch("https://h.hweb.peterchen97.cn/wol/wake/pc", {
          method: "POST",
        });
        return res.text();
      },
    },
    {
      name: "WOL-NAS",
      func: async () => {
        const res = await fetch("https://h.hweb.peterchen97.cn/wol/wake/nas", {
          method: "POST",
        });
        return res.text();
      },
    },
  ];
  return <FunctionCallSection functions={functions} />;
}
