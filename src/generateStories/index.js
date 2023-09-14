const fs = require('fs');
const intermock = require('typescript-automock');
const collectDependencies = require('./traverse');
const getTemplate = require('./template');

const generateStoriesTemplate = path => {
  const dirPath = path.replace(/.*src\//, '');
  const componentName = getComponentName(path);
  const args = getComponentArgs(path);

  return getTemplate(dirPath, componentName, args);
}

const getComponentArgs = dirPath => {
  const mockArgs = intermock.mock({
    files: transformFilePath(dirPath),
    interfaces: [getComponentPropsName(dirPath)],
    output: "string",
    isOptionalAlwaysEnabled:false,
  });

  return transformArgs(mockArgs);
}

const transformFilePath = dirPath => {
  const componentPath = `${dirPath}/index.tsx`;
  const importedPaths = collectDependencies([componentPath]);

  return importedPaths.map(path => [path,fs.readFileSync(path).toString()]);
}

const getComponentName = dirPath => {
  return dirPath.split('/').pop();
}

const getComponentPropsName = dirPath => {
  return `${getComponentName(dirPath)}Props`;
}

const transformArgs = args => {
  console.log(args)
  return args;
}

module.exports = generateStoriesTemplate;
