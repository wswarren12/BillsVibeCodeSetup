# Embedding Models

> **Descriptive, per-project decision.** Embedding-model choice is the stickiest decision in a RAG system — swapping models means re-embedding the entire corpus. This page surfaces the trade-offs so agents, scripts, and humans can pick deliberately rather than reaching for the default API.

This page exists so any future agent or script considering an embedding step pauses to ask: **could a small, self-hostable model be the better fit here?**

---

## When to consider a small embedding model

A "small" embedding model is roughly **<500M parameters** (often <350M) — designed to run on CPU, in a browser, or on a phone, while producing embeddings competitive with much larger models on retrieval tasks.

Consider a small model when **any** of the following is true:

- **On-device or in-browser retrieval is a feature, not just a constraint.** Privacy-sensitive data (legal, health, personal memory), offline capability, or data sovereignty are first-class requirements. Embeddings never leaving the device is a moat.
- **High-volume, latency-sensitive RAG.** Volume exceeds ~10M embeddings/month, queries are >1k/sec, or you want to convert variable API costs into fixed infrastructure. Self-hosting becomes cheaper than APIs at that scale.
- **"Good enough" semantic search.** Classification, deduplication, clustering, tagging, recommendations on short text. If you don't need bleeding-edge recall, small wins on cost and latency.
- **Agent memory or personal knowledge bases.** Personal AI agents, min-RAG for coding agents, community-scale corpora. Full control, no API bills, no rate limits.

## When small is the wrong call

- **Highly technical domains with dense jargon.** Small models tend to conflate domain-specific terminology and acronyms. Complex B2B documentation often justifies the larger model's cost.
- **Multimodal needs** (text + image + PDF in one embedding space). Strong multimodal models remain large.
- **Specialized domains where vertical models win.** Legal, finance, medical, code-specialized models outperform generic models by 10–15% in their domains.
- **Prototypes under low/medium volume.** When time-to-market matters more than infra cost, `text-embedding-3-small` (OpenAI) is 4 lines of code and good enough for ~90% of applications.

---

## Decision framework

Ask in order:

1. **Does the data need to stay on-device?** → Small (EmbeddingGemma-300M, nomic-embed-text).
2. **Is this a high-volume production system (>10M embeddings/month)?** → Small, self-hosted (BGE, Nomic, EmbeddingGemma).
3. **Is it a specialized domain where retrieval quality is revenue-critical?** → Large or domain-specific (Voyage, Cohere v4, OpenAI 3-large).
4. **Prototyping or low/medium volume?** → API (`text-embedding-3-small` is the safe default).
5. **Multilingual or multimodal?** → Qwen3 (open-source) or a frontier API, not the smallest models.

## Candidate small models (May 2026 snapshot)

Treat as a snapshot — leaderboards reshuffle constantly. The durable investment is your own eval harness, not picking the right model today.

| Model | Params | Output dims | Notable trait |
|---|---|---|---|
| **EmbeddingGemma-300M** (Google) | 308M | 768 (truncatable to 512/256/128) | <200MB RAM with quantization, 2K context, on-device focus, distilled from Gemini Embedding |
| **all-MiniLM-L6-v2** | 22M | 384 | The classic workhorse; ubiquitous default in sentence-transformers |
| **nomic-embed-text-v1/v2** | ~137M | 768 | Open weights, fully reproducible training |
| **bge-small-en-v1.5** (BAAI) | 33M | 384 | Strong English retrieval at tiny size |
| **Jina-embeddings-v3** (small variant) | ~239M | up to 1024 | Lightweight multilingual, 71.0 on MTEB English v2 |
| **Qwen3-Embedding-0.6B** | 600M | 32–1024 (flexible) | Multilingual, instruction-aware, flexible vector dims |

---

## Why "small but good" actually works

Three stacking techniques. Useful vocabulary for engineering review:

