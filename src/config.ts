import dotenv from 'dotenv';
import bunyan from 'bunyan';
import {
  v2 as cloudinary,
  ConfigOptions as CloudinaryConfigOptions
} from 'cloudinary';

dotenv.config();

class Config {
  public readonly DATABASE_URL: string;
  public readonly SERVER_PORT: string;
  public readonly JWT_SECRET: string;
  public readonly NODE_ENV: string;
  public readonly COOKIE_SECRET_KEY_ONE: string;
  public readonly COOKIE_SECRET_KEY_TWO: string;
  public readonly CLIENT_URL: string;
  public readonly REDIS_URL: string;
  public readonly CLOUD_NAME: string;
  public readonly CLOUD_API_KEY: string;
  public readonly CLOUD_API_SECRET: string;

  constructor() {
    this.DATABASE_URL = this.getEnvVar('DATABASE_URL');
    this.SERVER_PORT = this.getEnvVar('SERVER_PORT');
    this.JWT_SECRET = this.getEnvVar('JWT_SECRET');
    this.NODE_ENV = process.env.NODE_ENV || 'development';
    this.COOKIE_SECRET_KEY_ONE = this.getEnvVar('COOKIE_SECRET_KEY_ONE');
    this.COOKIE_SECRET_KEY_TWO = this.getEnvVar('COOKIE_SECRET_KEY_TWO');
    this.CLIENT_URL = this.getEnvVar('CLIENT_URL');
    this.REDIS_URL = this.getEnvVar('REDIS_URL');
    this.CLOUD_NAME = this.getEnvVar('CLOUD_NAME');
    this.CLOUD_API_KEY = this.getEnvVar('CLOUD_API_KEY');
    this.CLOUD_API_SECRET = this.getEnvVar('CLOUD_API_SECRET');

    this.loadCloudinaryConfig();
  }

  private loadCloudinaryConfig(): void {
    cloudinary.config({
      cloud_name: this.CLOUD_NAME,
      api_key: this.CLOUD_API_KEY,
      api_secret: this.CLOUD_API_SECRET,
      secure: this.NODE_ENV !== 'development'
    });
  }

  public createLogger(name: string): bunyan {
    return bunyan.createLogger({
      name,
      level: this.NODE_ENV === 'production' ? 'info' : 'debug'
    });
  }

  private getEnvVar(key: string): string {
    const value = process.env[key];
    if (!value) {
      throw new Error(
        `Configuration error: Missing environment variable "${key}".`
      );
    }
    return value;
  }
}

export const config = new Config();
