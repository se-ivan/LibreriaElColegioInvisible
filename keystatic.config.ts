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
        
        description: fields.markdoc({ label: 'Descripción' }),
        
        quote: fields.text({label: 'Pretitle',multiline: true}),

        avatar: fields.image({label: 'Imagen'}),

      },
    }),
  },
});