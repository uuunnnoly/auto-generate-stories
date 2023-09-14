const getTemplate = (dir, componentName, args) => {
return `
import React from 'react';
import type { StoryFn, Meta } from '@storybook/react';
import { ${componentName} } from './index';
            
export default {
  title: '${dir}',
  component: ${componentName},
} as Meta<typeof ${componentName}>;
            
const Template: StoryFn<typeof ${componentName}> = args => {
  return (
    <${componentName} {...args} />
  )
};

export const Overview = {
  render: Template,
  args: ${args}
};
`
}

module.exports = getTemplate;
