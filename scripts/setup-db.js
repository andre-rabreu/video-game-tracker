/* eslint-disable @typescript-eslint/no-require-imports */
const fs = require('node:fs');
const path = require('node:path');
const mysql = require('mysql2/promise');
const {
  SecretsManagerClient,
  GetSecretValueCommand,
} = require('@aws-sdk/client-secrets-manager');

const AWS_REGION = 'us-east-1';
const RDS_SECRET_ARN =
  '***REMOVED-ARN***';
const DB_NAME = 'tracker_db';

async function main() {
  const sm = new SecretsManagerClient({ region: AWS_REGION });
  const res = await sm.send(new GetSecretValueCommand({ SecretId: RDS_SECRET_ARN }));
  if (!res.SecretString) throw new Error('Segredo sem SecretString');
  const { host, port, username, password } = JSON.parse(res.SecretString);

  const sqlPath = path.join(__dirname, 'schema.sql');
  const sql = fs.readFileSync(sqlPath, 'utf-8');

  const conn = await mysql.createConnection({
    host,
    port,
    user: username,
    password,
    database: DB_NAME,
    multipleStatements: true,
  });

  try {
    await conn.query(sql);
    console.log('OK: tabelas criadas');
  } finally {
    await conn.end();
  }
}

main().catch((err) => {
  console.error('ERRO:', err);
  process.exit(1);
});
