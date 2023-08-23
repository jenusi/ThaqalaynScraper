const mergeData = (target, source) => {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !(source[key] instanceof Array)) {
      if (!target[key]) target[key] = {};
      mergeData(target[key], source[key]);
    } else {
      target[key] = source[key];
    }
  }
};

module.exports = mergeData;
