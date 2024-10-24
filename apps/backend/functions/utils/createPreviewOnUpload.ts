import * as S3 from "@aws-sdk/client-s3"
import db from "@db/db";
import { resource } from "@db/schema";
import { eq } from "drizzle-orm"
import fs from "fs"
import path from "path";
import { execSync } from "child_process";
import { Config } from "sst/node/config";
import Jimp from "jimp";

const createPreviewOnUpload = async (key: string, fileExtension: string, Bucket: string, client: S3.S3Client,  body?: Uint8Array) => {

  if(!body) {
    console.error("No body found");
    return;
  }

  try {
    let convertedImage = null;

    if (fileExtension === "pdf") {
      if(Config.STAGE == "dev") return;
      convertedImage = await ConvertFromPDF(body);
    } else{
      convertedImage = await ConvertFromImage(body, fileExtension);
    }

    if(!typeof(convertedImage) || !convertedImage) {
      console.error("Unable to convert image");
      return;
    }

    const PutObjectCommand = new S3.PutObjectCommand({
      Key: `${key.split("/")[0]}/preview.png`,
      Bucket: Bucket,
      Body: convertedImage
    })

    const response = await client.send(PutObjectCommand);

    if(response.$metadata.httpStatusCode === 200) {
      try {
        await db.update(resource).set({
          previewKey: `${key.split("/")[0]}/preview.png`
        }).where(eq(resource.key, key));
      } catch (error: any) {
        console.error("Unable to update preview in db:", error.message);
      } finally {
        return;
      }
    }

  } catch (error: any) {
    console.error("Unable to create preview", error);
  }

  return;
};

async function ConvertFromPDF(body: Uint8Array): Promise<Buffer> {
  return new Promise((resolve, reject) => {

    try {
      const dir = '/tmp';
      const inputname = path.join(dir, 'input.pdf'); 
      const outputname = path.join(dir, 'output.png');
      
      // Writing File
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(inputname, body);

      // Converting PDF to PNG
      execSync(`/opt/bin/gs -dQUIET -dPARANOIDSAFER -dBATCH -dNOPAUSE -dNOPROMPT -sDEVICE=png16m -dTextAlphaBits=4 -dGraphicsAlphaBits=4 -r100 -dFirstPage=1 -dLastPage=1 -sOutputFile=${outputname} ${inputname}`);

      // reading File
      const file = fs.readFileSync(outputname);
      resolve(file);
    } catch (error: any) {
      console.error("Error while Converting File:", error.message);
      reject(error.message);
    }
  });
}

async function ConvertFromImage(body: Uint8Array, extension: string): Promise<Buffer> {
  return new Promise(async (resolve, reject) => {
    if(Config.STAGE == "dev") {
      reject("Unable to resize image in dev mode!");
      return;
    };
    try {
      const dir = '/tmp';
      const inputname = path.join(dir, `input.${extension}`); 
      const outputname = path.join(dir, 'preview.png');
      
      // Writing File
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(inputname, body);

      // Converting Image to PNG
      await Jimp.read(inputname, (err, image) => {
        if(err) reject("Error while reading the image using Jimp");

        return image.resize(330, Jimp.AUTO).quality(50).write(outputname, (err) => {
          if(err) reject("Error while writing the image using Jimp");
            
          // reading File
          const file = fs.readFileSync(outputname);
          resolve(file);
        });
      }).catch((_err) => {
        reject("Error while converting the image");
      })

    } catch (error: any) {
      console.error("Error while Converting File:", error.message);
      reject(error.message);
    }
  });
}

export default createPreviewOnUpload;