import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import starlight from '@astrojs/starlight';

export default defineConfig({
  integrations: [
    mdx(),
    starlight({
      title: 'Open Engineer',
      description: 'A diverse multi-model AI agent team for OpenCode.',
      logo: {
        light: './src/assets/logo-light.svg',
        dark: './src/assets/logo-dark.svg',
      },
      social: {
        github: 'https://github.com/colygon/openengineer',
      },
      editLink: {
        baseUrl: 'https://github.com/colygon/openengineer/edit/main/docs-site/src/content/docs/',
      },
      sidebar: [
        {
          label: 'Getting Started',
          items: [
            'introduction',
            'quickstart',
            'installation',
          ],
        },
        {
          label: 'Core Concepts',
          items: [
            'concepts/agents',
            'concepts/categories',
            'concepts/models',
            'concepts/orchestration',
          ],
        },
        {
          label: 'Guides',
          items: [
            'guides/configuration',
            'guides/custom-agents',
            'guides/providers',
            'guides/shell-plugin',
          ],
        },
        {
          label: 'Reference',
          items: [
            'reference/config-schema',
            'reference/agents',
            'reference/categories',
            'reference/hooks',
            'reference/tools',
          ],
        },
      ],
      customCss: ['./src/styles/custom.css'],
    }),
  ],
});
