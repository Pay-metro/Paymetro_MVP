import { DataSource } from "typeorm";
import statuscode from "http-status-codes";
import { parse } from "pg-connection-string";

import customApiErrors from "@/utils/custom_errors";

const pgConnectionString = process.env.DB_CONNECTION_STRING;

if (!pgConnectionString)
  throw new customApiErrors(
    `Error While connecting to the reomte db`,
    statuscode.FORBIDDEN
  );

const config = parse(pgConnectionString);

const TypeormConfig = new DataSource({
  type: "postgres",
  host: config.host || undefined,
  port: config.port ? parseInt(config.port, 10) : undefined,
  username: config.user,
  password: config.password || undefined,
  database: config.database || undefined,
  entities: [], // register all entities here
  ssl: {
    rejectUnauthorized: false, // required for ssl connection
  },
  synchronize: true, // set to false in prod
  logging: false,
});

export const db_init = async () => {
  try {
    await TypeormConfig.initialize();
    logging.info("Database connection established successfully.");
  } catch (error: any) {
    logging.error(`Failed to initialize postgresql database`);
  }
};
