import { useAllResources } from "@/hooks/resources";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import RefetchButton from "@/components/RefetchButton";
import { Skeleton } from "@/components/ui/skeleton";
import { useTheme } from "@/components/providers/theme";
import { useSetRecoilState } from "recoil";
import { viewResourceIdAtom } from "@/store/resources";
import { getImageUrlFromExtension } from "@/lib/utils";

const AllResources = () => {
  const { resources, refetchResources, loading } = useAllResources();
  const { theme } = useTheme();
  const setViewResourceId = useSetRecoilState(viewResourceIdAtom);

  return (
    <div className="w-full">
      <div className="flex justify-between text-3xl font-cubano mb-2">
        All Resources
        <RefetchButton
          description="Refetch All Resources"
          refetchFunction={refetchResources}
          className="h-8"
        />
      </div>
      {loading ? (
        <Skeleton className="w-full h-svh" />
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4">
          {resources.map((resource) => {
            return (
              <Card
                key={resource.id}
                className="cursor-pointer hover:bg-accent duration-300"
                onClick={() => {
                  setViewResourceId(resource.id);
                }}
              >
                <CardHeader className="hidden">
                  <CardTitle></CardTitle>
                  <CardDescription></CardDescription>
                </CardHeader>
                <CardContent className="p-2">
                  <img
                    src={getImageUrlFromExtension(
                      theme,
                      resource.extension ?? undefined,
                      resource.previewUrl
                    )}
                    alt={resource.name}
                    className="w-full aspect-video border"
                  />
                  <div className="pt-4 p-2 flex justify-between items-center">
                    {resource.name}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default AllResources;
