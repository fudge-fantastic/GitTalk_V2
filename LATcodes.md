### QDRANT demo
```tsx
import {QdrantClient} from '@qdrant/js-client-rest';

const client = new QdrantClient({
    url: '',
    apiKey: '',
});

try {
    const result = await client.getCollections();
    console.log('List of collections:', result.collections);
} catch (err) {
    console.error('Could not get collections:', err);
}
```