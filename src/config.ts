import dotenv from 'dotenv';
import bunyan from 'bunyan';
import { v2 as cloudinary } from 'cloudinary';

dotenv.config();

class Config {
  public readonly DATABASE_URL: string | undefined;
  public readonly SERVER_PORT: string | undefined;
  public readonly JWT_TOKEN: string | undefined;
  public readonly NODE_ENV: string | undefined;
  public readonly COOKIE_SECRET_KEY_ONE: string | undefined;
  public readonly COOKIE_SECRET_KEY_TWO: string | undefined;
  public readonly CLIENT_URL: string | undefined;
  public readonly REDIS_URL: string | undefined;
  public readonly CLOUD_NAME: string | undefined;
  public readonly CLOUD_API_KEY: string | undefined;
  public readonly CLOUD_API_SECRET: string | undefined;

  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.SERVER_PORT = process.env.SERVER_PORT;
    this.JWT_TOKEN = process.env.JWT_TOKEN;
    this.NODE_ENV = process.env.NODE_ENV;
    this.COOKIE_SECRET_KEY_ONE = process.env.COOKIE_SECRET_KEY_ONE;
    this.COOKIE_SECRET_KEY_TWO = process.env.COOKIE_SECRET_KEY_TWO;
    this.CLIENT_URL = process.env.CLIENT_URL;
    this.REDIS_URL = process.env.REDIS_URL;
    this.CLOUD_NAME = process.env.CLOUD_NAME;
    this.CLOUD_API_KEY = process.env.CLOUD_API_KEY;
    this.CLOUD_API_SECRET = process.env.CLOUD_API_SECRET;

    this.validateEnvVars();
    this.configCloudinary();
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({ name, level: 'debug' });
  }

  private validateEnvVars(): void {
    for (const [key, value] of Object.entries(this)) {
      if (value === undefined) {
        throw new Error(`Configuaration error: ${key} is not defined`);
      }
    }
  }

  private configCloudinary(): void {
    cloudinary.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET,
      secure: this.NODE_ENV === 'development' ? false : true
    });
  }
}

export const config = new Config();
