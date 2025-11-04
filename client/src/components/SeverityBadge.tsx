import { Badge } from "@/components/ui/badge";
import { AlertTriangle, AlertCircle, Info, ShieldAlert } from "lucide-react";

type Severity = "critical" | "high" | "medium" | "low" | "info";

interface SeverityBadgeProps {
  severity: Severity;
  className?: string;
}

const severityConfig = {
  critical: {
    label: "Critical",
    icon: ShieldAlert,
    className: "bg-destructive text-destructive-foreground border-destructive-border",
  },
  high: {
    label: "High",
    icon: AlertTriangle,
    className: "bg-orange-500 text-white border-orange-600 dark:bg-orange-600 dark:border-orange-700",
  },
  medium: {
    label: "Medium",
    icon: AlertCircle,
    className: "bg-yellow-500 text-yellow-950 border-yellow-600 dark:bg-yellow-600 dark:text-yellow-50 dark:border-yellow-700",
  },
  low: {
    label: "Low",
    icon: Info,
    className: "bg-blue-500 text-white border-blue-600 dark:bg-blue-600 dark:border-blue-700",
  },
  info: {
    label: "Info",
    icon: Info,
    className: "bg-muted text-muted-foreground border-muted-border",
  },
};

export default function SeverityBadge({ severity, className }: SeverityBadgeProps) {
  const config = severityConfig[severity];
  const Icon = config.icon;

  return (
    <Badge variant="outline" className={`${config.className} ${className || ""}`} data-testid={`badge-severity-${severity}`}>
      <Icon className="h-3 w-3 mr-1" />
      {config.label}
    </Badge>
  );
}
