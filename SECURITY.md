# 🔒 Security Policy — ANG MVC (Last-Prepration-fang)

## Reporting a Vulnerability
Report security issues privately to **mrlexcoder@gmail.com**.  
Do **not** open a public issue.

---

## Secrets Handling

### Hard Rules
| Rule | Reason |
|---|---|
| Never hardcode tokens, passwords, or API keys in source files | Git history is immutable; bots scan every commit |
| Use `os.getenv("KEY_NAME")` — no fallback defaults for secrets | Prevents accidental credential leakage |
| `.env` is listed in `.gitignore` and must never be committed | Local-only configuration |
| Share `.env.example` only — never include real keys in it | Template for other developers |

### Supported Keys
| Variable | Use |
|---|---|
| `GITHUB_TOKEN` | CI/CD push automation |
| `OPENAI_API_KEY` | OpenAI LLM gateway |
| `ANTHROPIC_API_KEY` | Claude / Anthropic API |
| `HF_TOKEN` | HuggingFace models & Hub |
| `QWEN_API_KEY` | Qwen / Alibaba Cloud |
| `DATABASE_URL` | PostgreSQL connection string |
| `REDIS_URL` | Redis connection string |
| `QDRANT_HOST/QDRANT_API_KEY` | Vector DB |

---

## Token Rotation

If a token appears in a commit — even briefly — treat it as compromised and rotate it immediately:

1. Revoke the token on the provider's dashboard.
2. Generate a replacement with the **minimum scopes** required.
3. Update `pro_agi_tools.py` and any deploy configs with the new value.
4. Commit only the updated config — never commit the token itself.

---

## Branch Model

| Branch | Purpose | Visibility |
|---|---|---|
| `master` | Public stable / WordPress project | Public |
| `new_master` | Public ANG MVC dev branch | Public |
| **`pvt_new_master`** | **Private — all secrets stripped, hardened** | **Private** |

---

## CI/CD Secret Injection
Store all credentials as **GitHub Actions encrypted secrets** (Settings → Secrets and variables → Actions).  
Inject at runtime with `\${{ secrets.SECRET_NAME }}` — never inline.
