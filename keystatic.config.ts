import { config, fields, collection } from '@keystatic/core';

export default config({
  storage: {
    kind: 'local',
  },
  collections: {
    posts: collection({
      label: 'Posts',
      slugField: 'title',
      path: 'src/content/posts/*',
      format: { contentField: 'description' },
      schema: {
        title: fields.slug({ name: { label: 'Title' } }),
        
        description: fields.markdoc({ label: 'Content' }),

        avatar: fields.image({label: 'Imagen'}),

        date: fields.datetime({label: 'Event date',description: 'The date of the event'}),
      },
    }),
  },
});