const https = require('https');
const crypto = require('crypto');

const PUBLIC_KEY = process.env.ATLAS_PUBLIC_KEY;
const PRIVATE_KEY = process.env.ATLAS_PRIVATE_KEY;
const PROJECT_ID = process.env.ATLAS_PROJECT_ID;

if (!PUBLIC_KEY || !PRIVATE_KEY || !PROJECT_ID) {
  console.log('[atlas] ATLAS_PUBLIC_KEY / ATLAS_PRIVATE_KEY / ATLAS_PROJECT_ID not set — skipping IP whitelist');
  process.exit(0);
}

function getPublicIP() {
  return new Promise((resolve, reject) => {
    https.get('https://api.ipify.org?format=json', (res) => {
      let data = '';
      res.on('data', c => (data += c));
      res.on('end', () => resolve(JSON.parse(data).ip));
    }).on('error', reject);
  });
}

function parseDigestChallenge(header) {
  const result = {};
  const re = /(\w+)="([^"]+)"/g;
  let m;
  while ((m = re.exec(header))) result[m[1]] = m[2];
  const qopMatch = header.match(/qop=([\w,]+)/);
  if (qopMatch) result.qop = qopMatch[1].split(',')[0].trim();
  return result;
}

function buildDigestHeader(method, uri, { realm, nonce, qop }) {
  const nc = '00000001';
  const cnonce = crypto.randomBytes(8).toString('hex');
  const ha1 = crypto.createHash('md5').update(`${PUBLIC_KEY}:${realm}:${PRIVATE_KEY}`).digest('hex');
  const ha2 = crypto.createHash('md5').update(`${method}:${uri}`).digest('hex');
  const response = crypto.createHash('md5')
    .update(`${ha1}:${nonce}:${nc}:${cnonce}:${qop}:${ha2}`)
    .digest('hex');
  return `Digest username="${PUBLIC_KEY}", realm="${realm}", nonce="${nonce}", uri="${uri}", qop=${qop}, nc=${nc}, cnonce="${cnonce}", response="${response}"`;
}

function atlasRequest(path, body, authHeader) {
  return new Promise((resolve, reject) => {
    const bodyBuf = Buffer.from(body);
    const headers = { 'Content-Type': 'application/json', 'Content-Length': bodyBuf.length };
    if (authHeader) headers['Authorization'] = authHeader;

    const req = https.request(
      { hostname: 'cloud.mongodb.com', path, method: 'POST', headers },
      (res) => {
        let data = '';
        res.on('data', c => (data += c));
        res.on('end', () => resolve({ status: res.statusCode, headers: res.headers, body: data }));
      }
    );
    req.on('error', reject);
    req.write(bodyBuf);
    req.end();
  });
}

async function addIPToWhitelist(ip) {
  const path = `/api/atlas/v1.0/groups/${PROJECT_ID}/accessList`;
  const body = JSON.stringify([{ ipAddress: ip, comment: 'auto-whitelisted by dev script' }]);

  // Step 1: probe to get Digest challenge
  const probe = await atlasRequest(path, body, null);
  if (probe.status !== 401) throw new Error(`Expected 401 challenge, got ${probe.status}: ${probe.body}`);

  const challenge = parseDigestChallenge(probe.headers['www-authenticate'] || '');
  const authHeader = buildDigestHeader('POST', path, challenge);

  // Step 2: authenticated request
  const res = await atlasRequest(path, body, authHeader);
  return res;
}

(async () => {
  try {
    const ip = await getPublicIP();
    process.stdout.write(`[atlas] Current IP: ${ip} — whitelisting... `);
    const res = await addIPToWhitelist(ip);
    if (res.status === 201) console.log('added.');
    else if (res.status === 200) console.log('ok.');
    else if (res.status === 409) console.log('already whitelisted.');
    else {
      console.log(`\n[atlas] API returned ${res.status}: ${res.body}`);
      process.exit(1);
    }
  } catch (err) {
    console.error('[atlas] Failed to whitelist IP:', err.message);
    process.exit(1);
  }
})();
