/**
 * PrepSmart AI 2.0 - Curated Question Bank Dataset
 * Multi-domain interview questions categorized by track, difficulty, and company archetypes.
 */

export const QUESTION_CATEGORIES = [
  { id: 'all', name: 'All Tracks', icon: 'Sparkles' },
  { id: 'frontend', name: 'Frontend & Web', icon: 'Code' },
  { id: 'backend', name: 'Backend & Systems', icon: 'Server' },
  { id: 'system-design', name: 'System Design', icon: 'Cpu' },
  { id: 'ai-ml', name: 'AI & Machine Learning', icon: 'Brain' },
  { id: 'devops', name: 'Cloud & DevOps', icon: 'Cloud' },
  { id: 'behavioral', name: 'Behavioral & Leadership', icon: 'Users' },
];

export const QUESTION_DIFFICULTIES = [
  'All Difficulties',
  'Junior',
  'Mid-Level',
  'Senior',
  'Staff / Architect',
];

export const INITIAL_QUESTION_BANK = [
  // =========================================================================
  // FRONTEND & WEB
  // =========================================================================
  {
    id: 'fe-01',
    question: 'How do React Server Components (RSC) differ from traditional Client-Side Rendering and Server-Side Rendering (SSR) with hydration?',
    category: 'frontend',
    difficulty: 'Senior',
    companyTags: ['Meta', 'Vercel', 'Uber'],
    techStack: ['React 19', 'Next.js App Router', 'Hydration', 'Streaming'],
    idealAnswer: `React Server Components (RSC) execute exclusively on the server and never bundle their code into the client JavaScript bundle. Unlike traditional SSR (which produces static HTML that still requires the entire component tree to hydrate on the client with full bundle downloads), RSCs stream a specialized JSON-like wire format (RSC payload) containing rendered JSX and serialized props.

Key architectural benefits:
1. Zero client-side bundle impact: Heavy server libraries (markdown parsers, database clients, crypto utilities) stay 100% on the server.
2. Direct backend resource access: RSCs can directly query databases, internal microservices, and file systems without client API hops.
3. Selective hydration: Client Components ('use client') interleave seamlessly inside RSCs as "leaf" or "wrapper" nodes, hydrating independently without blocking the entire page.`,
    rubrics: [
      'Articulates that RSC code is never shipped to client JS bundles.',
      'Contrasts traditional SSR full-hydration with RSC streaming wire payload.',
      'Explains how Client Components receive server-rendered children via slot composition.',
      'Highlights security benefits (database credentials never exposed in client bundles).',
    ],
    redFlags: [
      'Confusing RSC with Next.js getServerSideProps or plain SSR.',
      'Claiming that RSC replaces the need for useState or useEffect entirely.',
      'Inability to explain the RSC wire format or client-server boundary.',
    ],
  },
  {
    id: 'fe-02',
    question: 'Explain the Critical Rendering Path and the specific metrics that define Core Web Vitals (LCP, INP, CLS). How do you debug and optimize each?',
    category: 'frontend',
    difficulty: 'Senior',
    companyTags: ['Google', 'Amazon', 'Shopify'],
    techStack: ['Web Vitals', 'Performance', 'DOM', 'Rendering Engine'],
    idealAnswer: `The Critical Rendering Path encompasses the sequence of steps the browser takes to convert HTML, CSS, and JS into visible pixels: DOM parsing -> CSSOM creation -> Render Tree creation -> Layout (Reflow) -> Paint -> Compositing.

Core Web Vitals quantify user experience:
1. Largest Contentful Paint (LCP, target < 2.5s): Measures perceived loading speed of the main viewport element. Optimized via resource preloading (rel="preload"), image compression (WebP/AVIF), CDN edge caching, and server-side rendering without render-blocking CSS/JS.
2. Interaction to Next Paint (INP, target < 200ms): Replaced FID. Measures page responsiveness across all user clicks, taps, and keypresses. Optimized by breaking long tasks (>50ms) with requestIdleCallback or scheduler.yield(), offloading CPU-heavy operations to Web Workers, and minimizing main thread JavaScript execution.
3. Cumulative Layout Shift (CLS, target < 0.1): Quantifies visual stability. Optimized by always declaring explicit width/height or aspect-ratio on images/videos, reserving space for dynamic ad banners, and using font-display: optional or size-adjust to prevent FOUT/FOIT.`,
    rubrics: [
      'Mentions that INP replaced FID as the responsiveness Core Web Vital.',
      'Details specific target thresholds (<2.5s, <200ms, <0.1).',
      'Provides actionable engineering remedies for each metric.',
      'Understands browser main-thread scheduling and long-task decomposition.',
    ],
    redFlags: [
      'Still citing First Input Delay (FID) as current standard without knowing INP.',
      'Recommending micro-optimizations while ignoring render-blocking resources.',
    ],
  },
  {
    id: 'fe-03',
    question: 'How do JavaScript Event Loop, microtasks, macrotasks, and requestAnimationFrame coordinate during frame execution?',
    category: 'frontend',
    difficulty: 'Mid-Level',
    companyTags: ['Netflix', 'Stripe', 'Airbnb'],
    techStack: ['JavaScript Core', 'Event Loop', 'V8 Engine', 'Async'],
    idealAnswer: `The JavaScript runtime is single-threaded and coordinates execution through a continuous Event Loop with distinct priority queues:

1. Call Stack: Synchronous execution executes first until empty.
2. Microtask Queue (highest async priority): Includes Promise.then/catch/finally, MutationObserver callbacks, and queueMicrotask(). The runtime drains the ENTIRE microtask queue (including microtasks queued by other microtasks) before processing the next macrotask or rendering a frame.
3. Rendering Pipeline: Prior to screen refresh (~16.6ms at 60Hz), the browser executes requestAnimationFrame (rAF) callbacks, calculates CSSOM recals, and runs layout/paint.
4. Macrotask (Task) Queue: Includes setTimeout, setInterval, setImmediate, and I/O callbacks. The event loop picks exactly ONE macrotask, executes it, drains all microtasks, checks if a frame should be rendered, and repeats.`,
    rubrics: [
      'Distinguishes that microtask queue is drained completely before next task.',
      'Positions requestAnimationFrame right before layout and paint phases.',
      'Accurately predicts execution order of nested Promise.resolve and setTimeout.',
    ],
    redFlags: [
      'Thinking setTimeout(fn, 0) runs immediately before current synchronous block.',
      'Failing to recognize that recursive microtasks can starve the UI and freeze rendering.',
    ],
  },

  // =========================================================================
  // BACKEND & DISTRIBUTED SYSTEMS
  // =========================================================================
  {
    id: 'be-01',
    question: 'How would you implement robust idempotency in a distributed payment processing API to prevent duplicate charges?',
    category: 'backend',
    difficulty: 'Senior',
    companyTags: ['Stripe', 'PayPal', 'Adyen'],
    techStack: ['Idempotency', 'Distributed Systems', 'Redis', 'PostgreSQL'],
    idealAnswer: `Idempotency ensures that submitting identical API requests multiple times produces the exact same outcome as a single request without side effects like double billing.

Production Architecture:
1. Idempotency Key Header: The client generates a unique UUID (v4) sent via 'Idempotency-Key'.
2. Atomic Lock & Record:
   - On request ingress, query an Idempotency Store (Redis or PostgreSQL table) inside a distributed lock (e.g. Redlock or SELECT ... FOR UPDATE).
   - If key does not exist: Insert record with status 'PROCESSING', request hash (to detect payload tampering), and TTL (e.g., 24 hours).
   - If key exists with status 'PROCESSING': Return HTTP 409 Conflict or hold connection until lock releases, preventing concurrent race conditions.
   - If key exists with status 'COMPLETED': Return the previously cached HTTP response (status code, headers, and body) immediately without hitting the payment gateway.
3. Payload Tampering Validation: Hash the request body (SHA-256) and verify it matches the stored hash; if the client changed the amount or currency under the same key, return HTTP 422 Unprocessable Entity.
4. Transactional Completion: Wrap downstream payment gateway call and database balance update in a transactional outbox pattern to guarantee consistency.`,
    rubrics: [
      'Specifies Idempotency-Key header pattern standard.',
      'Explains concurrent in-flight request handling (preventing race condition charges).',
      'Validates request payload hash to prevent key reuse with modified parameters.',
      'Defines TTL expiry and replay of exact cached response.',
    ],
    redFlags: [
      'Relying only on database UNIQUE constraint without in-flight concurrency locks.',
      'Not validating payload consistency across retried requests.',
    ],
  },
  {
    id: 'be-02',
    question: 'Compare Apache Kafka with RabbitMQ. What are their architectural differences, message delivery guarantees, and optimal use cases?',
    category: 'backend',
    difficulty: 'Staff / Architect',
    companyTags: ['LinkedIn', 'Uber', 'Cloudflare'],
    techStack: ['Kafka', 'RabbitMQ', 'Event-Driven', 'Message Queues'],
    idealAnswer: `While both are messaging platforms, their foundational architectures solve fundamentally different problem domains:

1. Storage vs Ephemeral Queue:
   - Kafka: Distributed, append-only partitioned commit log. Messages are persisted to disk and retained according to time/size policies regardless of consumption. Consumers track their own read offsets.
   - RabbitMQ: Traditional message broker based on AMQP. Messages are pushed to consumers and deleted upon acknowledgment (ephemeral).

2. Delivery Model:
   - Kafka: Pull-based model where consumers poll batches at their own pace, enabling massive horizontal scalability and log replayability.
   - RabbitMQ: Smart broker / dumb consumer push-based model with complex exchange routing (topic, fanout, headers, direct).

3. Throughput & Ordering:
   - Kafka: Millions of events/sec; strict total order guaranteed within each partition.
   - RabbitMQ: Tens of thousands of messages/sec; priority queueing, delayed messages, and per-message retry mechanisms.

Optimal Fit:
- Use Kafka for: High-throughput event streaming, event sourcing, CDC (change data capture), telemetry, and stream processing with Kafka Streams / Flink.
- Use RabbitMQ for: Granular routing, background job queues, request-reply RPCs, and per-message dead-letter acknowledgments.`,
    rubrics: [
      'Contrasts append-only persistent commit log with ephemeral queue broker.',
      'Explains pull-based consumer batching vs push-based smart broker dispatch.',
      'Accurately defines partition-level ordering in Kafka vs priority queueing in RabbitMQ.',
    ],
    redFlags: [
      'Assuming Kafka deletes messages after a consumer reads them.',
      'Claiming RabbitMQ is suited for high-volume append-only audit logging.',
    ],
  },
  {
    id: 'be-03',
    question: 'What are database isolation levels (Read Uncommitted, Read Committed, Repeatable Read, Serializable), and what anomalies do they prevent?',
    category: 'backend',
    difficulty: 'Senior',
    companyTags: ['Amazon', 'Cockroach Labs', 'Databricks'],
    techStack: ['PostgreSQL', 'MySQL InnoDB', 'ACID', 'Concurrency'],
    idealAnswer: `ANSI SQL defines 4 standard transaction isolation levels to balance concurrency against data consistency anomalies:

Anomalies:
1. Dirty Read: Transaction reads uncommitted modifications made by another transaction.
2. Non-repeatable (Fuzzy) Read: Re-reading a row retrieves altered values because another transaction committed an UPDATE.
3. Phantom Read: Re-executing a range query retrieves additional rows because another transaction committed an INSERT.
4. Serialization Anomaly: The final outcome of concurrent transactions cannot be reproduced by any serial order.

Isolation Levels:
- Read Uncommitted: Prevents nothing. Allows dirty reads. (Rarely used in production).
- Read Committed (Postgres/Oracle default): Prevents Dirty Reads via MVCC (Multi-Version Concurrency Control) snapshotting at statement start.
- Repeatable Read (MySQL default): Prevents Dirty and Non-repeatable Reads. Snapshot is taken at transaction start. In Postgres, also prevents Phantom Reads using MVCC.
- Serializable: Strongest level. Prevents all anomalies including write skew using SSI (Serializable Snapshot Isolation) or two-phase locking (2PL).`,
    rubrics: [
      'Accurately matches each isolation level with the specific anomaly it eliminates.',
      'Mentions MVCC (Multi-Version Concurrency Control) mechanism.',
      'Notes database defaults (PostgreSQL uses Read Committed, MySQL uses Repeatable Read).',
      'Explains trade-off between performance overhead and phantom prevention.',
    ],
    redFlags: [
      'Confusing Dirty Read with Phantom Read.',
      'Believing Serializable level locks the entire table permanently.',
    ],
  },

  // =========================================================================
  // SYSTEM DESIGN & SCALABILITY
  // =========================================================================
  {
    id: 'sd-01',
    question: 'Design a globally scalable URL Shortener service (like Bitly) supporting 100M new URLs per month and 10B clicks per month.',
    category: 'system-design',
    difficulty: 'Senior',
    companyTags: ['Google', 'Meta', 'Microsoft', 'ByteDance'],
    techStack: ['System Design', 'Base62', 'Redis Caching', 'NoSQL', 'CDN'],
    idealAnswer: `Capacity Planning:
- Write QPS: 100M / (30 days * 86400s) ≈ 40 writes/sec (Peak ~100 writes/sec).
- Read QPS: 10B / (30 days * 86400s) ≈ 4,000 reads/sec (Peak ~10,000 reads/sec). Read-heavy ratio (100:1).
- Storage: 7-character Base62 string (a-z, A-Z, 0-9) yields 62^7 ≈ 3.5 trillion unique combinations. At 500 bytes/record, 5 years storage is ~3 TB.

Architecture:
1. ID Generation Layer:
   - Dedicated Ticket Service / Snowflake ID generator or distributed range allocator (Zookeeper allocates blocks of 1,000,000 sequential 64-bit integers to worker nodes).
   - Convert unique ID into Base62 string (e.g. 11157 -> '2TX').
2. Ingress & Edge Redirection:
   - Cloudflare / AWS CloudFront CDN edge caches popular redirects with HTTP 301 (Permanent) or 302 (Found) for analytics capture.
   - API Gateway load balances requests across Stateless Redirect Microservices.
3. Caching & Storage:
   - Redis cluster caches hot 20% of URLs using LRU eviction (serves >95% of reads with sub-5ms latency).
   - Distributed Primary Datastore: Cassandra or DynamoDB partitioned by hash(short_key) for linear write scalability.
4. Analytics Pipeline:
   - Asynchronously publish redirect events to Kafka -> Flink -> ClickHouse to track click counts, geo-distribution, and referrers without adding latency to user redirection.`,
    rubrics: [
      'Performs back-of-the-envelope capacity estimations (QPS and storage).',
      'Chooses Base62 encoding over MD5/SHA hashing to avoid collision overhead.',
      'Explains trade-off between HTTP 301 (browser caches, lower server load) vs HTTP 302 (server sees every click for analytics).',
      'Decouples analytics pipeline using Kafka/ClickHouse.',
    ],
    redFlags: [
      'Using auto-incrementing integer directly in URL without Base62 encoding.',
      'Calculating MD5 hash and taking first 7 characters without addressing collisions.',
      'Synchronously updating click counter in primary DB on every read request.',
    ],
  },
  {
    id: 'sd-02',
    question: 'Design a Real-Time Collaborative Document Editing engine (like Google Docs or Figma) supporting thousands of concurrent editors.',
    category: 'system-design',
    difficulty: 'Staff / Architect',
    companyTags: ['Google', 'Figma', 'Notion', 'Slack'],
    techStack: ['CRDT', 'OT', 'WebSockets', 'Concurrency', 'Vector Clocks'],
    idealAnswer: `Real-time collaborative editing requires reconciling concurrent, conflicting mutations from distributed clients over high-latency networks.

Core Concurrency Reconcilers:
1. Operational Transformation (OT) vs Conflict-Free Replicated Data Types (CRDTs):
   - OT (Google Docs): Requires a centralized server to sequence operations, transform incoming edits against concurrent operations, and broadcast transformed operations back to clients. Complex mathematically with N-way transformations.
   - CRDTs (Figma, Notion, Yjs, Automerge): Mathematically proven convergence without a centralized coordinator. Operations commute (order of receipt does not alter final state). Each character is assigned a unique, immutable fractional index and vector clock.

High-Level Architecture:
1. Client-Side:
   - Local CRDT document state with optimistic UI rendering.
   - Local edit queue handles offline edits; synchronizes seamlessly upon reconnect.
2. Communication Layer:
   - Full-duplex WebSocket connections multiplexed over geographically distributed edge servers (Anycast routing).
   - Sticky routing or hash ring based on document_id ensures editors of the same document terminate on the same coordinator room.
3. Persistence & Snapshotting:
   - Append-only log of CRDT operations stored in Redis Streams / Kafka.
   - Periodic snapshotting worker compresses historical mutations into document snapshots (S3 / PostgreSQL) every 100 operations or 30 seconds to bound memory and catch-up sync times.
4. Presence & Awareness:
   - Ephemeral WebRTC / WebSocket channels for cursor positions, user selection highlights, and active presence pings (TTL of 5s).`,
    rubrics: [
      'Deeply compares Operational Transformation (OT) vs CRDTs (Yjs/LSEQ).',
      'Addresses offline editing, optimistic local rendering, and network partitions.',
      'Separates document state persistence from ephemeral presence (cursors).',
      'Explains snapshotting strategy to prevent unbounded mutation log growth.',
    ],
    redFlags: [
      'Suggesting simple distributed locking (pessimistic locking) on paragraphs.',
      'Ignoring offline disconnected states and conflict resolution.',
    ],
  },

  // =========================================================================
  // AI & MACHINE LEARNING
  // =========================================================================
  {
    id: 'ai-01',
    question: 'How do you design an enterprise Retrieval-Augmented Generation (RAG) pipeline to minimize hallucinations and maximize recall across millions of documents?',
    category: 'ai-ml',
    difficulty: 'Senior',
    companyTags: ['OpenAI', 'Anthropic', 'Scale AI', 'Databricks'],
    techStack: ['RAG', 'Vector DB', 'Embeddings', 'HyDE', 'Rerankers'],
    idealAnswer: `A robust enterprise RAG system requires multi-stage retrieval, semantic chunking, and precision reranking:

1. Ingestion & Semantic Chunking:
   - Replace fixed-token chunking with semantic, document-aware boundary chunking (splitting on markdown headers, table structures, and code blocks) with 10-15% chunk overlap.
   - Embed parent document chunks with smaller child retrieval windows (Parent Document Retrieval) so search matches granular sentences while the LLM receives full semantic context.
2. Hybrid Search (Dense + Sparse):
   - Combine dense semantic vector embeddings (OpenAI text-embedding-3 or BAAI/bge-large) with sparse lexical search (BM25 / Elasticsearch) using Reciprocal Rank Fusion (RRF). This ensures exact acronyms, part numbers, and error codes are found alongside semantic concepts.
3. Query Enhancement:
   - Hypothetical Document Embeddings (HyDE): Generate a preliminary synthetic answer with LLM and embed that answer for retrieval.
   - Query decomposition: Break complex multi-part questions into distinct parallel search queries.
4. Two-Stage Reranking:
   - Retrieve top 50 candidates from vector DB, then pass through a cross-encoder reranker (e.g., Cohere Rerank or BGE-Reranker-Large) to score deep query-document relevance, narrowing down to the top 5 most relevant passages.
5. Grounding & Hallucination Guardrails:
   - Instruct the LLM with strict context-anchored prompting: "Cite specific passage IDs [Doc-X]. If the context does not contain the answer, explicitly state 'Insufficient information'".
   - Post-generation validation using secondary verification models or BLEU/ROUGE/faithfulness rubrics.`,
    rubrics: [
      'Emphasizes Hybrid Search (Dense Vector + Sparse BM25 via Reciprocal Rank Fusion).',
      'Integrates Cross-Encoder Reranking to refine initial retrieval candidate sets.',
      'Explains Semantic / Parent Document Chunking strategies.',
      'Addresses source attribution, grounding citations, and hallucination guardrails.',
    ],
    redFlags: [
      'Assuming naive cosine similarity on fixed-character chunks is production-ready.',
      'Failing to mention rerankers or keyword matching for technical jargon.',
    ],
  },
  {
    id: 'ai-02',
    question: 'What is Quantization (FP16, INT8, INT4, AWQ, GGUF) in Large Language Models, and how does it affect memory footprint and inference latency?',
    category: 'ai-ml',
    difficulty: 'Senior',
    companyTags: ['NVIDIA', 'Meta', 'Hugging Face'],
    techStack: ['LLM Serving', 'Quantization', 'CUDA', 'vLLM', 'Ollama'],
    idealAnswer: `Quantization reduces the precision of model weights (and sometimes activations) from 32-bit floating point (FP32) or 16-bit (FP16/BF16) to lower-bit representations like 8-bit integers (INT8) or 4-bit integers (INT4).

Mathematical & Memory Impact:
- VRAM Calculation: A 70B parameter model in FP16 requires ~140 GB of GPU VRAM just to hold the weights (70B * 2 bytes). In 4-bit quantization (0.5 bytes/param), the footprint drops to ~35-40 GB, allowing it to fit onto a single consumer workstation or dual RTX 3090/4090s.
- Memory Bandwidth Bottleneck: LLM token generation (autoregressive decoding) is heavily memory-bandwidth bound rather than compute-bound. Transferring smaller quantized weights from VRAM to compute cores increases token generation speed significantly on memory-constrained systems.

Formats & Techniques:
1. GGUF: Binary format developed for llama.cpp/Ollama; allows CPU/GPU split offloading with quantization variants like Q4_K_M and Q8_0.
2. AWQ (Activation-aware Weight Quantization): Identifies the top 1% salient weights that protect model quality and protects them from aggressive quantization, achieving near-lossless INT4 accuracy.
3. GPTQ: Post-training quantization using second-order Taylor expansion approximations.`,
    rubrics: [
      'Explains how VRAM scales with bits-per-parameter.',
      'Recognizes that autoregressive inference is memory-bandwidth bound.',
      'Compares GGUF (llama.cpp/Ollama) with AWQ/GPTQ formats.',
      'Addresses accuracy degradation trade-offs vs throughput gains.',
    ],
    redFlags: [
      'Claiming quantization decreases model accuracy to unusable levels.',
      'Not knowing that inference is memory bandwidth constrained.',
    ],
  },

  // =========================================================================
  // CLOUD, DEVOPS & SRE
  // =========================================================================
  {
    id: 'do-01',
    question: 'Describe how the Kubernetes Control Plane manages Pod lifecycle and reconciliation loops. What happens step-by-step when you run kubectl apply -f deployment.yaml?',
    category: 'devops',
    difficulty: 'Senior',
    companyTags: ['Google Cloud', 'Red Hat', 'AWS', 'HashiCorp'],
    techStack: ['Kubernetes', 'Kubelet', 'etcd', 'Containerd'],
    idealAnswer: `When running 'kubectl apply -f deployment.yaml', the cluster executes a declarative reconciliation sequence:

1. Authentication & Validation (kube-apiserver):
   - kubectl translates manifest to JSON and authenticates against kube-apiserver via client certs/tokens.
   - Admission Controllers (Mutating and Validating Webhooks) inspect, inject sidecars, and validate the manifest.
   - Apiserver writes the desired state directly into etcd (the distributed key-value store).
2. Deployment Controller:
   - The Deployment Controller inside kube-controller-manager detects a diff between desired and current state via etcd watch events.
   - Creates a ReplicaSet object to match the specification.
3. ReplicaSet Controller:
   - Creates the desired number of Pod manifests (with status 'Pending') without assigning node names (nodeName is null).
4. Scheduler (kube-scheduler):
   - Watches for unscheduled pods.
   - Filters suitable worker nodes (checking taints/tolerations, resource requests/limits, affinities) and scores the best candidate.
   - Binds the Pod to the chosen worker node by updating the Pod spec in etcd.
5. Kubelet & Container Runtime:
   - The target node's kubelet detects the Pod assignment via its local apiserver watch.
   - Instructs Container Runtime (containerd/CRI-O) to pull images, create Linux namespaces (cgroups, network), and start the infra pause container.
   - Executes CNI plugin to assign Pod IP, mounts Secrets/ConfigMaps, and starts app containers.
   - Executes readiness and liveness probes before adding the Pod to the Service Endpoints.`,
    rubrics: [
      'Details etcd -> kube-apiserver -> controller-manager -> scheduler sequence.',
      'Explains that the scheduler only assigns nodeName; Kubelet executes the actual container spawn.',
      'Mentions CNI (Container Network Interface) and Pod readiness probes.',
    ],
    redFlags: [
      'Thinking kubectl speaks directly to worker nodes or Docker daemon.',
      'Missing the role of etcd as the single source of truth.',
    ],
  },
  {
    id: 'do-02',
    question: 'How do you design a zero-downtime Blue/Green deployment vs Canary deployment on modern cloud platforms? What are the rollback triggers?',
    category: 'devops',
    difficulty: 'Mid-Level',
    companyTags: ['Netflix', 'Spotify', 'GitHub'],
    techStack: ['CI/CD', 'ArgoCD', 'Istio', 'Observability'],
    idealAnswer: `Both strategies minimize release risk by decoupling code deployment from traffic release:

1. Blue/Green Deployment:
   - Architecture: Runs two identical production environments simultaneously. Environment A (Blue) currently serves 100% of live traffic.
   - Process: Deploy new version to Environment B (Green). Run automated smoke tests, health probes, and synthetic transactions in isolation. Once verified, flip the load balancer / router DNS or Service selector instantly to Green.
   - Pros/Cons: Instant rollback (just flip the switch back); requires 2x infrastructure capacity.
2. Canary Deployment:
   - Architecture: Incrementally exposes the new version to a small subset of real user traffic (e.g. 5% -> 25% -> 50% -> 100%) using a Service Mesh (Istio) or Ingress controller (Traefik/Nginx).
   - Automated Analysis: APM monitoring (Datadog/Prometheus) continuously evaluates golden signals: HTTP 5xx error rate, p99 latency, and host memory usage.
3. Automated Rollback Triggers:
   - If HTTP 5xx errors increase by >0.5% over baseline.
   - If p99 latency spikes beyond SLA thresholds (>300ms).
   - If unhandled application crashes or failed health check probes exceed 3 consecutive attempts.
   - Immediate automatic routing reversion and alert dispatch to on-call engineers.`,
    rubrics: [
      'Clearly distinguishes 100% instant switch (Blue/Green) from progressive traffic shifting (Canary).',
      'Defines automated canary metric analysis (error rates, p99 latencies).',
      'Lists concrete, quantifiable rollback triggers.',
    ],
    redFlags: [
      'Assuming Blue/Green deployment can only be done with manual DNS updates.',
      'No mention of automated metric-based rollbacks.',
    ],
  },

  // =========================================================================
  // BEHAVIORAL & LEADERSHIP (STAR)
  // =========================================================================
  {
    id: 'beh-01',
    question: 'Tell me about a time you led the investigation and resolution of a high-severity production outage. How did you coordinate the team, remediate the issue, and prevent recurrence?',
    category: 'behavioral',
    difficulty: 'Senior',
    companyTags: ['Amazon', 'Google', 'Apple', 'Meta'],
    techStack: ['STAR Method', 'Incident Management', 'Post-Mortem', 'Leadership'],
    idealAnswer: `Use the STAR Framework (Situation, Task, Action, Result):

- Situation: "During Black Friday peak traffic at my previous e-commerce company, our core checkout service p99 latency spiked from 120ms to over 8 seconds, resulting in a 45% drop in transaction completions and triggering a P0 Incident."
- Task: "As the Incident Commander on-call, my responsibility was to stabilize customer checkouts immediately, coordinate cross-functional engineers across database and payment teams, and provide clear stakeholder updates every 15 minutes."
- Action:
  1. Triage: Established an emergency bridge, isolated non-essential services, and inspected telemetry. Found that an unindexed database query introduced by a recent promotional campaign was locking checkout tables.
  2. Mitigation: Rather than attempting a complex code rollback during active traffic, we temporarily toggled a feature flag disabling the promotional lookups and added a dynamic read-replica connection pool to drain connection saturation within 8 minutes.
  3. Coordination: Maintained a dedicated comms channel with executive leadership and customer support with sanitized customer-facing status updates.
- Result: "Traffic normalized within 12 minutes, saving an estimated $320k in abandoned carts. Following the incident, I led a blameless post-mortem, authored an architectural policy mandating query execution plan lints in our CI/CD pipeline, and built synthetic load testing for all future holiday promotions."`,
    rubrics: [
      'Follows clean STAR structure with measurable business impact.',
      'Demonstrates Incident Commander leadership and calm triage under pressure.',
      'Differentiates rapid mitigation (feature flag/kill switch) from root cause fix.',
      'Mentions blameless post-mortem and structural engineering prevention.',
    ],
    redFlags: [
      'Focusing on blame rather than process and system improvements.',
      'Vague technical details or inability to state measurable metrics.',
    ],
  },
  {
    id: 'beh-02',
    question: 'Describe a situation where you had a strong technical disagreement with a Staff engineer or Product Manager. How did you navigate the impasse to reach a consensus?',
    category: 'behavioral',
    difficulty: 'Senior',
    companyTags: ['Meta', 'Netflix', 'Stripe', 'Amazon'],
    techStack: ['STAR Method', 'Influence without Authority', 'Consensus'],
    idealAnswer: `STAR Structure:

- Situation: "Our team was architecting our next-generation customer reporting engine. A senior peer advocated for a complex distributed microservices architecture using Apache Flink and Kafka, whereas I believed our scale and roadmap were better served by leveraging our existing PostgreSQL read replicas with ClickHouse for OLAP."
- Task: "My goal was to prevent premature architectural overengineering and high maintenance overhead, while ensuring we hit our strict Q3 launch deadline without damaging team morale or professional trust."
- Action:
  1. Data-Driven Alignment: Rather than arguing philosophy, I proposed we write an RFC with concrete evaluation criteria: development velocity, operational maintenance cost, infrastructure expense, and our projected 3-year data volume.
  2. Timeboxed Spike: We paired on a 3-day proof-of-concept benchmark. I demonstrated that ClickHouse handled our 100M row analytics queries in <45ms at 1/5th the infrastructure complexity of managing a dedicated Flink cluster.
  3. Compromise & Respect: I incorporated his valuable concerns regarding future streaming ingestion by ensuring our schema design decoupled raw event streams, allowing an easy migration path to streaming if business scale demanded it later.
- Result: "The team unanimously adopted the ClickHouse RFC. We delivered the project two weeks ahead of schedule with zero operational incidents in production, and our collaborative relationship was strengthened, leading us to co-author subsequent architectural proposals together."`,
    rubrics: [
      'Emphasizes data-driven benchmarks over subjective opinions.',
      'Demonstrates "Disagree and Commit" / collaborative compromise.',
      'Maintains emotional intelligence and strengthens professional trust.',
    ],
    redFlags: [
      'Appealing to personal authority ("I knew better because I was right").',
      'Escalating directly to management before attempting peer-to-peer alignment.',
    ],
  },
];
