import { SSTConfig } from "sst";
import { BackendStack } from "./stacks/Backend";

export default {
  config(_input) {
    return {
      name: "ctc-cms",
      region: "ap-south-1",
    };
  },
  stacks(app) {
    app.stack(BackendStack);
    if (app.stage === "dev"){
      app.setDefaultRemovalPolicy("destroy");
    }
  }
} satisfies SSTConfig;
