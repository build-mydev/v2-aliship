import { createFileRoute } from "@tanstack/react-router";
import { OpsListScreen } from "@/components/screens/OpsListScreen";
export const Route = createFileRoute("/admin/ops/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    return <OpsListScreen slug={slug} />;
  },
});
