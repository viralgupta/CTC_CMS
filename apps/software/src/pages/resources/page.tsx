import AllResources from "./components/AllResources";
import CreateResource from "./components/CreateResource";

const Resources = () => {
  return (
    <div className="w-full h-full flex flex-col">
      <CreateResource/>
      <AllResources/>
    </div>
  );
};

export default Resources;
