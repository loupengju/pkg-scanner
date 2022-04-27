const eventbus = require("../utils/eventbus");

const getFirstValue = (value) => {
  const [firstValue] = value && value.split ? value.split("/") : [];
  return firstValue;
}

module.exports = (babel, ...rest) => {
  const modules = rest[rest.length - 1];
  const depArr = [];
  return {
    visitor: {
      ImportDeclaration(path, source) {
        const bd = path.node;
        const value = getFirstValue(bd.source.value);
        // import
        if (bd.type === 'ImportDeclaration' && value && modules.includes(value)) {
          !depArr.includes(value) && depArr.push(value);
        }
        if (bd.type === 'ImportDeclaration' && (modules.includes(bd.source.value))) {
          !depArr.includes(bd.source.value) && depArr.push(bd.source.value);
        }
      },
      VariableDeclaration(path, source) {
        const bd = path.node;
        // require
        if (bd.type === 'VariableDeclaration' && bd.declarations && bd.declarations.length) {
          bd.declarations.forEach(dec => {
            if (dec.init &&  dec.init.arguments &&  dec.init.arguments.length) {
              dec.init.arguments.forEach(arg => {
                const value = getFirstValue(arg && arg.value ? arg.value : '');
                if (value && modules.includes(value)) {
                  !depArr.includes(value) && depArr.push(value);
                }
                if (arg && arg.value && modules.includes(arg.value)) {
                  !depArr.includes(arg.value) && depArr.push(arg.value);
                }
              })
            }
          })
        }

      },
      Literal(path, source) {
        const value = getFirstValue(path.node.value || '');
        value && !depArr.includes(value) && depArr.push(value);
        path.node.value && !depArr.includes(path.node.value) && depArr.push(path.node.value);
      },
      CallExpression(path, source) {
        const bd = path.node;
        if (bd.callee && bd.callee.name && bd.callee.name === 'require' && bd.arguments && bd.arguments.length) {
          bd.arguments.forEach(arg => {
            const value = getFirstValue(arg && arg.value ? arg.value : '');
            if (value && modules.includes(value)) {
              !depArr.includes(value) && depArr.push(value);
            }
            if (arg && arg.value && modules.includes(arg.value)) {
              !depArr.includes(arg.value) && depArr.push(arg.value);
            }
          })
        }
      },
    },
    post(state) {
      eventbus.$emit('depArr', depArr)
    }
  }
}
