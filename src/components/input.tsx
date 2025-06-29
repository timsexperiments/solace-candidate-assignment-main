export function Input({ className, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      className={[
        "rounded-md border border-gray-300 px-4 py-2 focus:border-green-700 focus:outline-none",
        className,
      ].join(" ")}
      {...props}
    />
  );
}
