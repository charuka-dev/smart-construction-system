import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "BuildSync-3D — Construction Portal" },
      { name: "description", content: "BuildSync-3D: plan, build and visualize construction projects in 3D." },
    ],
  }),
  component: Index,
});

function Index() {
  const { currentUser } = useApp();
  const navigate = useNavigate();
  useEffect(() => {
    navigate({
      to: currentUser ? (`/${currentUser.role}` as string) : "/auth",
      replace: true,
    });
  }, [currentUser, navigate]);
  return null;
}
