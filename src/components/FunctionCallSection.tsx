"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";

export interface FunctionItem {
  name: string;
  description?: string;
  func: () => Promise<any> | any;
}

export default function FunctionCallSection({
  functions,
}: {
  functions: FunctionItem[];
}) {
  const [result, setResult] = useState<string>("");
  const [loading, setLoading] = useState<string | null>(null);

  const handleCall = async (item: FunctionItem) => {
    setLoading(item.name);
    setResult("");
    try {
      const res = await item.func();
      setResult(
        `【${item.name}】执行结果：` +
          (typeof res === "object" ? JSON.stringify(res) : String(res))
      );
    } catch (e: any) {
      setResult(`【${item.name}】执行出错：` + e?.message || String(e));
    } finally {
      setLoading(null);
    }
  };

  return (
    <section className="my-8 p-6 bg-muted rounded-lg shadow space-y-4">
      <h2 className="text-xl font-bold mb-2">功能调用区</h2>
      <div className="flex flex-wrap gap-4">
        {functions.map((item) => (
          <Button
            key={item.name}
            onClick={() => handleCall(item)}
            disabled={loading === item.name}
            variant="secondary"
          >
            {item.name}
          </Button>
        ))}
      </div>
      {result && (
        <div className="mt-4 p-3 bg-background rounded text-sm break-all border border-border">
          {result}
        </div>
      )}
    </section>
  );
}
