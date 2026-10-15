// Reads and commits the data files through the GitHub REST API, using a token
// the admin pastes once. The token stays in this browser's localStorage.

export const REPO = { owner: 'migmfreitas', repo: 'iracing-posters', branch: 'main' }

export const FILES = {
  catalog: 'src/data/catalog.json',
  series: 'src/data/series.json',
} as const

const TOKEN_KEY = 'admin-github-token'

export function loadToken() {
  try {
    return localStorage.getItem(TOKEN_KEY) ?? ''
  } catch {
    return ''
  }
}

export function saveToken(token: string) {
  try {
    if (token) localStorage.setItem(TOKEN_KEY, token)
    else localStorage.removeItem(TOKEN_KEY)
  } catch {
    // Private mode: the token lasts for this visit only.
  }
}

async function api(token: string, path: string, init?: RequestInit) {
  const res = await fetch(`https://api.github.com/repos/${REPO.owner}/${REPO.repo}${path}`, {
    ...init,
    headers: {
      Accept: 'application/vnd.github+json',
      Authorization: `Bearer ${token}`,
      'X-GitHub-Api-Version': '2022-11-28',
      ...init?.headers,
    },
  })
  if (!res.ok) {
    const body = await res.json().catch(() => ({}))
    const reason = res.status === 401 ? 'the token was not accepted' : (body.message ?? res.statusText)
    throw new Error(`GitHub said ${res.status}: ${reason}`)
  }
  return res.json()
}

// Checks the token can write to the repo.
export async function checkAccess(token: string) {
  const repo = await api(token, '')
  if (!repo.permissions?.push) throw new Error('This token can read the repo but not save to it.')
}

const toBase64 = (text: string) => {
  const bytes = new TextEncoder().encode(text)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}

const fromBase64 = (b64: string) =>
  new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)))

export async function readJson<T>(token: string, path: string): Promise<{ data: T; sha: string }> {
  const file = await api(token, `/contents/${path}?ref=${REPO.branch}`)
  return { data: JSON.parse(fromBase64(file.content)), sha: file.sha }
}

export async function writeJson(token: string, path: string, data: unknown, sha: string, message: string) {
  const res = await api(token, `/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({
      message,
      content: toBase64(JSON.stringify(data, null, 2) + '\n'),
      sha,
      branch: REPO.branch,
    }),
  })
  return res.content.sha as string
}
