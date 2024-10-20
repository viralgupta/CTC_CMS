import { StackContext, Api, Config, Bucket } from "sst/constructs";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Size } from "aws-cdk-lib/core";

export function API({ stack }: StackContext) {

  const AUTH_SECRET = new Config.Secret(stack, "AUTH_SECRET");
  const DB_URL = new Config.Secret(stack, "DB_URL");

  const HIGH_PRIORITY_CUSTOMER = new Config.Parameter(stack, "HIGH_PRIORITY_CUSTOMER", {
    value: "200000"
  })

  const MID_PRIORITY_CUSTOMER = new Config.Parameter(stack, "MID_PRIORITY_CUSTOMER", {
    value: "50000"
  })

  const api = new Api(stack, "api", {
    routes: {
      $default: {
        function: {
          handler: "packages/functions/src/backend.handler",
          timeout: 20,
          runtime: "nodejs20.x"
        },
      },
    },
  });

  const ResourceBucket = new Bucket(stack, "ResourceBucket", {
    blockPublicACLs: true,
    notifications: {
      createResourceOnUpload: {
        function: {
          handler: "packages/functions/src/functions.createResourceOnUpload",
          bind: [DB_URL],
          timeout: 20,
          layers: [
            LayerVersion.fromLayerVersionArn(stack, "GhostScriptLayer", "arn:aws:lambda:ap-south-1:764866452798:layer:ghostscript:15")
          ],
          ephemeralStorageSize: Size.mebibytes(5120),
          runtime: "nodejs20.x"
        },
        events: ["object_created"]
      },
      removeResourceOnDelete: {
        function: {
          handler: "packages/functions/src/functions.removeResourceOnDelete",
          bind: [DB_URL],
          timeout: 10,
          runtime: "nodejs20.x"
        },
        events: ["object_removed"]
      },
    }
  });

  ResourceBucket.attachPermissionsToNotification("createResourceOnUpload", ["s3"])
  ResourceBucket.attachPermissionsToNotification("removeResourceOnDelete", ["s3"])

  api.bind([AUTH_SECRET, DB_URL, HIGH_PRIORITY_CUSTOMER, MID_PRIORITY_CUSTOMER, ResourceBucket]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
