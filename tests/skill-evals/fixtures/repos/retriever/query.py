"""A small retrieval candidate; no server execution is necessary for inspection."""
def retrieve(query, documents):
    return [{'text': d['text'], 'source': {'document_id': d['id'], 'page': d['page']}, 'score': 0.8}
            for d in documents if query.lower() in d['text'].lower()]
