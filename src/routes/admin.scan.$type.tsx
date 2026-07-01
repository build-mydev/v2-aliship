import { createFileRoute } from "@tanstack/react-router";
import { ScanPageForType } from "@/components/screens/ScanPageForType";

export const Route = createFileRoute("/admin/scan/$type")({
  component: () => {
    const { type } = Route.useParams();
    return <ScanPageForType type={type} />;
  },
});
