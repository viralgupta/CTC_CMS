import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import {
  viewResourceAtom,
  viewResourceIdAtom,
  ViewResourceType,
} from "@/store/resources";
import { useAllResources } from "@/hooks/resources";
import { useTheme } from "@/components/providers/theme";
import { getImageUrlFromExtension } from "@/lib/utils";
import { Textarea } from "@/components/ui/textarea";
import EditResource from "./EditResource";
import DeleteAlert from "@/components/DeleteAlert";
import { Input } from "@/components/ui/input";

export default function ResourceCard({
  resource,
}: {
  resource: ViewResourceType | null;
}) {
  const { theme } = useTheme();
  const { resources, refetchResources } = useAllResources();

  if (!resource) {
    return (
      <Card className="w-full p-6">
        <Skeleton className="w-full h-40" />
      </Card>
    );
  }

  return (
    <Card className="w-full">
      <CardContent className="p-2 flex gap-2">
        <img
          src={getImageUrlFromExtension(
            theme,
            resource.extension ?? undefined,
            resources.filter((res) => res.id == resource.id)[0].previewUrl
          )}
          alt={resource.name}
          className="aspect-video w-1/2"
        />
        <div className="w-1/2 h-full relative aspect-video">
          <div className="font-sofiapro">
            Name:
            <Input className="w-full mt-1" disabled defaultValue={resource.name} />
          </div>
          <div className="absolute bottom-0 w-full font-sofiapro">
            Description:
            <Textarea
              className="mt-1 resize-none"
              defaultValue={resource.description ?? ""}
              disabled
            />
            <div className="flex gap-2 mt-2">
              <EditResource>
                <Button variant={"outline"} className="w-full">
                  Edit Resource
                </Button>
              </EditResource>
              <DeleteAlert
                type="resource"
                viewObjectAtom={viewResourceAtom}
                viewObjectIdAtom={viewResourceIdAtom}
              >
                <Button variant={"outline"} className="w-full">
                  Delete Resource
                </Button>
              </DeleteAlert>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
