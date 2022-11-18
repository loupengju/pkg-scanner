// 扫描所有目录以及文件
const fg = require("fast-glob");
const babel = require("@babel/core");
const plugins = require("../plugins/scanner-import-or-require");
const eventbus = require("../utils/eventbus");
const ProgressBar = require("progress");
const { ignorePathList } = require("./constants");
const chalk = require("chalk");

const scanner = async (modules, rootDir) => {
  const allDeps = [];
  const entries = await fg([`**/**/*.js`, `**/**/*.ts`, `**/**/*.tsx`], {
    ignore: ignorePathList,
  });
  eventbus.$on("depArr", (depArr) => {
    allDeps.push.apply(allDeps, depArr);
  });

  const options = {
    presets: [
      // [
      //   require("@babel/preset-typescript"),
      //   {
      //     isTSX: true,
      //     allExtensions: true,
      //     allowDeclareFields: true,
      //   },
      // ],
      require("@babel/preset-flow"),
      require("@babel/preset-react"),
      require("@babel/preset-env"),
      require("@babel/preset-typescript")
    ],
    plugins: [
      plugins(...arguments, modules),
      [
        require("@babel/plugin-proposal-decorators"),
        {
          legacy: true,
        },
      ],
    ],
  };
  const bar = new ProgressBar(chalk.green("处理模块中[:bar] :current/:total"), { total: entries.length, width: 20 });
  entries.forEach((filepath, index) => {
    bar.tick();
    babel.transformFileSync(filepath, options);
  });

  return [...new Set(allDeps)];
};

module.exports = {
  scanner,
};
