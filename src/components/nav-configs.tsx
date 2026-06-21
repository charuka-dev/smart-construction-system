import {
  Users, FolderKanban, DollarSign, MessageSquare,
  ShieldCheck, BarChart3, PlusCircle, Compass, Eye, Palette, Receipt,
  ClipboardCheck, AlertTriangle, Camera,
} from "lucide-react";
import type { NavItem } from "./RoleShell";

export const contractorNav: NavItem[] = [
  { to: "/contractor", label: "Analytics", icon: <BarChart3 /> },
  { to: "/contractor/users", label: "User Management", icon: <Users /> },
  { to: "/contractor/projects", label: "Projects", icon: <FolderKanban /> },
  { to: "/contractor/costs", label: "Cost & Budget", icon: <DollarSign /> },
  { to: "/contractor/quality", label: "Quality & Approval", icon: <ShieldCheck /> },
  { to: "/contractor/messages", label: "Communication", icon: <MessageSquare /> },
];

export const clientNav: NavItem[] = [
  { to: "/client", label: "My Projects", icon: <FolderKanban /> },
  { to: "/client/new", label: "Create Project", icon: <PlusCircle /> },
  { to: "/client/progress", label: "Track Progress", icon: <Compass /> },
  { to: "/client/model", label: "3D Model", icon: <Eye /> },
  { to: "/client/customize", label: "Customize Design", icon: <Palette /> },
  { to: "/client/costs", label: "Cost Estimate", icon: <Receipt /> },
  { to: "/client/quality", label: "Quality Inspection", icon: <ClipboardCheck /> },
  { to: "/client/safety", label: "Safety Issues", icon: <AlertTriangle /> },
];

export const supervisorNav: NavItem[] = [
  { to: "/supervisor", label: "Project Analytics", icon: <BarChart3 /> },
  { to: "/supervisor/progress", label: "Daily Progress", icon: <Camera /> },
  { to: "/supervisor/costs", label: "Daily Cost", icon: <DollarSign /> },
  { to: "/supervisor/quality", label: "Quality Inspection", icon: <ShieldCheck /> },
  { to: "/supervisor/safety", label: "Safety & Issues", icon: <AlertTriangle /> },
  { to: "/supervisor/messages", label: "Contractor Chat", icon: <MessageSquare /> },
];
