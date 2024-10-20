import AllResources from "./components/AllResources";
import CreateResource from "./components/CreateResource";

const Resources = () => {
  return (
    <div className="w-full h-full">
      <CreateResource/>
      <div className="w-full h-full space-y-8">
        <AllResources/>
        <div>&nbsp;</div>
        <div>&nbsp;</div>
      </div>
    </div>
  );
};

export default Resources;
