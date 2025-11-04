import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { CheckCircle2, Circle, Loader2, XCircle } from "lucide-react";

type StepStatus = "pending" | "running" | "complete" | "error";

interface ScanStep {
  id: string;
  name: string;
  status: StepStatus;
}

interface ScanProgressProps {
  steps: ScanStep[];
  currentStep?: string;
  progress?: number;
}

const statusIcons = {
  pending: Circle,
  running: Loader2,
  complete: CheckCircle2,
  error: XCircle,
};

const statusColors = {
  pending: "text-muted-foreground",
  running: "text-primary",
  complete: "text-green-500",
  error: "text-destructive",
};

export default function ScanProgress({ steps, currentStep, progress = 0 }: ScanProgressProps) {
  return (
    <Card data-testid="card-scan-progress">
      <CardHeader>
        <CardTitle>Scan Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span className="font-medium">Overall Progress</span>
            <span className="text-muted-foreground">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        <div className="space-y-4">
          {steps.map((step, index) => {
            const Icon = statusIcons[step.status];
            const isLast = index === steps.length - 1;

            return (
              <div key={step.id} className="relative">
                <div className="flex items-center gap-3">
                  <div className={`flex-shrink-0 ${statusColors[step.status]}`}>
                    <Icon
                      className={`h-5 w-5 ${step.status === "running" ? "animate-spin" : ""}`}
                    />
                  </div>
                  <div className="flex-1">
                    <p
                      className={`text-sm font-medium ${
                        step.status === "running" ? "text-foreground" : "text-muted-foreground"
                      }`}
                      data-testid={`text-step-${step.id}`}
                    >
                      {step.name}
                    </p>
                  </div>
                  {step.status === "running" && (
                    <span className="text-xs text-muted-foreground">Running...</span>
                  )}
                  {step.status === "complete" && (
                    <span className="text-xs text-green-600 dark:text-green-400">Complete</span>
                  )}
                </div>
                {!isLast && (
                  <div className="ml-2.5 mt-2 mb-2 h-6 w-px bg-border" />
                )}
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
