import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useState } from "react";
import { useApp } from "@/lib/store";
import { RoleShell } from "@/components/RoleShell";
import { clientNav } from "@/components/nav-configs";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export const Route = createFileRoute("/client/new")({
  head: () => ({ meta: [{ title: "Create Project — BuildSync-3D" }] }),
  component: CreateProject,
});

function CreateProject() {
  const { createProject, currentUser } = useApp();
  const navigate = useNavigate();
  const [name, setName] = useState("");
  const [estimatedCost, setEstimatedCost] = useState(120000);
  const [siteAddress, setSiteAddress] = useState("");
  const [preview, setPreview] = useState<string>("");

  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(f);
  };

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;
    if (!name) { toast.error("Project name required."); return; }
    createProject({
      name,
      estimatedCost,
      clientId: currentUser.id,
      blueprintImageUrl: preview || "https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=70",
    });
    toast.success("Project submitted for approval.");
    void siteAddress;
    navigate({ to: "/client" });
  };

  return (
    <RoleShell role="client" title="Create a new project" nav={clientNav}>
      <Card className="p-6 max-w-3xl">
        <form className="space-y-5" onSubmit={submit}>
          <div className="space-y-1.5">
            <Label>Project name</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Voss Residence — Ridgeway" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label>Estimated cost (USD)</Label>
              <Input type="number" value={estimatedCost} onChange={(e) => setEstimatedCost(Number(e.target.value))} />
            </div>
            <div className="space-y-1.5">
              <Label>Site location address</Label>
              <Input value={siteAddress} onChange={(e) => setSiteAddress(e.target.value)} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Blueprint image</Label>
            <Input type="file" accept="image/*" onChange={onFile} />
            {preview && (
              <img src={preview} alt="Blueprint preview" className="mt-3 rounded-md border border-border max-h-64 object-contain bg-muted/40" />
            )}
            <p className="text-xs text-muted-foreground">
              We'll generate a 3D model from this drawing — you'll see a starter layout right away.
            </p>
          </div>
          <Button type="submit">Submit for approval</Button>
        </form>
      </Card>
    </RoleShell>
  );
}
