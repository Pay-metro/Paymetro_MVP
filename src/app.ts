import "reflect-metadata";
import ip from "ip";
import cors from "cors";
import path from "path";
import YAML from "yamljs";
import dotenv from "dotenv";
import session from "express-session";
import rateLimit from "express-rate-limit";
import swaggerUi from "swagger-ui-express";
import cookieParser from "cookie-parser";
import helmet, { HelmetOptions } from "helmet";
import express, { Application, Express, Response } from "express";

/*
import __404_err_page from "@/middlewares/notFound";
import { logger } from "@/utils/logger";
import errorHandlerMiddleware from "@/middlewares/errHandler";
*/

dotenv.config();
// remember to change all console.log() calls to logger.log() later
export class App {
  private readonly app: Application;
  private readonly APPLICATION_RUNNING = "Application is running on: ";
  private readonly helmetConfig: HelmetOptions = {
    frameguard: { action: "deny" }, // X-Frame-Options header to prevent clickjacking
    xssFilter: true, // X-XSS-Protection header to enable browser's built-in XSS protection
    referrerPolicy: { policy: "same-origin" }, // Referrer-Policy header
    hsts: { maxAge: 15552000, includeSubDomains: true, preload: true }, // Strict-Transport-Security (HSTS) header for HTTPS enforcement
  };
  constructor(
    private readonly port: string | number = process.env.PORT || 3000
  ) {
    this.app = express();
    this.middleware();
    this.routes();
  }

  private limiter = rateLimit({
    windowMs: 30 * 60 * 1000, // 30 mins
    limit: 100,
    standardHeaders: "draft-7",
    legacyHeaders: false,
    // store: // for redis
  });

  async listen(): Promise<void> {
    try {
      this.app.listen(this.port);
      console.info(`Documentation available at when project is done`);
      console.info(`${this.APPLICATION_RUNNING} ${ip.address()}:${this.port}`);
    } catch (error) {
      console.error("Database connection error: " + error);
    }
  }

  // loading swagger documentation from the pasth
//   private swaggerDoc = YAML.load(path.join(__dirname, "./../swagger.yaml"));

  private middleware(): void {
    this.app.set("trust proxy", 10);
    this.app.use(cors({ origin: "*", credentials: true }));
    this.app.use(express.json());
    this.app.use(express.urlencoded({ extended: true }));
    this.app.use(helmet({ contentSecurityPolicy: false })); // Disable the default CSP middleware
    this.app.use(helmet(this.helmetConfig));
    this.app.use(helmet.hidePoweredBy());
    this.app.use(helmet.noSniff());
    this.app.use(helmet.ieNoOpen());
    this.app.use(helmet.dnsPrefetchControl());
    this.app.use(helmet.permittedCrossDomainPolicies());
    this.app.use(cookieParser());
    //Setting up redis

    /* const RedisStore = new connectRedis({
      client: runRedisOperation,
       prefix: "sessionStore",
    });*/

    this.app.use(
      session({
        // store: RedisStore,
        secret: process.env.SESSION_SECRET || "",
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false, httpOnly: true, maxAge: 20 * 60 * 1000 },
      })
    );
    this.app.use(this.limiter);

      // Serve the Swagger UI
      /*
    this.app.use(
      "/api-docs",
      swaggerUi.serve,
      swaggerUi.setup(this.swaggerDoc)
    );
    */
  }

  // Routing for the application
  private routes() {
    this.app.get("/", (_, res: Response) => {
      res.send(
        '<h1>Builder Authentication API Documentation</h1><a href="/api-docs">Documentation</a>'
      );
    });

    // Routing goes here for the application

    // this.app.use("/auth", userRoutes);

    // this.app.use("/builders", builderRoute);

    // this.app.all("*", __404_err_page);

    // this.app.use(errorHandlerMiddleware);
  }
}
