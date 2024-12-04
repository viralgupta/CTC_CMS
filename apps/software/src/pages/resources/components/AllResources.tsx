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
    <div className="w-full flex-1 flex flex-col">
      <div className="flex justify-between text-3xl font-cubano mb-2 flex-none">
        All Resources
        <RefetchButton
          description="Refetch All Resources"
          refetchFunction={refetchResources}
          className="h-8"
        />
      </div>
      {loading ? (
        <Skeleton className="w-full flex-1" />
      ) : (
        <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
          {resources.map((resource) => {
            return (
              <Card
                key={resource.id}
                className="cursor-pointer hover:bg-accent duration-300 h-min"
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
                    className="h-60 mx-auto border"
                  />
                  <div className="p-2 flex justify-between items-center">
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
