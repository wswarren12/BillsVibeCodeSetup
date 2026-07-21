# Summary: Small Embedding Models Field Guide

**Source:** [[raw/articles/small-embedding-models-field-guide]]
**Type:** Article / field guide
**Date added:** 2026-05-15
**Compiled:** May 2026 (snapshot — leaderboards shift fast)

---

## Key takeaways

1. **A "small" embedding model is ~<500M parameters** (often <350M) — built to run on CPU, in a browser, or on a phone while remaining competitive on retrieval.
2. **Four situations where small is the right call:** on-device/in-browser retrieval, high-volume self-hosted RAG (>10M embeddings/month), "good enough" semantic search, and agent/personal knowledge bases.
3. **Three situations where small is wrong:** highly technical jargon-dense domains, multimodal needs, and specialized domains (legal/finance/medical/code) where vertical models win by 10–15%.
4. **Three stacking techniques make small models viable:** knowledge distillation (small model mimics large teacher), Matryoshka Representation Learning (truncatable output dims), and quantization (int8/int4 weights). EmbeddingGemma-300M is the current poster child — distilled from Gemini Embedding, runs in <200MB RAM with quantization.
5. **Embedding-model choice is the stickiest decision in RAG.** Swapping LLMs is an afternoon; swapping embeddings means re-embedding every document. Choose with that in mind.
6. **MTEB is not a benchmark for your product.** Build your own eval — 100–200 representative queries, annotated relevant docs, Recall@5/10 on your data. The durable investment is the eval harness, not picking the right model today.

## Concepts surfaced

- **Knowledge distillation** — student model trained to mimic teacher embeddings
- **Matryoshka Representation Learning (MRL)** — first-N dimensions of output are independently usable; tune storage/quality at query time
- **Quantization** (quantization-aware training) — int8/int4 weights, ~30–40% latency drop
- **Asymmetric vs symmetric embeddings** — separate prompts/processing for queries vs documents; getting this wrong silently tanks recall
- **Reranker architectures** — small embedding model + cross-encoder reranker often beats large embedding model alone

## Entities mentioned

- **EmbeddingGemma-300M** (Google) — 308M params, 768d truncatable, on-device focus
- **all-MiniLM-L6-v2** — 22M params, sentence-transformers default
- **nomic-embed-text-v1/v2** — ~137M params, open weights, reproducible training
- **bge-small-en-v1.5** (BAAI) — 33M params, English retrieval
- **Jina-embeddings-v3 small** — ~239M params, multilingual
- **Qwen3-Embedding-0.6B** — 600M params, flexible output dims
- **OpenAI `text-embedding-3-small`** — the API default for prototypes/low volume
- **Voyage, Cohere v4, OpenAI 3-large** — when specialized/high-quality matters
- **sqlite-vss, lancedb, FAISS** — lightweight vector stores that pair with small models

## Project application (called out in the source)

- **Cairn** — EmbeddingGemma-300M via LiteRT/ONNX is the obvious match for geo-anchored memory recall. On-device, small MRL dim (128 or 256) keeps the index tiny. Worth a spike. See [[projects/cairn]].
- **Hermes / agent infra** — EmbeddingGemma alongside Hermes on Hetzner gives a fully local RAG layer for email/calendar/document context. No OpenAI dependency, no rate limits, no data leaving the box.
- **min-RAG knowledge base** — Small embedding model + sqlite-vss/lancedb/FAISS is the right shape for a personal coding-agent knowledge base.

## Wiki pages affected

- **Created:** [[architecture/embedding-models]] — descriptive decision tree for embedding-model selection
- **Updated:** [[architecture/database]] — cross-link from `pgvector` mention to embedding-model decision

## Open questions / contradictions

None with existing wiki content. The guide extends architecture coverage into a domain (AI/ML model selection) the wiki hadn't previously addressed.
