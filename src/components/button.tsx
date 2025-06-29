"use client";

export function Button({
  className,
  children,
  ...props
}: React.ComponentProps<"button">) {
  return (
    <button
      className={[
        "flex items-center rounded-md bg-green-700 px-4 py-2 text-white",
        className,
      ].join(" ")}
      {...props}>
      {children}
    </button>
  );
}
