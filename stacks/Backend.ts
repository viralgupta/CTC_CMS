import { StackContext, Api, Config, Bucket, RDS } from "sst/constructs";
import { LayerVersion } from "aws-cdk-lib/aws-lambda";
import { Size } from "aws-cdk-lib/core";

export function BackendStack({ stack }: StackContext) {

  const AUTH_SECRET = new Config.Secret(stack, "AUTH_SECRET");
  const DB_URL = new Config.Secret(stack, "DB_URL");

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

  ResourceBucket.attachPermissionsToNotification("createResourceOnUpload", ["s3"]);
  ResourceBucket.attachPermissionsToNotification("removeResourceOnDelete", ["s3"]);

  const ReciptBucket = new Bucket(stack, "ReciptBucket", {
    blockPublicACLs: true,
    notifications: {
      updateOrderMovementOnUpload: {
        function: {
          handler: "packages/functions/src/functions.updateOrderMovementOnUpload",
          bind: [DB_URL],
          runtime: "nodejs20.x"
        },
        events: ["object_created"]
      }
    }
  });

  ReciptBucket.attachPermissionsToNotification("updateOrderMovementOnUpload", ["s3"]);

  api.bind([AUTH_SECRET, DB_URL, ResourceBucket, ReciptBucket]);

  stack.addOutputs({
    ApiEndpoint: api.url,
  });
}