1. **Knowledge distillation.** A small "student" model is trained to mimic embeddings from a large "teacher." EmbeddingGemma was distilled from Gemini Embedding.
2. **Matryoshka Representation Learning (MRL).** The model is trained so the *first N dimensions* of the output vector are themselves a usable embedding. Ship one model; truncate at query time (768 → 256 → 128) for cheaper storage with <2% quality loss in many cases.
3. **Quantization.** Store weights and/or output vectors in 8-bit or 4-bit integers instead of fp32. Modern small models are quantization-aware, so quality barely degrades; latency drops 30–40%.

Distillation makes the model small. MRL makes the *output* small and tunable. Quantization makes the *runtime* cheap.

---

## Trade-offs to weigh per project

| Decision | Pick small when... | Pick large/API when... |
|---|---|---|
| **Privacy posture** | Data sensitivity is a feature (legal, health, personal). On-device is a moat. | Cloud providers are already trusted for similar data. |
| **Cost structure** | Volume is high and predictable. Want variable API costs → fixed infra. | Volume is low/spiky. Engineering time saved > API fees. |
| **Time to market** | You have ML/infra capacity and a few weeks. | You need to ship next sprint. The OpenAI API is 4 lines of code. |
| **Quality ceiling** | "Good enough" retrieval is fine. | A few points of recall translates to real revenue. |
| **Offline capability** | Required (planes, tunnels, sovereignty). | Online-only is acceptable. |
| **Roadmap flexibility** | Want to swap models freely without renegotiating contracts. | Betting on a vendor relationship is acceptable. |

### Technical levers

- **Quality vs. latency.** Small on CPU at 50ms often beats large at 300ms for interactive UX, even at 3–5 points lower recall.
- **Quality vs. storage.** Doubling dims doubles vector DB cost. MRL truncation (768 → 256) gives ~3× cheaper storage, often <2% quality loss.
- **Self-host vs. API.** Self-hosting = own the GPU bill, on-call, upgrade path. API = own the contract, rate limits, change notifications.
- **Generic vs. fine-tuned.** A small generic model fine-tuned on your domain often beats a large generic model. Underused lever — particularly for distinctive corpora (legal memos, DAO docs, agent logs).
- **Lock-in.** Embedding-model choice is the stickiest decision in a RAG system. You can swap LLMs in an afternoon; swapping embeddings means re-embedding every document.

---

## Architecture-review checklist

For any new RAG or semantic-search feature, an agent/reviewer should be able to answer:

- **Model name, parameter count, output dimensions?** (e.g., "EmbeddingGemma-300M, 768d output")
- **Context length?** Max input tokens (small models: usually 512–2048). Determines chunking strategy.
- **Index size?** dims × bytes/dim × doc count. At 768d × 4 bytes × 1M docs ≈ 3GB. Halve dims via MRL → halve the index.
- **MRL truncation in use?** Which dimension? (256 is a common sweet spot.)
- **Asymmetric or symmetric?** Does the model use different prompts/processing for queries vs documents? EmbeddingGemma does (`task: search result | query:` vs `title: ... | text:`). Mismatching silently tanks retrieval quality.
- **Reranker?** Small embedding model + cross-encoder reranker often beats a large embedding model alone.
- **Evaluation plan?** "MTEB looks good" is not enough. 100–200 representative queries, annotated relevant docs, Recall@5 and Recall@10 on *your* data.

The three questions to push on in any embedding architecture review:

1. **What did we benchmark against our actual data, not MTEB?**
2. **What's our migration plan if we change models?** Different models produce incompatible vectors.
3. **Where does quality fall apart?** (Long docs? Multilingual? Acronyms? Cross-modal?)

---

## Related

- [[architecture/database]] — Postgres + `pgvector` is the default vector store (Supabase MVP tier).
- [[stacks/agents]] — Python + Claude Agent SDK; small embedding models run cleanly alongside agent runtimes.
- [[patterns/agent-automation]] — Plan-execute-validate loops; embedding-based memory/recall fits here.
- [[projects/cairn]] — Geo-anchored memory; on-device embeddings is the obvious match.

## Sources

- [[raw/articles/small-embedding-models-field-guide]] — Full field guide with sourced trade-offs, May 2026
- [[summaries/small-embedding-models-field-guide]] — Distilled summary
