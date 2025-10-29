import { S3Client } from "@aws-sdk/client-s3";
import { db } from "server/db";

export const getDigitalOceanConfig = async () => {
  const config = await db.query.storageSettings.findFirst({
    where: (s, { eq }) => eq(s.provider, "digitalocean"),
  });

  if (!config) return { isActive: false };

  return {
    isActive: config.isActive,
    region: config.region,
    endpoint: config.endpoint,
    accessKeyId: config.accessKey,
    secretAccessKey: config.secretKey,
    bucket: config.spaceName,
  };
};

export const createDOClient = async () => {
  const config = await getDigitalOceanConfig();

  if (
    !config.isActive ||
    !config.endpoint ||
    !config.accessKeyId ||
    !config.secretAccessKey
  ) {
    return null;
  }

  const s3 = new S3Client({
    forcePathStyle: false,
    region: config.region,
    endpoint: config.endpoint,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });

  return { s3, bucket: config.bucket };
};
