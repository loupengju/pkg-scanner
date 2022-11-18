#!/usr/bin/env node
const fs = require('fs');
const {scanner} = require("../utils/scanner");
const _ = require('lodash');
const chalk = require("chalk");

// 输入命令所在文件夹
const CMD_PATH = process.cwd();

// 读取package.json
const isHasPkg = fs.existsSync(`${CMD_PATH}/package.json`);
if (isHasPkg) {
  const packageJson = require(`${CMD_PATH}/package.json`);
  // 获取所有依赖
  const _allDeps = Object.keys({...(packageJson['dependencies'] || {}), ...(packageJson['devDependencies'] || {})});
  const allScripts = Object.keys(packageJson['scripts']).reduce((acc, cur) => {
    acc.push.apply(acc, packageJson['scripts'][cur].split(' '));
    return acc;
  }, []);
  const allDeps = _allDeps.filter(dep => !allScripts.includes(dep) && !dep.includes('@types'));
  scanner(allDeps, CMD_PATH).then(result => {
    const diff = _.difference(allDeps, result);
    const dev = diff.filter(c => Object.keys(packageJson['devDependencies'] || {}).includes(c)).join(',') || '无';
    const dep = diff.filter(c => Object.keys(packageJson['dependencies'] || {}).includes(c)).join(',') || '无';
    console.log(chalk.redBright('没有用到的模块：\n'), chalk.redBright('devDependencies:\n'), chalk.yellow(dev), '\n', chalk.redBright('dependencies\n'), chalk.yellow(dep));
  })
} else {
  console.log('项目路径不合法！');
}
