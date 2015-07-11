var levelEnum = {
  debug: 1,
  info: 2,
  warn: 3,
  error: 4
};

function nothing() {
}

function log(level) {
  level = level || levelEnum.debug;
  var args = Array.prototype.slice(arguments);
  //args.shift();
  console.log('==== %s', args);
  switch (level) {
    case levelEnum.debug:
      console.log.apply(null, args);
      break;
    case levelEnum.info:
      console.info.apply(null, args);
      break;
    case levelEnum.warn:
      console.warn(args);
      break;
    case levelEnum.error:
      console.error(args);
      break;
  }
}

// FIXME doesn't work
module.exports = function (level) {
  return log.bind(null, level);
};
