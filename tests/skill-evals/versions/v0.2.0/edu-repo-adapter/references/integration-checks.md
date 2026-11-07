# Integration decisions that often change the reuse choice

Read for multi-repo composition, citation flows, persistent state or user-supplied content. Apply only the checks relevant to the task.

| Boundary | Questions that matter |
| --- | --- |
| Payload | Field names, types, optionality, units, encoding and ordering. Does an adapter lose information? |
| Identity | Source/document/problem IDs, page index convention, provenance and duplicate handling. |
| Lifecycle | Sync vs async, retries, failures, stale responses, ownership and reset behavior. |
| Access | Component authentication assumptions, caller scope and storage location. |
| Platform | Browser/server/native boundary, language/runtime and actual deployment dependencies. |
| Content | Is a displayed string trusted HTML or untrusted user/document text? Where does escaping/sanitization occur? |
| Terms | Code versus sample data, annotations, documents, model weights and assets. |

For a retriever returning `{text, source:{document_id,page}}` and a viewer expecting `{answer,citations:[{url,label}]}`, specify the conversion, document registry and page-index convention. Do not create a public URL by guessing one from an ID. A valid citation must resolve to the supplied document/page or be explicitly unavailable. Empty/no-source results need a visible state rather than fabricated evidence.

For document text rendered as HTML, inspect the output sink and decide who escapes values. Plain text rendering/escaping can be appropriate; if rich HTML is a requirement, choose and verify sanitization. Test hostile text, empty citations, missing source IDs, and page boundaries when that path is implemented. This is an actual interface risk, not a general security audit of the repository.

Compare components as substitutes when their responsibilities overlap. For example, two complete tutoring platforms may be alternatives rather than modules to integrate. A library callable from Python does not automatically become a browser API. Estimate the adapter, hosting and maintenance work before choosing a combination.

Use owned materials in a commercial prototype when bundled sample data has noncommercial or unknown terms. Keep the restricted dataset as a separately labeled reference if useful; do not redistribute it with the eligible code.
