import { createFileRoute, Outlet, redirect } from "@tanstack/react-router";

async function getMe() {
  const res = await fetch("/api/auth/me", {
    credentials: "include",
  });

  if (!res.ok) return null;
  return res.json();
}

export const Route = createFileRoute("/_authenticated")({
  ssr: false,
  beforeLoad: async () => {
    const user = await getMe();

    if (!user) {
      throw redirect({ to: "/auth" });
    }

    return { user };
  },
  component: () => <Outlet />,
});