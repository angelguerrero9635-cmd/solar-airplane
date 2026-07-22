const OWNER = process.env.GITHUB_OWNER;
const REPO = process.env.GITHUB_REPO;
const BRANCH = process.env.GITHUB_BRANCH || "main";
const TOKEN = process.env.GITHUB_TOKEN;

const API_BASE = `https://api.github.com/repos/${OWNER}/${REPO}`;

function headers() {
  return {
    Authorization: `Bearer ${TOKEN}`,
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

function assertConfigured() {
  if (!OWNER || !REPO || !TOKEN) {
    throw new Error(
      "Missing GITHUB_OWNER, GITHUB_REPO, or GITHUB_TOKEN environment variables."
    );
  }
}

export async function getFile(path) {
  assertConfigured();
  const res = await fetch(
    `${API_BASE}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`,
    { headers: headers(), cache: "no-store" }
  );
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`GitHub read failed for ${path}: ${res.status}`);
  }
  const data = await res.json();
  const content = Buffer.from(data.content, "base64").toString("utf-8");
  return { content, sha: data.sha, path: data.path };
}

export async function putFile(path, content, message, sha) {
  assertConfigured();
  const body = {
    message,
    content: Buffer.from(content, "utf-8").toString("base64"),
    branch: BRANCH,
  };
  if (sha) body.sha = sha;
  const res = await fetch(`${API_BASE}/contents/${path}`, {
    method: "PUT",
    headers: { ...headers(), "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(
      `GitHub write failed for ${path}: ${res.status} ${err.message || ""}`
    );
  }
  return res.json();
}

export async function listDir(path) {
  assertConfigured();
  const res = await fetch(
    `${API_BASE}/contents/${path}?ref=${encodeURIComponent(BRANCH)}`,
    { headers: headers(), cache: "no-store" }
  );
  if (res.status === 404) return [];
  if (!res.ok) {
    throw new Error(`GitHub list failed for ${path}: ${res.status}`);
  }
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function getLatestCommit() {
  assertConfigured();
  const res = await fetch(
    `${API_BASE}/commits/${encodeURIComponent(BRANCH)}`,
    { headers: headers(), cache: "no-store" }
  );
  if (!res.ok) return null;
  const data = await res.json();
  return {
    sha: data.sha.slice(0, 7),
    message: data.commit.message,
    date: data.commit.author.date,
  };
}
