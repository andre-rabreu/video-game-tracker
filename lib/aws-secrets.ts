import 'server-only';
import {
  SecretsManagerClient,
  GetSecretValueCommand,
} from '@aws-sdk/client-secrets-manager';

const AWS_REGION = 'us-east-1';
const RDS_SECRET_ARN =
  '***REMOVED-ARN***';

const CACHE_TTL_MS = 10 * 60 * 1000;

export interface RdsCredentials {
  host: string;
  port: number;
  username: string;
  password: string;
}

interface CachedSecret {
  value: RdsCredentials;
  expiresAt: number;
}

let client: SecretsManagerClient | null = null;
let cached: CachedSecret | null = null;
let inFlight: Promise<RdsCredentials> | null = null;

function getClient(): SecretsManagerClient {
  if (!client) {
    client = new SecretsManagerClient({ region: AWS_REGION });
  }
  return client;
}

async function fetchSecret(): Promise<RdsCredentials> {
  const command = new GetSecretValueCommand({ SecretId: RDS_SECRET_ARN });
  const response = await getClient().send(command);

  if (!response.SecretString) {
    throw new Error('Segredo do RDS sem SecretString');
  }

  const parsed = JSON.parse(response.SecretString) as {
    host?: string;
    port?: number;
    username?: string;
    password?: string;
  };

  if (!parsed.host || !parsed.username || !parsed.password || !parsed.port) {
    throw new Error('Segredo do RDS com campos faltando (host/port/username/password)');
  }

  return {
    host: parsed.host,
    port: parsed.port,
    username: parsed.username,
    password: parsed.password,
  };
}

export async function getRdsSecret(): Promise<RdsCredentials> {
  const now = Date.now();
  if (cached && cached.expiresAt > now) {
    return cached.value;
  }
  if (inFlight) {
    return inFlight;
  }

  inFlight = (async () => {
    try {
      const value = await fetchSecret();
      cached = { value, expiresAt: Date.now() + CACHE_TTL_MS };
      return value;
    } finally {
      inFlight = null;
    }
  })();

  return inFlight;
}
