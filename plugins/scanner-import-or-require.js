const eventbus = require("../utils/eventbus");

module.exports = (babel, ...rest) => {
  const modules = rest[rest.length - 1];
  const depArr = [];
  return {
    visitor: {
      ImportDeclaration(path, source) {
        const bd = path.node;
        // import
        if (bd.type === 'ImportDeclaration' && modules.includes(bd.source.value)) {
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
                if (arg && arg.value && modules.includes(arg.value)) {
                  !depArr.includes(arg.value) && depArr.push(arg.value);
                }
              })
            }
          })
        }

      },
      Literal(path, source) {
        path.node.value && !depArr.includes(path.node.value) && depArr.push(path.node.value);
      },
      CallExpression(path, source) {
        const bd = path.node;
        if (bd.callee && bd.callee.name && bd.callee.name === 'require' && bd.arguments && bd.arguments.length) {
          bd.arguments.forEach(arg => {
            if (arg && arg.value && modules.includes(arg.value)) {
              !depArr.includes(arg.value) && depArr.push(arg.value);
            }
          })
        }
      },
      MemberExpression(path, source) {
        const bd = path.node;
        if (bd.object && bd.object.name && bd.object.name === 'require' && bd.property && bd.property.name && modules.includes(bd.property.name)) {
          !depArr.includes(bd.property.name) && depArr.push(bd.property.name);
        }
      },

    },
    post(state) {
      eventbus.$emit('depArr', depArr)
    }
  }
}
