import { microservices } from "@shared/microservices";
import ScanProgress from "../ScanProgress";

export default function ScanProgressExample() {
  const steps = microservices.map((ms, index) => ({
    id: ms.id,
    name: ms.name,
    status: index < 2 ? ("complete" as const) : index === 2 ? ("running" as const) : ("pending" as const),
  }));

  return (
    <ScanProgress
      steps={steps}
      currentStep="crypto-check"
      progress={45}
    />
  );
}
