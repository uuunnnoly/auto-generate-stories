const parser = require('@babel/parser');
const traverse = require('@babel/traverse');
const fs = require('fs');
const p = require('path');

const traverseFile = (path,dirPath) => {
  const sourceCode = fs.readFileSync(path, { encoding: 'utf-8' });
  
  const ast = parser.parse(sourceCode, {
    sourceType: "module",
    plugins: ["jsx", "typescript"],
  });

  const typeNames = traverseInterface(ast);

  const filePaths = traverseImport(ast,typeNames);

  return filePaths.map(filePath => {
    if (dirPath && !p.isAbsolute(filePath)) {
      return p.resolve(dirPath, `${filePath}.ts`);
    }
    return filePath;
  });
}

const traverseInterface = (ast) => {
  const typeNames = [];

  traverse.default(ast, {
    TSInterfaceDeclaration(path) {
      const nodes = path.node.body.body;
      nodes?.forEach(item => {
        const typeNode = item.typeAnnotation.typeAnnotation;
        if (typeNode.type === 'TSTypeReference') {
          // @ts-ignore
          typeNames.push(typeNode.typeName.name)
        }else if (typeNode.type === 'TSArrayType' && typeNode.elementType.type === 'TSTypeReference') {
          // @ts-ignore
          typeNames.push(typeNode.elementType.typeName.name)
        }
      })
    },
    TSTypeAliasDeclaration(path) {
      const node = path.node.typeAnnotation;
      if (node.type === 'TSTypeReference') {
        // @ts-ignore
        typeNames.push(node.typeName.name);
      } else if (node.type === 'TSTypeLiteral') { 
        const nodes = node.members;
        nodes.forEach(item => {
        const typeNode = item.typeAnnotation.typeAnnotation;
        if (typeNode.type === 'TSTypeReference') {
          // @ts-ignore
          typeNames.push(typeNode.typeName.name)
        }
      });
      }
    }
  });

  return typeNames;
}

const traverseImport = (ast, typeNames) => {
  const filePaths = [];

  traverse.default(ast, {
    ImportDeclaration(path) {
      path.node.specifiers.find(specifier => {
        // @ts-ignore
        if (typeNames.includes(specifier.imported.name)) {
          filePaths.push(path.node.source.value)
        }
      })
    },
  });
 
  return [...new Set(filePaths)];
}

const collectDependencies = (paths) => {
  let res = paths;
  if (paths.length === 0) {
    return res;
  }
  paths.forEach(path => {
    const dirPath = p.parse(path).dir;
    const arr = traverseFile(path, dirPath);
    const dependencies = collectDependencies(arr);
    res = res.concat(dependencies);
  })
  return res;
}

module.exports = collectDependencies;