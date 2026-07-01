import { createFileRoute } from "@tanstack/react-router";
import { ScanPageForType } from "@/components/screens/ScanPageForType";

export const Route = createFileRoute("/dc/scan/$type")({
  component: () => {
    const { type } = Route.useParams();
    return <ScanPageForType type={type} />;
  },
});
