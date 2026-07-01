import { createFileRoute } from "@tanstack/react-router";
import { OpsListScreen } from "@/components/screens/OpsListScreen";
export const Route = createFileRoute("/office/ops/$slug")({
  component: () => {
    const { slug } = Route.useParams();
    return <OpsListScreen slug={slug} />;
  },
});
